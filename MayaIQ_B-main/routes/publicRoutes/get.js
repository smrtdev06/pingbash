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

// Router to get group by name for web component
router.get("/group-by-name/:groupName", async (req, res) => {
    try {
        const { groupName } = req.params;
        console.log('🔍 Looking for group by name:', groupName);
        
        // Query to find group by name
        const result = await PG_query(`
            SELECT "Id" as id, "Name" as name, "Creator_Id" as creator_id
            FROM "Groups" 
            WHERE LOWER("Name") = LOWER($1)
            LIMIT 1
        `, [groupName]);
        
        if (result.rows.length === 0) {
            console.log('❌ Group not found:', groupName);
            return res.status(httpCode.NOT_FOUND).send({ error: "Group not found" });
        }
        
        const group = result.rows[0];
        console.log('✅ Found group:', group);
        
        // Send success response with group info
        return res.status(httpCode.SUCCESS).send(group);
    } catch (error) {
        console.error('❌ Error fetching group by name:', error);
        // Send error response
        return res.status(httpCode.SERVER_ERROR).send({ error: "An error occurred while fetching the group." });
    }
});

module.exports = router;