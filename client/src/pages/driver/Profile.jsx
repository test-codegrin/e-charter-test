import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Edit, Save, X, FileText, AlertTriangle, Upload, CheckCircle, Calendar, Briefcase, Camera, Building2, FileImage, File, ChevronRight, Shield, Info, Star } from 'lucide-react'
import { driverAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Loader from '../../components/Loader'
import { dispatchStorageEvent } from '../../utils/storageEvent'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  
  const [showDocModal, setShowDocModal] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [selectedDocType, setSelectedDocType] = useState(null)
  const [docFormData, setDocFormData] = useState({
    document_file: null,
    document_number: '',
    document_expiry_date: ''
  })

  const requiredDocuments = [
    { type: 'driving_license', label: 'Driving License', icon: FileText, color: 'blue' },
    { type: 'medical_certificate', label: 'Medical Certificate', icon: FileText, color: 'green' },
    { type: 'insurance', label: 'Insurance', icon: FileText, color: 'purple' }
  ]

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await driverAPI.getProfile()
      const profileData = response.data.profile || {}
      setProfile(profileData)
      setFormData({
        firstname: profileData.firstname,
        lastname: profileData.lastname,
        phone_no: profileData.phone_no,
        address: profileData.address,
        city_name: profileData.city_name,
        zip_code: profileData.zip_code,
        year_of_experiance: profileData.year_of_experiance,
        gender: profileData.gender
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

// Helper function to update localStorage
  const updateLocalStorage = (updatedData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const updatedUser = {
        ...userData,
        ...updatedData
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Trigger custom event to update header
      dispatchStorageEvent();
    } catch (error) {
      console.error('Error updating localStorage:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await driverAPI.updateProfile(formData)
      
      // Update profile state with returned data
      if (response.data.updatedData) {
        const updatedData = response.data.updatedData
        
        setProfile(prevProfile => ({
          ...prevProfile,
          ...updatedData
        }))

        // Update localStorage with new profile data
        updateLocalStorage({
          firstname: updatedData.firstname,
          lastname: updatedData.lastname,
          driverName: updatedData.driverName,
          name: updatedData.driverName,
          phone_no: updatedData.phone_no,
          status: updatedData.status
        })
      }
      
      toast.success('Profile updated successfully! Your account is now under review.')
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB')
      return
    }

    try {
      setUploadingProfile(true)
      const uploadFormData = new FormData()
      uploadFormData.append('profile_image', file)
      
      const response = await driverAPI.updateProfilePhoto(uploadFormData)
      
      // Update profile state with new image
      if (response.data.updatedData) {
        const newProfileImage = response.data.updatedData.profile_image
        
        setProfile(prevProfile => ({
          ...prevProfile,
          profile_image: newProfileImage
        }))

        // Update localStorage with new profile image
        updateLocalStorage({
          profile_image: newProfileImage
        })
      }
      
      toast.success('Profile photo updated successfully!')
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      toast.error('Failed to upload profile photo')
    } finally {
      setUploadingProfile(false)
    }
  }


  const openDocumentModal = (docType) => {
    setSelectedDocType(docType)
    setModalStep(1)
    setDocFormData({
      document_file: null,
      document_number: '',
      document_expiry_date: ''
    })
    setShowDocModal(true)
  }

  const handleNextStep = () => {
    if (!docFormData.document_file) {
      toast.error('Please select a file')
      return
    }
    if (!docFormData.document_number) {
      toast.error('Please enter document number')
      return
    }
    if (!docFormData.document_expiry_date) {
      toast.error('Please select expiry date')
      return
    }
    setModalStep(2)
  }

  const handleDocumentUpload = async () => {
    try {
      setUploading(true)
      const uploadFormData = new FormData()
      uploadFormData.append('document', docFormData.document_file)
      uploadFormData.append('document_type', selectedDocType)
      uploadFormData.append('document_number', docFormData.document_number)
      uploadFormData.append('document_expiry_date', docFormData.document_expiry_date)

      await driverAPI.uploadDocument(uploadFormData)
      toast.success('Document uploaded successfully! Your account is now under review.')
      
      setShowDocModal(false)
      setModalStep(1)
      await fetchProfile()
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setDocFormData({ ...docFormData, document_file: file })
  }

  const getFileIcon = (file) => {
    if (!file) return Upload
    const fileType = file.type
    if (fileType.includes('pdf')) return File
    if (fileType.includes('image')) return FileImage
    return FileText
  }

  const getFileTypeLabel = (file) => {
    if (!file) return ''
    const fileType = file.type
    if (fileType.includes('pdf')) return 'PDF Document'
    if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG Image'
    if (fileType.includes('png')) return 'PNG Image'
    return 'File'
  }

  const getDocumentByType = (type) => {
    return profile?.documents?.find(doc => doc.document_type === type)
  }

  const allDocumentsUploaded = () => {
    return requiredDocuments.every(reqDoc => getDocumentByType(reqDoc.type))
  }

  const isDocumentExpired = (expiryDate) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isDocumentExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  }

  if (loading) {
    return (
      <Loader />
    )
  }

  if (!profile) {
    return <div className="text-center py-12">Error loading profile</div>
  }

  const FileIcon = getFileIcon(docFormData.document_file)
  const selectedDocInfo = requiredDocuments.find(d => d.type === selectedDocType)

  return (
    <div className="space-y-6">
      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden">
            <div className={`bg-gradient-to-r from-${selectedDocInfo?.color}-500 to-${selectedDocInfo?.color}-600 p-6 pb-0 text-black`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Upload {selectedDocInfo?.label}</h3>
                    <p className="text-sm text-black text-opacity-90">Step {modalStep} of 2</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDocModal(false)
                    setModalStep(1)
                  }}
                  className="text-black hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mt-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${(modalStep / 2) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-6">
              {modalStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-3">
                      Document File *
                    </label>
                    <label className={`flex flex-col items-center justify-center w-full h-40 px-4 transition-all border-2 border-dashed rounded-xl appearance-none cursor-pointer ${
                      docFormData.document_file 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-secondary-300 bg-secondary-50 hover:border-primary-400 hover:bg-primary-50'
                    }`}>
                      <div className="flex flex-col items-center space-y-3">
                        {docFormData.document_file ? (
                          <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                              <FileIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-green-700">{docFormData.document_file.name}</p>
                              <p className="text-xs text-green-600 mt-1">{getFileTypeLabel(docFormData.document_file)} • {(docFormData.document_file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setDocFormData({ ...docFormData, document_file: null })
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove file
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                              <Upload className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-secondary-700">Click to upload or drag and drop</p>
                              <p className="text-xs text-secondary-500 mt-1">JPG, PNG or PDF (max. 5MB)</p>
                            </div>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Document Number *
                    </label>
                    <input
                      type="text"
                      value={docFormData.document_number}
                      onChange={(e) => setDocFormData({ ...docFormData, document_number: e.target.value.toUpperCase() })}
                      className="input-field font-mono text-lg"
                      placeholder="Enter document number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 mb-2">
                      Expiry Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="date"
                        value={docFormData.document_expiry_date}
                        onChange={(e) => setDocFormData({ ...docFormData, document_expiry_date: e.target.value })}
                        className="input-field pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Document Guidelines:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                          <li>Ensure document is clear and readable</li>
                          <li>All text and numbers should be visible</li>
                          <li>Document must be valid and not expired</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={() => {
                        setShowDocModal(false)
                        setModalStep(1)
                      }}
                      className="flex-1 px-4 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold flex items-center justify-center space-x-2"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-10 h-10 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-secondary-900 mb-2">Verify Your Information</h4>
                    <p className="text-sm text-secondary-600">Please review your document details before submitting</p>
                  </div>

                  <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-secondary-200">
                      <span className="text-sm font-medium text-secondary-600">Document Type</span>
                      <span className="text-sm font-bold text-secondary-900">{selectedDocInfo?.label}</span>
                    </div>

                    <div className="flex items-start justify-between pb-3 border-b border-secondary-200">
                      <span className="text-sm font-medium text-secondary-600">File</span>
                      <div className="flex items-center space-x-2">
                        <FileIcon className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm font-medium text-secondary-900 max-w-[200px] truncate">{docFormData.document_file?.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-secondary-200">
                      <span className="text-sm font-medium text-secondary-600">Document Number</span>
                      <span className="text-sm font-bold text-secondary-900 font-mono">{docFormData.document_number}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-600">Expiry Date</span>
                      <span className="text-sm font-bold text-secondary-900">{new Date(docFormData.document_expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Important Notice:</p>
                        <p className="text-yellow-700">
                          Your profile will be under review after document submission. You'll be notified once verification is complete.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setModalStep(1)}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all font-semibold disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleDocumentUpload}
                      disabled={uploading}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Confirm & Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Driver Profile</h1>
          <p className="text-secondary-600 mt-1">Manage your personal information and documents</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Status Warnings */}
      {profile.status === 'in_review' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-5 rounded-xl shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-yellow-900">Profile Under Review</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Your profile changes are being reviewed by our admin team. You'll be notified once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {!allDocumentsUploaded() && profile.status !== 'in_review' && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-5 rounded-xl shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Complete Your Documents</h3>
              <p className="text-sm text-red-800 mt-1">
                You cannot accept trips until all required documents are uploaded and verified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary-100">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="relative group">
                {profile.profile_image ? (
                  <img 
                    src={profile.profile_image} 
                    alt={profile.driverName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 shadow-xl ring-4 ring-primary-50"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center border-4 border-primary-200 shadow-xl">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 rounded-full cursor-pointer transition-all">
                  <div className="hidden group-hover:flex flex-col items-center text-white">
                    {uploadingProfile ? (
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-xs font-semibold">Click to Change</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleProfilePhotoUpload}
                    disabled={uploadingProfile}
                  />
                </label>
              </div>
              
              <label 
                className={`absolute -bottom-2 -right-2 w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-3 border-white transition-all ${
                  uploadingProfile 
                    ? 'bg-gray-400' 
                    : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:scale-110'
                }`}
              >
                {uploadingProfile ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleProfilePhotoUpload}
                  disabled={uploadingProfile}
                />
              </label>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-secondary-900">{profile.driverName}</h2>
              <p className="text-secondary-600 capitalize flex items-center mt-2">
                <Briefcase className="w-4 h-4 mr-2" />
                {profile.driver_type?.replace('_', ' ')} • {profile.year_of_experiance} years experience
              </p>
              <div className="flex items-center space-x-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  profile.status === 'approved' 
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : profile.status === 'in_review'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {profile.status === 'in_review' ? 'Under Review' : profile.status}
                </span>
                <span className="text-sm text-secondary-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          
          {editing && (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData({
                    firstname: profile.firstname,
                    lastname: profile.lastname,
                    phone_no: profile.phone_no,
                    address: profile.address,
                    city_name: profile.city_name,
                    zip_code: profile.zip_code,
                    year_of_experiance: profile.year_of_experiance,
                    gender: profile.gender
                  })
                }}
                disabled={saving}
                className="px-6 py-3 bg-secondary-100 text-secondary-700 rounded-xl hover:bg-secondary-200 transition-all font-semibold flex items-center space-x-2 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-secondary-900 border-b-2 border-primary-100 pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">First Name *</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.firstname || ''}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className="input-field"
                    placeholder="First name"
                  />
                ) : (
                  <p className="text-secondary-900 font-medium">{profile.firstname}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Last Name *</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.lastname || ''}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="input-field"
                    placeholder="Last name"
                  />
                ) : (
                  <p className="text-secondary-900 font-medium">{profile.lastname}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Email Address</label>
              <div className="flex items-center space-x-2 p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                <Mail className="w-5 h-5 text-secondary-400" />
                <p className="text-secondary-900">{profile.email}</p>
              </div>
              <p className="text-xs text-secondary-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Phone Number *</label>
              {editing ? (
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-secondary-400" />
                  <input
                    type="tel"
                    value={formData.phone_no || ''}
                    onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                    className="input-field flex-1"
                    placeholder="Phone number"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                  <Phone className="w-5 h-5 text-secondary-400" />
                  <p className="text-secondary-900">{profile.phone_no}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Gender</label>
                {editing ? (
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-secondary-900 capitalize font-medium">{profile.gender}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Experience *</label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.year_of_experiance || ''}
                    onChange={(e) => setFormData({ ...formData, year_of_experiance: e.target.value })}
                    className="input-field"
                    min="0"
                    placeholder="Years"
                  />
                ) : (
                  <p className="text-secondary-900 font-medium">{profile.year_of_experiance} years</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-secondary-900 border-b-2 border-primary-100 pb-2">Address Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Street Address *</label>
              {editing ? (
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Enter full address"
                />
              ) : (
                <div className="flex items-start space-x-2 p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                  <MapPin className="w-5 h-5 text-secondary-400 mt-0.5 flex-shrink-0" />
                  <p className="text-secondary-900">{profile.address}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">City *</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.city_name || ''}
                    onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
                    className="input-field"
                    placeholder="City"
                  />
                ) : (
                  <p className="text-secondary-900 capitalize font-medium">{profile.city_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">ZIP Code *</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.zip_code || ''}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="input-field"
                    placeholder="ZIP"
                  />
                ) : (
                  <p className="text-secondary-900 font-medium">{profile.zip_code}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Company */}
      {profile.driver_type === 'fleet_partner' && profile.fleet_company_details && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-white rounded-lg shadow-md p-2 flex items-center justify-center flex-shrink-0">
              {profile.fleet_company_details.profile_image ? (
                <img 
                  src={profile.fleet_company_details.profile_image} 
                  alt={profile.fleet_company_details.company_name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-secondary-900 mb-1">
                {profile.fleet_company_details.company_name}
              </h3>
              <p className="text-sm text-secondary-600 mb-3">Your Fleet Company</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-600 font-medium">Contact</p>
                  <p className="text-secondary-900 font-semibold">{profile.fleet_company_details.phone_no}</p>
                </div>
                <div>
                  <p className="text-secondary-600 font-medium">Location</p>
                  <p className="text-secondary-900 font-semibold capitalize">{profile.fleet_company_details.city_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 border-2 border-yellow-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-900">{profile.ratings?.average_rating}</div>
              <div className="text-sm text-yellow-700 font-medium">Average Rating</div>
              <div className="text-xs text-yellow-600 mt-1">{profile.ratings?.total_ratings} total ratings</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-md">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-green-900">{profile.ratings?.positive_ratings}</div>
              <div className="text-sm text-green-700 font-medium">Positive Reviews</div>
              <div className="text-xs text-green-600 mt-1">4+ star ratings</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold text-white">
                {profile.ratings?.total_ratings > 0 
                  ? Math.round((profile.ratings?.positive_ratings / profile.ratings?.total_ratings) * 100)
                  : 0}%
              </span>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900">
                {profile.ratings?.total_ratings > 0 
                  ? Math.round((profile.ratings?.positive_ratings / profile.ratings?.total_ratings) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-blue-700 font-medium">Satisfaction Rate</div>
              <div className="text-xs text-blue-600 mt-1">Customer satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-secondary-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-secondary-900">Required Documents</h3>
            <p className="text-sm text-secondary-600 mt-1">Upload and manage your verification documents</p>
          </div>
          {allDocumentsUploaded() && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-green-800">All documents uploaded</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {requiredDocuments.map((reqDoc) => {
            const uploadedDoc = getDocumentByType(reqDoc.type)
            const isExpired = uploadedDoc && isDocumentExpired(uploadedDoc.document_expiry_date)
            const isExpiringSoon = uploadedDoc && isDocumentExpiringSoon(uploadedDoc.document_expiry_date)
            const Icon = reqDoc.icon

            return (
              <div 
                key={reqDoc.type}
                className={`p-6 border-2 rounded-xl transition-all shadow-sm hover:shadow-lg ${
                  uploadedDoc && !isExpired
                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100'
                    : isExpired
                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100'
                    : 'border-secondary-200 bg-gradient-to-br from-secondary-50 to-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${
                      uploadedDoc && !isExpired 
                        ? 'bg-green-200' 
                        : isExpired 
                        ? 'bg-red-200' 
                        : 'bg-secondary-200'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        uploadedDoc && !isExpired ? 'text-green-700' : isExpired ? 'text-red-700' : 'text-secondary-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-secondary-900">{reqDoc.label}</h4>
                      <p className="text-xs text-secondary-600 font-medium">Required</p>
                    </div>
                  </div>
                  {uploadedDoc && !isExpired && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {isExpired && (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                {uploadedDoc ? (
                  <div className="space-y-3">
                    <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-2 shadow-sm">
                      <div>
                        <p className="text-xs text-secondary-600 font-medium">Document Number</p>
                        <p className="font-bold text-secondary-900">{uploadedDoc.document_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-600 font-medium">Expiry Date</p>
                        <p className={`font-bold flex items-center ${
                          isExpired ? 'text-red-700' : isExpiringSoon ? 'text-yellow-700' : 'text-secondary-900'
                        }`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(uploadedDoc.document_expiry_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {uploadedDoc.document_url && (
                        <a
                          href={uploadedDoc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() => openDocumentModal(reqDoc.type)}
                        className="flex-1 px-3 py-2 bg-secondary-600 text-white text-sm rounded-lg hover:bg-secondary-700 transition-colors font-semibold shadow-sm"
                      >
                        Re-upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => openDocumentModal(reqDoc.type)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Document</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Document Upload Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Accepted formats: JPG, PNG, PDF (Max 5MB)</li>
                <li>Documents must be clear and readable</li>
                <li>Ensure expiry dates are visible and valid</li>
                <li>Profile will be reviewed after document upload</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
