const express = require("express");
const router = express.Router();

const {
    getDashboardStats,
    getDriverTrips,
    getDriverProfile,
    updateDriverProfile
} = require("../controller/driverController");

const { authenticationToken } = require("../middleware/authMiddleware");

console.log("Setting up driver main routes...");

// Dashboard and profile routes
router.get("/dashboard/stats", authenticationToken, getDashboardStats);
router.get("/trips", authenticationToken, getDriverTrips);
router.get("/profile", authenticationToken, getDriverProfile);
router.put("/profile", authenticationToken, updateDriverProfile);

console.log("Driver main routes configured successfully");
console.log("Available driver routes:");
console.log("  - GET /api/driver/dashboard/stats");
console.log("  - GET /api/driver/trips");
console.log("  - GET /api/driver/profile");
console.log("  - PUT /api/driver/profile");

module.exports = router;