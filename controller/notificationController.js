const asyncHandler = require("express-async-handler");
const { db } = require("../config/db");
const notificationQueries = require("../config/notificationQueries/notificationQueries");

// Get user notifications
const getUserNotifications = asyncHandler(async (req, res) => {
  const user_id = req.user?.user_id;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [notifications] = await db.query(notificationQueries.getUserNotifications, [user_id]);

    res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get driver notifications
const getDriverNotifications = asyncHandler(async (req, res) => {
  const driver_id = req.user?.driver_id;

  if (!driver_id) {
    return res.status(401).json({ message: "Driver authentication required" });
  }

  try {
    const [notifications] = await db.query(notificationQueries.getDriverNotifications, [driver_id]);

    res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error("Error fetching driver notifications:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get admin notifications
const getAdminNotifications = asyncHandler(async (req, res) => {
  try {
    const [notifications] = await db.query(notificationQueries.getAdminNotifications);

    res.status(200).json({
      message: "Admin notifications fetched successfully",
      count: notifications.length,
      notifications
    });

  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { notification_id } = req.params;

  try {
    const [result] = await db.query(notificationQueries.markAsRead, [notification_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  const user_id = req.user?.user_id;
  const driver_id = req.user?.driver_id;
  const admin_id = req.user?.admin_id;

  try {
    await db.query(notificationQueries.markAllAsRead, [user_id || null, driver_id || null, admin_id || null]);

    res.status(200).json({
      message: "All notifications marked as read"
    });

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  getUserNotifications,
  getDriverNotifications,
  getAdminNotifications,
  markAsRead,
  markAllAsRead
};