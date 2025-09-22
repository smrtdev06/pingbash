/**
 * @author               Dmytro
 * @published            June 9, 20244
 * @description  
 **  Controller for Chat function
 */

const { log } = require("console");
const { PG_query } = require("../../db")
const jwt = require('jsonwebtoken');
const { TIMEOUT_MINS } = require("../../libs/chatCode");
const { array } = require("@hapi/joi");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test SMTP connection on startup
transporter.verify(function(error, success) {
    if (error) {
        console.log('❌ SMTP connection failed:', error);
        console.log('📧 Email notifications will not work. Please check SMTP configuration in .env file');
    } else {
        console.log('✅ SMTP server is ready to send emails');
    }
});

const sendNotificationEamil = async (emails, message) => {
 
    // Send OTP to user's email
    const subject = 'Email Verification';
    const content = `<center>
            <h2>Group Notification</h2>
            <div style="font-size:30px;font-weight:bold">${message}</div>
            </center>`;
    
    emails.forEach( async (toEmail, index) => {
        try {
            await transporter.sendMail({ 
                from: `${process.env.SMTP_FROM_NAME || 'Pingbash'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`, 
                to: toEmail, 
                subject, 
                html: content 
            });
        } catch (err) {
            console.log(err)
        }
        
    });
 };

const sendPrivateMessageEmailNotification = async (senderId, receiverId, messageContent) => {
    try {
        console.log(`📧 [EMAIL] Attempting to send email notification: sender=${senderId}, receiver=${receiverId}`);
        
        // Get sender and receiver information
        const senderResult = await PG_query(`SELECT "Name", "Email" FROM "Users" WHERE "Id" = ${senderId}`);
        const receiverResult = await PG_query(`SELECT "Name", "Email" FROM "Users" WHERE "Id" = ${receiverId}`);
        
        console.log(`📧 [EMAIL] Sender query result: ${senderResult.rows.length} rows`);
        console.log(`📧 [EMAIL] Receiver query result: ${receiverResult.rows.length} rows`);
        
        if (senderResult.rows.length === 0) {
            console.log(`❌ [EMAIL] Sender with ID ${senderId} not found in database`);
            return;
        }
        
        if (receiverResult.rows.length === 0) {
            console.log(`❌ [EMAIL] Receiver with ID ${receiverId} not found in database`);
            return;
        }
        
        const sender = senderResult.rows[0];
        const receiver = receiverResult.rows[0];
        
        console.log(`📧 [EMAIL] Sender: ${sender.Name} (${sender.Email})`);
        console.log(`📧 [EMAIL] Receiver: ${receiver.Name} (${receiver.Email})`);
        
        if (!receiver.Email) {
            console.log(`❌ [EMAIL] Receiver ${receiver.Name} has no email address`);
            return;
        }
        
        // Check SMTP configuration
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`❌ [EMAIL] SMTP configuration incomplete. Host: ${process.env.SMTP_HOST}, User: ${process.env.SMTP_USER}, Pass: ${process.env.SMTP_PASS ? '[SET]' : '[NOT SET]'}`);
            return;
        }
        
        // Truncate message if too long
        const truncatedMessage = messageContent.length > 100 
            ? messageContent.substring(0, 100) + '...' 
            : messageContent;
        
        const subject = `New message from ${sender.Name}`;
        const content = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h2 style="color: white; margin: 0; text-align: center;">New Private Message</h2>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #dee2e6;">
                    <p style="margin: 0 0 15px 0; font-size: 16px;">Hi ${receiver.Name},</p>
                    <p style="margin: 0 0 15px 0;">You have received a new private message from <strong>${sender.Name}</strong>:</p>
                    <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 5px;">
                        <p style="margin: 0; font-style: italic; color: #333;">"${truncatedMessage}"</p>
                    </div>
                    <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                        Log in to your chat to view the full message and reply.
                    </p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
                    <p>This is an automated notification from Pingbash Chat.</p>
                </div>
            </div>`;
        
        console.log(`📧 [EMAIL] Sending email to ${receiver.Email} with subject: ${subject}`);
        
        const mailOptions = {
            from: `${process.env.SMTP_FROM_NAME || 'Pingbash'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to: receiver.Email,
            subject: subject,
            html: content
        };
        
        console.log(`📧 [EMAIL] Mail options:`, {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });
        
        const result = await transporter.sendMail(mailOptions);
        
        console.log(`✅ [EMAIL] Email notification sent successfully to ${receiver.Email} for private message from ${sender.Name}`);
        console.log(`📧 [EMAIL] Message ID: ${result.messageId}`);
        
    } catch (error) {
        console.error("❌ [EMAIL] Error sending private message email notification:", error);
        console.error("❌ [EMAIL] Error details:", {
            message: error.message,
            code: error.code,
            response: error.response
        });
    }
};

// To get the User list for the Chat
const getUsers = async (loggedId) => {
    try {
        let initList = []
        initList = await PG_query(`WITH "MessageList" AS (
                SELECT m."Id", m."Sender_Id", sender."Name" AS "Sender_Name", m."Content", m."Receiver_Id", receiver."Name" AS "Receiver_Name",
                    m."Send_Time", m."Read_Time", m."History_Iden", sender.country, sender.gender, sender.birthday,
                    CASE WHEN m."Sender_Id" = ${loggedId} THEN receiver."Id" ELSE sender."Id" END AS "Opposite_Id",
                    CASE WHEN m."Sender_Id" = ${loggedId} THEN receiver."Name" ELSE sender."Name" END AS "Opposite_Name",
                    CASE WHEN m."Sender_Id" = ${loggedId} THEN receiver."Email" ELSE sender."Email" END AS "Opposite_Email",
                    CASE WHEN m."Sender_Id" = ${loggedId} THEN receiver."Address" ELSE sender."Address" END AS "Opposite_Address",
                    CASE WHEN m."Sender_Id" = ${loggedId} THEN receiver."Profession" ELSE sender."Profession" END AS "Opposite_Profession",
                    CASE WHEN m."Sender_Id" = ${loggedId} THEN receiver."Photo_Name" ELSE sender."Photo_Name" END AS "Opposite_Photo_Name"
                FROM "Messages" m
                JOIN "Users" sender ON m."Sender_Id" = sender."Id"
                JOIN "Users" receiver ON m."Receiver_Id" = receiver."Id"
                WHERE m."History_Iden" = 1
                AND (m."Sender_Id" = ${loggedId} OR m."Receiver_Id" = ${loggedId})
            ),
            "LastMessagesReadStatus" AS (
                SELECT
                    ml.*,
                    CASE
                        WHEN ml."Sender_Id" = ${loggedId} THEN 0
                        WHEN ml."Read_Time" IS NOT NULL THEN 0
                        ELSE (
                            SELECT COUNT(*)
                            FROM "Messages" m
                            WHERE m."Read_Time" IS NULL
                            AND m."Sender_Id" = ml."Sender_Id"
                            AND m."Receiver_Id" = ml."Receiver_Id"
                        )
                    END AS "Unread_Message_Count",
                    ROW_NUMBER() OVER (PARTITION BY "Opposite_Id" ORDER BY "Send_Time" DESC) AS rn
                FROM "MessageList" ml
            )
            SELECT 
                "Id", "Sender_Id", "Sender_Name", "Content", "Receiver_Id", "Receiver_Name", "Send_Time", "Read_Time", "History_Iden",
                "Opposite_Id", "Opposite_Name", "Opposite_Email", "Opposite_Address", "Opposite_Profession", "Opposite_Photo_Name", 
                "Unread_Message_Count", country, gender, birthday
            FROM "LastMessagesReadStatus"
            WHERE rn = 1
            ORDER BY "Send_Time" DESC;`);
        return initList.rows
    } catch (error) {
        console.log(error)
    }
}

// To get the User list for the Chat
const getFriends = async (loggedId) => {
    try {
        let initList = []
        initList = await PG_query(`WITH "FriendsList" AS (
            SELECT f.friend_id AS "friend_id"
            FROM friends f
            WHERE f.user_id = ${loggedId}
            UNION
            SELECT f.user_id AS "friend_id"
            FROM friends f
            WHERE f.friend_id = ${loggedId}
        ),
        "UsersInfo" AS (
            SELECT *
            FROM "Users" u
        ),
        "LastMessagePerFriend" AS (
            SELECT DISTINCT ON (
                CASE 
                    WHEN m."Sender_Id" = ${loggedId} THEN m."Receiver_Id"
                    ELSE m."Sender_Id"
                END
            )
            m.*, 
            CASE 
                WHEN m."Sender_Id" = ${loggedId} THEN m."Receiver_Id"
                ELSE m."Sender_Id"
            END AS "Friend_Id"
            FROM "Messages" m
            WHERE m."History_Iden" = 1
            AND (m."Sender_Id" = ${loggedId} OR m."Receiver_Id" = ${loggedId})
            ORDER BY 
                CASE 
                    WHEN m."Sender_Id" = ${loggedId} THEN m."Receiver_Id"
                    ELSE m."Sender_Id"
                END,
                m."Send_Time" DESC
        ),
        "UnreadCount" AS (
            SELECT
                m."Sender_Id" AS "Friend_Id",
                COUNT(*) AS "Unread_Message_Count"
            FROM "Messages" m
            WHERE m."Receiver_Id" = ${loggedId}
            AND m."Read_Time" IS NULL
            GROUP BY m."Sender_Id"
        )

        SELECT 
            f."friend_id" AS "Opposite_Id",
            u."Name" AS "Opposite_Name",
            u."Email" AS "Opposite_Email",
            u."Address" AS "Opposite_Address",
            u."Profession" AS "Opposite_Profession",
            u."Photo_Name" AS "Opposite_Photo_Name",
            u.country,
            u.gender,
            u.birthday,

            m."Id",
            m."Sender_Id",
            su."Name" AS "Sender_Name",
            m."Content",
            m."Receiver_Id",
            ru."Name" AS "Receiver_Name",
            m."Send_Time",
            m."Read_Time",
            m."History_Iden",

            COALESCE(uc."Unread_Message_Count", 0) AS "Unread_Message_Count"

        FROM "FriendsList" f
        LEFT JOIN "UsersInfo" u ON u."Id" = f."friend_id"
        LEFT JOIN "LastMessagePerFriend" m ON m."Friend_Id" = f."friend_id"
        LEFT JOIN "UsersInfo" su ON su."Id" = m."Sender_Id"
        LEFT JOIN "UsersInfo" ru ON ru."Id" = m."Receiver_Id"
        LEFT JOIN "UnreadCount" uc ON uc."Friend_Id" = f."friend_id"

        ORDER BY m."Send_Time" DESC NULLS LAST;`);

        return initList.rows
    } catch (error) {
        console.log(error)
    }
}

// To get the User list for the Chat
const addFriend = async (loggedId, friendId) => {
    try {
        let cons = await PG_query(`INSERT INTO friends (user_id, friend_id)
            SELECT ${loggedId}, ${friendId}
            WHERE ${loggedId} != ${friendId}
            AND NOT EXISTS (
                SELECT 1 FROM friends
                WHERE (user_id = ${loggedId} AND friend_id = ${friendId})
                OR (user_id = ${friendId} AND friend_id = ${loggedId})
            );`);
    } catch (error) {
        console.log(error)
    }
}

// unfriend user 
const unFriend = async (loggedId, friendId) => {
    try {
        await PG_query(`DELETE FROM friends
            WHERE (user_id = ${loggedId} AND friend_id = ${friendId})
            OR (user_id = ${friendId} AND friend_id = ${loggedId});`);
    } catch (error) {
        console.log(error);
    }
}

// To get the User list for the Chat
const getSearchUsers = async (search) => {
    try {
        let users = await PG_query(`SELECT u."Id" as "Opposite_Id", u."Photo_Name" as "Opposite_Photo_Name", u."Profession" as "Opposite_Profession", 
            u."Name" as "Opposite_Name", u."Email" as "Opposite_Email", u.country, u.gender, u.birthday
            FROM "Users" u
            WHERE u."Name" ILIKE  '%${search}%'  
                OR u."Email" ILIKE  '%${search}%';`); 
        return users.rows
    } catch (error) {
        console.log(error)
    }

}

// Get group info that updated
const getGroup = async (groupId) => {
    try {
        let initList = []
        initList = await PG_query(`SELECT 
            g.*,
            creator."Name" AS creater_name,
            JSONB_AGG(DISTINCT 
                JSONB_BUILD_OBJECT(
                    'id', COALESCE(u."Id", gu2.user_id),
                    'name', COALESCE(u."Name", 'Anonymous User #' || gu2.user_id),
                    'email', COALESCE(u."Email", 'anon' || gu2.user_id || '@anonymous.local'),
                    'avatar', u."Photo_Name",
                    'gender', u.gender,
                    'birthday', u.birthday,
                    'country', u.country,
                    'banned', gu2.banned,
                    'unban_request', gu2.unban_request,
                    'is_member', gu2.is_member, 
                    'role_id', gu2.role_id,
                    'chat_limit', gu2.chat_limit,
                    'manage_mods', gu2.manage_mods,
                    'manage_chat', gu2.manage_chat,
                    'manage_censored', gu2.manage_censored,
                    'ban_user', gu2.ban_user,
                    'filter_mode', gu2.filter_mode,
                    'to_time', gu2.to_time,
                    'is_timed_out', CASE WHEN gu2.to_time IS NOT NULL AND gu2.to_time > CURRENT_TIMESTAMP THEN true ELSE false END
                )
            ) FILTER (WHERE gu2.user_id IS NOT NULL) AS members
        FROM 
            groups g
        LEFT JOIN 
            group_users gu1 ON g.id = gu1.group_id
        LEFT JOIN 
            group_users gu2 ON g.id = gu2.group_id
        LEFT JOIN 
            "Users" u ON gu2.user_id = u."Id"
        LEFT JOIN 
            "Users" creator ON g.creater_id = creator."Id"
        WHERE 
            g.id = ${groupId}
        GROUP BY 
            g.id, g.name, g.creater_id, creator."Name";`); 
        return initList.rows.length > 0 ? initList.rows[0] : null
    } catch (error) {
        console.log(error)
    }
}

