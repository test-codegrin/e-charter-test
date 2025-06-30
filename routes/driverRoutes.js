const express = require("express");
const router = express.Router();
const {
    registerDriver,
    loginDriver,
    requestDriverReset,
    verifyDriverResetCode,
    resetDriverPassword,
    updateDriverPassword,
} = require("../controller/driverAuthController");

const {
    getDashboardStats,
    getDriverTrips,
    getDriverProfile,
    updateDriverProfile
} = require("../controller/driverController");

const { authenticationToken } = require("../middleware/authMiddleware");

console.log("Setting up driver routes...");

// Authentication routes
router.post("/register", registerDriver);
router.post("/login", loginDriver);
router.post("/requestreset", requestDriverReset);
router.post("/verifyreset", verifyDriverResetCode);
router.post("/resetpassword", resetDriverPassword);
router.put("/updatepassword", updateDriverPassword);

// Dashboard and profile routes
router.get("/dashboard/stats", authenticationToken, getDashboardStats);
router.get("/trips", authenticationToken, getDriverTrips);
router.get("/profile", authenticationToken, getDriverProfile);
router.put("/profile", authenticationToken, updateDriverProfile);

console.log("Driver routes configured successfully");

module.exports = router;