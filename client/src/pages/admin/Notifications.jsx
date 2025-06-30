import React, { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Eye, Trash2, Filter } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, read, unread

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    filterNotifications()
  }, [notifications, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getNotifications()
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = notifications

    if (filter === 'read') {
      filtered = filtered.filter(notif => notif.is_read === 1)
    } else if (filter === 'unread') {
      filtered = filtered.filter(notif => notif.is_read === 0)
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId) => {
    try {
      await adminAPI.markAsRead(notificationId)
      setNotifications(notifications.map(notif => 
        notif.notification_id === notificationId 
          ? { ...notif, is_read: 1 }
          : notif
      ))
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllAsRead()
      setNotifications(notifications.map(notif => ({ ...notif, is_read: 1 })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return <Check className="w-5 h-5 text-green-500" />
      case 'trip_started':
        return <Bell className="w-5 h-5 text-blue-500" />
      case 'trip_completed':
        return <CheckCheck className="w-5 h-5 text-purple-500" />
      case 'driver_registered':
        return <Bell className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-secondary-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return 'border-l-green-500'
      case 'trip_started':
        return 'border-l-blue-500'
      case 'trip_completed':
        return 'border-l-purple-500'
      case 'driver_registered':
        return 'border-l-orange-500'
      default:
        return 'border-l-secondary-300'
    }
  }

  const unreadCount = notifications.filter(notif => notif.is_read === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
          <p className="text-secondary-600">
            Stay updated with system activities and alerts
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCheck className="w-5 h-5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {notifications.length}
          </div>
          <div className="text-sm text-secondary-600">Total Notifications</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">
            {unreadCount}
          </div>
          <div className="text-sm text-secondary-600">Unread</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {notifications.length - unreadCount}
          </div>
          <div className="text-sm text-secondary-600">Read</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-secondary-400" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.notification_id}
            className={`card border-l-4 ${getNotificationColor(notification.type)} ${
              notification.is_read === 0 ? 'bg-primary-50' : 'bg-white'
            } transition-colors duration-200`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      notification.is_read === 0 ? 'text-secondary-900' : 'text-secondary-700'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 text-sm ${
                      notification.is_read === 0 ? 'text-secondary-700' : 'text-secondary-500'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-xs text-secondary-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      {notification.trip_id && (
                        <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                          Trip #{notification.trip_id}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.is_read === 0 && (
                      <button
                        onClick={() => markAsRead(notification.notification_id)}
                        className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-2 text-secondary-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Unread indicator */}
              {notification.is_read === 0 && (
                <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              )}
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="card text-center py-12">
            <Bell className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500">
              {filter === 'all' 
                ? 'No notifications yet' 
                : `No ${filter} notifications`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications