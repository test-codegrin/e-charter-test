import React, { useState, useEffect } from 'react'
import { Car, MapPin, DollarSign, Clock, TrendingUp, Calendar, Building2, CheckCircle } from 'lucide-react'
import { driverAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [driverType, setDriverType] = useState('individual')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const response = await driverAPI.getDashboardStats()
      const { stats: dashboardStats, recentTrips: trips } = response.data

      setStats(dashboardStats)
      setDriverType(dashboardStats.driver_type)
      setRecentTrips(trips || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    const numValue = Number(value) || 0
    return numValue.toFixed(2)
  }

  const getPercentageChange = (current, previous = 0) => {
    if (previous === 0) return '+0%'
    const change = ((current - previous) / previous * 100).toFixed(1)
    return change >= 0 ? `+${change}%` : `${change}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12">Error loading dashboard</div>
  }

  // Different stat cards based on driver type
  const getStatCards = () => {
    if (driverType === 'individual') {
      return [
        {
          title: 'Total Earnings',
          value: `$${formatCurrency(stats.totalEarnings)}`,
          icon: DollarSign,
          color: 'bg-green-500',
          change: getPercentageChange(stats.totalEarnings, stats.totalEarnings * 0.85),
          trend: 'up'
        },
        {
          title: 'Monthly Earnings',
          value: `$${formatCurrency(stats.monthlyEarnings)}`,
          icon: Calendar,
          color: 'bg-blue-500',
          change: getPercentageChange(stats.monthlyEarnings, stats.monthlyEarnings * 0.9),
          trend: 'up'
        },
        {
          title: 'Completed Trips',
          value: stats.completedTrips,
          icon: MapPin,
          color: 'bg-purple-500',
          change: getPercentageChange(stats.completedTrips, stats.completedTrips * 0.9),
          trend: 'up'
        },
        {
          title: 'My Vehicles',
          value: stats.totalVehicles,
          icon: Car,
          color: 'bg-orange-500',
          change: `${stats.approvedVehicles} approved`,
          trend: 'neutral'
        }
      ]
    } else {
      // Fleet partner
      return [
        {
          title: 'Total Trips',
          value: stats.totalTrips,
          icon: MapPin,
          color: 'bg-blue-500',
          change: getPercentageChange(stats.totalTrips, stats.totalTrips * 0.9),
          trend: 'up'
        },
        {
          title: 'Completed Trips',
          value: stats.completedTrips,
          icon: CheckCircle,
          color: 'bg-green-500',
          change: `${stats.completionRate}% rate`,
          trend: 'up'
        },
        {
          title: 'Running Trips',
          value: stats.runningTrips,
          icon: Clock,
          color: 'bg-orange-500',
          change: 'Active now',
          trend: 'neutral'
        },
        {
          title: 'Upcoming Trips',
          value: stats.confirmedTrips,
          icon: Calendar,
          color: 'bg-purple-500',
          change: 'Confirmed',
          trend: 'neutral'
        }
      ]
    }
  }

  const statCards = getStatCards()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          {driverType === 'fleet_partner' ? 'Fleet Driver Dashboard' : 'Driver Dashboard'}
        </h1>
        <p className="text-secondary-600">
          Welcome back, {stats.driver_name}! Here's your performance overview.
        </p>
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
                      {stat.trend !== 'neutral' && <TrendIcon className="w-4 h-4 text-green-500" />}
                      <span className="text-sm ml-1 text-green-600">{stat.change}</span>
                      {stat.trend === 'up' && <span className="text-sm text-secondary-500 ml-1">vs last month</span>}
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
        {/* Performance Overview - REMOVED onTimeRate */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Average Rating</span>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-yellow-500">{stats.averageRating}</span>
                <span className="text-sm text-secondary-500">/ 5.0</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Total Ratings</span>
              <span className="font-bold text-blue-600">{stats.totalRatings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Completion Rate</span>
              <span className="font-bold text-green-600">{stats.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Total Trips</span>
              <span className="font-bold text-purple-600">{stats.totalTrips}</span>
            </div>
          </div>
        </div>

        {/* Conditional Second Card - Vehicle Status OR Fleet Company Info */}
        {driverType === 'individual' ? (
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">My Vehicles</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Total Vehicles</span>
                <span className="font-bold text-blue-600">{stats.totalVehicles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Approved</span>
                <span className="font-bold text-green-600">{stats.approvedVehicles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Pending</span>
                <span className="font-bold text-warning-600">{stats.pendingVehicles}</span>
              </div>
              <button className="w-full btn-secondary text-sm mt-3">
                Manage Vehicles
              </button>
            </div>
          </div>
        ) : (
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-500" />
              Fleet Company
            </h3>
            {stats.fleet_company ? (
              <div className="space-y-3">
                {stats.fleet_company.profile_image && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={stats.fleet_company.profile_image} 
                      alt={stats.fleet_company.company_name}
                      className="h-16 w-auto object-contain rounded"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-secondary-600">Company Name</p>
                  <p className="font-semibold text-secondary-900">{stats.fleet_company.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Contact</p>
                  <p className="text-sm text-secondary-700">{stats.fleet_company.email}</p>
                  <p className="text-sm text-secondary-700">{stats.fleet_company.phone_no}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Location</p>
                  <p className="text-sm text-secondary-700 capitalize">{stats.fleet_company.city_name}</p>
                </div>
                {stats.fleet_company.website && (
                  <div>
                    <p className="text-sm text-secondary-600">Website</p>
                    <a 
                      href={`https://${stats.fleet_company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {stats.fleet_company.website}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-secondary-500">No fleet company assigned</p>
            )}
          </div>
        )}

        {/* Today's Schedule */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {stats.runningTrips > 0 ? (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="font-medium text-orange-800">Running Trip</div>
                <div className="text-sm text-orange-600">{stats.runningTrips} active</div>
              </div>
            ) : stats.confirmedTrips > 0 ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-800">Upcoming Trips</div>
                <div className="text-sm text-green-600">{stats.confirmedTrips} confirmed</div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-secondary-300 mx-auto mb-2" />
                <p className="text-sm text-secondary-500">No trips scheduled</p>
              </div>
            )}
            
            {/* Trip Summary */}
            <div className="pt-3 border-t border-secondary-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-600">Completed</span>
                <span className="font-semibold text-green-600">{stats.completedTrips}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-secondary-600">Cancelled</span>
                <span className="font-semibold text-red-600">{stats.cancelledTrips}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trips Table */}
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
                <th className="table-header">Trip Name</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Route</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Status</th>
                {driverType === 'individual' && <th className="table-header">Earnings</th>}
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {recentTrips.map((trip) => (
                <tr key={trip.trip_id} className="hover:bg-secondary-50">
                  <td className="table-cell font-medium">#{trip.trip_id}</td>
                  <td className="table-cell">{trip.trip_name || 'N/A'}</td>
                  <td className="table-cell">
                    {trip.user_details?.firstname} {trip.user_details?.lastname}
                  </td>
                  <td className="table-cell">
                    <div className="max-w-xs truncate">
                      {trip.pickup_location_name} → {trip.dropoff_location_name}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm">
                      {trip.vehicle_details?.maker} {trip.vehicle_details?.model}
                      <div className="text-xs text-secondary-500">{trip.vehicle_details?.registration_number}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge status-${trip.trip_status}`}>
                      {trip.trip_status}
                    </span>
                  </td>
                  {driverType === 'individual' && (
                    <td className="table-cell font-medium">
                      ${formatCurrency(trip.total_price)}
                    </td>
                  )}
                  <td className="table-cell text-secondary-500">
                    {new Date(trip.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentTrips.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
              <p className="text-secondary-500">No trips found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard