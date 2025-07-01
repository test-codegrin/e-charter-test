import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Mail, 
  Phone, 
  Shield, 
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const DriverSettings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  
  const [settings, setSettings] = useState({
    profile: {
      driverName: '',
      email: '',
      phoneNo: '',
      address: '',
      cityName: '',
      zipCord: ''
    },
    notifications: {
      email_trip_assignments: true,
      email_trip_updates: true,
      sms_trip_assignments: true,
      sms_trip_updates: true,
      app_notifications: true
    },
    security: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      
      // Fetch driver profile
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Driver profile loaded:', data.profile)
        
        setSettings(prev => ({
          ...prev,
          profile: data.profile
        }))
      } else {
        toast.error('Failed to load profile')
      }
      
      // Fetch driver notification settings
      try {
        const notifResponse = await fetch('/api/driver/settings/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (notifResponse.ok) {
          const notifData = await notifResponse.json()
          setSettings(prev => ({
            ...prev,
            notifications: notifData.settings
          }))
        }
      } catch (notifError) {
        console.error('Error fetching notification settings:', notifError)
        // Continue with default notification settings
      }
      
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.profile)
      })
      
      if (response.ok) {
        toast.success('Profile updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/settings/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.notifications)
      })
      
      if (response.ok) {
        toast.success('Notification settings updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update notification settings')
      }
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast.error('Failed to update notification settings')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    try {
      // Validate passwords
      if (!settings.security.current_password) {
        toast.error('Current password is required')
        return
      }
      
      if (!settings.security.new_password) {
        toast.error('New password is required')
        return
      }
      
      if (settings.security.new_password !== settings.security.confirm_password) {
        toast.error('New passwords do not match')
        return
      }
      
      if (settings.security.new_password.length < 8) {
        toast.error('Password must be at least 8 characters')
        return
      }
      
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/updatepassword', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: settings.profile.email,
          oldPassword: settings.security.current_password,
          newPassword: settings.security.new_password
        })
      })
      
      if (response.ok) {
        toast.success('Password changed successfully')
        // Clear password fields
        setSettings(prev => ({
          ...prev,
          security: {
            current_password: '',
            new_password: '',
            confirm_password: ''
          }
        }))
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const updateProfileSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value
      }
    }))
  }

  const updateNotificationSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }))
  }

  const updateSecuritySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

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
          <h1 className="text-2xl font-bold text-secondary-900">Account Settings</h1>
          <p className="text-secondary-600">Manage your account preferences and settings</p>
        </div>
        <button
          onClick={fetchSettings}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Profile Information</h3>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={settings.profile.driverName || ''}
                  onChange={(e) => updateProfileSetting('driverName', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.profile.email || ''}
                  onChange={(e) => updateProfileSetting('email', e.target.value)}
                  className="input-field"
                  disabled // Email should not be changed directly
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Contact support to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.profile.phoneNo || ''}
                  onChange={(e) => updateProfileSetting('phoneNo', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={settings.profile.cityName || ''}
                  onChange={(e) => updateProfileSetting('cityName', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={settings.profile.zipCord || ''}
                  onChange={(e) => updateProfileSetting('zipCord', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Address
                </label>
                <textarea
                  value={settings.profile.address || ''}
                  onChange={(e) => updateProfileSetting('address', e.target.value)}
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Notification Preferences</h3>
              <button
                onClick={saveNotifications}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-md font-medium text-secondary-800">Email Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_trip_assignments"
                    checked={settings.notifications.email_trip_assignments}
                    onChange={(e) => updateNotificationSetting('email_trip_assignments', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="email_trip_assignments" className="text-sm font-medium text-secondary-700">
                    New Trip Assignments
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_trip_updates"
                    checked={settings.notifications.email_trip_updates}
                    onChange={(e) => updateNotificationSetting('email_trip_updates', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="email_trip_updates" className="text-sm font-medium text-secondary-700">
                    Trip Status Updates
                  </label>
                </div>
              </div>

              <h4 className="text-md font-medium text-secondary-800 mt-6">SMS Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_trip_assignments"
                    checked={settings.notifications.sms_trip_assignments}
                    onChange={(e) => updateNotificationSetting('sms_trip_assignments', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="sms_trip_assignments" className="text-sm font-medium text-secondary-700">
                    New Trip Assignments
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_trip_updates"
                    checked={settings.notifications.sms_trip_updates}
                    onChange={(e) => updateNotificationSetting('sms_trip_updates', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="sms_trip_updates" className="text-sm font-medium text-secondary-700">
                    Trip Status Updates
                  </label>
                </div>
              </div>

              <h4 className="text-md font-medium text-secondary-800 mt-6">In-App Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="app_notifications"
                    checked={settings.notifications.app_notifications}
                    onChange={(e) => updateNotificationSetting('app_notifications', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="app_notifications" className="text-sm font-medium text-secondary-700">
                    Enable In-App Notifications
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Change Password</h3>
              <button
                onClick={changePassword}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Change Password'}</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current_password ? 'text' : 'password'}
                    value={settings.security.current_password}
                    onChange={(e) => updateSecuritySetting('current_password', e.target.value)}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current_password')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPasswords.current_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new_password ? 'text' : 'password'}
                    value={settings.security.new_password}
                    onChange={(e) => updateSecuritySetting('new_password', e.target.value)}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new_password')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPasswords.new_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm_password ? 'text' : 'password'}
                    value={settings.security.confirm_password}
                    onChange={(e) => updateSecuritySetting('confirm_password', e.target.value)}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm_password')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showPasswords.confirm_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DriverSettings