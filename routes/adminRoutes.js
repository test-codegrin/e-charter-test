const express = require("express")
const router = express.Router()
const {getAllDrivers,getAllCars} = require("../controller/adminController")
const { authenticationToken } = require("../middleware/authMiddleware")

// Fixed route definitions - no parameters needed here
router.get("/alldrivers", authenticationToken, getAllDrivers);
router.get("/allcars", authenticationToken, getAllCars);

module.exports = router;