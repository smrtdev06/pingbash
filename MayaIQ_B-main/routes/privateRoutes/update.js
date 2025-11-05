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
const { updateProductsValidation, updateVendorInforValidation, updateCustomerInforValidation, updateCustomerPasswordValidation } = require("../../libs/validations.js");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the directories exist
const productUploadDir = path.join(__dirname, '../../uploads/products');
const userUploadDir = path.join(__dirname, '../../uploads/users');

if (!fs.existsSync(productUploadDir)) {
    fs.mkdirSync(productUploadDir, { recursive: true });
}

if (!fs.existsSync(userUploadDir)) {
    fs.mkdirSync(userUploadDir, { recursive: true });
}

// Configure multer for product file upload
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, productUploadDir); // Use the product upload directory
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Use a unique filename
    }
});

const uploadProduct = multer({ storage: productStorage });

// Configure multer for user photo upload
const userStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, userUploadDir); // Use the user upload directory
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Use a unique filename
    }
});

const uploadUser = multer({ storage: userStorage });

// Router to update the customer profile
router.post("/customer/detail", authenticateUser, async (req, res) => {
    const { error } = updateCustomerInforValidation(req.body);
    if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);

    let email = req.body.Email.toLowerCase();
    let fullName = req.body.FirstName + " " + req.body.LastName;
    
    // Handle optional fields - convert empty strings to NULL
    let country = req.body.country && req.body.country.trim() !== '' ? req.body.country : null;
    let description = req.body.description && req.body.description.trim() !== '' ? req.body.description : null;
    let gender = req.body.gender && req.body.gender.trim() !== '' ? req.body.gender : null;
    let birthday = req.body.birthday && req.body.birthday.trim() !== '' ? req.body.birthday : null;

    try {
        await PG_query(`UPDATE "Users"
                         SET "Name" = $1, "Email" = $2, "country" = $3, "Profession" = $4, "gender" = $5, "birthday" = $6
                         WHERE "Id" = $7;`, 
                         [fullName, email, country, description, gender, birthday, req.user.id]);
        res.status(httpCode.SUCCESS).send("Successfully Updated!");
    } catch (error) {
        console.error(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred" });
    }
});

// Router to update the password 
router.post("/password", authenticateUser, async (req, res) => {
    const { error } = updateCustomerPasswordValidation(req.body);
    if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);

    try {
        const user = await PG_query(`SELECT * FROM "Users" WHERE "Id" = '${req.user.id}';`);

        if (!user.rows.length) {
            return res.status(httpCode.NOTHING).send();
        }
        // Check password
        const passwordMatch = bcrypt.compareSync(req.body.CurrentPassword, user.rows[0].Password);
        if (!passwordMatch) {
            return res.status(httpCode.NOT_MATCHED).send('Your current password is not matched');
        } else {
            // Update your password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(req.body.NewPassword, salt);

            await PG_query(`UPDATE "Users"
                             SET "Password" = '${hashedPassword}'
                             WHERE "Id" = '${req.user.id}';`);

            const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            res.send({ token });
        }
    } catch (error) {
        console.error(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred" });
    }
});

// Router to update vendor profile data
router.post("/vendor/detail", authenticateUser, async (req, res) => {
    const { error } = updateVendorInforValidation(req.body);
    if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);

    let email = req.body.Email.toLowerCase();
    let fullName = req.body.FirstName + " " + req.body.LastName;

    try {
        await PG_query(`UPDATE "Users"
                         SET "Name" = '${fullName}', "Email" = '${email}', "Profession" = '${req.body.Profession}', "Description" = '${req.body.Description}', "LocationType" = '${req.body.LocationType}', "Address" = '${req.body.Address}'
                         WHERE "Id" = '${req.user.id}';`);
        res.status(httpCode.SUCCESS).send("Successfully Updated!");
    } catch (error) {
        console.error(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred" });
    }
});