// Get groups that created by user
const getMyGroups = async (loggedId) => {
    try {
        let initList = []
        initList = await PG_query(`SELECT 
            g.*,
            creator."Name" AS creater_name,
            JSONB_AGG(DISTINCT 
                JSONB_BUILD_OBJECT(
                    'id', COALESCE(u."Id", gu2.user_id),
                    'name', COALESCE(u."Name", 'Anonymous User #' || gu2.user_id),
                    'email', COALESCE(u."Email", 'anon' || gu2.user_id || '@anonymous.local'),
                    'avatar', u."Photo_Name",
                    'gender', u.gender,
                    'birthday', u.birthday,
                    'country', u.country,
                    'banned', gu2.banned,
                    'unban_request', gu2.unban_request,
                    'is_member', gu2.is_member, 
                    'role_id', gu2.role_id,
                    'chat_limit', gu2.chat_limit,
                    'manage_mods', gu2.manage_mods,
                    'manage_chat', gu2.manage_chat,
                    'manage_censored', gu2.manage_censored,
                    'ban_user', gu2.ban_user,
                    'filter_mode', gu2.filter_mode,
                    'to_time', gu2.to_time,
                    'is_timed_out', CASE WHEN gu2.to_time IS NOT NULL AND gu2.to_time > CURRENT_TIMESTAMP THEN true ELSE false END
                )
            ) FILTER (WHERE gu2.user_id IS NOT NULL) AS members
        FROM 
            groups g
        LEFT JOIN 
            group_users gu1 ON g.id = gu1.group_id
        LEFT JOIN 
            group_users gu2 ON g.id = gu2.group_id
        LEFT JOIN 
            "Users" u ON gu2.user_id = u."Id"
        LEFT JOIN 
            "Users" creator ON g.creater_id = creator."Id"
        WHERE 
            g.creater_id = ${loggedId}
        GROUP BY 
            g.id, g.name, g.creater_id, creator."Name"
        ORDER BY 
            (g.creater_id = ${loggedId}) DESC, g.id;`); 
        console.log(initList.rows);
        return initList.rows
    } catch (error) {
        console.log(error)
    }
}

// Get groups that added in user's favorites
const getFavGroups = async (loggedId) => {
    try {
        let initList = []
        initList = await PG_query(`SELECT 
            g.*,
            creator."Name" AS creater_name,
            JSONB_AGG(DISTINCT 
                JSONB_BUILD_OBJECT(
                    'id', COALESCE(u."Id", gu2.user_id),
                    'name', COALESCE(u."Name", 'Anonymous User #' || gu2.user_id),
                    'email', COALESCE(u."Email", 'anon' || gu2.user_id || '@anonymous.local'),
                    'avatar', u."Photo_Name",
                    'gender', u.gender,
                    'birthday', u.birthday,
                    'country', u.country,
                    'banned', gu2.banned,
                    'unban_request', gu2.unban_request,
                    'is_member', gu2.is_member, 
                    'role_id', gu2.role_id,
                    'chat_limit', gu2.chat_limit,
                    'manage_mods', gu2.manage_mods,
                    'manage_chat', gu2.manage_chat,
                    'manage_censored', gu2.manage_censored,
                    'ban_user', gu2.ban_user,
                    'filter_mode', gu2.filter_mode,
                    'to_time', gu2.to_time,
                    'is_timed_out', CASE WHEN gu2.to_time IS NOT NULL AND gu2.to_time > CURRENT_TIMESTAMP THEN true ELSE false END
                )
            ) FILTER (WHERE gu2.user_id IS NOT NULL) AS members
        FROM 
            groups g
        LEFT JOIN 
            group_users gu1 ON g.id = gu1.group_id
        LEFT JOIN 
            group_users gu2 ON g.id = gu2.group_id
        LEFT JOIN 
            "Users" u ON gu2.user_id = u."Id"
        LEFT JOIN 
            "Users" creator ON g.creater_id = creator."Id"
        WHERE 
            gu1.user_id = ${loggedId}
            AND gu1.is_member = 1
        GROUP BY 
            g.id, g.name, g.creater_id, creator."Name"
        ORDER BY 
            (g.creater_id = ${loggedId}) DESC, g.id;`); 
        return initList.rows
    } catch (error) {
        console.log(error)
    }
}

// Called when user add group to his favorite or remove from favorites
const updateGroupFavInfo = async (groupId, userId, isMember) => {
    try {
        // To set the History_Iden for the latest chat as 0
        await PG_query(`UPDATE group_users
            SET is_member = ${isMember}
            WHERE group_id = ${groupId} AND user_id = ${userId};`);

    } catch (err) {
        console.log(err)
    }
};

const joinFromSignup = async (groupId, userId, anonId, ip) => {
    try {
        // To set the History_Iden for the latest chat as 0
        // await PG_query(`DELETE FROM group_users 
        //     WHERE group_id = ${groupId} AND user_id = ${anonId}`);
        await PG_query(`INSERT INTO group_users (group_id, user_id, ip)
            VALUES (${groupId}, ${userId}, '${ip}')
            ON CONFLICT (group_id, user_id)
            DO UPDATE
            SET ip = EXCLUDED.ip;`);
    } catch (err) {
        console.log(err)
    }
};

// To get message list for 1 day
const getMsg = async (user, opposite) => {
    try {
        let msgList = []
        if (opposite != undefined) {
            msgList = await PG_query(`SELECT 
                m.*, u."Name" AS sender_name, u."Photo_Name" AS sender_avatar
                    FROM "Messages" m
                    JOIN "Users" u ON m."Sender_Id" = u."Id"
                    WHERE (("Sender_Id" = ${user} AND "Receiver_Id" = ${opposite}) OR ("Sender_Id" = ${opposite} AND "Receiver_Id" = ${user}))
                    AND DATE("Send_Time") = (
                        SELECT MAX(DATE("Send_Time"))
                        FROM "Messages"
                        WHERE (("Sender_Id" = ${user} AND "Receiver_Id" = ${opposite}) OR ("Sender_Id" = ${opposite} AND "Receiver_Id" = ${user}))
                    )
                    ORDER BY "Send_Time";`)
        }        
        return msgList.rows
    } catch (error) {
        console.log(error)
    }
}

// To get message list for 1 day
const getGroupMsg = async (groupId) => {
    try {
        let msgList = []
        msgList = await PG_query(`SELECT 
                m.*, 
                u."Name" AS sender_name, 
                u."Photo_Name" AS sender_avatar,
                gu.banned AS sender_banned,
                gu.unban_request AS sender_unban_request
            FROM 
                "Messages" m
            LEFT JOIN  
                "Users" u ON m."Sender_Id" = u."Id"
            LEFT JOIN 
                "group_users" gu ON gu."user_id" = m."Sender_Id" AND gu."group_id" = m."group_id"
            WHERE 
                m.group_id = ${groupId} 
                AND DATE(m."Send_Time") = (
                        SELECT MAX(DATE("Send_Time"))
                        FROM "Messages"
                        WHERE "group_id" = ${groupId} 
                    )
            ORDER BY 
                m."Id";`)
        return msgList.rows
    } catch (error) {
        console.log(error)
    }
}

