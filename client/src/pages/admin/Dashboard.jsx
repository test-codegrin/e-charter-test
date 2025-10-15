import React, { useState, useEffect } from 'react'
import { Users, Car, MapPin, DollarSign, TrendingUp, TrendingDown, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalVehicles: 0,
    totalTrips: 0,
    totalUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    inProgressTrips: 0,
    completedTrips: 0,
    approvedDrivers: 0,
    approvedVehicles: 0,
    pendingDrivers: 0,
    pendingVehicles: 0
  })
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard statistics from the new endpoint
      const response = await adminAPI.getDashboardStats()
      const { stats: dashboardStats, recentTrips: trips } = response.data

      // Merge API stats with default values
      setStats(prevStats => ({
        ...prevStats,
        ...dashboardStats
      }))
      
      setRecentTrips(trips || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const numValue = Number(value) || 0
    return numValue.toFixed(2)
  }

  // Helper function to calculate percentage change (mock for now)
  const getPercentageChange = (current, previous = 0) => {
    if (previous === 0) return '+0%'
    const change = ((current - previous) / previous * 100).toFixed(1)
    return change >= 0 ? `+${change}%` : `${change}%`
  }

  const statCards = [
    {
      title: 'Total Drivers',
      value: stats.totalDrivers,
      icon: Users,
      color: 'bg-ice-500',
      change: getPercentageChange(stats.totalDrivers, stats.totalDrivers * 0.9),
      trend: 'up'
    },
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Car,
      color: 'bg-ice-600',
      change: getPercentageChange(stats.totalVehicles, stats.totalVehicles * 0.95),
      trend: 'up'
    },
    {
      title: 'Active Trips',
      value: stats.inProgressTrips,
      icon: MapPin,
      color: 'bg-ice-700',
      change: getPercentageChange(stats.inProgressTrips, stats.inProgressTrips * 0.8),
      trend: 'up'
    },
    {
      title: 'Total Revenue',
      value: `$${formatCurrency(stats.totalRevenue)}`,
      icon: DollarSign,
      color: 'bg-ice-800',
      change: getPercentageChange(stats.totalRevenue, stats.totalRevenue * 0.85),
      trend: 'up'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ice-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-dark-800">Admin Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          
          return (
            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-dark-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-ice-600' : 'text-red-500'}`} />
                    <span className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-ice-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-secondary-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-glow floating-icon`}>
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
        <div className="card slide-in">
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-warning-500 mr-2" />
            Pending Approvals
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <div>
                <p className="font-medium text-warning-800">Driver Applications</p>
                <p className="text-sm text-warning-600">Requires review</p>
              </div>
              <span className="bg-warning-200 text-warning-800 px-2 py-1 rounded-full text-sm font-medium">
                {stats.pendingDrivers}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
              <div>
                <p className="font-medium text-warning-800">Vehicle Applications</p>
                <p className="text-sm text-warning-600">Requires review</p>
              </div>
              <span className="bg-warning-200 text-warning-800 px-2 py-1 rounded-full text-sm font-medium">
                {stats.pendingVehicles}
              </span>
            </div>
            <button className="w-full btn-primary text-sm">
              Review Applications
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="card slide-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-ice-500 mr-2" />
            System Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Total Users</span>
              <span className="font-bold text-ice-600">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Approved Drivers</span>
              <span className="font-bold text-ice-600">{stats.approvedDrivers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Approved Vehicles</span>
              <span className="font-bold text-ice-600">{stats.approvedVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Completed Trips</span>
              <span className="font-bold text-ice-600">{stats.completedTrips}</span>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="card slide-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-dark-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-ice-500 mr-2" />
            Revenue Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Total Revenue</span>
              <span className="font-bold text-ice-600">${formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">This Month</span>
              <span className="font-bold text-ice-600">${formatCurrency(stats.monthlyRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Avg per Trip</span>
              <span className="font-bold text-ice-600">
                ${stats.completedTrips > 0 ? formatCurrency(stats.totalRevenue / stats.completedTrips) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="card fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-dark-800 flex items-center">
            <Clock className="w-5 h-5 text-ice-500 mr-2" />
            Recent Trips
          </h3>
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
              {recentTrips.map((trip, index) => (
                <tr key={trip.trip_id} className="hover:bg-ice-50" style={{ animationDelay: `${index * 0.05}s` }}>
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
