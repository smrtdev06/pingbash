/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Public Getting Data for MayaIQ Backend
 */
 const router = require('express').Router();
 const httpCode = require('../../libs/httpCode.js');
 const { PG_query } = require('../../db/index.js');
 const { getSignUpValidation } = require('../../libs/validations.js');
 
 // Router to get the list from the Users for Dashboard
 router.post("/signup/list", async (req, res) => {
     const { error } = getSignUpValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         // Fetch all professions
         let profession = await PG_query(`SELECT * FROM "Profession" WHERE "Role"=${req.body.Role}`);
 
         // Send success response with professions
         return res.status(httpCode.SUCCESS).send({ profession: profession.rows });
     } catch (error) {
         console.error(error); // Log the error for debugging
         // Send error response
         return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the data." });
     }
 });
 
 module.exports = router;