// To get message list for 1 day
const getGroupId = async (groupName) => {
    try {
        let groupId = []
        groupId = await PG_query(`SELECT id FROM groups WHERE name = '${groupName}';;`)
        return groupId.rows[0].id
    } catch (error) {
        console.log(error)
    }
}

// To get message History for Read More
const getHistory = async (user, opposite, limit) => {
    try {
        let historyList = []
        historyList = await PG_query(`SELECT *
         FROM "Messages"
         WHERE (("Sender_Id" = ${user} AND "Receiver_Id" = ${opposite}) OR ("Sender_Id" = ${opposite} AND "Receiver_Id" = ${user}))
         AND DATE("Send_Time") BETWEEN 
             (SELECT DATE(MAX("Send_Time")) - INTERVAL '${limit} day' FROM "Messages") 
             AND 
             (SELECT DATE(MAX("Send_Time")) FROM "Messages")
         ORDER BY "Send_Time";`)
        return historyList.rows
    } catch (error) {
        console.log(error)
    }
}

// To get message History for Read More
const getGroupHistory = async (groupId, limit) => {
    const lmt = 30
    try {
        let historyList = []
        historyList = await PG_query(`SELECT 
                m.*, 
                u."Name" AS sender_name, 
                u."Photo_Name" AS sender_avatar,
                gu.banned AS sender_banned,
                gu.unban_request AS sender_unban_request
            FROM 
                "Messages" m
            LEFT JOIN  
                "Users" u ON m."Sender_Id" = u."Id"
            LEFT JOIN 
                "group_users" gu ON gu."user_id" = m."Sender_Id" AND gu."group_id" = m."group_id"
            WHERE 
                m.group_id = ${groupId} 
            AND DATE(m."Send_Time") BETWEEN 
                        (SELECT DATE(MAX("Send_Time")) - INTERVAL '${lmt} day' FROM "Messages")
                        AND 
                        (SELECT DATE(MAX("Send_Time")) FROM "Messages")
            ORDER BY 
                m."Id";`)
        return historyList.rows
    } catch (error) {
        console.log(error)
    }
}

// To get the chat opposite detail for the chat now button action
const getChatOppositeDetail = async (id) => {
    let opposite = await PG_query(`SELECT u."Id", u."Name", u."Email", u."Address", u."Profession" FROM "Users" as u WHERE u."Id"=${id}`)
    return opposite.rows[0]
}

// To save the new message
const saveMsg = async (sender_id, content, receiver_id, parent_id) => {
    try {
        // To set the History_Iden for the latest chat as 0
        await PG_query(`UPDATE "Messages" SET "History_Iden" = 0 
             WHERE "Id" = (
                 SELECT "Id" 
                 FROM "Messages" 
                 WHERE (("Sender_Id" = ${sender_id} AND "Receiver_Id" = ${receiver_id}) 
                 OR ("Sender_Id" = ${receiver_id} AND "Receiver_Id" = ${sender_id}))
                 AND "History_Iden" = 1
                 ORDER BY "Send_Time" DESC 
                 LIMIT 1
         );`)

        // To set the History_Iden for the new chat as 1
        await PG_query(`INSERT INTO "Messages" ("Sender_Id", "Send_Time", "Content", "Receiver_Id", "History_Iden", "parent_id")
         VALUES (${sender_id}, CURRENT_TIMESTAMP, '${content}', ${receiver_id}, 1, ${parent_id == undefined ? null : parent_id});`)

    } catch (err) {
        console.log(err)
    }
};

// To save the new group message
const deleteMsg = async (msgId, sender_id, receiver_id) => {
    try {
        // To set the History_Iden for the new chat as 1
        await PG_query(`DELETE FROM "Messages" WHERE "Id" = ${msgId};`)
        await PG_query(`UPDATE "Messages"
            SET "History_Iden" = 1
            FROM (
                SELECT "Id"
                FROM "Messages"
                WHERE (("Sender_Id" = ${sender_id} AND "Receiver_Id" = ${receiver_id}) 
                    OR ("Sender_Id" = ${receiver_id} AND "Receiver_Id" = ${sender_id}))
                AND "History_Iden" = 0
                ORDER BY "Send_Time" DESC
                LIMIT 1
            ) AS sub
            WHERE "Messages"."Id" = sub."Id";`);

    } catch (err) {
        console.log(err)
    }
};

// To save the new group message
const saveGroupMsg = async (sender_id, content, group_id, receiverId, parent_id) => {
    try {
        await PG_query(`INSERT INTO "Messages" ("Receiver_Id", "Sender_Id", "Send_Time", "Content", "group_id", "History_Iden", "parent_id")
         VALUES (${receiverId}, ${sender_id}, CURRENT_TIMESTAMP, '${content}', ${group_id}, 1, ${parent_id == undefined ? null : parent_id});`)

    } catch (err) {
        console.log(err)
    }
};

// To save the new group message
const deleteGroupMsg = async (msgId) => {
    try {
        // To set the History_Iden for the new chat as 1
        await PG_query(`DELETE FROM "Messages" WHERE "Id" = ${msgId};`)
        await PG_query(`DELETE FROM pin_messages WHERE message_id = ${msgId};`)
    } catch (err) {
        console.log(err)
    }
};

const timeoutUser = async (groupId, userId) => {
    try {
        console.log(`⏰ [TIMEOUT] Setting timeout for user ${userId} in group ${groupId} for ${TIMEOUT_MINS} minutes`);
        
        // First ensure the user exists in group_users table
        const userExists = await PG_query(`SELECT * FROM group_users WHERE group_id = ${groupId} AND user_id = ${userId};`);
        
        if (userExists.rows.length === 0) {
            console.log(`⏰ [TIMEOUT] User ${userId} not found in group ${groupId}, adding them first`);
            await PG_query(`INSERT INTO group_users (group_id, user_id, is_member, role_id, banned) 
                VALUES (${groupId}, ${userId}, 1, 0, 0) 
                ON CONFLICT (group_id, user_id) DO NOTHING;`);
        }
        
        // Set timeout
        const result = await PG_query(`UPDATE group_users
            SET to_time = CURRENT_TIMESTAMP + INTERVAL '${TIMEOUT_MINS} minutes'
            WHERE group_id = ${groupId} AND user_id = ${userId}
            RETURNING to_time;`);
            
        if (result.rows.length > 0) {
            console.log(`✅ [TIMEOUT] User ${userId} timed out until: ${result.rows[0].to_time}`);
        } else {
            console.log(`❌ [TIMEOUT] Failed to timeout user ${userId} in group ${groupId}`);
        }
        
    } catch (error) {
        console.error(`❌ [TIMEOUT] Error timing out user ${userId} in group ${groupId}:`, error);
    }
}

const timeoutIpAddress = async (groupId, ipAddress, timeoutBy) => {
    try {
        // First clean up any expired timeouts
        await PG_query(`UPDATE ip_timeouts 
            SET is_active = false 
            WHERE is_active = true AND expires_at < CURRENT_TIMESTAMP;`);
        
        // Check if there's already an active timeout for this IP
        const existingTimeout = await PG_query(`SELECT id FROM ip_timeouts 
            WHERE group_id = ${groupId} AND ip_address = '${ipAddress}' AND is_active = true;`);
        
        if (existingTimeout.rows.length > 0) {
            // Extend existing timeout
            await PG_query(`UPDATE ip_timeouts 
                SET expires_at = CURRENT_TIMESTAMP + INTERVAL '${TIMEOUT_MINS} minutes',
                    timeout_at = CURRENT_TIMESTAMP,
                    timeout_by = ${timeoutBy}
                WHERE id = ${existingTimeout.rows[0].id};`);
            console.log(`⏰ Extended existing IP timeout for ${ipAddress} in group ${groupId}`);
        } else {
            // Create new IP timeout
            await PG_query(`INSERT INTO ip_timeouts (group_id, ip_address, timeout_by, expires_at)
                VALUES (${groupId}, '${ipAddress}', ${timeoutBy}, CURRENT_TIMESTAMP + INTERVAL '${TIMEOUT_MINS} minutes');`);
            console.log(`⏰ Created new IP timeout for ${ipAddress} in group ${groupId}`);
        }
    } catch (error) {
        console.log("Error timing out IP address:", error);
    }
}

const checkUserTimeout = async (groupId, userId) => {
    try {
        console.log(`⏰ [CHECK] Checking timeout for user ${userId} in group ${groupId}`);
        
        // Check if user is timed out in the group_users table
        const result = await PG_query(`SELECT to_time FROM group_users 
            WHERE group_id = ${groupId} AND user_id = ${userId} 
            AND to_time IS NOT NULL AND to_time > CURRENT_TIMESTAMP;`);
        
        console.log(`⏰ [CHECK] Timeout check result: ${result.rows.length} rows`);
        
        if (result.rows.length > 0) {
            console.log(`⏰ [CHECK] User ${userId} is timed out until: ${result.rows[0].to_time}`);
            return {
                isTimedOut: true,
                expiresAt: result.rows[0].to_time
            };
        }
        
        console.log(`⏰ [CHECK] User ${userId} is not timed out`);
        return { isTimedOut: false };
    } catch (error) {
        console.error(`❌ [CHECK] Error checking user timeout for user ${userId} in group ${groupId}:`, error);
        return { isTimedOut: false };
    }
}

const checkIpTimeout = async (groupId, ipAddress) => {
    try {
        // First clean up any expired timeouts
        await PG_query(`UPDATE ip_timeouts 
            SET is_active = false 
            WHERE is_active = true AND expires_at < CURRENT_TIMESTAMP;`);
            
        const result = await PG_query(`SELECT expires_at FROM ip_timeouts 
            WHERE group_id = ${groupId} AND ip_address = '${ipAddress}' AND is_active = true 
            AND expires_at > CURRENT_TIMESTAMP;`);
        
        if (result.rows.length > 0) {
            return {
                isTimedOut: true,
                expiresAt: result.rows[0].expires_at
            };
        }
        
        return { isTimedOut: false };
    } catch (error) {
        console.log("Error checking IP timeout:", error);
        return { isTimedOut: false };
    }
}

const banGroupUser = async (groupId, userId) => {
    try {
        // First, ensure the user exists in group_users table (INSERT if not exists)
        await PG_query(`INSERT INTO group_users (group_id, user_id, banned, unban_request, is_member)
            VALUES (${groupId}, ${userId}, 1, 0, 0)
            ON CONFLICT (group_id, user_id)
            DO UPDATE SET banned = 1, unban_request = 0;`)
        
        console.log(`User ${userId} banned from group ${groupId} (added to group_users if not existed)`);
        
        // Delete pinned messages from banned user
        await PG_query(`DELETE FROM pin_messages
            WHERE message_id IN (
                SELECT id
                FROM "Messages"
                WHERE "Sender_Id" = ${userId} and group_id = ${groupId}
            );`)
        
        // Delete messages from banned user
        await PG_query(`DELETE FROM "Messages"
            WHERE "Sender_Id" = ${userId} and group_id = ${groupId};`)
    } catch (error) {
        console.log("Error banning user:", error);
    }
}

const banGroupUserWithIp = async (groupId, userId, ipAddress, bannedBy) => {
    try {
        console.log(`🚨 [IP-BAN-DEBUG] Starting IP ban process for user ${userId}, IP: ${ipAddress}, group: ${groupId}, bannedBy: ${bannedBy}`);
        
        // First, ban the user normally
        console.log(`🚨 [IP-BAN-DEBUG] Step 1: Banning user normally...`);
        await banGroupUser(groupId, userId);
        console.log(`🚨 [IP-BAN-DEBUG] Step 1 completed: User banned normally`);
        
        // Check if there's already ANY ban for this IP (active or inactive)
        console.log(`🚨 [IP-BAN-DEBUG] Step 2: Checking for existing bans (any status)...`);
        const existingBanQuery = `SELECT id, is_active FROM ip_bans 
            WHERE group_id = ${groupId} AND ip_address = '${ipAddress}'
            ORDER BY banned_at DESC LIMIT 1;`;
        console.log(`🚨 [IP-BAN-DEBUG] Existing ban query:`, existingBanQuery);
        const existingBan = await PG_query(existingBanQuery);
        console.log(`🚨 [IP-BAN-DEBUG] Existing ban result:`, existingBan.rows);
        
        if (existingBan.rows.length > 0) {
            // Update existing ban (whether active or inactive)
            const existingRecord = existingBan.rows[0];
            const wasActive = existingRecord.is_active;
            console.log(`🚨 [IP-BAN-DEBUG] Step 3a: Updating existing ban (was ${wasActive ? 'active' : 'inactive'})...`);
            
            // For anonymous users (>100000000), use NULL for user_id to avoid foreign key constraint
            const isAnonymousUser = userId > 100000000;
            const dbUserId = isAnonymousUser ? 'NULL' : userId;
            console.log(`🚨 [IP-BAN-DEBUG] User ${userId} is ${isAnonymousUser ? 'anonymous' : 'registered'}, using DB user_id: ${dbUserId}`);
            
            const updateQuery = `UPDATE ip_bans 
                SET is_active = true, user_id = ${userId}, banned_by = ${bannedBy}, banned_at = CURRENT_TIMESTAMP
                WHERE id = ${existingRecord.id};`;
            console.log(`🚨 [IP-BAN-DEBUG] Update query:`, updateQuery);
            const updateResult = await PG_query(updateQuery);
            console.log(`🚨 [IP-BAN-DEBUG] Update result:`, updateResult);
            console.log(`🔄 ${wasActive ? 'Updated' : 'Reactivated'} existing IP ban for ${ipAddress}`);
        } else {
            // Create new IP ban
            console.log(`🚨 [IP-BAN-DEBUG] Step 3b: Creating new IP ban (no existing record found)...`);
            
            // For anonymous users (>100000000), use NULL for user_id to avoid foreign key constraint
            const isAnonymousUser = userId > 100000000;
            const dbUserId = isAnonymousUser ? 'NULL' : userId;
            console.log(`🚨 [IP-BAN-DEBUG] User ${userId} is ${isAnonymousUser ? 'anonymous' : 'registered'}, using DB user_id: ${dbUserId}`);
            
            const insertQuery = `INSERT INTO ip_bans (group_id, user_id, ip_address, banned_by, is_active, banned_at)
                VALUES (${groupId}, ${dbUserId}, '${ipAddress}', ${bannedBy}, true, CURRENT_TIMESTAMP);`;
            console.log(`🚨 [IP-BAN-DEBUG] Insert query:`, insertQuery);
            const insertResult = await PG_query(insertQuery);
            console.log(`🚨 [IP-BAN-DEBUG] Insert result:`, insertResult);
            console.log(`➕ Created new IP ban for ${ipAddress}`);
        }
        
        console.log(`🚫 [IP-BAN-DB] IP BAN ADDED: User ${userId}, IP ${ipAddress} banned from group ${groupId} by ${bannedBy}`);
        
        // Verify the ban was created
        console.log(`🚨 [IP-BAN-DEBUG] Verifying IP ban creation...`);
        const verifyResult = await PG_query(`SELECT * FROM ip_bans WHERE group_id = ${groupId} AND ip_address = '${ipAddress}' AND is_active = true;`);
        console.log(`🚨 [IP-BAN-DEBUG] Verify result:`, verifyResult.rows);
        
        if (verifyResult.rows.length > 0) {
            const ban = verifyResult.rows[0];
            console.log(`🚨 [IP-BAN-DEBUG] Ban details: ID=${ban.id}, user_id=${ban.user_id}, ip_address=${ban.ip_address}, banned_by=${ban.banned_by}`);
            console.log(`✅ [IP-BAN-DEBUG] IP ban successfully created and verified!`);
        } else {
            console.error(`❌ [IP-BAN-DEBUG] IP ban verification FAILED - no active ban found!`);
        }
        
    } catch (error) {
        console.log("🔍 [IP-BAN-DB] Error banning user with IP:", error);
        console.log("🔍 [IP-BAN-DB] Error stack:", error.stack);
    }
}

const checkIpBan = async (groupId, ipAddress) => {
    try {
        console.log(`🔍 [IP-BAN-DB] Checking database for IP: '${ipAddress}' (length: ${ipAddress?.length}), group: ${groupId}`);
        
        const result = await PG_query(`SELECT * FROM ip_bans 
            WHERE group_id = ${groupId} 
            AND ip_address = '${ipAddress}' 
            AND is_active = true;`);
        
        const isBanned = result.rows.length > 0;
        console.log(`🔍 [IP-BAN-DB] IP ${ipAddress} in group ${groupId} - ${isBanned ? 'BANNED' : 'NOT BANNED'} (${result.rows.length} active bans)`);
        
        if (result.rows.length > 0) {
            console.log(`🔍 [IP-BAN-DB] Active IP ban details:`, result.rows[0]);
        } else {
            // Debug: Show all IP bans for this group to see if there's a mismatch
            const allBans = await PG_query(`SELECT * FROM ip_bans WHERE group_id = ${groupId} AND is_active = true;`);
            console.log(`🔍 [IP-BAN-DB] All active IP bans for group ${groupId} (${allBans.rows.length} total):`, allBans.rows.map(row => ({
                ip: `'${row.ip_address}' (len: ${row.ip_address?.length})`,
                user_id: row.user_id,
                banned_by: row.banned_by,
                banned_at: row.banned_at
            })));
            
            // Check for exact match issues
            if (allBans.rows.length > 0) {
                const exactMatches = allBans.rows.filter(row => row.ip_address === ipAddress);
                const trimMatches = allBans.rows.filter(row => row.ip_address?.trim() === ipAddress?.trim());
                console.log(`🔍 [IP-BAN-DB] Exact matches: ${exactMatches.length}, Trim matches: ${trimMatches.length}`);
            }
        }
        
        return isBanned;
    } catch (error) {
        console.log("Error checking IP ban:", error);
        return false;
    }
}

const checkUserBan = async (groupId, userId) => {
    try {
        const result = await PG_query(`SELECT banned FROM group_users 
            WHERE group_id = ${groupId} 
            AND user_id = ${userId} 
            AND banned = 1;`);
        
        const isBanned = result.rows.length > 0;
        console.log(`🔍 User ban check: User ${userId} in group ${groupId} - ${isBanned ? 'BANNED' : 'NOT BANNED'}`);
        
        return isBanned;
    } catch (error) {
        console.log("Error checking user ban:", error);
        return false;
    }
}

const getIpBans = async (groupId) => {
    try {
        const result = await PG_query(`SELECT 
            ib.*,
            u."Name" as banned_user_name,
            u."Email" as banned_user_email,
            banner."Name" as banned_by_name
        FROM ip_bans ib
        LEFT JOIN "Users" u ON ib.user_id = u."Id"
        LEFT JOIN "Users" banner ON ib.banned_by = banner."Id"
        WHERE ib.group_id = ${groupId} 
        AND ib.is_active = true
        ORDER BY ib.banned_at DESC;`);
        return result.rows;
    } catch (error) {
        console.log("Error getting IP bans:", error);
        return [];
    }
}

const unbanGroupIps = async (groupId, ipAddresses) => {
    try {
        const ipList = ipAddresses.map(ip => `'${ip}'`).join(',');
        const result = await PG_query(`UPDATE ip_bans 
            SET is_active = false 
            WHERE group_id = ${groupId} 
            AND ip_address IN (${ipList}) 
            AND is_active = true;`);
        
        console.log(`Unbanned ${result.rowCount} IP addresses from group ${groupId}: ${ipAddresses}`);
        return result.rowCount;
    } catch (error) {
        console.log("Error unbanning IPs:", error);
        return 0;
    }
}

const debugIpBanStatus = async (groupId, ipAddress) => {
    try {
        const allBans = await PG_query(`SELECT id, user_id, ip_address, banned_by, banned_at, is_active 
            FROM ip_bans 
            WHERE group_id = ${groupId} AND ip_address = '${ipAddress}'
            ORDER BY banned_at DESC;`);
        
        console.log(`🔍 All IP ban records for ${ipAddress} in group ${groupId}:`, allBans.rows);
        
        const activeBans = await PG_query(`SELECT * FROM ip_bans 
            WHERE group_id = ${groupId} AND ip_address = '${ipAddress}' AND is_active = true;`);
        
        console.log(`🔍 Active IP bans: ${activeBans.rows.length}`, activeBans.rows);
        
        return {
            totalBans: allBans.rows.length,
            activeBans: activeBans.rows.length,
            details: allBans.rows
        };
    } catch (error) {
        console.log("Error debugging IP ban status:", error);
        return null;
    }
}

const unbanGroupUser = async (groupId, userId) => {
    try {
        // Unban user in group_users table
        await PG_query(`UPDATE group_users
            SET banned = 0, unban_request = 0
            WHERE group_id = ${groupId} AND user_id = ${userId};`)
        
        // Also remove any IP bans for this user in this group
        await PG_query(`UPDATE ip_bans 
            SET is_active = false 
            WHERE group_id = ${groupId} AND user_id = ${userId} AND is_active = true;`)
        
        console.log(`User ${userId} unbanned from group ${groupId} (including IP bans)`);
    } catch (error) {
        console.log("Error unbanning user:", error);
    }
}

