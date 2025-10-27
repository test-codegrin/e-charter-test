import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { ArrowLeft, Eye, EyeOff, Search, X, Building2, CheckCircle, Phone } from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'


const AddDriver = () => {
  const navigate = useNavigate()
  
  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_no: '',
    password: '',
    confirmPassword: '',
    gender: '',
    address: '',
    city_name: '',
    zip_code: '',
    driver_type: '',
    fleet_company_id: null,
    year_of_experiance: ''
  })


  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)


  // Fleet company state
  const [fleetCompanies, setFleetCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)
  const [companySearchTerm, setCompanySearchTerm] = useState('')
  const dropdownRef = useRef(null)


  // Fetch fleet companies
  useEffect(() => {
    if (formData.driver_type === 'fleet_partner') {
      fetchFleetCompanies()
    }
  }, [formData.driver_type])


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false)
      }
    }


    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  const fetchFleetCompanies = async () => {
    try {
      const response = await adminAPI.getAllFleetPartners()
      setFleetCompanies(response.data.companies || [])
    } catch (error) {
      console.error('Error fetching fleet companies:', error)
      toast.error('Failed to load fleet companies')
    }
  }


  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }


    // Reset fleet company when driver type changes to individual
    if (name === 'driver_type' && value === 'individual') {
      setFormData(prev => ({
        ...prev,
        fleet_company_id: null
      }))
      setSelectedCompany(null)
    }
  }


  const handleCompanySelect = (company) => {
    setSelectedCompany(company)
    setFormData(prev => ({
      ...prev,
      fleet_company_id: company.fleet_company_id
    }))
    setShowCompanyDropdown(false)
    setCompanySearchTerm('')
    
    if (errors.fleet_company_id) {
      setErrors(prev => ({
        ...prev,
        fleet_company_id: ''
      }))
    }
  }


  const filteredCompanies = fleetCompanies.filter(company =>
    company.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
  )


  const validateForm = () => {
    const newErrors = {}


    // Required fields
    if (!formData.firstname.trim()) newErrors.firstname = 'First name is required'
    if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required'
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid'
    }

    // Phone number validation
    if (!formData.phone_no.trim()) {
      newErrors.phone_no = 'Phone number is required'
    } else if (!/^[0-9]{10}$/.test(formData.phone_no.replace(/[\s-]/g, ''))) {
      newErrors.phone_no = 'Phone number must be 10 digits'
    }


    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }


    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }


    // Gender
    if (!formData.gender) newErrors.gender = 'Gender is required'


    // Address
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    
    // City
    if (!formData.city_name.trim()) newErrors.city_name = 'City is required'
    
    // ZIP code
    if (!formData.zip_code) {
      newErrors.zip_code = 'ZIP code is required'
    } else if (!/^\d{5,6}$/.test(formData.zip_code)) {
      newErrors.zip_code = 'ZIP code must be 5-6 digits'
    }


    // Driver type
    if (!formData.driver_type) newErrors.driver_type = 'Driver type is required'


    // Fleet company (if fleet_partner)
    if (formData.driver_type === 'fleet_partner' && !formData.fleet_company_id) {
      newErrors.fleet_company_id = 'Fleet company is required'
    }


    // Year of experience
    if (!formData.year_of_experiance) {
      newErrors.year_of_experiance = 'Years of experience is required'
    } else if (formData.year_of_experiance < 0 || formData.year_of_experiance > 50) {
      newErrors.year_of_experiance = 'Years must be between 0 and 50'
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      setShowConfirmModal(true)
    }
  }


  const handleConfirmAdd = async () => {
    try {
      setLoading(true)
      
      // Prepare data for API
      const driverData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone_no: formData.phone_no,
        password: formData.password,
        gender: formData.gender,
        address: formData.address,
        city_name: formData.city_name,
        zip_code: parseInt(formData.zip_code),
        driver_type: formData.driver_type,
        year_of_experiance: parseInt(formData.year_of_experiance)
      }


      // Add fleet_company_id only if driver is fleet_partner
      if (formData.driver_type === 'fleet_partner') {
        driverData.fleet_company_id = formData.fleet_company_id
      }


      await adminAPI.addDriver(driverData)
      
      toast.success('Driver added successfully!')
      setShowConfirmModal(false)
      navigate('/admin/drivers')
    } catch (error) {
      console.error('Error adding driver:', error)
      toast.error(error.response?.data?.message || 'Failed to add driver')
      setShowConfirmModal(false)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/drivers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Add New Driver</h1>
            <p className="text-secondary-600">Create a new driver account</p>
          </div>
        </div>
      </div>


      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
           {/* Personal Information */}
<div>
  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
    Personal Information
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* First Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        First Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="firstname"
        value={formData.firstname}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          errors.firstname ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Enter first name"
      />
      {errors.firstname && (
        <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
      )}
    </div>

    {/* Last Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Last Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="lastname"
        value={formData.lastname}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          errors.lastname ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="Enter last name"
      />
      {errors.lastname && (
        <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
      )}
    </div>
  </div>

  {/* Email, Phone, Gender in one row */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Email <span className="text-red-500">*</span>
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          errors.email ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="driver@example.com"
      />
      {errors.email && (
        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
      )}
    </div>

    {/* Phone Number */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Phone Number <span className="text-red-500">*</span>
      </label>
      <input
        type="tel"
        name="phone_no"
        value={formData.phone_no}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          errors.phone_no ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder="9876543210"
        maxLength="10"
      />
      {errors.phone_no && (
        <p className="text-red-500 text-xs mt-1">{errors.phone_no}</p>
      )}
    </div>

    {/* Gender */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Gender <span className="text-red-500">*</span>
      </label>
      <select
        name="gender"
        value={formData.gender}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          errors.gender ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      {errors.gender && (
        <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
      )}
    </div>
  </div>
</div>



            {/* Account Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Account Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>


                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>


            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Address Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city_name"
                      value={formData.city_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.city_name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter city"
                    />
                    {errors.city_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.city_name}</p>
                    )}
                  </div>


                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.zip_code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter ZIP code"
                    />
                    {errors.zip_code && (
                      <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Driver Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Driver Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="driver_type"
                    value={formData.driver_type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.driver_type ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select driver type</option>
                    <option value="individual">Individual</option>
                    <option value="fleet_partner">Fleet Partner</option>
                  </select>
                  {errors.driver_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.driver_type}</p>
                  )}
                </div>


                {/* Fleet Company (Conditional) */}
                {formData.driver_type === 'fleet_partner' && (
                  <div ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fleet Company <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-left flex items-center justify-between ${
                          errors.fleet_company_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {selectedCompany ? (
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-blue-500" />
                            <span>{selectedCompany.company_name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Select fleet company</span>
                        )}
                        <Search className="w-4 h-4 text-gray-400" />
                      </button>


                      {showCompanyDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                          {/* Search Input */}
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                value={companySearchTerm}
                                onChange={(e) => setCompanySearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Search company..."
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>


                          {/* Company List */}
                          <div className="max-h-48 overflow-y-auto">
                            {filteredCompanies.length > 0 ? (
                              filteredCompanies.map((company) => (
                                <button
                                  key={company.fleet_company_id}
                                  type="button"
                                  onClick={() => handleCompanySelect(company)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                >
                                  <Building2 className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm text-gray-900">{company.company_name}</span>
                                  {selectedCompany?.fleet_company_id === company.fleet_company_id && (
                                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No companies found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.fleet_company_id && (
                      <p className="text-red-500 text-xs mt-1">{errors.fleet_company_id}</p>
                    )}
                  </div>
                )}


                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="year_of_experiance"
                    value={formData.year_of_experiance}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.year_of_experiance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter years of experience"
                  />
                  {errors.year_of_experiance && (
                    <p className="text-red-500 text-xs mt-1">{errors.year_of_experiance}</p>
                  )}
                </div>
              </div>
            </div>


            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/admin/drivers')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Add Driver
              </button>
            </div>
          </div>
        </form>
      </div>


     {/* Confirmation Modal */}
{showConfirmModal && createPortal(
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mx-auto mb-4">
          <CheckCircle className="w-6 h-6 text-primary-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Confirm Add Driver
        </h3>
        
        <p className="text-gray-600 text-center mb-6">
          Please review the driver information before confirming
        </p>


        {/* Driver Details */}
        <div className="space-y-4">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                1
              </div>
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">First Name:</span>
                <p className="font-medium text-gray-900 mt-0.5">{formData.firstname}</p>
              </div>
              <div>
                <span className="text-gray-600">Last Name:</span>
                <p className="font-medium text-gray-900 mt-0.5">{formData.lastname}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium text-gray-900 mt-0.5">{formData.email}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone Number:</span>
                <p className="font-medium text-gray-900 mt-0.5">{formData.phone_no}</p>
              </div>
              <div>
                <span className="text-gray-600">Gender:</span>
                <p className="font-medium text-gray-900 mt-0.5 capitalize">{formData.gender}</p>
              </div>
            </div>
          </div>


          {/* Address Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                2
              </div>
              Address Information
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Street Address:</span>
                <p className="font-medium text-gray-900 mt-0.5">{formData.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-600">City:</span>
                  <p className="font-medium text-gray-900 mt-0.5">{formData.city_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">ZIP Code:</span>
                  <p className="font-medium text-gray-900 mt-0.5">{formData.zip_code}</p>
                </div>
              </div>
            </div>
          </div>


          {/* Driver Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                3
              </div>
              Driver Details
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Driver Type:</span>
                <p className="font-medium text-gray-900 mt-0.5 capitalize">
                  {formData.driver_type === 'fleet_partner' ? 'Fleet Partner' : 'Individual'}
                </p>
              </div>
              {formData.driver_type === 'fleet_partner' && selectedCompany && (
                <div>
                  <span className="text-gray-600">Fleet Company:</span>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <p className="font-medium text-gray-900">{selectedCompany.company_name}</p>
                  </div>
                </div>
              )}
              <div>
                <span className="text-gray-600">Years of Experience:</span>
                <p className="font-medium text-gray-900 mt-0.5">
                  {formData.year_of_experiance} {formData.year_of_experiance === '1' ? 'year' : 'years'}
                </p>
              </div>
            </div>
          </div>


          {/* Account Security */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs mr-2">
                4
              </div>
              Account Security
            </h4>
            <div className="text-sm">
              <div>
                <span className="text-gray-600">Password:</span>
                <p className="font-medium text-gray-900 mt-0.5">
                  {'•'.repeat(formData.password.length)} (Hidden)
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={() => setShowConfirmModal(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAdd}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              'Confirm & Add Driver'
            )}
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
)}


    </div>
  )
}


export default AddDriver
