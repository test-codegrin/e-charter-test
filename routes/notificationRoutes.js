const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getDriverNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controller/notificationController");
const { authenticationToken } = require("../middleware/authMiddleware");


// User notifications
router.get("/user", authenticationToken, getUserNotifications);

// Driver notifications
router.get("/driver", authenticationToken, getDriverNotifications);

// Admin notifications
router.get("/admin", authenticationToken, getAdminNotifications);

// Mark as read - Fixed parameter syntax
router.put("/:notification_id/read", authenticationToken, markAsRead);
router.put("/mark-all-read", authenticationToken, markAllAsRead);

// Delete notification
router.delete("/:notification_id", authenticationToken, deleteNotification);


module.exports = router;