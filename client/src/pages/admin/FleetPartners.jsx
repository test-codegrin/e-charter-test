import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, Filter, Eye, Phone, Mail, MapPin, Calendar, Building2, Globe, CheckCircle, XCircle, Clock } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'


const FleetPartners = () => {
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showModal, setShowModal] = useState(false)


  useEffect(() => {
    fetchFleetPartners()
  }, [])


  useEffect(() => {
    filterCompanies()
  }, [companies, searchTerm, statusFilter])


  const fetchFleetPartners = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getAllFleetPartners()
      console.log('Fleet Partners response:', response.data)
      setCompanies(response.data.companies || [])
    } catch (error) {
      console.error('Error fetching fleet partners:', error)
      toast.error('Failed to fetch fleet partners')
    } finally {
      setLoading(false)
    }
  }


  const filterCompanies = () => {
    let filtered = companies


    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company => {
        const companyName = company.company_name?.toLowerCase() || ''
        const email = company.email?.toLowerCase() || ''
        const city = company.city_name?.toLowerCase() || ''
        
        return companyName.includes(searchTerm.toLowerCase()) ||
               email.includes(searchTerm.toLowerCase()) ||
               city.includes(searchTerm.toLowerCase())
      })
    }


    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter)
    }


    setFilteredCompanies(filtered)
  }


  const handleStatusChange = async (companyId, newStatus) => {
    try {
      await adminAPI.updateFleetPartnerStatus(companyId, newStatus)
      
      const statusText = newStatus === 'approved' ? 'approved' : 
                        newStatus === 'rejected' ? 'rejected' : 'marked as in review'
      
      toast.success(`Fleet partner ${statusText} successfully`)
      fetchFleetPartners()
    } catch (error) {
      console.error('Error updating fleet partner status:', error)
      toast.error('Failed to update fleet partner status')
    }
  }


  // Status badge component
  const getStatusBadge = (status) => {
    // Handle empty status as in_review
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
  const StatusDropdown = ({ currentStatus, companyId, companyName }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef(null)
    const normalizedStatus = currentStatus || 'in_review'


    const statusOptions = [
      { value: 'in_review', label: 'In Review', icon: Clock, color: 'text-yellow-600' },
      { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-green-600' },
      { value: 'rejected', label: 'Reject', icon: XCircle, color: 'text-red-600' },
    ]


    const handleStatusSelect = (status) => {
      if (status !== normalizedStatus) {
        handleStatusChange(companyId, status)
      }
      setIsOpen(false)
    }


    const handleToggle = () => {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.right + window.scrollX - 192 // 192px = w-48 width
        })
      }
      setIsOpen(!isOpen)
    }


    return (
      <>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          {getStatusBadge(normalizedStatus)}
        </button>


        {isOpen && createPortal(
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
              style={{ 
                top: `${position.top}px`, 
                left: `${position.left}px` 
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
                      <span className="text-sm text-gray-700">{option.label}</span>
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


  const openCompanyModal = (company) => {
    setSelectedCompany(company)
    setShowModal(true)
  }


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Fleet Partner Management</h1>
          <p className="text-secondary-600">Manage fleet company registrations and approvals</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-secondary-600">Total: </span>
            <span className="font-semibold text-secondary-900">{companies.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-secondary-600">Approved: </span>
            <span className="font-semibold text-green-600">
              {companies.filter(c => c.status === 'approved').length}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-secondary-600">In Review: </span>
            <span className="font-semibold text-yellow-600">
              {companies.filter(c => !c.status || c.status === 'in_review').length}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-secondary-600">Rejected: </span>
            <span className="font-semibold text-red-600">
              {companies.filter(c => c.status === 'rejected').length}
            </span>
          </div>
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
              placeholder="Search by company name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>


          {/* Status Filter */}
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
          </div>
        </div>
      </div>


      {/* Fleet Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.fleet_company_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {company.profile_image ? (
                        <img 
                          src={company.profile_image} 
                          alt={company.company_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{company.company_name}</p>
                        <p className="text-sm text-gray-500">ID: {company.fleet_company_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{company.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{company.phone_no}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{company.city_name}</p>
                        <p className="text-xs text-gray-500">ZIP: {company.postal_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {company.website ? (
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{company.website}</span>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(company.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusDropdown 
                      currentStatus={company.status}
                      companyId={company.fleet_company_id}
                      companyName={company.company_name}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openCompanyModal(company)}
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


          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No fleet partners found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>


      {/* Company Details Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Fleet Partner Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>


              <div className="space-y-6">
                {/* Company Profile */}
                <div className="flex items-center space-x-4 pb-6 border-b">
                  {selectedCompany.profile_image ? (
                    <img 
                      src={selectedCompany.profile_image} 
                      alt={selectedCompany.company_name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{selectedCompany.company_name}</h4>
                    <div className="mt-2">
                      {getStatusBadge(selectedCompany.status)}
                    </div>
                  </div>
                </div>


                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{selectedCompany.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedCompany.phone_no}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Website
                      </label>
                      {selectedCompany.website ? (
                        <a 
                          href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {selectedCompany.website}
                        </a>
                      ) : (
                        <p className="text-gray-400">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>


                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Location
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900">{selectedCompany.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        City
                      </label>
                      <p className="text-gray-900 capitalize">{selectedCompany.city_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Postal Code
                      </label>
                      <p className="text-gray-900">{selectedCompany.postal_code}</p>
                    </div>
                  </div>
                </div>


                {/* Registration Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Registration Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Registered On
                      </label>
                      <p className="text-gray-900">{formatDate(selectedCompany.created_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">{formatDate(selectedCompany.updated_at)}</p>
                    </div>
                  </div>
                </div>


                {/* Status Change Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Change Status</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleStatusChange(selectedCompany.fleet_company_id, 'approved')
                        setShowModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedCompany.fleet_company_id, 'in_review')
                        setShowModal(false)
                      }}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>In Review</span>
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedCompany.fleet_company_id, 'rejected')
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


export default FleetPartners