const express = require("express")
const router = express.Router()
const { approveDriver, approveVehicle, approveFleetCompany } = require("../controller/verificationController")
const { authenticationToken } = require("../middleware/authMiddleware")


// Fixed route parameter definitions - ensure proper parameter names
router.put("/approve-driver/:driver_id", authenticationToken, approveDriver);
router.put("/approve-fleet-company/:fleet_company_id", authenticationToken, approveFleetCompany);
router.put("/approve-vehicle/:vehicle_id", authenticationToken, approveVehicle);

console.log("Verification routes configured successfully");

module.exports = router;