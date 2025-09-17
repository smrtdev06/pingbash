/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Private Getting Data for MayaIQ Backend
 */
 const router = require('express').Router();
 const authenticateUser = require('../verifyToken.js');
 const httpCode = require('../../libs/httpCode.js');
 const { PG_query } = require('../../db/index.js');
 const { getDashboardListValidation, getProfileDatailValidation } = require('../../libs/validations.js');
 
 // Router to get the list from the Users for Dashboard
 router.post("/dashboard/list", authenticateUser, async (req, res) => {
 
     const { error } = getDashboardListValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         // Fetch user list based on role    
         let userlist = await PG_query(`SELECT u."Id", u."Name", u."Email", u."Password", u."Profession", u."Address", u."Geometry", u."Role", u."Description", u."Photo_Name" 
                                        FROM "Users" as u 
                                        WHERE u."Role" = 1`); 
 
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ users: userlist.rows });
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

  // Router to get All Groups
 router.post("/groups/list", authenticateUser, async (req, res) => {
     const userId = req.body.userId;
     try {
         // Fetch user list based on role    
         let groups = await PG_query(`SELECT 
                g.id,
                g.name,
                g.creater_id,
                CASE 
                    WHEN gu.user_id IS NOT NULL THEN true 
                    ELSE false 
                END AS isMember
            FROM 
                groups g
            LEFT JOIN 
                group_users gu 
                ON g.id = gu.group_id AND gu.user_id = ${userId};`); 
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ groups: groups.rows });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

 // Check Group Name availability
 router.post("/groups/name/availability", authenticateUser, async (req, res) => {
     const groupName = req.body.groupName;
     try {
         // Fetch user list based on role    
         let groups = await PG_query(`SELECT 
                *
                FROM groups WHERE name LIKE '${groupName}';`); 
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ availability: groups.rows.length == 0 });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

 // Router to get All Groups
 router.post("/groups/search", authenticateUser, async (req, res) => {
     const search = req.body.search;
     try {
         // Fetch user list based on role    
         let groups = await PG_query(`SELECT 
            g.*,
            creator."Name" AS creater_name,
            JSONB_AGG(DISTINCT 
                JSONB_BUILD_OBJECT(
                    'id', u."Id",
                    'name', u."Name",
                    'email', u."Email",
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
                    'filter_mode', gu2.filter_mode
                )
            ) FILTER (WHERE u."Id" IS NOT NULL) AS members
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
            g.name LIKE '%${search}%'
        GROUP BY 
            g.id, g.name, g.creater_id, creator."Name"
        ORDER BY 
            g.id;`);  
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ groups: groups.rows });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

   // Router to get Group from Group Name for Anon and Wildcard subdomain
 router.post("/groups/getGroup", authenticateUser, async (req, res) => {
     const userId = req.body.userId;
     try {
         // Fetch user list based on role    
         let initList = []
        initList = await PG_query(`SELECT 
                g.*,
                creator."Name" AS creater_name,
                JSONB_AGG(DISTINCT 
                    JSONB_BUILD_OBJECT(
                        'id', u."Id",
                        'name', u."Name",
                        'email', u."Email",
                        'banned', gu2.banned,
                        'unban_request', gu2.unban_request,
                        'is_member', gu2.is_member
                    )
                ) FILTER (WHERE u."Id" IS NOT NULL) AS members
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
                g.name = ${req.body.groupName}
            GROUP BY 
                g.id, g.name, g.creater_id, creator."Name";`); 
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ group: initList.rows.length > 0 ? initList.rows[0] : null });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

    // Router to get All Groups with members
 router.post("/groups/listWithMembers", authenticateUser, async (req, res) => {
     const userId = req.body.userId;
     try {
         // Fetch user list based on role    
         let groups = await PG_query(`SELECT 
                g.id,
                g.name,
                ARRAY_REMOVE(ARRAY_AGG(gu.user_id), NULL) AS members
            FROM 
                groups g
            LEFT JOIN 
                group_users gu ON g.id = gu.group_id
            WHERE 
                g.creater_id = ${userId}
            GROUP BY 
                g.id;`); 
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ groups: groups.rows });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

 // Router to Chat Groups
 router.post("/groups/chatGroups", authenticateUser, async (req, res) => {
     const userId = req.body.userId;
     try {
         // Fetch user list based on role    
         let groups = await PG_query(`SELECT 
                g.id,
                g.name,
                g.creater_id,
                ARRAY_AGG(DISTINCT gu2.user_id) AS members
            FROM 
                groups g
            LEFT JOIN 
                group_users gu1 ON g.id = gu1.group_id
            LEFT JOIN 
                group_users gu2 ON g.id = gu2.group_id
            WHERE 
                g.creater_id = ${userId}
                OR gu1.user_id = ${userId}
            GROUP BY 
                g.id, g.name, g.creater_id
            ORDER BY 
                (g.creater_id = ${userId}) DESC, g.id;`); 
         // Send success response with user list and professions
         return res.status(httpCode.SUCCESS).send({ groups: groups.rows });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });
 
 // Router to get the Profile
 router.post("/profile/detail", authenticateUser, async (req, res) => {
 
     const { error } = getProfileDatailValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         // Fetch user detail 
         let userDetail = await PG_query(`SELECT u."Id", u."Name", u."Email", u."Description", u."Address", u."Profession", u."Photo_Name" FROM "Users" as u WHERE u."Id"=${req.body.User_Id}`);
 
         // Fetch all products
         let products = await PG_query(`SELECT * FROM "Products" WHERE "User_Id"=${req.body.User_Id}`);
 
         // Send success response 
         return res.status(httpCode.SUCCESS).send({ userDetail: userDetail.rows[0], products: products.rows });
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });
 
 // Router to get my profile detail
 router.post("/myProfile/detail", authenticateUser, async (req, res) => {
 
     try {
         // Fetch user detail 
         let personal = await PG_query(`SELECT *
         FROM "Users" WHERE "Id"=${req.user.id}`); 
         // Send success response 
         return res.status(httpCode.SUCCESS).send({ personal: personal.rows });
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

 router.post("/chats/option", authenticateUser, async (req, res) => { 
     try {
         // Fetch user detail 
         let option = await PG_query(`SELECT * FROM options as u WHERE user_id = ${req.body.user_id}`);
 
         // Send success response 
         return res.status(httpCode.SUCCESS).send({ option: option.rows });
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });

// Router to get chat rules for a group
router.post("/groups/getChatRules", authenticateUser, async (req, res) => {
    const { groupId } = req.body;
    
    if (!groupId) {
        return res.status(httpCode.INVALID_MSG).send("Group ID is required");
    }
    
    try {
        // Get chat rules for the group
        const result = await PG_query(`
            SELECT chat_rules, show_chat_rules, creater_id 
            FROM groups 
            WHERE id = ${groupId}
        `);
        
        if (result.rows.length === 0) {
            return res.status(httpCode.NOT_FOUND).send("Group not found");
        }
        
        const group = result.rows[0];
        
        return res.status(httpCode.SUCCESS).send({ 
            chatRules: group.chat_rules || '',
            showChatRules: group.show_chat_rules || false,
            isCreator: group.creater_id === req.user.id
        });
        
    } catch (error) {
        console.error("Error getting chat rules:", error);
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching chat rules." });
    }
});

module.exports = router;