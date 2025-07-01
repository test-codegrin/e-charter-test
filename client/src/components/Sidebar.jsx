import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  Car,
  MapPin,
  FileText,
  Bell,
  User,
  LogOut,
  Truck,
  Building,
  DollarSign
} from 'lucide-react'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Drivers', path: '/admin/drivers' },
    { icon: Building, label: 'Fleet Partners', path: '/admin/fleet-partners' },
    { icon: Car, label: 'Vehicles', path: '/admin/vehicles' },
    { icon: MapPin, label: 'Trips', path: '/admin/trips' },
    { icon: DollarSign, label: 'Payouts', path: '/admin/payouts' },
    { icon: FileText, label: 'Invoices', path: '/admin/invoices' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
  ]

  const driverMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/driver/dashboard' },
    { icon: MapPin, label: 'My Trips', path: '/driver/trips' },
    { icon: Truck, label: 'My Vehicles', path: '/driver/vehicles' },
    { icon: User, label: 'Profile', path: '/driver/profile' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : driverMenuItems

  const isActive = (path) => {
    return location.pathname === path || (path === '/' && location.pathname === '/')
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name
    if (user?.adminName) return user.adminName
    if (user?.driverName) return user.driverName
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    return 'User'
  }

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg border-r border-secondary-200">
      {/* Logo */}
      <div className="p-6 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary-900">eCharter</h1>
            <p className="text-sm text-secondary-500 capitalize">{user?.role || 'User'} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200 bg-white">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-secondary-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-secondary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar