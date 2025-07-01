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

console.log("Setting up enhanced settings routes...");

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

console.log("Enhanced settings routes configured successfully");
console.log("Available settings routes:");
console.log("  - GET /api/admin/settings - Get all settings");
console.log("  - PUT /api/admin/settings - Update settings");
console.log("  - GET /api/admin/settings/category/:category - Get category settings");
console.log("  - GET /api/admin/settings/:category/:key - Get specific setting");
console.log("  - DELETE /api/admin/settings/reset - Reset all settings");
console.log("  - DELETE /api/admin/settings/reset/:category - Reset category settings");
console.log("  - GET /api/admin/settings/audit/log - Get audit log");

module.exports = router;