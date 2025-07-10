const express = require("express");
const router = express.Router();
const { getApprovedCars} = require("../controller/userController");
const { authenticationToken } = require("../middleware/authMiddleware")

// Fixed route definitions - no parameters needed here
router.get("/getapprovecars", authenticationToken, getApprovedCars);


module.exports = router;