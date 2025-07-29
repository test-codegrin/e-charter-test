const express = require("express")
const router = express.Router()
const upload = require("../middleware/upload.js");
const { authenticationToken } = require("../middleware/authMiddleware")
const { registerUser, loginUser, requestReset, verifyResetCode, resetPassword, updatePassword } = require("../controller/userAuthController.js")

// Fixed route definitions - no parameters needed here
router.post("/register", upload.single("profileImage"), registerUser)
router.post("/login", loginUser)
router.post("/requestreset", requestReset)
router.post("/verifyresetcode", verifyResetCode)
router.post("/resetpassword", resetPassword);
router.post("/changepassword",authenticationToken, updatePassword);

module.exports = router;