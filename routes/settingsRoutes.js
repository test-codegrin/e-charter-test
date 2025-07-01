const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getSetting,
  resetSettings
} = require("../controller/settingsController");
const { authenticationToken } = require("../middleware/authMiddleware");

console.log("Setting up settings routes...");

// Settings management routes
router.get("/", authenticationToken, getSettings);
router.put("/", authenticationToken, updateSettings);
router.get("/:category/:key", authenticationToken, getSetting);
router.delete("/:category?", authenticationToken, resetSettings);

console.log("Settings routes configured successfully");

module.exports = router;