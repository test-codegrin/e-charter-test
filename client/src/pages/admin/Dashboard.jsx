import React, { useState, useEffect } from 'react'
import { Users, Car, MapPin, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { adminAPI } from '../../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalVehicles: 0,
    totalTrips: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeTrips: 0
  })
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch multiple data sources
      const [driversRes, vehiclesRes, tripsRes] = await Promise.all([
        adminAPI.getAllDrivers(),
        adminAPI.getAllVehicles(),
        adminAPI.getAllTrips()
      ])

      const drivers = driversRes.data.drivers || []
      const vehicles = vehiclesRes.data.cars || []
      const trips = tripsRes.data.trips || []

      // Calculate stats with proper number handling
      const pendingDrivers = drivers.filter(d => d.status === 0).length
      const pendingVehicles = vehicles.filter(v => v.status === 0).length
      const activeTrips = trips.filter(t => t.status === 'in_progress').length
      const completedTrips = trips.filter(t => t.status === 'completed')
      
      // Safely calculate total revenue with proper number conversion
      const totalRevenue = completedTrips.reduce((sum, trip) => {
        const price = parseFloat(trip.total_price) || 0
        return sum + price
      }, 0)

      setStats({
        totalDrivers: drivers.length,
        totalVehicles: vehicles.length,
        totalTrips: trips.length,
        totalRevenue: Number(totalRevenue), // Ensure it's a number
        pendingApprovals: pendingDrivers + pendingVehicles,
        activeTrips
      })

      // Set recent trips (last 5)
      setRecentTrips(trips.slice(0, 5))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values on error
      setStats({
        totalDrivers: 0,
        totalVehicles: 0,
        totalTrips: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeTrips: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const numValue = Number(value) || 0
    return numValue.toFixed(2)
  }

  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Car,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Active Trips',
      value: stats.activeTrips,
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `$${formatCurrency(stats.totalRevenue)}`, // Use helper function
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+23%',
      trend: 'up'
    }
  ]

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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-secondary-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Pending Approvals</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <div>
                <p className="font-medium text-warning-800">Driver Applications</p>
                <p className="text-sm text-warning-600">Requires review</p>
              </div>
              <span className="bg-warning-200 text-warning-800 px-2 py-1 rounded-full text-sm font-medium">
                {stats.pendingApprovals}
              </span>
            </div>
            <button className="w-full btn-primary text-sm">
              Review Applications
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">New trip completed</p>
                <p className="text-xs text-secondary-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">Driver registered</p>
                <p className="text-xs text-secondary-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">Vehicle approved</p>
                <p className="text-xs text-secondary-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">API Status</span>
              <span className="status-badge status-approved">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Payment Gateway</span>
              <span className="status-badge status-approved">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">SMS Service</span>
              <span className="status-badge status-approved">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Email Service</span>
              <span className="status-badge status-approved">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900">Recent Trips</h3>
          <button className="btn-secondary text-sm">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Trip ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Route</th>
                <th className="table-header">Status</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {recentTrips.map((trip) => (
                <tr key={trip.trip_id} className="hover:bg-secondary-50">
                  <td className="table-cell font-medium">#{trip.trip_id}</td>
                  <td className="table-cell">
                    {trip.firstName} {trip.lastName}
                  </td>
                  <td className="table-cell">
                    <div className="max-w-xs truncate">
                      {trip.pickupLocation} → {trip.dropLocation}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge status-${trip.status}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="table-cell font-medium">
                    ${formatCurrency(trip.total_price)}
                  </td>
                  <td className="table-cell text-secondary-500">
                    {new Date(trip.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentTrips.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-500">No recent trips found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard