const express = require("express");
const router = express.Router();
const { addCar, getCarsByDriver } = require("../controller/driverCarController");
const { authenticationToken } = require("../middleware/authMiddleware")

// Fixed route definitions - no parameters needed here
router.post("/addcar", authenticationToken, addCar); 
router.get("/getdrivercar", authenticationToken, getCarsByDriver);

module.exports = router;