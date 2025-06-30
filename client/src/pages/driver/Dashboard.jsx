import React, { useState, useEffect } from 'react'
import { Car, MapPin, DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react'
import { driverAPI } from '../../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    activeTrips: 0,
    rating: 4.8
  })
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch driver trips
      const tripsResponse = await driverAPI.getTrips()
      const trips = tripsResponse.data.trips || []

      // Calculate stats with proper number handling
      const completedTrips = trips.filter(t => t.status === 'completed')
      const activeTrips = trips.filter(t => t.status === 'in_progress')
      
      // Safely calculate total earnings
      const totalEarnings = completedTrips.reduce((sum, trip) => {
        const price = parseFloat(trip.total_price) || 0
        return sum + price
      }, 0)
      
      // Calculate monthly earnings (current month)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyTrips = completedTrips.filter(trip => {
        const tripDate = new Date(trip.created_at)
        return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear
      })
      const monthlyEarnings = monthlyTrips.reduce((sum, trip) => {
        const price = parseFloat(trip.total_price) || 0
        return sum + price
      }, 0)

      setStats({
        totalTrips: trips.length,
        completedTrips: completedTrips.length,
        totalEarnings: Number(totalEarnings),
        monthlyEarnings: Number(monthlyEarnings),
        activeTrips: activeTrips.length,
        rating: 4.8 // Mock rating
      })

      // Set recent trips (last 5)
      setRecentTrips(trips.slice(0, 5))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values on error
      setStats({
        totalTrips: 0,
        completedTrips: 0,
        totalEarnings: 0,
        monthlyEarnings: 0,
        activeTrips: 0,
        rating: 4.8
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
      title: 'Total Earnings',
      value: `$${formatCurrency(stats.totalEarnings)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Monthly Earnings',
      value: `$${formatCurrency(stats.monthlyEarnings)}`,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      icon: MapPin,
      color: 'bg-purple-500',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Active Trips',
      value: stats.activeTrips,
      icon: Clock,
      color: 'bg-orange-500',
      change: '0',
      trend: 'neutral'
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
        <h1 className="text-2xl font-bold text-secondary-900">Driver Dashboard</h1>
        <p className="text-secondary-600">Welcome back! Here's your performance overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = TrendingUp
          
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  {stat.change !== '0' && (
                    <div className="flex items-center mt-2">
                      <TrendIcon className="w-4 h-4 text-green-500" />
                      <span className="text-sm ml-1 text-green-600">{stat.change}</span>
                      <span className="text-sm text-secondary-500 ml-1">vs last month</span>
                    </div>
                  )}
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
        {/* Performance Overview */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Average Rating</span>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-yellow-500">{stats.rating}</span>
                <span className="text-sm text-secondary-500">/ 5.0</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Completion Rate</span>
              <span className="font-bold text-green-600">98%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">On-Time Rate</span>
              <span className="font-bold text-blue-600">95%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Response Time</span>
              <span className="font-bold text-purple-600">2 min</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left p-4 rounded-lg">
              <div className="font-medium">View Active Trips</div>
              <div className="text-sm opacity-90">Check ongoing bookings</div>
            </button>
            <button className="w-full btn-secondary text-left p-4 rounded-lg">
              <div className="font-medium">Add New Vehicle</div>
              <div className="text-sm">Register another vehicle</div>
            </button>
            <button className="w-full btn-secondary text-left p-4 rounded-lg">
              <div className="font-medium">Update Availability</div>
              <div className="text-sm">Manage your schedule</div>
            </button>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {stats.activeTrips > 0 ? (
              <div className="p-3 bg-primary-50 rounded-lg">
                <div className="font-medium text-primary-800">Active Trip</div>
                <div className="text-sm text-primary-600">In progress</div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
                <p className="text-sm text-secondary-500">No trips scheduled</p>
              </div>
            )}
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
                <th className="table-header">Earnings</th>
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
              <p className="text-secondary-500">No trips found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard