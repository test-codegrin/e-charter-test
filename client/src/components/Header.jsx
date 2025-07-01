import React, { useState, useEffect } from 'react'
import { Search, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name
    if (user?.adminName) return user.adminName
    if (user?.driverName) return user.driverName
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    return 'User'
  }

  // Fetch notifications count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        const endpoint = user?.role === 'admin' ? '/api/notifications/admin' : '/api/notifications/driver'
        
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.notifications?.filter(n => n.is_read === 0).length || 0)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-dark-800 border-b border-dark-700 px-6 py-4 text-white">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-ice-500 focus:border-transparent text-white placeholder-dark-400"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors duration-200">
            <Bell className="w-6 h-6 animated-icon" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full pulse-dot"></span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-dark-700 rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-ice-500 rounded-full flex items-center justify-center shadow-glow">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-ice-400 capitalize">{user?.role || 'User'}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-lg border border-dark-700 py-1 z-50 scale-in">
                <div className="px-4 py-2 border-b border-dark-700">
                  <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                
                {/* Profile Link */}
                <a
                  href={user?.role === 'admin' ? '/admin/profile' : '/driver/profile'}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </a>

                {/* Settings Link */}
                <a
                  href={user?.role === 'admin' ? '/admin/settings' : '/driver/settings'}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-dark-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </a>

                <div className="border-t border-dark-700 my-1"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-danger-400 hover:bg-danger-900 hover:bg-opacity-30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}

export default Header