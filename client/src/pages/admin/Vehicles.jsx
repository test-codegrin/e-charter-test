import React, { useState, useEffect } from 'react'
import { Search, Filter, Check, X, Eye, Car, User } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter, typeFilter])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllVehicles()
      setVehicles(response.data.cars || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const filterVehicles = () => {
    let filtered = vehicles

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vehicle =>
        vehicle.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      const statusValue = statusFilter === 'approved' ? 1 : 0
      filtered = filtered.filter(vehicle => vehicle.status === statusValue)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => 
        vehicle.carType.toLowerCase() === typeFilter.toLowerCase()
      )
    }

    setFilteredVehicles(filtered)
  }

  const handleApproval = async (carId, status) => {
    try {
      await adminAPI.approveVehicle(carId, status)
      toast.success(`Vehicle ${status === 1 ? 'approved' : 'rejected'} successfully`)
      fetchVehicles()
    } catch (error) {
      console.error('Error updating vehicle status:', error)
      toast.error('Failed to update vehicle status')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="status-badge status-pending">Pending</span>
      case 1:
        return <span className="status-badge status-approved">Approved</span>
      default:
        return <span className="status-badge status-pending">Unknown</span>
    }
  }

  const getVehicleIcon = (type) => {
    return <Car className="w-5 h-5" />
  }

  const openVehicleModal = (vehicle) => {
    setSelectedVehicle(vehicle)
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
          <h1 className="text-2xl font-bold text-secondary-900">Vehicle Management</h1>
          <p className="text-secondary-600">Manage vehicle registrations and approvals</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-600">Total: {vehicles.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filters */}
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
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Vehicle</th>
                <th className="table-header">Driver</th>
                <th className="table-header">Type & Size</th>
                <th className="table-header">License Plate</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.car_id} className="hover:bg-secondary-50">
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        {getVehicleIcon(vehicle.carType)}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{vehicle.carName}</p>
                        <p className="text-sm text-secondary-500">ID: {vehicle.car_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-secondary-400" />
                      <div>
                        <p className="font-medium text-secondary-900">{vehicle.driverName}</p>
                        <p className="text-sm text-secondary-500">{vehicle.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-secondary-900">{vehicle.carType}</p>
                      <p className="text-sm text-secondary-500">{vehicle.carSize}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="font-mono text-sm bg-secondary-100 px-2 py-1 rounded">
                      {vehicle.carNumber}
                    </span>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(vehicle.status)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openVehicleModal(vehicle)}
                        className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {vehicle.status === 0 && (
                        <>
                          <button
                            onClick={() => handleApproval(vehicle.car_id, 1)}
                            className="p-2 text-success-600 hover:text-success-700 hover:bg-success-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(vehicle.car_id, 0)}
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

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-500">No vehicles found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Vehicle Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Vehicle Info */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Vehicle Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Vehicle Name</label>
                      <p className="text-secondary-900">{selectedVehicle.carName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">License Plate</label>
                      <p className="text-secondary-900 font-mono">{selectedVehicle.carNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Type</label>
                      <p className="text-secondary-900">{selectedVehicle.carType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Size</label>
                      <p className="text-secondary-900">{selectedVehicle.carSize}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Status</label>
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                </div>

                {/* Driver Info */}
                <div>
                  <h4 className="font-semibold text-secondary-900 mb-3">Driver Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Driver Name</label>
                      <p className="text-secondary-900">{selectedVehicle.driverName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Email</label>
                      <p className="text-secondary-900">{selectedVehicle.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Phone</label>
                      <p className="text-secondary-900">{selectedVehicle.phoneNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Driver ID</label>
                      <p className="text-secondary-900">{selectedVehicle.driver_id}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedVehicle.status === 0 && (
                  <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                    <button
                      onClick={() => {
                        handleApproval(selectedVehicle.car_id, 1)
                        setShowModal(false)
                      }}
                      className="btn-success flex-1"
                    >
                      Approve Vehicle
                    </button>
                    <button
                      onClick={() => {
                        handleApproval(selectedVehicle.car_id, 0)
                        setShowModal(false)
                      }}
                      className="btn-danger flex-1"
                    >
                      Reject Vehicle
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

export default Vehicles