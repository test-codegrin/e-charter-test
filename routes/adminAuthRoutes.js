const express = require("express")
const router = express.Router()
const upload = require("../middleware/upload.js");
const { adminRegister, adminLogin } = require("../controller/adminAuthController.js")

// Fixed route definitions - no parameters needed here
router.post("/register", adminRegister)
router.post("/login", adminLogin);

module.exports = router;