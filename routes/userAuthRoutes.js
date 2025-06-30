const express = require("express")
const router = express.Router()
const upload = require("../middleware/upload.js");
const { registerUser, loginUser, requestReset, verifyResetCode, resetPassword, updatePassword } = require("../controller/userAuthController.js")

router.post("/register",  upload.single("profileImage"),registerUser)
router.post("/login", loginUser)
router.post("/requestreset", requestReset)
router.post("/verifyresetcode", verifyResetCode)
router.post("/resetpassword", resetPassword);
router.post("/changepassword", updatePassword);

module.exports = router;
