const express = require("express")
const router = express.Router()
const { approveDriver, approveCar } = require("../controller/verificationController")
const { authenticationToken } = require("../middleware/authMiddleware")

// Fixed route parameter definitions
router.post("/approvedriver/:driver_id", authenticationToken, approveDriver);
router.post("/approvecar/:car_id", authenticationToken, approveCar);

module.exports = router;