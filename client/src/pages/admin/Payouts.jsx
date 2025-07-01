import React, { useState, useEffect } from 'react'
import { DollarSign, Users, TrendingUp, Download, Eye, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

const Payouts = () => {
  const [payoutData, setPayoutData] = useState({
    summary: {
      totalRevenue: 0,
      totalCommission: 0,
      totalPayouts: 0,
      totalTrips: 0
    },
    driverPayouts: [],
    recentPayouts: []
  })
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all') // all, fleet_partner, individual
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPayoutData()
  }, [])

  const fetchPayoutData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/payouts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayoutData(data)
      } else {
        toast.error('Failed to fetch payout data')
      }
    } catch (error) {
      console.error('Error fetching payout data:', error)
      toast.error('Failed to fetch payout data')
    } finally {
      setLoading(false)
    }
  }

  const filteredDrivers = payoutData.driverPayouts.filter(driver => {
    if (filterType === 'all') return true
    return driver.registration_type === filterType
  })

  const openDriverModal = (driver) => {
    setSelectedDriver(driver)
    setShowModal(true)
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Payout Management</h1>
          <p className="text-secondary-600">Manage driver and fleet partner payouts</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            ${payoutData.summary.totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm text-secondary-600">Total Revenue</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            ${payoutData.summary.totalCommission.toFixed(2)}
          </div>
          <div className="text-sm text-secondary-600">Admin Commission</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${payoutData.summary.totalPayouts.toFixed(2)}
          </div>
          <div className="text-sm text-secondary-600">Driver Payouts</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {payoutData.summary.totalTrips}
          </div>
          <div className="text-sm text-secondary-600">Completed Trips</div>
        </div>
      </div>

      {/* Commission Structure Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Commission Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Individual Drivers</h4>
            <div className="text-sm text-blue-700">
              <p>• Driver Payout: <strong>80%</strong></p>
              <p>• Admin Commission: <strong>20%</strong></p>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Fleet Partners</h4>
            <div className="text-sm text-green-700">
              <p>• Fleet Payout: <strong>85%</strong></p>
              <p>• Admin Commission: <strong>15%</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Payouts */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900">Driver Payouts</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-secondary-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual Drivers</option>
              <option value="fleet_partner">Fleet Partners</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Driver/Fleet</th>
                <th className="table-header">Type</th>
                <th className="table-header">Trips</th>
                <th className="table-header">Total Earnings</th>
                <th className="table-header">Commission Rate</th>
                <th className="table-header">Payout Amount</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.driver_id} className="hover:bg-secondary-50">
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {driver.company_name || driver.driverName}
                        </p>
                        <p className="text-sm text-secondary-500">{driver.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${
                      driver.registration_type === 'fleet_partner' ? 'status-approved' : 'status-confirmed'
                    }`}>
                      {driver.registration_type === 'fleet_partner' ? 'Fleet Partner' : 'Individual'}
                    </span>
                  </td>
                  <td className="table-cell font-medium">
                    {driver.total_trips}
                  </td>
                  <td className="table-cell font-medium">
                    ${driver.total_earnings.toFixed(2)}
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium">
                      {driver.commission_rate}%
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-green-600">
                        {driver.total_payout.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => openDriverModal(driver)}
                      className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-500">No payout data found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-6">Recent Trip Payouts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Trip ID</th>
                <th className="table-header">Driver</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Trip Amount</th>
                <th className="table-header">Commission</th>
                <th className="table-header">Driver Payout</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {payoutData.recentPayouts.slice(0, 10).map((payout) => (
                <tr key={payout.trip_id} className="hover:bg-secondary-50">
                  <td className="table-cell font-medium">
                    #{payout.trip_id}
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-secondary-900">{payout.driverName}</p>
                      <p className="text-sm text-secondary-500">
                        {payout.registration_type === 'fleet_partner' ? 'Fleet Partner' : 'Individual'}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    {payout.customer_first_name} {payout.customer_last_name}
                  </td>
                  <td className="table-cell font-medium">
                    ${parseFloat(payout.total_price).toFixed(2)}
                  </td>
                  <td className="table-cell">
                    <span className="text-blue-600 font-medium">
                      ${parseFloat(payout.admin_commission).toFixed(2)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="text-green-600 font-medium">
                      ${parseFloat(payout.driver_payout).toFixed(2)}
                    </span>
                  </td>
                  <td className="table-cell text-secondary-500">
                    {new Date(payout.trip_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Driver Details Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Payout Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">
                    {selectedDriver.registration_type === 'fleet_partner' ? 'Fleet Partner' : 'Driver'} Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Name</label>
                      <p className="text-secondary-900">
                        {selectedDriver.company_name || selectedDriver.driverName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Email</label>
                      <p className="text-secondary-900">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Type</label>
                      <p className="text-secondary-900">
                        {selectedDriver.registration_type === 'fleet_partner' ? 'Fleet Partner' : 'Individual Driver'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Commission Rate</label>
                      <p className="text-secondary-900">{selectedDriver.commission_rate}%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Payout Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Total Trips</label>
                      <p className="text-2xl font-bold text-blue-600">{selectedDriver.total_trips}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Total Earnings</label>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedDriver.total_earnings.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Admin Commission</label>
                      <p className="text-2xl font-bold text-orange-600">
                        ${(selectedDriver.total_earnings - selectedDriver.total_payout).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Driver Payout</label>
                      <p className="text-2xl font-bold text-purple-600">
                        ${selectedDriver.total_payout.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payouts