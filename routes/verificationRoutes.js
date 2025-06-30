const express = require("express")
const router = express.Router()
const { approveDriver, approveCar } = require("../controller/verificationController")
const { authenticationToken } = require("../middleware/authMiddleware")

console.log("Setting up verification routes...");

// Fixed route parameter definitions - ensure proper parameter names
router.post("/approvedriver/:driver_id", authenticationToken, approveDriver);
router.post("/approvecar/:car_id", authenticationToken, approveCar);

console.log("Verification routes configured successfully");

module.exports = router;