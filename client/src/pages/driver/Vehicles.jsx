import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Car, 
  Edit, 
  Eye, 
  Trash2, 
  X, 
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add', 'edit', 'view'
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  
  const [formData, setFormData] = useState({
    carName: '',
    carNumber: '',
    carSize: '',
    carType: '',
    bus_capacity: '',
    vehicle_age: '',
    vehicle_condition: 'good',
    specialized_services: [],
    wheelchair_accessible: false,
    vehicle_features: [],
    maintenance_schedule: '',
    insurance_expiry: '',
    license_plate_expiry: ''
  })

  const vehicleTypes = ['Sedan', 'SUV', 'Van', 'Bus', 'Mini-Bus', 'Coach', 'Luxury-Coach']
  const vehicleSizes = ['Small', 'Medium', 'Large']
  const vehicleConditions = ['excellent', 'good', 'fair', 'needs_maintenance']
  
  const specializedServiceOptions = [
    'Airport Transfer', 'Wedding Transportation', 'Corporate Events',
    'Tour Services', 'Medical Transport', 'School Transport',
    'Event Shuttle', 'Long Distance', 'Luxury Service'
  ]
  
  const vehicleFeatureOptions = [
    'Air Conditioning', 'WiFi', 'GPS Navigation', 'Entertainment System',
    'Leather Seats', 'Reclining Seats', 'USB Charging', 'Refreshments',
    'Privacy Partition', 'Sound System', 'Reading Lights', 'Storage Space'
  ]

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/getdrivercar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Vehicles loaded:', data)
        setVehicles(data.cars || [])
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to fetch vehicles')
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.carName || !formData.carNumber || !formData.carSize || !formData.carType) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      const url = modalMode === 'edit' 
        ? `/api/driver/car/${selectedVehicle.car_id}`
        : '/api/driver/addcar'
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        setShowModal(false)
        resetForm()
        fetchVehicles()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || `Failed to ${modalMode} vehicle`)
      }
    } catch (error) {
      console.error(`Error ${modalMode}ing vehicle:`, error)
      toast.error(`Failed to ${modalMode} vehicle`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to delete ${vehicle.carName} (${vehicle.carNumber})?`)) {
      return
    }

    try {
      setDeleting(vehicle.car_id)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/driver/car/${vehicle.car_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        fetchVehicles()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to delete vehicle')
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Failed to delete vehicle')
    } finally {
      setDeleting(null)
    }
  }

  const openModal = (mode, vehicle = null) => {
    setModalMode(mode)
    setSelectedVehicle(vehicle)
    
    if (mode === 'add') {
      resetForm()
    } else if (vehicle) {
      setFormData({
        carName: vehicle.carName || '',
        carNumber: vehicle.carNumber || '',
        carSize: vehicle.carSize || '',
        carType: vehicle.carType || '',
        bus_capacity: vehicle.bus_capacity || '',
        vehicle_age: vehicle.vehicle_age || '',
        vehicle_condition: vehicle.vehicle_condition || 'good',
        specialized_services: vehicle.specialized_services || [],
        wheelchair_accessible: vehicle.wheelchair_accessible || false,
        vehicle_features: vehicle.vehicle_features || [],
        maintenance_schedule: vehicle.maintenance_schedule || '',
        insurance_expiry: vehicle.insurance_expiry || '',
        license_plate_expiry: vehicle.license_plate_expiry || ''
      })
    }
    
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      carName: '',
      carNumber: '',
      carSize: '',
      carType: '',
      bus_capacity: '',
      vehicle_age: '',
      vehicle_condition: 'good',
      specialized_services: [],
      wheelchair_accessible: false,
      vehicle_features: [],
      maintenance_schedule: '',
      insurance_expiry: '',
      license_plate_expiry: ''
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value) 
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return (
          <span className="status-badge status-pending flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending Approval</span>
          </span>
        )
      case 1:
        return (
          <span className="status-badge status-approved flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        )
      case 2:
        return (
          <span className="status-badge status-rejected flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        )
      default:
        return (
          <span className="status-badge status-pending">Unknown</span>
        )
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
          onClick={() => openModal('add')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="card text-center">
          <div className="text-2xl font-bold text-danger-600">
            {vehicles.filter(v => v.status === 2).length}
          </div>
          <div className="text-sm text-secondary-600">Rejected</div>
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
              {vehicle.bus_capacity && (
                <div className="flex justify-between">
                  <span className="text-sm text-secondary-600">Capacity:</span>
                  <span className="text-sm font-medium">{vehicle.bus_capacity} passengers</span>
                </div>
              )}
              {vehicle.wheelchair_accessible && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600">Wheelchair Accessible</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-secondary-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => openModal('view', vehicle)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => openModal('edit', vehicle)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1"
                  disabled={deleting === vehicle.car_id}
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(vehicle)}
                  className="btn-danger text-sm flex items-center justify-center space-x-1 px-3"
                  disabled={deleting === vehicle.car_id}
                >
                  {deleting === vehicle.car_id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
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
              onClick={() => openModal('add')}
              className="btn-primary"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">
                  {modalMode === 'add' ? 'Add New Vehicle' : 
                   modalMode === 'edit' ? 'Edit Vehicle' : 'Vehicle Details'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Vehicle Name *
                      </label>
                      <input
                        type="text"
                        name="carName"
                        value={formData.carName}
                        onChange={handleChange}
                        required
                        disabled={modalMode === 'view'}
                        className="input-field"
                        placeholder="e.g., Honda Civic"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        License Plate *
                      </label>
                      <input
                        type="text"
                        name="carNumber"
                        value={formData.carNumber}
                        onChange={handleChange}
                        required
                        disabled={modalMode === 'view'}
                        className="input-field"
                        placeholder="e.g., ABC-1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Vehicle Type *
                      </label>
                      <select
                        name="carType"
                        value={formData.carType}
                        onChange={handleChange}
                        required
                        disabled={modalMode === 'view'}
                        className="input-field"
                      >
                        <option value="">Select Type</option>
                        {vehicleTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Vehicle Size *
                      </label>
                      <select
                        name="carSize"
                        value={formData.carSize}
                        onChange={handleChange}
                        required
                        disabled={modalMode === 'view'}
                        className="input-field"
                      >
                        <option value="">Select Size</option>
                        {vehicleSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Passenger Capacity
                      </label>
                      <input
                        type="number"
                        name="bus_capacity"
                        value={formData.bus_capacity}
                        onChange={handleChange}
                        disabled={modalMode === 'view'}
                        className="input-field"
                        placeholder="e.g., 8"
                        min="1"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Vehicle Age (years)
                      </label>
                      <input
                        type="number"
                        name="vehicle_age"
                        value={formData.vehicle_age}
                        onChange={handleChange}
                        disabled={modalMode === 'view'}
                        className="input-field"
                        placeholder="e.g., 3"
                        min="0"
                        max="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Vehicle Condition
                      </label>
                      <select
                        name="vehicle_condition"
                        value={formData.vehicle_condition}
                        onChange={handleChange}
                        disabled={modalMode === 'view'}
                        className="input-field"
                      >
                        {vehicleConditions.map(condition => (
                          <option key={condition} value={condition}>
                            {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="wheelchair_accessible"
                          checked={formData.wheelchair_accessible}
                          onChange={handleChange}
                          disabled={modalMode === 'view'}
                          className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-secondary-700">
                          Wheelchair Accessible
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Specialized Services */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Specialized Services</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specializedServiceOptions.map(service => (
                      <label key={service} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.specialized_services.includes(service)}
                          onChange={() => handleMultiSelect('specialized_services', service)}
                          disabled={modalMode === 'view'}
                          className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vehicle Features */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Vehicle Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vehicleFeatureOptions.map(feature => (
                      <label key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.vehicle_features.includes(feature)}
                          onChange={() => handleMultiSelect('vehicle_features', feature)}
                          disabled={modalMode === 'view'}
                          className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Insurance Expiry Date
                      </label>
                      <input
                        type="date"
                        name="insurance_expiry"
                        value={formData.insurance_expiry}
                        onChange={handleChange}
                        disabled={modalMode === 'view'}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        License Plate Expiry Date
                      </label>
                      <input
                        type="date"
                        name="license_plate_expiry"
                        value={formData.license_plate_expiry}
                        onChange={handleChange}
                        disabled={modalMode === 'view'}
                        className="input-field"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Maintenance Schedule
                      </label>
                      <textarea
                        name="maintenance_schedule"
                        value={formData.maintenance_schedule}
                        onChange={handleChange}
                        disabled={modalMode === 'view'}
                        rows={3}
                        className="input-field"
                        placeholder="Describe your maintenance schedule..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                {modalMode !== 'view' && (
                  <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={saving}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>{modalMode === 'edit' ? 'Update Vehicle' : 'Add Vehicle'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Vehicles