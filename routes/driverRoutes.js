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

console.log("Setting up driver main routes...");

// Dashboard and profile routes
router.get("/dashboard/stats", authenticationToken, getDashboardStats);
router.get("/trips", authenticationToken, getDriverTrips);
router.get("/profile", authenticationToken, getDriverProfile);
router.put("/profile", authenticationToken, updateDriverProfile);

// Settings routes
router.get("/settings/notifications", authenticationToken, getDriverNotificationSettings);
router.put("/settings/notifications", authenticationToken, updateDriverNotificationSettings);
router.get("/settings/fleet", authenticationToken, getDriverFleetSettings);
router.put("/settings/fleet", authenticationToken, updateDriverFleetSettings);
router.get("/settings/payment", authenticationToken, getDriverPaymentSettings);
router.put("/settings/payment", authenticationToken, updateDriverPaymentSettings);

console.log("Driver main routes configured successfully");
console.log("Available driver routes:");
console.log("  - GET /api/driver/dashboard/stats");
console.log("  - GET /api/driver/trips");
console.log("  - GET /api/driver/profile");
console.log("  - PUT /api/driver/profile");
console.log("  - GET /api/driver/settings/notifications");
console.log("  - PUT /api/driver/settings/notifications");
console.log("  - GET /api/driver/settings/fleet");
console.log("  - PUT /api/driver/settings/fleet");
console.log("  - GET /api/driver/settings/payment");
console.log("  - PUT /api/driver/settings/payment");

module.exports = router;