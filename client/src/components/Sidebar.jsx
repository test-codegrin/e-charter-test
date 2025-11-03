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
import { ADMIN_ROUTES, DRIVER_ROUTES } from '../constants/routes'

const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: ADMIN_ROUTES.DASHBOARD },
    { icon: Users, label: 'Drivers', path: ADMIN_ROUTES.DRIVERS.ALL_DRIVERS },
    { icon: Building, label: 'Fleet Partners', path: ADMIN_ROUTES.FLEET_PARTNER.ALL_FLEET_PARTNER },
    { icon: Car, label: 'Vehicles', path: ADMIN_ROUTES.VEHICLES.ALL_VEHICLES },
    { icon: MapPin, label: 'Trips', path: ADMIN_ROUTES.TRIPS.ALL_TRIPS },
    { icon: DollarSign, label: 'Payouts', path: ADMIN_ROUTES.PAYOUTS },
    { icon: Bell, label: 'Notifications', path: ADMIN_ROUTES.NOTIFICATIONS },
    { icon: Settings, label: 'Settings', path: ADMIN_ROUTES.SETTINGS },
  ]

  const driverMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: DRIVER_ROUTES.DASHBOARD },
    { icon: MapPin, label: 'My Trips', path: DRIVER_ROUTES.TRIPS },
    { icon: Truck, label: 'My Vehicles', path: DRIVER_ROUTES.VEHICLES },
    { icon: User, label: 'Profile', path: DRIVER_ROUTES.PROFILE },
    { icon: Settings, label: 'Settings', path: DRIVER_ROUTES.SETTINGS },
  ]

  const fleertDriverMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: DRIVER_ROUTES.DASHBOARD },
    { icon: MapPin, label: 'My Trips', path: DRIVER_ROUTES.TRIPS },
    { icon: User, label: 'Profile', path: DRIVER_ROUTES.PROFILE },
    { icon: Settings, label: 'Settings', path: DRIVER_ROUTES.SETTINGS },
  ]

  const menuItems = user?.role === 'admin' ? adminMenuItems : user?.driver_type === 'individual' ? driverMenuItems : fleertDriverMenuItems

  const isActive = (path) => {
    return location.pathname === path || (path === '/' && location.pathname === '/')
  }

  return (
    <div className="bg-dark-800 w-64 min-h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex flex-col justify-center items-center">
          <img src="/assets/images/logo.png" alt="" className="w-24 mb-2" />
          <p className="text-md text-white capitalize font-bold">{user?.role || 'User'} Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          const isActiveRoute = isActive(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg 
                transition-colors duration-200 group
                ${isActiveRoute 
                  ? 'bg-ice-100 text-ice-700 font-medium' 
                  : 'text-gray-300 hover:bg-ice-50 hover:text-ice-700'
                }
              `}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Icon 
                className={`w-5 h-5 transition-colors duration-200 
                  ${isActiveRoute ? 'text-ice-700' : 'text-gray-300 group-hover:text-ice-700'}`} 
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700 bg-dark-800">
        <div className="text-center">
          <p className="text-xs text-gray-400">© 2025 eCharter</p>
          <p className="text-xs text-gray-400">All rights reserved</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