const unbanGroupUsers = async (groupId, userIds) => {
    try {
        // Unban users in group_users table
        const userResult = await PG_query(`UPDATE group_users
            SET banned = 0, unban_request = 0
            WHERE group_id = ${groupId} AND user_id IN (${userIds});`)
        
        console.log(`✅ Unbanned ${userResult.rowCount} users from group_users table`);
        
        // Also remove any IP bans for these users in this group
        const ipResult = await PG_query(`UPDATE ip_bans 
            SET is_active = false 
            WHERE group_id = ${groupId} AND user_id IN (${userIds}) AND is_active = true;`)
        
        console.log(`✅ Deactivated ${ipResult.rowCount} IP bans for users [${userIds}] in group ${groupId}`);
        
        // Debug: Show which IP addresses were affected
        if (ipResult.rowCount > 0) {
            const affectedIps = await PG_query(`SELECT ip_address, user_id 
                FROM ip_bans 
                WHERE group_id = ${groupId} AND user_id IN (${userIds}) AND is_active = false
                ORDER BY banned_at DESC LIMIT 10;`);
            console.log(`🔍 Recently deactivated IPs:`, affectedIps.rows);
        }
        
        console.log(`Users [${userIds}] unbanned from group ${groupId} (including IP bans)`);
    } catch (error) {
        console.log("Error unbanning users:", error);
    }
}

const updateCensoredContents = async (groupId, contents) => {
    try {
        await PG_query(`UPDATE groups
            SET censored_words = '${contents}'
            WHERE id = ${groupId};`)
    } catch (error) {
        console.log(error);
    }
}

const updateGroupModerators = async (groupId, senderId, modIds) => {
    try {
        await PG_query(`UPDATE group_users
            SET role_id = CASE
                WHEN role_id = 1 THEN role_id
                WHEN user_id = ANY(ARRAY[${modIds}]) THEN 2
                ELSE NULL
            END
            WHERE group_id = ${groupId};`)
    } catch (error) {
        console.log(error);
    }
}

const clearGroupChat = async (groupId) => {
    try {
        await PG_query(`DELETE FROM "Messages" WHERE group_id = ${groupId};`)
        await PG_query(`DELETE FROM pin_messages WHERE group_id = ${groupId};`)
    } catch (error) {
        console.log(error);
    }
}

const pinChatMessage = async (msgId, groupId, userId) => {
    try {
        await PG_query(`INSERT INTO pin_messages (message_id, user_id, group_id)
            SELECT ${msgId}, ${userId}, ${groupId}
            WHERE NOT EXISTS (
                SELECT 1 FROM pin_messages
                WHERE message_id = ${msgId} AND user_id = ${userId}
            );`);
    } catch (error) {
        console.log(error);
    }
}

const unpinChatMessage = async (msgId) => {
    try {
        await PG_query(`DELETE FROM pin_messages
            WHERE message_id = ${msgId};`);
    } catch (error) {
        console.log(error);
    }
}

const blockUser = async (userId, blockId) => {
    try {
        await PG_query(`INSERT INTO block_users (user_id, block_id)
            SELECT ${userId}, ${blockId}
            WHERE NOT EXISTS (
                SELECT 1 FROM block_users
                WHERE user_id = ${userId} AND block_id = ${blockId}
            );`);
    } catch (error) {
        console.log(error);
    }
}

const unblockUser = async (userId, blockId) => {
    try {
        await PG_query(`DELETE FROM block_users WHERE user_id = ${userId} AND block_id = ${blockId};`);
    } catch (error) {
        console.log(error);
    }
}

const getBlockedUsers = async (userId) => {
    try {
        const userIds = await PG_query(`SELECT COALESCE(array_agg(block_id), ARRAY[]::integer[]) AS blocked_ids
            FROM block_users
            WHERE user_id = ${userId};`);
        return userIds.rows[0].blocked_ids || [];
    } catch (error) {
        console.log(error);
        return [];
    }
}

const getBlockedUsersInfo = async (userId) => {
    try {
        const userIds = await PG_query(`SELECT u."Id" AS "Opposite_Id",
                u."Name" AS "Opposite_Name",
                u."Email" AS "Opposite_Email",
                u."Address" AS "Opposite_Address",
                u."Profession" AS "Opposite_Profession",
                u."Photo_Name" AS "Opposite_Photo_Name",
                u.country,
                u.gender,
                u.birthday
            FROM "Users" u
            JOIN block_users bu
            ON u."Id" = bu.block_id
            WHERE bu.user_id = ${userId};`);
        return userIds.rows;
    } catch (error) {
        console.log(error);
        return new array();
    }
}

const updateGroupBlockedUsers = async (userId, groupId, blockIds) => {
    
    try {
        if (blockIds.length > 0) {
            await PG_query(`INSERT INTO block_users (user_id, group_id, block_id)
                SELECT
                    ${userId}, ${groupId}, unnest(ARRAY[${blockIds}])
                ON CONFLICT (user_id, group_id, block_id) DO NOTHING;
                
                DELETE FROM block_users
                WHERE user_id = ${userId}
                    AND group_id = ${groupId}
                    AND block_id NOT IN (SELECT unnest(ARRAY[${blockIds}]));`);
        } else {
            await PG_query(`DELETE FROM block_users
                WHERE user_id = ${userId}
                    AND group_id = ${groupId};`);
        }        
    } catch (error) {
        console.log(error);
    }
}

const unblockGroupUser = async (userId, groupId, blockId) => {
    try {
        await PG_query(`DELETE FROM block_users
            WHERE user_id = ${userId} AND group_id = ${groupId} AND block_id = ${blockId};`);
    } catch (error) {
        console.log(error);
    }
}

const updateGroupPostModes = async (
    groupId, 
    post_level, 
    url_level, 
    slow_mode, 
    slow_time
) => {
    try {
        await PG_query(`UPDATE groups
            SET
                post_level = ${post_level},
                url_level = ${url_level},
                slow_mode = ${slow_mode},
                slow_time = ${slow_time}
            WHERE id = ${groupId};`);
    } catch (error) {
        console.log(error);
    }
}

const updateGroupChatboxStyle = async (
    groupId, 
    size_mode,
    frame_width,
    frame_height,
    bg_color,
    title_color,
    msg_bg_color,
    msg_txt_color,
    reply_msg_color,
    msg_date_color,
    input_bg_color,
    show_user_img,
    custom_font_size,
    font_size,
    round_corners,
    corner_radius 
) => {
    try {
        await PG_query(`UPDATE groups
            SET
                size_mode = '${size_mode}',
                frame_width = ${frame_width},
                frame_height = ${frame_height},
                bg_color = '${bg_color}',
                title_color = '${title_color}',
                msg_bg_color = '${msg_bg_color}',
                msg_txt_color = '${msg_txt_color}',
                reply_msg_color = '${reply_msg_color}',
                msg_date_color = '${msg_date_color}',
                input_bg_color = '${input_bg_color}',
                show_user_img = ${show_user_img},
                custom_font_size = ${custom_font_size},
                font_size = ${font_size},
                round_corners = ${round_corners},
                corner_radius = ${corner_radius}
            WHERE id = ${groupId};`);
    } catch (error) {
        console.log(error);
    }
}

const updateGroupModPriorities = async (
    modId, 
    groupId, 
    chat_limit, 
    manage_mods, 
    manage_chat, 
    manage_censored, 
    ban_user
) => {
    try {
        await PG_query(`UPDATE group_users
            SET
                chat_limit = ${chat_limit},
                manage_mods = ${manage_mods},
                manage_chat = ${manage_chat},
                manage_censored = ${manage_censored},
                ban_user = ${ban_user}
            WHERE user_id = ${modId} AND group_id = ${groupId};`);
    } catch (error) {
        console.log(error);
    }
}

const sendGroupNotification = async (senderId, groupId, message) => {
    try {
        await PG_query(`INSERT INTO "Messages" ("Content", "Sender_Id", "Receiver_Id")
            SELECT 
                '${message}' AS "Content",
                ${senderId} AS "Sender_Id",
                gu.user_id AS "Receiver_Id"
            FROM group_users gu
            WHERE gu.group_id = ${groupId}
            AND gu.user_id <> ${senderId}
            AND gu.user_id < 1000000;`);
    } catch (error) {
        console.log(error)
    }
}

const getLastMessage = async (senderId, receiverId) => {
  try {
    const result = await PG_query(`
      SELECT *
      FROM "Messages"
      WHERE "Sender_Id" = ${senderId}
        AND "Receiver_Id" = ${receiverId}
      ORDER BY "Id" DESC
      LIMIT 1;
    `);

    const lastMsg = result.rows;

    if (lastMsg && lastMsg.length > 0) {
      return lastMsg[0];
    } else {
      return null;
    }        
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getPinnedMsgInfo = async (groupId) => {
    try {
        let msgs = await PG_query(`SELECT message_id FROM pin_messages
            WHERE group_id = ${groupId};`);
        return msgs.rows.map(row => row.message_id)
    } catch (error) {
        console.log(error);
    }
}

 // Router to user to Group as Listener
const joinToGroup = async (groupId, userId) => {
     try {
         await PG_query(`INSERT INTO group_users (group_id, user_id, is_member)
            VALUES (${groupId}, ${userId}, 1)
            ON CONFLICT (group_id, user_id)
            DO UPDATE SET is_member = 1;`);
     } catch (error) {
         console.log(error);
     }
 };

// To handle the message read function
const readMSG = async (sender, receiver) => {
    try {

        await PG_query(`UPDATE "Messages"
                         SET "Read_Time" = CURRENT_TIMESTAMP
                         WHERE "Sender_Id" = ${sender} AND "Receiver_Id" = ${receiver};`)
    } catch (error) {
        console.log(error)

    }
}

// To handle the message read function
const readGroupMSG = async (groupId) => {
    try {

        await PG_query(`UPDATE "Messages"
                         SET "Read_Time" = CURRENT_TIMESTAMP
                         WHERE "group_id" = ${groupId};`)
    } catch (error) {
        console.log(error)

    }
}

const getReceiverIdsOfGroup = async (groupId) => {
    try {
        let userIds = []
        userIds = await PG_query(`SELECT COALESCE(array_agg(user_id), ARRAY[]::integer[]) as user_ids
            FROM group_users
            WHERE group_id = ${groupId};`);
        return userIds.rows[0].user_ids || [];
    } catch (error) {
        console.log("ERRR====");
        console.log(error);
        return [];
    }
}

const getReceiverEmailsOfGroup = async (groupId) => {
    try {
        let userIds = []
        userIds = await PG_query(`SELECT COALESCE(array_agg(u."Email"), ARRAY[]::text[]) AS emails
            FROM group_users gu
            JOIN "Users" u ON u."Id" = gu.user_id
            WHERE gu.group_id = ${groupId}`);
        return userIds.rows[0].emails || [];
    } catch (error) {
        console.log("ERRR====");
        console.log(error);
        return [];
    }
}

// Get chat rules for a group
const getChatRules = async (groupId) => {
    try {
        const result = await PG_query(`
            SELECT chat_rules, show_chat_rules, creater_id 
            FROM groups 
            WHERE id = ${groupId}
        `);
        
        if (result.rows.length === 0) {
            return null;
        }
        
        return result.rows[0];
    } catch (error) {
        console.log("Error getting chat rules:", error);
        return null;
    }
}

// Update chat rules for a group
const updateChatRules = async (groupId, chatRules, showChatRules, userId) => {
    try {
        console.log("updateChatRules called with:", { groupId, userId, chatRules: chatRules?.length, showChatRules });
        
        // Check if user is the creator
        const groupCheck = await PG_query(`SELECT creater_id FROM groups WHERE id = ${groupId}`);
        console.log("Group check result:", groupCheck.rows);
        
        if (groupCheck.rows.length === 0) {
            console.log("Group not found");
            return { success: false, error: "Group not found" };
        }
        
        if (groupCheck.rows[0].creater_id !== userId) {
            console.log("User not authorized:", { creater_id: groupCheck.rows[0].creater_id, userId });
            return { success: false, error: "Unauthorized" };
        }
        
        // Escape single quotes in chat rules to prevent SQL injection
        const escapedChatRules = (chatRules || '').replace(/'/g, "''");
        
        // Update chat rules
        await PG_query(`
            UPDATE groups 
            SET chat_rules = '${escapedChatRules}', 
                show_chat_rules = ${showChatRules || false}
            WHERE id = ${groupId}
        `);
        
        console.log("Chat rules updated successfully");
        return { success: true, chatRules: chatRules || '', showChatRules: showChatRules || false };
    } catch (error) {
        console.log("Error updating chat rules:", error);
        return { success: false, error: "Database error" };
    }
}

module.exports = {
    sendNotificationEamil,
    sendPrivateMessageEmailNotification,
    getUsers,
    getFriends,
    addFriend,
    unFriend,
    getSearchUsers,
    getGroup,
    getMyGroups,
    getFavGroups,
    getGroupId,
    getMsg,
    getGroupMsg,
    joinFromSignup,
    getChatOppositeDetail,
    saveMsg,
    deleteMsg,
    saveGroupMsg,
    deleteGroupMsg,
    banGroupUser,
    unbanGroupUser,
    unbanGroupUsers,
    updateCensoredContents,
    updateGroupModerators,
    getHistory,
    getGroupHistory,
    readMSG,
    getReceiverIdsOfGroup,
    getReceiverEmailsOfGroup,
    joinToGroup,
    updateGroupFavInfo,
    clearGroupChat,
    pinChatMessage,
    unpinChatMessage,
    getPinnedMsgInfo,
    updateGroupPostModes,
    updateGroupModPriorities,
    sendGroupNotification,
    getLastMessage,
    updateGroupChatboxStyle,
    timeoutUser,
    timeoutIpAddress,
    checkUserTimeout,
    checkIpTimeout,
    blockUser,
    unblockUser,
    unblockGroupUser,
    updateGroupBlockedUsers,
    getBlockedUsersInfo,
    getBlockedUsers,
    getChatRules,
    updateChatRules,
    banGroupUserWithIp,
    checkIpBan,
    checkUserBan,
    getIpBans,
    unbanGroupIps,
    debugIpBanStatus
}
