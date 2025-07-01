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
  X,
  DollarSign,
  Truck,
  Clock
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
    },
    fleet: {
      auto_accept_trips: false,
      service_radius: 50,
      operating_hours: '9:00-17:00',
      availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      max_passengers: 4,
      preferred_trip_types: ['airport', 'corporate', 'event']
    },
    payment: {
      payment_method: 'direct_deposit',
      bank_name: '',
      account_number: '',
      routing_number: '',
      payment_frequency: 'weekly'
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
      
      // Fetch fleet settings if driver is a fleet partner
      if (user?.registration_type === 'fleet_partner' || user?.company_name) {
        try {
          const fleetResponse = await fetch('/api/driver/settings/fleet', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (fleetResponse.ok) {
            const fleetData = await fleetResponse.json()
            setSettings(prev => ({
              ...prev,
              fleet: fleetData.settings
            }))
          }
        } catch (fleetError) {
          console.error('Error fetching fleet settings:', fleetError)
          // Continue with default fleet settings
        }
      }
      
      // Fetch payment settings
      try {
        const paymentResponse = await fetch('/api/driver/settings/payment', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json()
          setSettings(prev => ({
            ...prev,
            payment: paymentData.settings
          }))
        }
      } catch (paymentError) {
        console.error('Error fetching payment settings:', paymentError)
        // Continue with default payment settings
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

  const saveFleetSettings = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/settings/fleet', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.fleet)
      })
      
      if (response.ok) {
        toast.success('Fleet settings updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update fleet settings')
      }
    } catch (error) {
      console.error('Error updating fleet settings:', error)
      toast.error('Failed to update fleet settings')
    } finally {
      setSaving(false)
    }
  }

  const savePaymentSettings = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/driver/settings/payment', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.payment)
      })
      
      if (response.ok) {
        toast.success('Payment settings updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update payment settings')
      }
    } catch (error) {
      console.error('Error updating payment settings:', error)
      toast.error('Failed to update payment settings')
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

  const updateFleetSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      fleet: {
        ...prev.fleet,
        [key]: value
      }
    }))
  }

  const updatePaymentSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
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

  const handleDayToggle = (day) => {
    setSettings(prev => {
      const currentDays = prev.fleet.availability_days || []
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day]
      
      return {
        ...prev,
        fleet: {
          ...prev.fleet,
          availability_days: newDays
        }
      }
    })
  }

  const handleTripTypeToggle = (type) => {
    setSettings(prev => {
      const currentTypes = prev.fleet.preferred_trip_types || []
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type]
      
      return {
        ...prev,
        fleet: {
          ...prev.fleet,
          preferred_trip_types: newTypes
        }
      }
    })
  }

  // Determine which tabs to show based on user type
  let tabs = [
    { id: 'profile', label: 'Profile Settings', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  // Add fleet settings tab for fleet partners
  if (user?.registration_type === 'fleet_partner' || user?.company_name) {
    tabs.push({ id: 'fleet', label: 'Fleet Settings', icon: Truck })
  }

  // Add payment settings tab for all drivers
  tabs.push({ id: 'payment', label: 'Payment', icon: DollarSign })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-ice-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bounce-in">
        <div>
          <h1 className="text-2xl font-bold text-dark-800">Account Settings</h1>
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
      <div className="border-b border-secondary-200 fade-in">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-ice-500 text-ice-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
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
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <SettingsIcon className="w-5 h-5 text-ice-500 mr-2" />
                Profile Information
              </h3>
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
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <Bell className="w-5 h-5 text-ice-500 mr-2" />
                Notification Preferences
              </h3>
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
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
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
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
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
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
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
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
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
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
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
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <Shield className="w-5 h-5 text-ice-500 mr-2" />
                Change Password
              </h3>
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

        {/* Fleet Settings */}
        {activeTab === 'fleet' && (
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <Truck className="w-5 h-5 text-ice-500 mr-2" />
                Fleet Settings
              </h3>
              <button
                onClick={saveFleetSettings}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_accept_trips"
                  checked={settings.fleet.auto_accept_trips}
                  onChange={(e) => updateFleetSetting('auto_accept_trips', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="auto_accept_trips" className="text-sm font-medium text-secondary-700">
                  Auto-accept Trip Assignments
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  value={settings.fleet.service_radius}
                  onChange={(e) => updateFleetSetting('service_radius', parseInt(e.target.value))}
                  min="1"
                  max="500"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Maximum distance you're willing to travel for pickups
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={settings.fleet.operating_hours}
                  onChange={(e) => updateFleetSetting('operating_hours', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 9:00-17:00"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Format: HH:MM-HH:MM (24-hour format)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Availability Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <label key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(settings.fleet.availability_days || []).includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                      />
                      <span className="text-sm text-secondary-700 capitalize">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Maximum Passengers
                </label>
                <input
                  type="number"
                  value={settings.fleet.max_passengers}
                  onChange={(e) => updateFleetSetting('max_passengers', parseInt(e.target.value))}
                  min="1"
                  max="100"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Preferred Trip Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['airport', 'corporate', 'event', 'tour', 'wedding', 'school', 'medical'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(settings.fleet.preferred_trip_types || []).includes(type)}
                        onChange={() => handleTripTypeToggle(type)}
                        className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                      />
                      <span className="text-sm text-secondary-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <DollarSign className="w-5 h-5 text-ice-500 mr-2" />
                Payment Settings
              </h3>
              <button
                onClick={savePaymentSettings}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={settings.payment.payment_method}
                  onChange={(e) => updatePaymentSetting('payment_method', e.target.value)}
                  className="input-field"
                >
                  <option value="direct_deposit">Direct Deposit</option>
                  <option value="paypal">PayPal</option>
                  <option value="check">Check</option>
                </select>
              </div>

              {settings.payment.payment_method === 'direct_deposit' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={settings.payment.bank_name}
                      onChange={(e) => updatePaymentSetting('bank_name', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Account Number
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.account_number ? 'text' : 'password'}
                        value={settings.payment.account_number}
                        onChange={(e) => updatePaymentSetting('account_number', e.target.value)}
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('account_number')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPasswords.account_number ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Routing Number
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.routing_number ? 'text' : 'password'}
                        value={settings.payment.routing_number}
                        onChange={(e) => updatePaymentSetting('routing_number', e.target.value)}
                        className="input-field pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('routing_number')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                      >
                        {showPasswords.routing_number ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {settings.payment.payment_method === 'paypal' && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={settings.payment.paypal_email}
                    onChange={(e) => updatePaymentSetting('paypal_email', e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payment Frequency
                </label>
                <select
                  value={settings.payment.payment_frequency}
                  onChange={(e) => updatePaymentSetting('payment_frequency', e.target.value)}
                  className="input-field"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="p-4 bg-ice-50 rounded-lg border border-ice-200">
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-ice-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-ice-800">Payment Processing Schedule</h4>
                    <p className="text-sm text-ice-600 mt-1">
                      {settings.payment.payment_frequency === 'weekly' && 'Payments are processed every Friday for the previous week.'}
                      {settings.payment.payment_frequency === 'biweekly' && 'Payments are processed every other Friday.'}
                      {settings.payment.payment_frequency === 'monthly' && 'Payments are processed on the 1st of each month for the previous month.'}
                    </p>
                  </div>
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