const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  registerFleetPartner,
  addFleetVehicle,
  uploadFleetDocument,
  getFleetPartnerProfile,
  getAllFleetPartners
} = require("../controller/fleetPartnerController");

const { authenticationToken } = require("../middleware/authMiddleware");

console.log("Setting up fleet partner routes...");

// Public routes
router.post("/register", registerFleetPartner);

// Protected routes (require authentication)
router.post("/vehicle", authenticationToken, addFleetVehicle);
router.post("/document", authenticationToken, upload.single("document"), uploadFleetDocument);
router.get("/profile", authenticationToken, getFleetPartnerProfile);

// Admin routes
router.get("/admin/all", authenticationToken, getAllFleetPartners);

console.log("Fleet partner routes configured successfully");
console.log("Available fleet partner routes:");
console.log("  - POST /api/fleet/register");
console.log("  - POST /api/fleet/vehicle");
console.log("  - POST /api/fleet/document");
console.log("  - GET /api/fleet/profile");
console.log("  - GET /api/fleet/admin/all");

module.exports = router;