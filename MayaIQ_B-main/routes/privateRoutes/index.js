/**
 * @Author           Dymtro
 * @Created          May 24, 2024
 * @Description     
 ** Private Routes for MayaIQ Backend
 */
const router = require("express").Router();

const get = require("./get");
const update = require("./update")
const add = require("./add")
const del = require("./delete")

router.use("/get", get)
router.use("/add", add)
router.use("/update", update)
router.use("/delete", del)

module.exports = router;