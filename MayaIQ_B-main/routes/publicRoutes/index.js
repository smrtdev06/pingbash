/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Public Routes for MayaIQ Backend
 */

const router = require("express").Router();

const get = require("./get");

router.use("/get", get);

module.exports = router;