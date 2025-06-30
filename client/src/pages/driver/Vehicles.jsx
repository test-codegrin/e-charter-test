import React, { useState, useEffect } from 'react'
import { Plus, Car, Edit, Eye } from 'lucide-react'
import { driverAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    carName: '',
    carNumber: '',
    carSize: '',
    carType: ''
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await driverAPI.getVehicles()
      setVehicles(response.data.cars || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await driverAPI.addVehicle(formData)
      toast.success('Vehicle added successfully! Pending approval.')
      setShowAddModal(false)
      setFormData({
        carName: '',
        carNumber: '',
        carSize: '',
        carType: ''
      })
      fetchVehicles()
    } catch (error) {
      console.error('Error adding vehicle:', error)
      toast.error('Failed to add vehicle')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="status-badge status-pending">Pending Approval</span>
      case 1:
        return <span className="status-badge status-approved">Approved</span>
      case 2:
        return <span className="status-badge status-rejected">Rejected</span>
      default:
        return <span className="status-badge status-pending">Unknown</span>
    }
  }

  const getVehicleIcon = (type) => {
    return <Car className="w-5 h-5" />
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
          <h1 className="text-2xl font-bold text-secondary-900">My Vehicles</h1>
          <p className="text-secondary-600">Manage your registered vehicles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {vehicles.length}
          </div>
          <div className="text-sm text-secondary-600">Total Vehicles</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {vehicles.filter(v => v.status === 1).length}
          </div>
          <div className="text-sm text-secondary-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">
            {vehicles.filter(v => v.status === 0).length}
          </div>
          <div className="text-sm text-secondary-600">Pending</div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.car_id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  {getVehicleIcon(vehicle.carType)}
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900">{vehicle.carName}</h3>
                  <p className="text-sm text-secondary-500">{vehicle.carType}</p>
                </div>
              </div>
              {getStatusBadge(vehicle.status)}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">License Plate:</span>
                <span className="text-sm font-medium font-mono">{vehicle.carNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Size:</span>
                <span className="text-sm font-medium">{vehicle.carSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary-600">Type:</span>
                <span className="text-sm font-medium">{vehicle.carType}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex space-x-2">
                <button className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1">
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <div className="col-span-full card text-center py-12">
            <Car className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-500 mb-4">No vehicles registered yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Add New Vehicle</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Vehicle Name
                  </label>
                  <input
                    type="text"
                    name="carName"
                    value={formData.carName}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="e.g., Honda Civic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    name="carNumber"
                    value={formData.carNumber}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="e.g., ABC-1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    name="carType"
                    value={formData.carType}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Vehicle Size
                  </label>
                  <select
                    name="carSize"
                    value={formData.carSize}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Size</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vehicles