/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description
 ** Private adding data for MayaIQ Backend
 */
 const router = require('express').Router();
 const authenticateUser = require('../verifyToken.js');
 const httpCode = require('../../libs/httpCode.js');
 const { PG_query } = require('../../db/index.js');
 const { addProductsValidation, getUpsertOptionValidation } = require("../../libs/validations.js");
 const multer = require('multer');
 const path = require('path');
 const fs = require('fs');
 
 // Ensure the directories exist
 const productUploadDir = path.join(__dirname, '../../uploads/products');
 const userUploadDir = path.join(__dirname, '../../uploads/users');
 const chatImageUploadDir = path.join(__dirname, '../../uploads/chats/images');
 const chatFileUploadDir = path.join(__dirname, '../../uploads/chats/files');
 const { getGroupCreatingValidation } = require('../../libs/validations.js');
 
 const ensureDirectoryExists = (dir) => {
     if (!fs.existsSync(dir)) {
         fs.mkdirSync(dir, { recursive: true });
     }
 };
 
 ensureDirectoryExists(productUploadDir);
 ensureDirectoryExists(userUploadDir);
 ensureDirectoryExists(chatImageUploadDir);
 ensureDirectoryExists(chatFileUploadDir);
 
 // Configure multer storage options
 const configureMulterStorage = (uploadDir) => {
     return multer.diskStorage({
         destination: (req, file, cb) => {
             cb(null, uploadDir);
         },
         filename: (req, file, cb) => {
             cb(null, `${Date.now()}${path.extname(file.originalname)}`);
         }
     });
 };
 
 const uploadProduct = multer({ storage: configureMulterStorage(productUploadDir) });
 const uploadUser = multer({ storage: configureMulterStorage(userUploadDir) });
 const uploadChatImage = multer({ storage: configureMulterStorage(chatImageUploadDir) });
 const uploadChatFile = multer({ storage: configureMulterStorage(chatFileUploadDir) });
 
 // Router to add the list for the Products/Services
 router.post("/products", authenticateUser, uploadProduct.single('Image'), async (req, res) => {
     const { error } = addProductsValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         // Extracting uploaded file name
         const uploadedFileName = req.file.filename;
 
         // Insert product details into the database including the uploaded file name
         await PG_query(`INSERT INTO "Products" ("User_Id", "Product_Name", "Price", "Photo_Name")
                         VALUES (${req.user.id}, '${req.body.Product_Name}', ${req.body.Price}, '${uploadedFileName}')`);
 
         return res.status(httpCode.SUCCESS).send("Saved Successfully!");
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while saving the data." });
     }
 });
 
 // Router to add the user's photo
 router.post("/users/photo", authenticateUser, uploadUser.single('Image'), async (req, res) => {
     try {
         // Extracting uploaded file name
         const uploadedFileName = req.file.filename;
 
         // Insert user photo details into the database
         await PG_query(`UPDATE "Users" SET "Photo_Name" = '${uploadedFileName}' WHERE "Id" = ${req.user.id}`);
 
         return res.status(httpCode.SUCCESS).send("Photo uploaded successfully!");
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while uploading the photo." });
     }
 });

   // Router to create Group
router.post("/groups/create", authenticateUser, async (req, res) => {
   console.log("Group creation request body:", req.body);
   const { error } = getGroupCreatingValidation(req.body);
    if (error) {
        console.log("Validation error:", error.details[0].message);
        return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
    }
    try {
         // Extracting uploaded file name
         const groupName = req.body.groupName;
         const createrId = req.body.createrId;

         console.log("About to execute group creation SQL...");
        let groupId = await PG_query(`INSERT INTO "groups" (
                "name", 
                "creater_id",
                "size_mode",
                "frame_width",
                "frame_height",
                "bg_color",
                "title_color",
                "msg_bg_color",
                "msg_txt_color",
                "reply_msg_color",
                "msg_date_color",
                "input_bg_color",
                "show_user_img",
                "custom_font_size",
                "font_size",
                "round_corners",
                "corner_radius",
                "chat_rules",
                "show_chat_rules"
            )
            VALUES (
                '${groupName}', 
                ${createrId},
                '${req.body.size_mode}',
                ${req.body.frame_width},
                ${req.body.frame_height},
                '${req.body.bg_color}',
                '${req.body.title_color}',
                '${req.body.msg_bg_color}',
                '${req.body.msg_txt_color}',
                '${req.body.reply_msg_color}',
                '${req.body.msg_date_color}',
                '${req.body.input_bg_color}',
                ${req.body.show_user_img},
                ${req.body.custom_font_size},
                ${req.body.font_size},
                ${req.body.round_corners},
                ${req.body.corner_radius},
                '${(req.body.chat_rules || '').replace(/'/g, "''")}',
                ${req.body.show_chat_rules || false}
            ) RETURNING id`);
                console.log("Group created successfully, ID:", groupId.rows[0].id);        
        console.log("About to insert group_users...");
        await PG_query(`INSERT INTO "group_users" (
                "group_id", 
                "user_id",
                "is_member",
                "role_id"          
            )
            VALUES (
                ${groupId.rows[0].id}, 
                ${createrId},
                1,
                1     
            );`);
        console.log("Group_users inserted successfully");
         let groups = await PG_query(`SELECT 
                 g.*, gu.role_id,
                 CASE 
                     WHEN gu.user_id IS NOT NULL THEN true 
                     ELSE false 
                 END AS isMember
             FROM 
                 groups g
             LEFT JOIN 
                 group_users gu 
                 ON g.id = gu.group_id AND gu.user_id = ${createrId};`); 
          // Send success response with user list and professions
                   return res.status(httpCode.SUCCESS).send({ groups: groups.rows, message: "Saved Successfully!"});
    } catch (error) {
        console.log("Group creation error:", error);
        console.log("Error details:", error.message);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while creating new group." });
    }
 });

 // Router to add User to Group
 router.post("/groups/adduser", authenticateUser, async (req, res) => {
     try {
         // Extracting uploaded file name
         const groupId = req.body.groupId;
         const userId = req.body.userId;
         await PG_query(`INSERT INTO "group_users" ("group_id", "user_id", "is_member")
                         VALUES (${groupId}, ${userId}, 1)`);
 
         return res.status(httpCode.SUCCESS).send("Saved Successfully!");
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while adding a user to group." });
     }
 });

//   Router to get All Groups with members
 router.post("/groups/addanon", async (req, res) => {
     try {
         // Fetch user list based on role // Extracting uploaded file name
         const group_name = req.body.groupName;
         const user_id = req.body.userId;
         
         const groups = await PG_query(`SELECT 
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
            g.name like '${group_name}'
        GROUP BY 
            g.id, g.name, g.creater_id, creator."Name";`);

         let groupId =  0;
         if (groups.rows.length > 0) {
            groupId = groups.rows[0].id;
            await PG_query(`INSERT INTO group_users (group_id, user_id)
                SELECT ${groupId}, ${user_id}
                WHERE NOT EXISTS (
                SELECT 1
                FROM group_users
                WHERE group_id = ${groupId} AND user_id = ${user_id}
                );`);
         }
         return res.status(httpCode.SUCCESS).send({ group: groups.rows.length > 0 ? groups.rows[0] : null });
     } catch (error) {
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });
 
 // Router to add the chats' image
 router.post("/chats/images", authenticateUser, uploadChatImage.single('Image'), async (req, res) => {
     try {
         // Extracting uploaded file name
         const uploadedFileName = req.file.filename;
 
         return res.status(httpCode.SUCCESS).send(uploadedFileName);
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while uploading the photo." });
     }
 });
 
 // Router to add the chats' files
 router.post("/chats/files", authenticateUser, uploadChatFile.single('File'), async (req, res) => {
     try {
         // Extracting uploaded file name
         const uploadedFileName = req.file.filename;
 
         return res.status(httpCode.SUCCESS).send(uploadedFileName);
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while uploading the file." });
     }
 });

  // Router to Upsert sound option
 router.post("/chats/updateoption", authenticateUser, async (req, res) => {
    const { error } = getUpsertOptionValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
     try {
         const userId = req.body.user_id;
        const soundOption = req.body.sound_option;
        // Insert product details into the database including the uploaded file name
        await PG_query(`WITH upsert AS (
            UPDATE options
            SET sound_option = ${soundOption}
            WHERE user_id = ${userId}
            RETURNING *
        )
        INSERT INTO options (user_id, sound_option)
        SELECT ${userId}, ${soundOption}
        WHERE NOT EXISTS (
            SELECT 1 FROM options WHERE user_id = ${userId}
        );`);
        return res.status(httpCode.SUCCESS).send("Saved Successfully!");
     } catch (error) {
         console.log(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while saving the data." });
     }
 });

 // Router to add the FeedBack
 router.post("/feedback", authenticateUser, async (req, res) => {
    
    try {
        // Insert product details into the database including the uploaded file name
        await PG_query(`INSERT INTO "Feedbacks" ("User_Id", "Feedback")
                        VALUES (${req.user.id}, '${req.body.data}')`);

        return res.status(httpCode.SUCCESS).send("Saved Successfully!");
    } catch (error) {
        console.log(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while saving the data." });
    }
});

// Router to update chat rules for a group
router.post("/groups/updateChatRules", authenticateUser, async (req, res) => {
    const { groupId, chatRules, showChatRules } = req.body;
    const userId = req.user.id;
    
    if (!groupId) {
        return res.status(httpCode.INVALID_MSG).send("Group ID is required");
    }
    
    try {
        // Check if user is the creator of the group
        const groupCheck = await PG_query(`SELECT creater_id FROM groups WHERE id = ${groupId}`);
        
        if (groupCheck.rows.length === 0) {
            return res.status(httpCode.NOT_FOUND).send("Group not found");
        }
        
        if (groupCheck.rows[0].creater_id !== userId) {
            return res.status(httpCode.FORBIDDEN).send("Only group creator can update chat rules");
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
        
        return res.status(httpCode.SUCCESS).send({ 
            message: "Chat rules updated successfully",
            chatRules: chatRules || '',
            showChatRules: showChatRules || false
        });
        
    } catch (error) {
        console.error("Error updating chat rules:", error);
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while updating chat rules." });
    }
});

module.exports = router;