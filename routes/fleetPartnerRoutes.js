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


// Public routes
router.post("/register", registerFleetPartner);

// Protected routes (require authentication)
router.post("/vehicle", authenticationToken, addFleetVehicle);
router.post("/document", authenticationToken, upload.single("document"), uploadFleetDocument);
router.get("/profile", authenticationToken, getFleetPartnerProfile);

// Admin routes
router.get("/admin/all", authenticationToken, getAllFleetPartners);



module.exports = router;