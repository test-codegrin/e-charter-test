const notificationQueries = {
  createNotification: `
    INSERT INTO notifications (
      user_id, driver_id, admin_id, type, title, 
      message, trip_id, is_read
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,

  getUserNotifications: `
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `,

  getDriverNotifications: `
    SELECT * FROM notifications 
    WHERE driver_id = ? 
    ORDER BY created_at DESC
  `,

  getAdminNotifications: `
    SELECT * FROM notifications WHERE for_admin = 1
    ORDER BY created_at DESC
  `,

  markAsRead: `
    UPDATE notifications 
    SET is_read = 1 
    WHERE notification_id = ?
  `,

  markAllAsRead: `
    UPDATE notifications 
    SET is_read = 1 
    WHERE user_id = ? OR driver_id = ? OR admin_id = ?
  `
};

module.exports = notificationQueries;