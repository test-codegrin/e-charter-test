const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getDriverTrips,
    getDriverProfile,
    updateDriverProfile,
    getDriverNotificationSettings,
    updateDriverNotificationSettings
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

console.log("Driver main routes configured successfully");
console.log("Available driver routes:");
console.log("  - GET /api/driver/dashboard/stats");
console.log("  - GET /api/driver/trips");
console.log("  - GET /api/driver/profile");
console.log("  - PUT /api/driver/profile");
console.log("  - GET /api/driver/settings/notifications");
console.log("  - PUT /api/driver/settings/notifications");

module.exports = router;