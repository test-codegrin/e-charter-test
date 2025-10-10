const express = require("express")
const router = express.Router()
const {
  getAllDrivers, 
  getAllVehicles, 
  getAllTrips, 
  getDashboardStats,
  getAllFleetPartners,
  editFleetPartnerByAdmin,
  deleteFleetPartnerByAdmin,
  getPayoutSummary,
  getAllUsers,
  editUser,
  deleteUser,
  getAllFleetCompanies
} = require("../controller/adminController")
const { 
  approveDriver, 
  approveVehicle, 
  getPendingApprovals, 
  approveFleetCompany
} = require("../controller/verificationController")
const { authenticationToken } = require("../middleware/authMiddleware")


// Dashboard stats
router.get("/dashboard/status", authenticationToken, getDashboardStats);

// Data management routes
router.get("/all-drivers", authenticationToken, getAllDrivers);
router.get("/all-vehicles", authenticationToken, getAllVehicles);
router.get("/all-trips", authenticationToken, getAllTrips);
router.get("/all-users",authenticationToken,getAllUsers);
router.get("/fleet-companies",authenticationToken,getAllFleetCompanies);
router.delete("/delete-user/:user_id", authenticationToken,deleteUser);
router.put("/edituser/:user_id", editUser);



// Fleet partner management
router.get("/fleetpartners", authenticationToken, getAllFleetPartners);
router.put("/editfleetpartner/:driver_id", authenticationToken, editFleetPartnerByAdmin);
router.delete( "/deletefleetpartner/:company_id",authenticationToken, deleteFleetPartnerByAdmin);


// Payout management
router.get("/payouts", authenticationToken, getPayoutSummary);

// Approval management
// router.get("/pending-approvals", authenticationToken, getPendingApprovals);
// router.put("/approve-driver/:driver_id", authenticationToken, approveDriver);
// router.put("/approve-fleet-company/:fleet_company_id", authenticationToken, approveFleetCompany);
// router.put("/approve-vehicle/:vehicle_id", authenticationToken, approveVehicle);

module.exports = router;