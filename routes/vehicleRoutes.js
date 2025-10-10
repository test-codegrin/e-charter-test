const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getDriverTrips,
    getDriverProfile,
    updateDriverProfile,
    getDriverNotificationSettings,
    updateDriverNotificationSettings,
    getDriverFleetSettings,
    updateDriverFleetSettings,
    getDriverPaymentSettings,
    updateDriverPaymentSettings
} = require("../controller/driverController");

const { authenticationToken } = require("../middleware/authMiddleware");


// Vehicle routes
router.post("/add", getDashboardStats);


module.exports = router;