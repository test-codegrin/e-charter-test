import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Eye, 
  Trash2, 
  Filter,
  User,
  Car,
  Navigation,
  Building2,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Activity,
  Info,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState('all'); // all, read, unread
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, approval, booking, status, others
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, readFilter, categoryFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotifications();
      console.log('Notifications:', response.data);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = notifications;

    // Filter by read status
    if (readFilter === 'read') {
      filtered = filtered.filter((notif) => notif.is_read === 1);
    } else if (readFilter === 'unread') {
      filtered = filtered.filter((notif) => notif.is_read === 0);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((notif) => notif.notification_category === categoryFilter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      await adminAPI.markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((notif) =>
          notif.notification_id === notificationId ? { ...notif, is_read: 1 } : notif
        )
      );
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsAsRead();
      setNotifications(notifications.map((notif) => ({ ...notif, is_read: 1 })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;

    try {
      setDeleting(true);
      await adminAPI.deleteNotification(notificationToDelete.notification_id);
      setNotifications(
        notifications.filter((notif) => notif.notification_id !== notificationToDelete.notification_id)
      );
      toast.success('Notification deleted successfully');
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'approval':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'booking':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'status':
        return <Activity className="w-5 h-5 text-purple-500" />;
      case 'others':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'approval':
        return 'border-l-yellow-500';
      case 'booking':
        return 'border-l-blue-500';
      case 'status':
        return 'border-l-purple-500';
      case 'others':
        return 'border-l-gray-400';
      default:
        return 'border-l-gray-300';
    }
  };

  const getCategoryBadge = (category) => {
    const categoryMap = {
      approval: { label: 'Approval', color: 'bg-yellow-100 text-yellow-800' },
      booking: { label: 'Booking', color: 'bg-blue-100 text-blue-800' },
      status: { label: 'Status', color: 'bg-purple-100 text-purple-800' },
      others: { label: 'Others', color: 'bg-gray-100 text-gray-800' },
    };

    const categoryInfo = categoryMap[category] || { label: category, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
        {categoryInfo.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryCount = (category) => {
    if (category === 'all') return notifications.length;
    return notifications.filter((notif) => notif.notification_category === category).length;
  };

  const unreadCount = notifications.filter((notif) => notif.is_read === 0).length;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Notification?</h3>

              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this notification? This action cannot be undone.
              </p>

              {notificationToDelete && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex items-start space-x-3">
                    {getCategoryIcon(notificationToDelete.notification_category)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {notificationToDelete.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {notificationToDelete.message}
                      </p>
                      <div className="mt-2">
                        {getCategoryBadge(notificationToDelete.notification_category)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
          <p className="text-secondary-600">Stay updated with system activities and alerts</p>
        </div>
        <div className="flex items-center space-x-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
            >
              <CheckCheck className="w-5 h-5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        {/* Read/Unread Filter */}
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-secondary-400" />
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setReadFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                readFilter === 'all'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setReadFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                readFilter === 'unread'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setReadFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                readFilter === 'read'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
          <Filter className="w-5 h-5 text-secondary-400" />
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary-100 text-primary-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              All ({getCategoryCount('all')})
            </button>
            <button
              onClick={() => setCategoryFilter('approval')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'approval'
                  ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Approval ({getCategoryCount('approval')})
            </button>
            <button
              onClick={() => setCategoryFilter('booking')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'booking'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Booking ({getCategoryCount('booking')})
            </button>
            <button
              onClick={() => setCategoryFilter('status')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'status'
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Status ({getCategoryCount('status')})
            </button>
            <button
              onClick={() => setCategoryFilter('others')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryFilter === 'others'
                  ? 'bg-gray-100 text-gray-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              Others ({getCategoryCount('others')})
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {(readFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setReadFilter('all');
                setCategoryFilter('all');
              }}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center space-x-1"
            >
              <XCircle className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.notification_id}
            className={`bg-white rounded-lg shadow-md border-l-4 ${getCategoryColor(
              notification.notification_category
            )} ${
              notification.is_read === 0 ? 'bg-blue-50 border-2 border-blue-100' : ''
            } transition-all hover:shadow-lg p-4`}
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getCategoryIcon(notification.notification_category)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3
                        className={`text-sm font-semibold ${
                          notification.is_read === 0 ? 'text-secondary-900' : 'text-secondary-700'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {notification.is_read === 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      {getCategoryBadge(notification.notification_category)}
                    </div>
                    <p
                      className={`mt-1 text-sm ${
                        notification.is_read === 0 ? 'text-secondary-700' : 'text-secondary-500'
                      } line-clamp-2`}
                    >
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 flex-wrap">
                      <span className="text-xs text-secondary-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(notification.created_at)}</span>
                      </span>
                      {notification.trip_id && (
                        <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded flex items-center space-x-1">
                          <Navigation className="w-3 h-3" />
                          <span>Trip #{notification.trip_id}</span>
                        </span>
                      )}
                      {notification.driver_id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>Driver #{notification.driver_id}</span>
                        </span>
                      )}
                      {notification.user_id && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>User #{notification.user_id}</span>
                        </span>
                      )}
                      {notification.fleet_company_id && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center space-x-1">
                          <Building2 className="w-3 h-3" />
                          <span>Fleet #{notification.fleet_company_id}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.is_read === 0 && (
                      <button
                        onClick={() => markAsRead(notification.notification_id)}
                        className="p-2 text-secondary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteClick(notification)}
                      className="p-2 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Unread indicator */}
              {notification.is_read === 0 && (
                <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2 animate-pulse"></div>
              )}
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Bell className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500 font-medium">No notifications found</p>
            <p className="text-sm text-secondary-400 mt-2">
              {readFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You'll be notified about important system activities here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