// Router to update the list for the Products/Services
router.post("/products", authenticateUser, uploadProduct.single('Image'), async (req, res) => {
    const { error } = updateProductsValidation(req.body);
    if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);

    try {
        // Step 1: Retrieve the current photo name from the database
        const result = await PG_query(`SELECT "Photo_Name" FROM "Products" WHERE "Id" = ${req.body.Id}`);

        if (result.rows.length === 0) {
            return res.status(httpCode.NOT_FOUND).send({ error: "User not found." });
        }

        const photoName = result.rows[0].Photo_Name;

        // Only delete the old photo if a new file is uploaded
        if (photoName && req.file) {
            // Step 2: Delete the photo file from the server's filesystem
            const photoPath = path.join(productUploadDir, photoName);

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Extracting uploaded file name if a new file is uploaded
        const uploadedFileName = req.file ? req.file.filename : photoName;

        // Update product details in the database including the uploaded file name
        await PG_query(`UPDATE "Products" 
             SET "Product_Name" = '${req.body.Product_Name}', "Price" = ${req.body.Price}, "Photo_Name" = COALESCE('${uploadedFileName}', "Photo_Name")
             WHERE "Id" = ${req.body.Id} AND "User_Id" = ${req.user.id}`);

        return res.status(httpCode.SUCCESS).send("Updated Successfully!");
    } catch (error) {
        console.error(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while updating the data." });
    }
});

// Router to update user photo
router.post("/users/photo", authenticateUser, uploadUser.single('Image'), async (req, res) => {
    try {
       
        // Step 1: Retrieve the current photo name from the database
        const result = await PG_query(`SELECT "Photo_Name" FROM "Users" WHERE "Id" = ${req.user.id}`);

        if (result.rows.length === 0) {
            return res.status(httpCode.NOT_FOUND).send({ error: "User not found." });
        }

        const currentPhotoName = result.rows[0].Photo_Name;

        // Only delete the old photo if a new file is uploaded
        if (currentPhotoName && req.file) {
            // Step 2: Delete the photo file from the server's filesystem
            const photoPath = path.join(userUploadDir, currentPhotoName);

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Check if a new file is uploaded
        if (req.file) {
            // Extracting uploaded file name
            const uploadedFileName = req.file.filename;

            // Step 3: Update user photo details in the database
            await PG_query(`UPDATE "Users" SET "Photo_Name" = '${uploadedFileName}' WHERE "Id" = ${req.user.id}`);

            return res.status(httpCode.SUCCESS).send("Photo updated successfully!");
        } else {
            return res.status(httpCode.INVALID_MSG).send({ error: "No photo uploaded." });
        }
    } catch (error) {
        console.error(error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while updating the photo." });
    }
});

router.post("/groups/join", authenticateUser, async (req, res) => {
     try {
         // Extracting uploaded file name
         const groupId = req.body.groupId;
         const userId = req.body.userId;

         // Check if user is banned from this group
         const banCheck = await PG_query(`SELECT banned FROM group_users 
             WHERE group_id = ${groupId} AND user_id = ${userId} AND banned = 1;`);
         
         if (banCheck.rows.length > 0) {
             console.log(`Join attempt blocked: User ${userId} is banned from group ${groupId}`);
             return res.status(httpCode.FORBIDDEN).send({ error: "You are banned from this group" });
         }

         // Check if user's IP is banned (we need to get IP from request)
         const userIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                        req.headers['x-forwarded-for']?.split(',')[0] || 
                        req.headers['x-real-ip'] || 
                        '127.0.0.1';

         const ipBanCheck = await PG_query(`SELECT * FROM ip_bans 
             WHERE group_id = ${groupId} AND ip_address = '${userIp}' AND is_active = true;`);
         
         if (ipBanCheck.rows.length > 0) {
             console.log(`Join attempt blocked: IP ${userIp} is banned from group ${groupId}`);
             return res.status(httpCode.FORBIDDEN).send({ error: "Your IP address is banned from this group" });
         }

                 console.log(`✅ User ${userId} authorized to join group ${groupId} (IP: ${userIp})`);
        
        // Use INSERT ... ON CONFLICT to handle existing users
        await PG_query(`
            INSERT INTO group_users (group_id, user_id, is_member, role_id, banned, to_time) 
            VALUES (${groupId}, ${userId}, 1, 0, 0, NULL)
            ON CONFLICT (group_id, user_id) 
            DO UPDATE SET is_member = 1, banned = 0, to_time = NULL;
        `);
        
        console.log(`✅ User ${userId} successfully joined/updated in group ${groupId}`);
        
        // Return success response
        return res.status(httpCode.SUCCESS).send({ 
            message: "Joined Successfully!",
            groupId: groupId,
            userId: userId 
        });
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while creating new group." });
     }
 });

 router.post("/groups/leave", authenticateUser, async (req, res) => {
     try {
         // Extracting uploaded file name
         const groupId = req.body.groupId;
         const userId = req.body.userId;
         await PG_query(`DELETE FROM "group_users" WHERE "group_id" = ${groupId} AND "user_id" = ${userId};`);
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
          return res.status(httpCode.SUCCESS).send({ groups: groups.rows, message: "Left Successfully!"});
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while creating new group." });
     }
 });

 router.post("/groups/addUser", authenticateUser, async (req, res) => {
     try {
         // Extracting uploaded file name
         const groupId = req.body.groupId;
         const userId = req.body.userId;
         const createrId = req.body.createrId;
         await PG_query(`INSERT INTO "group_users" ("group_id", "user_id") VALUES (${groupId}, ${userId});`);
         let groups = await PG_query(`SELECT 
                g.id,
                g.name,
                ARRAY_REMOVE(ARRAY_AGG(gu.user_id), NULL) AS members
            FROM 
                groups g
            LEFT JOIN 
                group_users gu ON g.id = gu.group_id
            WHERE 
                g.creater_id = ${createrId}
            GROUP BY 
                g.id;`); 
          // Send success response with user list and professions
          return res.status(httpCode.SUCCESS).send({ groups: groups.rows, message: "Joined Successfully!"});
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while creating new group." });
     }
 });

module.exports = router;