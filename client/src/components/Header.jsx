import React, { useState } from 'react'
import { Search, Bell, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors duration-200">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-secondary-900">
                {user?.name || user?.adminName || user?.driverName || 'User'}
              </p>
              <p className="text-xs text-secondary-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header