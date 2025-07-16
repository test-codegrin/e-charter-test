import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react'
import { driverAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const [profile, setProfile] = useState({
    driverName: '',
    email: '',
    phoneNo: '',
    address: '',
    cityName: '',
    zipCode: ''
  })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await driverAPI.getProfile()
      const profileData = response.data.profile || {}
      setProfile(profileData)
      setFormData(profileData)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await driverAPI.updateProfile(formData)
      setProfile(formData)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setEditing(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
          <h1 className="text-2xl font-bold text-secondary-900">Driver Profile</h1>
          <p className="text-secondary-600">Manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-success flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="btn-secondary flex items-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              {editing ? (
                <input
                  type="text"
                  name="driverName"
                  value={formData.driverName || ''}
                  onChange={handleChange}
                  className="input-field text-2xl font-bold"
                  placeholder="Driver Name"
                />
              ) : (
                profile.driverName || 'Driver Name'
              )}
            </h2>
            <p className="text-secondary-600">Professional Driver</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="status-badge status-approved">Verified</span>
              <span className="text-sm text-secondary-500">Member since 2024</span>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email Address
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Email address"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile.email || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-secondary-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phoneNo"
                      value={formData.phoneNo || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Phone number"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile.phoneNo || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Address Information</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-secondary-400 mt-1" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Street Address
                  </label>
                  {editing ? (
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      rows={2}
                      className="input-field"
                      placeholder="Street address"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile.address || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    City
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="cityName"
                      value={formData.cityName || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="City"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile.cityName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Postal Code
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode || ''}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Postal code"
                    />
                  ) : (
                    <p className="text-secondary-900">{profile.zipCode || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">4.8</div>
          <div className="text-sm text-secondary-600">Average Rating</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">156</div>
          <div className="text-sm text-secondary-600">Completed Trips</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">2,340</div>
          <div className="text-sm text-secondary-600">Miles Driven</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">98%</div>
          <div className="text-sm text-secondary-600">On-Time Rate</div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Account Settings</h3>
        <div className="space-y-4">
          <button className="w-full text-left p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="font-medium text-secondary-900">Change Password</div>
            <div className="text-sm text-secondary-600">Update your account password</div>
          </button>
          <button className="w-full text-left p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="font-medium text-secondary-900">Notification Preferences</div>
            <div className="text-sm text-secondary-600">Manage email and SMS notifications</div>
          </button>
          <button className="w-full text-left p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="font-medium text-secondary-900">Privacy Settings</div>
            <div className="text-sm text-secondary-600">Control your data and privacy</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile