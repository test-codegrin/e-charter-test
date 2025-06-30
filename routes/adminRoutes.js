const express = require("express")
const router = express.Router()
const {getAllDrivers, getAllCars, getAllTrips, getDashboardStats} = require("../controller/adminController")
const { authenticationToken } = require("../middleware/authMiddleware")

console.log("Setting up admin routes...");

// Dashboard stats
router.get("/dashboard/stats", authenticationToken, getDashboardStats);

// Data management routes
router.get("/alldrivers", authenticationToken, getAllDrivers);
router.get("/allcars", authenticationToken, getAllCars);
router.get("/alltrips", authenticationToken, getAllTrips);

console.log("Admin routes configured successfully");

module.exports = router;