const express = require("express");
const router = express.Router();
const { getApprovedCars,getUserProfile,editUserProfile} = require("../controller/userController");
const upload = require("../middleware/upload.js");
const { authenticationToken } = require("../middleware/authMiddleware")
const multer = require("multer");
// Fixed route definitions - no parameters needed here
router.get("/getapprovecars", authenticationToken, getApprovedCars);
router.get("/getuserprofile", authenticationToken, getUserProfile);
router.put("/edituserprofile", authenticationToken,upload.single("profileImage"), editUserProfile);


module.exports = router;