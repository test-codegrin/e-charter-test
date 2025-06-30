const express = require("express");
const router = express.Router();
const { addCar,getCarsByDriver } = require("../controller/driverCarController");
const { authenticationToken } = require("../middleware/authMiddleware")

router.post("/addcar",authenticationToken, addCar); 
router.get("/getdrivercar", authenticationToken, getCarsByDriver);

module.exports = router;