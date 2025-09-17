/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Private Deleting for MayaIQ Backend
 */
 const router = require('express').Router();
 const authenticateUser = require('../verifyToken.js');
 const httpCode = require('../../libs/httpCode.js');
 const { PG_query } = require('../../db/index.js');
 const multer = require('multer');
 const path = require('path');
 const fs = require('fs');
 const { getProductsValidation } = require('../../libs/validations.js');
 
 // Ensure the directories exist
 const productUploadDir = path.join(__dirname, '../../uploads/products');
 const userUploadDir = path.join(__dirname, '../../uploads/users');
 const chatImageUploadDir = path.join(__dirname, '../../uploads/chats/images');
 const chatFileUploadDir = path.join(__dirname, '../../uploads/chats/files');
 
 if (!fs.existsSync(productUploadDir)) {
     fs.mkdirSync(productUploadDir, { recursive: true });
 }
 
 if (!fs.existsSync(userUploadDir)) {
     fs.mkdirSync(userUploadDir, { recursive: true });
 }
 
 if (!fs.existsSync(chatImageUploadDir)) {
     fs.mkdirSync(chatImageUploadDir, { recursive: true });
 }
 
 if (!fs.existsSync(chatFileUploadDir)) {
     fs.mkdirSync(chatFileUploadDir, { recursive: true });
 }
 
 // Router to delete the user's photo
 router.post("/users/photo", authenticateUser, async (req, res) => {
     try {
         // Step 1: Retrieve the current photo name from the database
         const result = await PG_query(`SELECT "Photo_Name" FROM "Users" WHERE "Id" = ${req.user.id}`);
 
         if (result.rows.length === 0) {
             return res.status(httpCode.NOT_FOUND).send({ error: "User not found." });
         }
 
         const photoName = result.rows[0].Photo_Name;
 
         if (photoName) {
             // Step 2: Delete the photo file from the server's filesystem
             const photoPath = path.join(userUploadDir, photoName);
 
             if (fs.existsSync(photoPath)) {
                 fs.unlinkSync(photoPath);
             }
         }
 
         // Step 3: Update the database to set the Photo_Name to default product name
         await PG_query(`UPDATE "Users" SET "Photo_Name" = 'default_product.png' WHERE "Id" = ${req.user.id}`);
 
         return res.status(httpCode.SUCCESS).send("Photo deleted successfully!");
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while deleting the photo." });
     }
 });
 
 // Router to delete the product involving the product name and price, image
 router.post("/product", authenticateUser, async (req, res) => {
     const { error } = getProductsValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         // Step 1: Retrieve the current photo name from the database
         const result = await PG_query(`SELECT "Photo_Name" FROM "Products" WHERE "Id" = ${req.body.Id}`);
 
         if (result.rows.length === 0) {
             return res.status(httpCode.NOT_FOUND).send({ error: "Product not found." });
         }
 
         const photoName = result.rows[0].Photo_Name;
 
         if (photoName) {
             // Step 2: Delete the photo file from the server's filesystem
             const photoPath = path.join(productUploadDir, photoName);
 
             if (fs.existsSync(photoPath)) {
                 fs.unlinkSync(photoPath);
             }
         }
 
         // Step 3: Delete the details from the Product table
         await PG_query(`DELETE FROM "Products" WHERE "Id" = ${req.body.Id}`);
 
         return res.status(httpCode.SUCCESS).send("Product deleted successfully!");
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while deleting the product." });
     }
 });
 
 // Router to delete images from chats
 router.post("/chats/images/:imageName", authenticateUser, async (req, res) => {
     try {
         const imageName = req.params.imageName;
         const imagePath = path.join(chatImageUploadDir, imageName);
 
         if (fs.existsSync(imagePath)) {
             fs.unlinkSync(imagePath);
             return res.status(httpCode.SUCCESS).send("Image deleted successfully!");
         } else {
             return res.status(httpCode.NOT_FOUND).send({ error: "Image not found." });
         }
     } catch (error) {
         console.error(error);
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while deleting the image." });
     }
 });
 
 // Router to delete files from chats
 router.post("/chats/files/:fileName", authenticateUser, async (req, res) => {
     try {
         const fileName = req.params.fileName;
         const filePath = path.join(chatFileUploadDir, fileName);
 
         if (fs.existsSync(filePath)) {
             fs.unlinkSync(filePath);
             return res.status(httpCode.SUCCESS).send("File deleted successfully!");
         } else {
             return res.status(httpCode.NOT_FOUND).send({ error: "File not found." });
         }
     } catch (error) {
         console.error(error);
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while deleting the file." });
     }
 });

 router.post("/groups/delete", authenticateUser, async (req, res) => {
     try {
         // Extracting uploaded file name
         const groupId = req.body.groupId;
         const createrId = req.body.userId;
         await PG_query(`DELETE FROM "groups" WHERE "id" = ${groupId}`);
         await PG_query(`DELETE FROM "group_users" WHERE "group_id" = ${groupId}`);
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
                 ON g.id = gu.group_id AND gu.user_id = ${createrId};`); 
          // Send success response with user list and professions
          return res.status(httpCode.SUCCESS).send({ groups: groups.rows, message: "Deleted Successfully!"});
     } catch (error) {
         console.log(error);
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while creating new group." });
     }
 });
 
 module.exports = router;