const notificationDeleteQueries = {
    deleteNotification:"UPDATE notifications SET is_deleted = 1 WHERE notification_id = ?"
}

module.exports = notificationDeleteQueries