 const router = require('express').Router();
 const bcrypt = require('bcryptjs');
 const jwt = require('jsonwebtoken');
 const { registerValidation, loginValidation, confirmValidation, newPassValidation, resendEmailVailidation } = require('../libs/validations.js');
 const { errorHandler } = require("../libs/handlers.js");
 
 const httpCode = require('../libs/httpCode.js');
 const { PG_query } = require('../db/index.js');
 const nodemailer = require("nodemailer");
 
 const otpStore = new Map();
 
 const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS
     }
 });
 
 // Generated OTP for sign up
 const generateOTP = () => {
     return Math.floor(1000 + Math.random() * 9000);
 };
 
 const otpFunction = async (email) => {
     const otp = generateOTP();
     const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // UTC expiry time
 
     // Send OTP to user's email
     const subject = 'Email Verification';
     const message = `<center>
              <h2>Verify your email address</h2>
              <h3>To start using Pingbash, please input this verification code into your form:</h3>
              <div style="font-size:30px;font-weight:bold">${otp}</div>
              </center>`;
 
     await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject, html: message });
 
     // Record OTP temporarily with UTC expiry time
     otpStore.set(email, { otp, expiry });
 };
 
 // Router for user register
 router.post('/register', async (req, res) => {
    console.log(req.body);
     const { error } = registerValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     let email = req.body.Email.toLowerCase();
 
     try {
         let isExist = await PG_query(`SELECT * FROM "Users" WHERE "Email" = '${email}' AND ("Role"=1 OR "Role"=0);`);
         if (isExist.rows.length) {
             return res.status(httpCode.DUPLICATED).send("You already signed up here!");
         } else {
             const salt = bcrypt.genSaltSync(10);
             const hashedPassword = bcrypt.hashSync(req.body.Password, salt);
 
             await otpFunction(email);
 
            //  await PG_query(`INSERT INTO "Users" ("Name", "Email", "Password", "Profession", "Address", "Geometry", "Role", "country", "gender", "birthday")
            //   VALUES
            //       ('${req.body.Name}', 
            //         '${email}', 
            //         '${hashedPassword}', 
            //         '${req.body.Profession}', 
            //         '${req.body.Address}', 
            //         '${JSON.stringify(req.body.Geometry)}', 
            //         '${req.body.Role}', 
            //         '${req.body.country}',
            //         '${req.body.gender}',
            //         '${req.body.birthday}');`); 
            await PG_query(`INSERT INTO "Users" ("Name", "Email", "Password")
              VALUES
                  ('${req.body.Name}', 
                    '${email}', 
                    '${hashedPassword}');`); 

             return res.status(httpCode.SUCCESS).send("Saved Successfully!");
         }
     } catch (error) {
         errorHandler(error);
         res.status(httpCode.SERVER_ERROR).send();
     }
 });

 // Router for user register from group embedded
 router.post('/register/group', async (req, res) => {
    console.log(req.body);
     const { error } = registerValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     let email = req.body.Email.toLowerCase();
 
     try {
         let isExist = await PG_query(`SELECT * FROM "Users" WHERE "Email" = '${email}';`);
         if (isExist.rows.length) {
             return res.status(httpCode.DUPLICATED).send("You already signed up here!");
         } else {
             const salt = bcrypt.genSaltSync(10);
             const hashedPassword = bcrypt.hashSync(req.body.Password, salt);
            const result = await PG_query(`
                INSERT INTO "Users" ("Name", "Email", "Password", "Role")
                VALUES (
                    '${req.body.Name}', 
                    '${email}', 
                    '${hashedPassword}',
                    1
                )
                RETURNING "Id";
                `);
            const token = jwt.sign({ id: result.rows[0].Id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            return res.status(httpCode.SUCCESS).send({ token, id: result.rows[0].Id });
         }
     } catch (error) {
         errorHandler(error);
         res.status(httpCode.SERVER_ERROR).send();
     }
 });

 // Router for user register
 router.get("/test", (req, res) => {
    console.log("test =====");
  res.json({ message: 'GET request success!' });
  
});
 
 // Router for Email verification
 router.post("/confirm", async (req, res) => {
     const { error } = confirmValidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         const { email, otp } = req.body;
         if (!otpStore.has(email)) return res.status(httpCode.FORBIDDEN).send("Not arrived your verification email.");
 
         const { otp: storedOtp, expiry } = otpStore.get(email);
 
         if (new Date().toISOString() > expiry) {
             otpStore.delete(email);
             return res.status(httpCode.FORBIDDEN).send("OTP has expired!");
         }
 
         if (storedOtp !== otp) {
             return res.status(httpCode.FORBIDDEN).send('Invalid OTP');
         }
 
         otpStore.delete(email);

        //  await PG_query(`UPDATE "Users"
        //           SET "Role" = CASE
        //               WHEN "Role" = 3 THEN 0
        //               WHEN "Role" = 4 THEN 1
        //               ELSE "Role"
        //           END
        //           WHERE "Email" = '${email}'
        //           AND "Role" NOT IN (0, 1);`);
        await PG_query(`UPDATE "Users"
                  SET "Role" = 1
                  WHERE "Email" = '${email}';`);
 
         const user = await PG_query(`SELECT * FROM "Users" WHERE "Email" = '${email}';`);
         const token = jwt.sign({ id: user.rows[0].Id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
 
         res.send({ token, id: user.rows[0].Id });
 
     } catch (error) {
         errorHandler(error);
         res.status(httpCode.SERVER_ERROR).send();
     }
 });
 
 // Router for Resend verification
 router.post("/resend", async (req, res) => {
     const { error } = resendEmailVailidation(req.body);
     if (error) return res.status(httpCode.INVALID_MSG).send(error.details[0].message);
 
     try {
         await otpFunction(req.body.email.toLowerCase());
         return res.status(httpCode.SUCCESS).send("Email Verification code resended Successfully!");
     } catch (error) {
         errorHandler(error);
         res.status(httpCode.SERVER_ERROR).send();
     }
 });
 
 // Router for user sign in
 router.post('/login', async (req, res) => {
     const { error } = loginValidation(req.body);
     if (error) return res.status(httpCode.FORBIDDEN).send(error.details[0].message);
 
     let email = req.body.Email.toLowerCase();
 
     try {
         const user = await PG_query(`SELECT * FROM "Users" WHERE "Email" = '${email}';`);
 
         if (!user.rows.length) {
             return res.status(httpCode.NOTHING).send();
         } else {
             // Check Role
             if (req.body.Role !== 1) {
                 return res.status(httpCode.NOT_ALLOWED).send('Email or Password or Role do not match');
             } else {
                 // Check password
                 const passwordMatch = bcrypt.compareSync(req.body.Password, user.rows[0].Password);
                 if (!passwordMatch) {
                     return res.status(httpCode.NOT_MATCHED).send('Email or Password or Role do not match');
                 } else {
                     // Create and assign JWT
                     const token = jwt.sign({ id: user.rows[0].Id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
                     res.send({ token, id: user.rows[0].Id });
                 }
             }
         }
     } catch (error) {
         errorHandler(error);
         res.status(httpCode.SERVER_ERROR).send();
     }
 });
 
 // Router for new password 
 router.post('/setNewPass', async (req, res) => {
     const { error } = newPassValidation(req.body);
     if (error) return res.status(httpCode.FORBIDDEN).send(error.details[0].message);
 
     let email = req.body.email.toLowerCase();
     try {
         const user = await PG_query(`SELECT * FROM "Users" WHERE "Email" = '${email}';`);
 
         if (!user.rows.length) {
             return res.status(httpCode.NOTHING).send("There is no email to set new password. Resend your Email");
         } else {
             const salt = bcrypt.genSaltSync(10);
             const hashedPassword = bcrypt.hashSync(req.body.newPass, salt);
 
             await PG_query(`UPDATE "Users"
                              SET "Password" = '${hashedPassword}'
                              WHERE "Email" = '${email}';`);
 
             res.status(httpCode.SUCCESS).send("Success!");
         }
     } catch (error) {
         errorHandler(error);
         res.status(httpCode.SERVER_ERROR).send();
     }
 });
 
 module.exports = router;
 