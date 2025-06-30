import React, { useState, useEffect } from 'react'
import { Search, Filter, Check, X, Eye, Phone, Mail, MapPin } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [filteredDrivers, setFilteredDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchDrivers()
  }, [])

  useEffect(() => {
    filterDrivers()
  }, [drivers, searchTerm, statusFilter])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllDrivers()
      setDrivers(response.data.drivers || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const filterDrivers = () => {
    let filtered = drivers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(driver =>
        driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.cityName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      const statusValue = statusFilter === 'approved' ? 1 : statusFilter === 'pending' ? 0 : 2
      filtered = filtered.filter(driver => driver.status === statusValue)
    }

    setFilteredDrivers(filtered)
  }

  const handleApproval = async (driverId, status) => {
    try {
      await adminAPI.approveDriver(driverId, status)
      toast.success(`Driver ${status === 1 ? 'approved' : 'rejected'} successfully`)
      fetchDrivers()
    } catch (error) {
      console.error('Error updating driver status:', error)
      toast.error('Failed to update driver status')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="status-badge status-pending">Pending</span>
      case 1:
        return <span className="status-badge status-approved">Approved</span>
      case 2:
        return <span className="status-badge status-rejected">Rejected</span>
      default:
        return <span className="status-badge status-pending">Unknown</span>
    }
  }

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
          <h1 className="text-2xl font-bold text-secondary-900">Driver Management</h1>
          <p className="text-secondary-600">Manage driver registrations and approvals</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-600">Total: {drivers.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Driver</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Location</th>
                <th className="table-header">Status</th>
                <th className="table-header">Registered</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.driver_id} className="hover:bg-secondary-50">
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {driver.driverName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{driver.driverName}</p>
                        <p className="text-sm text-secondary-500">ID: {driver.driver_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm">{driver.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm">{driver.phoneNo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-secondary-400" />
                      <div>
                        <p className="text-sm font-medium">{driver.cityName}</p>
                        <p className="text-xs text-secondary-500">{driver.zipCord}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(driver.status)}
                  </td>
                  <td className="table-cell text-secondary-500">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openDriverModal(driver)}
                        className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {driver.status === 0 && (
                        <>
                          <button
                            onClick={() => handleApproval(driver.driver_id, 1)}
                            className="p-2 text-success-600 hover:text-success-700 hover:bg-success-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(driver.driver_id, 2)}
                            className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-100 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-500">No drivers found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Driver Details Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Driver Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Name</label>
                      <p className="text-secondary-900">{selectedDriver.driverName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Email</label>
                      <p className="text-secondary-900">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Phone</label>
                      <p className="text-secondary-900">{selectedDriver.phoneNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Status</label>
                      {getStatusBadge(selectedDriver.status)}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Address</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-secondary-700">Street Address</label>
                      <p className="text-secondary-900">{selectedDriver.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">City</label>
                      <p className="text-secondary-900">{selectedDriver.cityName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Postal Code</label>
                      <p className="text-secondary-900">{selectedDriver.zipCord}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedDriver.status === 0 && (
                  <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                    <button
                      onClick={() => {
                        handleApproval(selectedDriver.driver_id, 1)
                        setShowModal(false)
                      }}
                      className="btn-success flex-1"
                    >
                      Approve Driver
                    </button>
                    <button
                      onClick={() => {
                        handleApproval(selectedDriver.driver_id, 2)
                        setShowModal(false)
                      }}
                      className="btn-danger flex-1"
                    >
                      Reject Driver
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Drivers