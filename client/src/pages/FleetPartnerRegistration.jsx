import React, { useState } from 'react'
import { Car, Building, Users, Shield, FileText, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const FleetPartnerRegistration = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Company Information
    company_name: '',
    legal_entity_type: '',
    business_address: '',
    contact_person_name: '',
    contact_person_position: '',
    
    // Contact Information
    driverName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNo: '',
    address: '',
    cityName: '',
    zipCord: '',
    
    // Fleet Details
    fleet_size: '',
    
    // Operational Information
    service_areas: [{ city: '', province: '', radius: 50, is_primary: true }],
    operating_hours: '',
    safety_protocols: '',
    
    // Insurance and Compliance
    insurance_policy_number: '',
    business_license_number: '',
    
    // Experience and Reputation
    years_experience: '',
    certifications: [{ name: '', authority: '', number: '', issue_date: '', expiry_date: '' }],
    references: [{ name: '', contact: '', email: '', phone: '', period: '', description: '' }],
    
    // Additional Information
    additional_services: [],
    sustainability_practices: '',
    special_offers: '',
    
    // Technology and Communication
    communication_channels: [],
    terms_accepted: false,
    technology_agreement: false
  })

  const steps = [
    { id: 1, title: 'Company Info', icon: Building },
    { id: 2, title: 'Fleet Details', icon: Car },
    { id: 3, title: 'Operations', icon: Users },
    { id: 4, title: 'Compliance', icon: Shield },
    { id: 5, title: 'Additional', icon: FileText },
    { id: 6, title: 'Review', icon: CheckCircle }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }))
  }

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.company_name && formData.legal_entity_type && 
               formData.business_address && formData.contact_person_name &&
               formData.driverName && formData.email && formData.password &&
               formData.phoneNo && formData.password === formData.confirmPassword
      case 2:
        return formData.fleet_size && formData.service_areas[0].city
      case 3:
        return formData.operating_hours && formData.safety_protocols
      case 4:
        return formData.insurance_policy_number && formData.business_license_number
      case 5:
        return formData.years_experience
      case 6:
        return formData.terms_accepted && formData.technology_agreement
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6))
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(6)) {
      toast.error('Please accept all terms and agreements')
      return
    }

    try {
      const response = await fetch('/api/fleet/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Fleet partner registration submitted successfully!')
        navigate('/registration-success', { 
          state: { 
            type: 'fleet_partner',
            company: formData.company_name,
            message: 'Your fleet partner application is under review. We will contact you within 2-3 business days.'
          }
        })
      } else {
        toast.error(data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed. Please try again.')
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-secondary-900">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Your Company Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Legal Entity Type *
                </label>
                <select
                  name="legal_entity_type"
                  value={formData.legal_entity_type}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Entity Type</option>
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="llc">LLC</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Business Address *
                </label>
                <textarea
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                  placeholder="Complete business address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person Name *
                </label>
                <input
                  type="text"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Primary contact person"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person Position *
                </label>
                <input
                  type="text"
                  name="contact_person_position"
                  value={formData.contact_person_position}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Fleet Manager, CEO"
                  required
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Account holder name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="company@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Create password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Confirm password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-secondary-900">Fleet Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Number of Vehicles in Fleet *
                </label>
                <input
                  type="number"
                  name="fleet_size"
                  value={formData.fleet_size}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 15"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Service Areas</h4>
              {formData.service_areas.map((area, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={area.city}
                        onChange={(e) => handleArrayChange('service_areas', index, 'city', e.target.value)}
                        className="input-field"
                        placeholder="City name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Province *
                      </label>
                      <select
                        value={area.province}
                        onChange={(e) => handleArrayChange('service_areas', index, 'province', e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Select Province</option>
                        <option value="Ontario">Ontario</option>
                        <option value="Quebec">Quebec</option>
                        <option value="British Columbia">British Columbia</option>
                        <option value="Alberta">Alberta</option>
                        <option value="Manitoba">Manitoba</option>
                        <option value="Saskatchewan">Saskatchewan</option>
                        <option value="Nova Scotia">Nova Scotia</option>
                        <option value="New Brunswick">New Brunswick</option>
                        <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                        <option value="Prince Edward Island">Prince Edward Island</option>
                        <option value="Northwest Territories">Northwest Territories</option>
                        <option value="Nunavut">Nunavut</option>
                        <option value="Yukon">Yukon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Coverage Radius (km)
                      </label>
                      <input
                        type="number"
                        value={area.radius}
                        onChange={(e) => handleArrayChange('service_areas', index, 'radius', parseInt(e.target.value))}
                        className="input-field"
                        placeholder="50"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={area.is_primary}
                        onChange={(e) => handleArrayChange('service_areas', index, 'is_primary', e.target.checked)}
                        className="mr-2"
                      />
                      Primary service area
                    </label>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('service_areas', index)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('service_areas', { city: '', province: '', radius: 50, is_primary: false })}
                className="btn-secondary"
              >
                Add Service Area
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-secondary-900">Operational Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Operating Hours *
              </label>
              <input
                type="text"
                name="operating_hours"
                value={formData.operating_hours}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 24/7, Mon-Fri 6AM-10PM"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Safety and Maintenance Protocols *
              </label>
              <textarea
                name="safety_protocols"
                value={formData.safety_protocols}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Describe your safety protocols, maintenance schedules, driver training programs, etc."
                required
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-secondary-900">Insurance and Compliance</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Insurance Policy Number *
                </label>
                <input
                  type="text"
                  name="insurance_policy_number"
                  value={formData.insurance_policy_number}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Policy number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Business License Number *
                </label>
                <input
                  type="text"
                  name="business_license_number"
                  value={formData.business_license_number}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="License number"
                  required
                />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Certifications</h4>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Certification Name
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)}
                        className="input-field"
                        placeholder="e.g., DOT Safety Certification"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Issuing Authority
                      </label>
                      <input
                        type="text"
                        value={cert.authority}
                        onChange={(e) => handleArrayChange('certifications', index, 'authority', e.target.value)}
                        className="input-field"
                        placeholder="e.g., Transport Canada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Certificate Number
                      </label>
                      <input
                        type="text"
                        value={cert.number}
                        onChange={(e) => handleArrayChange('certifications', index, 'number', e.target.value)}
                        className="input-field"
                        placeholder="Certificate number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={cert.expiry_date}
                        onChange={(e) => handleArrayChange('certifications', index, 'expiry_date', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                  {index > 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('certifications', index)}
                        className="text-danger-600 hover:text-danger-700"
                      >
                        Remove Certification
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('certifications', { name: '', authority: '', number: '', issue_date: '', expiry_date: '' })}
                className="btn-secondary"
              >
                Add Certification
              </button>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-secondary-900">Experience and Additional Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Years of Experience in Charter Transportation *
              </label>
              <input
                type="number"
                name="years_experience"
                value={formData.years_experience}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 10"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Additional Services Offered
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Tour Planning', 'Event Transportation', 'Airport Transfers',
                  'Corporate Events', 'Wedding Transportation', 'School Trips',
                  'Sports Teams', 'Conference Shuttles', 'Multi-day Tours'
                ].map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.additional_services.includes(service)}
                      onChange={() => handleMultiSelect('additional_services', service)}
                      className="mr-2"
                    />
                    {service}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Sustainability Initiatives
              </label>
              <textarea
                name="sustainability_practices"
                value={formData.sustainability_practices}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Describe any eco-friendly practices, fuel-efficient vehicles, carbon offset programs, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Special Offers or Promotions
              </label>
              <textarea
                name="special_offers"
                value={formData.special_offers}
                onChange={handleChange}
                rows={3}
                className="input-field"
                placeholder="Any special discounts, loyalty programs, or promotional offers for eCharter users"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Communication Channels Available
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Phone', 'Email', 'SMS', 'WhatsApp', 'Live Chat', '24/7 Support'].map(channel => (
                  <label key={channel} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.communication_channels.includes(channel)}
                      onChange={() => handleMultiSelect('communication_channels', channel)}
                      className="mr-2"
                    />
                    {channel}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-secondary-900">Review and Terms</h3>
            
            <div className="bg-secondary-50 rounded-lg p-6">
              <h4 className="text-lg font-medium text-secondary-900 mb-4">Registration Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Company:</strong> {formData.company_name}
                </div>
                <div>
                  <strong>Entity Type:</strong> {formData.legal_entity_type}
                </div>
                <div>
                  <strong>Contact Person:</strong> {formData.contact_person_name}
                </div>
                <div>
                  <strong>Fleet Size:</strong> {formData.fleet_size} vehicles
                </div>
                <div>
                  <strong>Experience:</strong> {formData.years_experience} years
                </div>
                <div>
                  <strong>Service Areas:</strong> {formData.service_areas.length} locations
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="technology_agreement"
                    checked={formData.technology_agreement}
                    onChange={handleChange}
                    className="mr-3 mt-1"
                    required
                  />
                  <div className="text-sm">
                    <strong>Technology Platform Agreement:</strong> I confirm that our company has the willingness and capability to use the eCharter platform for bookings and scheduling. We have access to necessary technology (smartphones, internet connection) and can integrate with your system for real-time updates and communication.
                  </div>
                </label>
              </div>

              <div className="border rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    className="mr-3 mt-1"
                    required
                  />
                  <div className="text-sm">
                    <strong>Terms and Conditions:</strong> I agree to eCharter's platform terms of service and partnership agreement. I understand the fee structure and payment terms for using the platform. I commit to providing excellent customer service and support to clients using the eCharter platform.
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
              <p className="text-sm text-warning-800">
                <strong>Next Steps:</strong> After submitting your application, our team will review your information and contact you within 2-3 business days. You may be required to upload additional documents such as insurance certificates, business licenses, and vehicle permits.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">Fleet Partner Registration</h1>
          <p className="text-secondary-600 mt-2">Join eCharter as a fleet partner and grow your business</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-success-500 border-success-500 text-white'
                      : isActive 
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-secondary-300 text-secondary-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-secondary-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-success-500' : 'bg-secondary-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-secondary-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!formData.terms_accepted || !formData.technology_agreement}
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default FleetPartnerRegistration