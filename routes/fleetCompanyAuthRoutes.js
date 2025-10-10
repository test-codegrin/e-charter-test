
const express = require("express")
const router = express.Router()
const upload = require("../middleware/upload.js");
const { registerCompany, loginCompany } = require("../controller/fleetAuthController.js");

// Fixed route definitions - no parameters needed here
router.post("/register", upload.single("profile_image"), registerCompany)
router.post("/login", loginCompany);

module.exports = router;