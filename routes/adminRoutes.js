const express = require("express")
const router = express.Router()
const {
  getAllDrivers, 
  getAllCars, 
  getAllTrips, 
  getDashboardStats,
  getAllFleetPartners,
  getPayoutSummary
} = require("../controller/adminController")
const { 
  approveDriver, 
  approveCar, 
  getPendingApprovals 
} = require("../controller/verificationController")
const { authenticationToken } = require("../middleware/authMiddleware")


// Dashboard stats
router.get("/dashboard/stats", authenticationToken, getDashboardStats);

// Data management routes
router.get("/alldrivers", authenticationToken, getAllDrivers);
router.get("/allcars", authenticationToken, getAllCars);
router.get("/alltrips", authenticationToken, getAllTrips);

// Fleet partner management
router.get("/fleet-partners", authenticationToken, getAllFleetPartners);

// Payout management
router.get("/payouts", authenticationToken, getPayoutSummary);

// Approval management
router.get("/pending-approvals", authenticationToken, getPendingApprovals);
router.post("/approve-driver/:driver_id", authenticationToken, approveDriver);
router.post("/approve-car/:car_id", authenticationToken, approveCar);


module.exports = router;