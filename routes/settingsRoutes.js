const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getSetting,
  getSettingsByCategory,
  resetSettings,
  getSettingsAuditLog
} = require("../controller/settingsController");
const { authenticationToken } = require("../middleware/authMiddleware");


// Main settings routes
router.get("/", authenticationToken, getSettings);
router.put("/", authenticationToken, updateSettings);

// Category-specific routes
router.get("/category/:category", authenticationToken, getSettingsByCategory);

// Individual setting routes
router.get("/:category/:key", authenticationToken, getSetting);

// Reset routes
router.delete("/reset", authenticationToken, resetSettings);
router.delete("/reset/:category", authenticationToken, resetSettings);

// Audit log routes
router.get("/audit/log", authenticationToken, getSettingsAuditLog);



module.exports = router;