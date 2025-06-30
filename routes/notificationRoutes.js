const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getDriverNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead
} = require("../controller/notificationController");
const { authenticationToken } = require("../middleware/authMiddleware");

console.log("Setting up notification routes...");

// User notifications
router.get("/user", authenticationToken, getUserNotifications);

// Driver notifications
router.get("/driver", authenticationToken, getDriverNotifications);

// Admin notifications
router.get("/admin", authenticationToken, getAdminNotifications);

// Mark as read - Fixed parameter syntax
router.put("/:notification_id/read", authenticationToken, markAsRead);
router.put("/mark-all-read", authenticationToken, markAllAsRead);

console.log("Notification routes configured successfully");

module.exports = router;