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
  Truck,
  Building,
  DollarSign,
  Settings
} from 'lucide-react'

const Sidebar = () => {
  const { user } = useAuth()
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
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ]

  const driverMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/driver/dashboard' },
    { icon: MapPin, label: 'My Trips', path: '/driver/trips' },
    { icon: Truck, label: 'My Vehicles', path: '/driver/vehicles' },
    { icon: User, label: 'Profile', path: '/driver/profile' },
    { icon: Settings, label: 'Settings', path: '/driver/settings' },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : driverMenuItems

  const isActive = (path) => {
    return location.pathname === path || (path === '/' && location.pathname === '/')
  }

  return (
    <div className="bg-dark-800 w-64 min-h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-ice-500 rounded-lg flex items-center justify-center shadow-glow">
            <Car className="w-6 h-6 text-white animated-icon" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">eCharter</h1>
            <p className="text-sm text-ice-400 capitalize">{user?.role || 'User'} Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation - Takes up remaining space */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActiveRoute = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActiveRoute ? 'active' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Icon className={`w-5 h-5 ${isActiveRoute ? 'text-ice-500' : 'text-ice-300'}`} />
              <span className={isActiveRoute ? 'text-white' : 'text-gray-300'}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer - Simple branding only */}
      <div className="p-4 border-t border-dark-700 bg-dark-800">
        <div className="text-center">
          <p className="text-xs text-gray-400">© 2024 eCharter</p>
          <p className="text-xs text-gray-400">All rights reserved</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar