import React, { useState, useEffect } from 'react'
import { Search, Filter, Check, X, Eye, Building, Users, Car } from 'lucide-react'
import toast from 'react-hot-toast'

const FleetPartners = () => {
  const [fleetPartners, setFleetPartners] = useState([])
  const [filteredPartners, setFilteredPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchFleetPartners()
  }, [])

  useEffect(() => {
    filterPartners()
  }, [fleetPartners, searchTerm, statusFilter])

  const fetchFleetPartners = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/fleet/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setFleetPartners(data.fleetPartners || [])
      } else {
        toast.error('Failed to fetch fleet partners')
      }
    } catch (error) {
      console.error('Error fetching fleet partners:', error)
      toast.error('Failed to fetch fleet partners')
    } finally {
      setLoading(false)
    }
  }

  const filterPartners = () => {
    let filtered = fleetPartners

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(partner =>
        partner.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.cityName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      const statusValue = statusFilter === 'approved' ? 1 : statusFilter === 'pending' ? 0 : 2
      filtered = filtered.filter(partner => partner.status === statusValue)
    }

    setFilteredPartners(filtered)
  }

  const handleApproval = async (driverId, status) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/verification/approvedriver/${driverId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Fleet partner ${status === 1 ? 'approved' : 'rejected'} successfully`)
        fetchFleetPartners()
      } else {
        toast.error('Failed to update fleet partner status')
      }
    } catch (error) {
      console.error('Error updating fleet partner status:', error)
      toast.error('Failed to update fleet partner status')
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

  const openPartnerModal = (partner) => {
    setSelectedPartner(partner)
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
          <h1 className="text-2xl font-bold text-secondary-900">Fleet Partner Management</h1>
          <p className="text-secondary-600">Manage fleet partner registrations and approvals</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-secondary-600">Total: {fleetPartners.length}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {fleetPartners.length}
          </div>
          <div className="text-sm text-secondary-600">Total Applications</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">
            {fleetPartners.filter(p => p.status === 0).length}
          </div>
          <div className="text-sm text-secondary-600">Pending Review</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">
            {fleetPartners.filter(p => p.status === 1).length}
          </div>
          <div className="text-sm text-secondary-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-danger-600">
            {fleetPartners.filter(p => p.status === 2).length}
          </div>
          <div className="text-sm text-secondary-600">Rejected</div>
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
              placeholder="Search fleet partners..."
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

      {/* Fleet Partners Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="table-header">Company</th>
                <th className="table-header">Contact Person</th>
                <th className="table-header">Fleet Details</th>
                <th className="table-header">Location</th>
                <th className="table-header">Status</th>
                <th className="table-header">Applied</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200">
              {filteredPartners.map((partner) => (
                <tr key={partner.driver_id} className="hover:bg-secondary-50">
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{partner.company_name}</p>
                        <p className="text-sm text-secondary-500">{partner.legal_entity_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium text-secondary-900">{partner.driverName}</p>
                      <p className="text-sm text-secondary-500">{partner.email}</p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Car className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm font-medium">{partner.fleet_size || 0}</span>
                        <span className="text-xs text-secondary-500">vehicles</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-secondary-400" />
                        <span className="text-sm font-medium">{partner.years_experience || 0}</span>
                        <span className="text-xs text-secondary-500">years</span>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm font-medium">{partner.cityName}</p>
                  </td>
                  <td className="table-cell">
                    {getStatusBadge(partner.status)}
                  </td>
                  <td className="table-cell text-secondary-500">
                    {new Date(partner.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openPartnerModal(partner)}
                        className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {partner.status === 0 && (
                        <>
                          <button
                            onClick={() => handleApproval(partner.driver_id, 1)}
                            className="p-2 text-success-600 hover:text-success-700 hover:bg-success-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(partner.driver_id, 2)}
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

          {filteredPartners.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-500">No fleet partners found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Partner Details Modal */}
      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Fleet Partner Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Company Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Company Name</label>
                      <p className="text-secondary-900">{selectedPartner.company_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Legal Entity Type</label>
                      <p className="text-secondary-900">{selectedPartner.legal_entity_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Business Address</label>
                      <p className="text-secondary-900">{selectedPartner.business_address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Contact Person</label>
                      <p className="text-secondary-900">{selectedPartner.contact_person_name}</p>
                      <p className="text-sm text-secondary-500">{selectedPartner.contact_person_position}</p>
                    </div>
                  </div>
                </div>

                {/* Fleet Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Fleet Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Fleet Size</label>
                      <p className="text-secondary-900">{selectedPartner.fleet_size} vehicles</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Years of Experience</label>
                      <p className="text-secondary-900">{selectedPartner.years_experience} years</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Operating Hours</label>
                      <p className="text-secondary-900">{selectedPartner.operating_hours}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Status</label>
                      {getStatusBadge(selectedPartner.status)}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Email</label>
                      <p className="text-secondary-900">{selectedPartner.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Phone</label>
                      <p className="text-secondary-900">{selectedPartner.phoneNo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">City</label>
                      <p className="text-secondary-900">{selectedPartner.cityName}</p>
                    </div>
                  </div>
                </div>

                {/* Compliance Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-secondary-900">Compliance</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Insurance Policy</label>
                      <p className="text-secondary-900">{selectedPartner.insurance_policy_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Business License</label>
                      <p className="text-secondary-900">{selectedPartner.business_license_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Technology Agreement</label>
                      <p className="text-secondary-900">{selectedPartner.technology_agreement ? 'Accepted' : 'Not accepted'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Terms Accepted</label>
                      <p className="text-secondary-900">{selectedPartner.terms_accepted ? 'Accepted' : 'Not accepted'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedPartner.status === 0 && (
                <div className="flex space-x-3 pt-6 mt-6 border-t border-secondary-200">
                  <button
                    onClick={() => {
                      handleApproval(selectedPartner.driver_id, 1)
                      setShowModal(false)
                    }}
                    className="btn-success flex-1"
                  >
                    Approve Fleet Partner
                  </button>
                  <button
                    onClick={() => {
                      handleApproval(selectedPartner.driver_id, 2)
                      setShowModal(false)
                    }}
                    className="btn-danger flex-1"
                  >
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FleetPartners