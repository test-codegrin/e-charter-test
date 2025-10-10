import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Search,
  Filter,
  Eye,
  Car,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Fuel,
  Users,
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [filteredVehicles, setFilteredVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [ownershipFilter, setOwnershipFilter] = useState('all')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    filterVehicles()
  }, [vehicles, searchTerm, statusFilter, typeFilter, ownershipFilter])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllVehicles()
      console.log('Vehicles response:', response.data)
      setVehicles(response.data.vehicles || [])
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
        vehicle.maker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.fleet_company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(vehicle => 
        vehicle.vehicle_type?.toLowerCase() === typeFilter.toLowerCase()
      )
    }

    // Ownership filter
    if (ownershipFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.ownership === ownershipFilter)
    }

    setFilteredVehicles(filtered)
  }

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await adminAPI.approveVehicle(vehicleId, newStatus)

      const statusText = 
        newStatus === 'approved' ? 'approved' :
        newStatus === 'rejected' ? 'rejected' :
        'marked as in review'

      toast.success(`Vehicle ${statusText} successfully`)
      fetchVehicles()
    } catch (error) {
      console.error('Error updating vehicle status:', error)
      toast.error('Failed to update vehicle status')
    }
  }

  // Status badge component
  const getStatusBadge = (status) => {
    const normalizedStatus = status || 'in_review'

    switch (normalizedStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      case 'in_review':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In Review
          </span>
        )
    }
  }

  // Status dropdown component with Portal
  const StatusDropdown = ({ currentStatus, vehicleId, vehicleName }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef(null)
    const normalizedStatus = currentStatus || 'in_review'

    const statusOptions = [
      {
        value: 'in_review',
        label: 'In Review',
        icon: Clock,
        color: 'text-yellow-600',
      },
      {
        value: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-green-600',
      },
      {
        value: 'rejected',
        label: 'Reject',
        icon: XCircle,
        color: 'text-red-600',
      },
    ]

    const handleStatusSelect = (status) => {
      if (status !== normalizedStatus) {
        handleStatusChange(vehicleId, status)
      }
      setIsOpen(false)
    }

    const handleToggle = () => {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.right + window.scrollX - 192, // 192px = w-48 width
        })
      }
      setIsOpen(!isOpen)
    }

    return (
      <>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          {getStatusBadge(normalizedStatus)}
        </button>

        {isOpen &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
              />
              <div
                className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                }}
              >
                <div className="p-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = option.value === normalizedStatus

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusSelect(option.value)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                          isSelected
                            ? 'bg-gray-100 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>,
            document.body
          )}
      </>
    )
  }

  const openVehicleModal = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Vehicle Management
        </h1>
        <p className="text-secondary-600">
          Manage vehicle registrations and approvals
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <span className="text-secondary-600">Total: </span>
          <span className="font-semibold text-secondary-900">
            {vehicles.length}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-secondary-600">Approved: </span>
          <span className="font-semibold text-green-600">
            {vehicles.filter((v) => v.status === 'approved').length}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-secondary-600">In Review: </span>
          <span className="font-semibold text-yellow-600">
            {vehicles.filter((v) => !v.status || v.status === 'in_review').length}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-secondary-600">Rejected: </span>
          <span className="font-semibold text-red-600">
            {vehicles.filter((v) => v.status === 'rejected').length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by maker, model, registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-secondary-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="hatchback">Hatchback</option>
              <option value="bus">Bus</option>
            </select>
            <select
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Ownership</option>
              <option value="individual">Individual</option>
              <option value="fleet_company">Fleet Company</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.vehicle_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {vehicle.car_image ? (
                        <img 
                          src={vehicle.car_image} 
                          alt={`${vehicle.maker} ${vehicle.model}`}
                          className="w-44 h-20 object-contain rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Car className="w-8 h-8 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {vehicle.maker} {vehicle.model}
                        </p>
                        {vehicle.name && (
                          <p className="text-sm text-gray-500">{vehicle.name}</p>
                        )}
                        <p className="text-xs text-gray-400">ID: {vehicle.vehicle_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {vehicle.ownership === 'fleet_company' ? (
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {vehicle.fleet_company_name || 'Fleet Company'}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            Fleet Partner
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Individual</p>
                          <p className="text-xs text-gray-500">Owner Driver</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-gray-900 capitalize">
                          {vehicle.vehicle_type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{vehicle.number_of_seats} Seats</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Fuel className="w-3 h-3" />
                          <span className="capitalize">{vehicle.fuel_type}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded border border-gray-200">
                      {vehicle.registration_number}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown
                      currentStatus={vehicle.status}
                      vehicleId={vehicle.vehicle_id}
                      vehicleName={`${vehicle.maker} ${vehicle.model}`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(vehicle.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openVehicleModal(vehicle)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No vehicles found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Details Modal */}
      {showModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Vehicle Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Vehicle Image - Full Display */}
                {selectedVehicle.car_image && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                    <img 
                      src={selectedVehicle.car_image} 
                      alt={`${selectedVehicle.maker} ${selectedVehicle.model}`}
                      className="w-full h-80 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Vehicle Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Vehicle Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Manufacturer
                      </label>
                      <p className="text-gray-900">{selectedVehicle.maker}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Model
                      </label>
                      <p className="text-gray-900">{selectedVehicle.model}</p>
                    </div>
                    {selectedVehicle.name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Vehicle Name
                        </label>
                        <p className="text-gray-900">{selectedVehicle.name}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Registration Number
                      </label>
                      <p className="text-gray-900 font-mono">{selectedVehicle.registration_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Vehicle Type
                      </label>
                      <p className="text-gray-900 capitalize">{selectedVehicle.vehicle_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Number of Seats
                      </label>
                      <p className="text-gray-900">{selectedVehicle.number_of_seats}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Fuel Type
                      </label>
                      <p className="text-gray-900 capitalize">{selectedVehicle.fuel_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Availability
                      </label>
                      <p className="text-gray-900">
                        {selectedVehicle.is_available ? (
                          <span className="text-green-600 font-medium">Available</span>
                        ) : (
                          <span className="text-red-600 font-medium">Not Available</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Ownership Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Ownership Type
                      </label>
                      <p className="text-gray-900 capitalize">
                        {selectedVehicle.ownership.replace('_', ' ')}
                      </p>
                    </div>
                    {selectedVehicle.ownership === 'fleet_company' && selectedVehicle.fleet_company_name && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Fleet Company
                          </label>
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            <p className="text-gray-900 font-medium">
                              {selectedVehicle.fleet_company_name}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Fleet Company ID
                          </label>
                          <p className="text-gray-900">{selectedVehicle.fleet_company_id}</p>
                        </div>
                      </>
                    )}
                    {selectedVehicle.ownership === 'individual' && (
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <User className="w-4 h-4" />
                          <p className="text-sm">This vehicle is owned by an individual driver</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Registration Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Created At
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedVehicle.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedVehicle.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Change Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Change Status
                  </h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedVehicle.vehicle_id, 'approved')
                        setShowModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedVehicle.vehicle_id, 'in_review')
                        setShowModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>In Review</span>
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedVehicle.vehicle_id, 'rejected')
                        setShowModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
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

export default Vehicles