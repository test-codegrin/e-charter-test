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
  getDriverById,
  editUser,
  deleteUser,
  getAllFleetCompanies,
  deleteDriver,
  getVehicleById,
  deleteVehicle,
  getFleetCompanyById,
  deleteFleetCompany,
  getAllVehiclesByFleetCompany,
  getAllDriversByFleetCompany,
  getVehicleByDriverId,
  getTripById,
  getTripByDriverId
} = require("../controller/adminController")
const { authenticationToken } = require("../middleware/authMiddleware")


// Dashboard stats
router.get("/dashboard/stats", authenticationToken, getDashboardStats);

// Data management routes
router.get("/all-drivers", authenticationToken, getAllDrivers);
router.get("/driver/:driver_id", authenticationToken, getDriverById);
router.get('/driver-vehicles/:driver_id', getVehicleByDriverId);

router.get("/all-vehicles", authenticationToken, getAllVehicles);
router.get("/vehicle/:vehicle_id", authenticationToken, getVehicleById);

router.get('/fleet-company/:fleet_company_id', getFleetCompanyById);
router.get('/fleet-company-vehicles/:fleet_company_id', getAllVehiclesByFleetCompany);
router.get('/fleet-company-drivers/:fleet_company_id', getAllDriversByFleetCompany);
router.delete('/fleet-company/:fleet_company_id', deleteFleetCompany);

router.get("/all-trips", authenticationToken, getAllTrips);
router.get("/trip/:trip_id",authenticationToken,getTripById);
router.get("/driver-trips/:driver_id",authenticationToken,getTripByDriverId);

router.get("/fleet-companies",authenticationToken,getAllFleetCompanies);

// router.get("/all-users",authenticationToken,getAllUsers);
// router.delete("/delete-user/:user_id", authenticationToken,deleteUser);
// router.put("/edituser/:user_id", editUser);
// router.delete("/driver/:driver_id", authenticationToken,deleteDriver);
// router.delete("/vehicle/:vehicle_id", authenticationToken,deleteVehicle);



// // Fleet partner management
// router.get("/fleetpartners", authenticationToken, getAllFleetPartners);
// router.put("/editfleetpartner/:driver_id", authenticationToken, editFleetPartnerByAdmin);
// router.delete( "/deletefleetpartner/:company_id",authenticationToken, deleteFleetPartnerByAdmin);

// Payout management
// router.get("/payouts", authenticationToken, getPayoutSummary);

// Approval management
// router.get("/pending-approvals", authenticationToken, getPendingApprovals);
// router.put("/approve-driver/:driver_id", authenticationToken, approveDriver);
// router.put("/approve-fleet-company/:fleet_company_id", authenticationToken, approveFleetCompany);
// router.put("/approve-vehicle/:vehicle_id", authenticationToken, approveVehicle);

module.exports = router;