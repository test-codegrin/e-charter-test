import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Mail, 
  Bell, 
  Shield, 
  Server, 
  CreditCard, 
  Flag, 
  Truck,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('commission')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({})
  const [showSecrets, setShowSecrets] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Settings loaded:', data.settings)
        setSettings(data.settings)
      } else {
        toast.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (category) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category,
          settings: settings[category]
        })
      })
      
      if (response.ok) {
        toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const tabs = [
    { id: 'commission', label: 'Commission', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'business', label: 'Business Rules', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'features', label: 'Features', icon: Flag },
    { id: 'system', label: 'System', icon: Server }
  ]

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
          <h1 className="text-2xl font-bold text-dark-800">System Settings</h1>
          <p className="text-secondary-600">Configure system-wide settings and preferences</p>
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

      {/* Commission Settings */}
      {activeTab === 'commission' && settings.commission && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <DollarSign className="w-5 h-5 text-ice-500 mr-2" />
              Commission Settings
            </h3>
            <button
              onClick={() => saveSettings('commission')}
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
                Individual Driver Commission Rate (%)
              </label>
              <input
                type="number"
                value={settings.commission.individual_driver_rate}
                onChange={(e) => updateSetting('commission', 'individual_driver_rate', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="input-field"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Percentage of trip fare retained by the platform
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Fleet Partner Commission Rate (%)
              </label>
              <input
                type="number"
                value={settings.commission.fleet_partner_rate}
                onChange={(e) => updateSetting('commission', 'fleet_partner_rate', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="input-field"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Percentage of trip fare retained by the platform for fleet partners
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.commission.tax_rate}
                onChange={(e) => updateSetting('commission', 'tax_rate', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
                className="input-field"
              />
              <p className="text-xs text-secondary-500 mt-1">
                HST/GST tax rate applied to trips
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Currency
              </label>
              <select
                value={settings.commission.currency}
                onChange={(e) => updateSetting('commission', 'currency', e.target.value)}
                className="input-field"
              >
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && settings.email && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <Mail className="w-5 h-5 text-ice-500 mr-2" />
              Email Settings
            </h3>
            <button
              onClick={() => saveSettings('email')}
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
                id="smtp_enabled"
                checked={settings.email.smtp_enabled}
                onChange={(e) => updateSetting('email', 'smtp_enabled', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="smtp_enabled" className="text-sm font-medium text-secondary-700">
                Enable SMTP Email
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.email.smtp_host}
                  onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                  className="input-field"
                  placeholder="e.g., smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.email.smtp_port}
                  onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
                  className="input-field"
                  placeholder="e.g., 587"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.email.smtp_user}
                  onChange={(e) => updateSetting('email', 'smtp_user', e.target.value)}
                  className="input-field"
                  placeholder="e.g., your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.smtp_password ? 'text' : 'password'}
                    value={settings.email.smtp_password}
                    onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter SMTP password"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('smtp_password')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showSecrets.smtp_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.email.from_name}
                  onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., eCharter Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.email.from_email}
                  onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                  className="input-field"
                  placeholder="e.g., noreply@echarter.co"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && settings.notifications && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <Bell className="w-5 h-5 text-ice-500 mr-2" />
              Notification Settings
            </h3>
            <button
              onClick={() => saveSettings('notifications')}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-md font-medium text-secondary-800">Email Notifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="email_booking_confirmation"
                  checked={settings.notifications.email_booking_confirmation}
                  onChange={(e) => updateSetting('notifications', 'email_booking_confirmation', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="email_booking_confirmation" className="text-sm font-medium text-secondary-700">
                  Booking Confirmations
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="email_trip_updates"
                  checked={settings.notifications.email_trip_updates}
                  onChange={(e) => updateSetting('notifications', 'email_trip_updates', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="email_trip_updates" className="text-sm font-medium text-secondary-700">
                  Trip Status Updates
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="email_payment_receipts"
                  checked={settings.notifications.email_payment_receipts}
                  onChange={(e) => updateSetting('notifications', 'email_payment_receipts', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="email_payment_receipts" className="text-sm font-medium text-secondary-700">
                  Payment Receipts
                </label>
              </div>
            </div>

            <h4 className="text-md font-medium text-secondary-800 mt-6">SMS Notifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sms_booking_confirmation"
                  checked={settings.notifications.sms_booking_confirmation}
                  onChange={(e) => updateSetting('notifications', 'sms_booking_confirmation', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="sms_booking_confirmation" className="text-sm font-medium text-secondary-700">
                  Booking Confirmations
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sms_trip_started"
                  checked={settings.notifications.sms_trip_started}
                  onChange={(e) => updateSetting('notifications', 'sms_trip_started', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="sms_trip_started" className="text-sm font-medium text-secondary-700">
                  Trip Started Alerts
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sms_trip_completed"
                  checked={settings.notifications.sms_trip_completed}
                  onChange={(e) => updateSetting('notifications', 'sms_trip_completed', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="sms_trip_completed" className="text-sm font-medium text-secondary-700">
                  Trip Completed Alerts
                </label>
              </div>
            </div>

            <h4 className="text-md font-medium text-secondary-800 mt-6">Admin Notifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="admin_new_bookings"
                  checked={settings.notifications.admin_new_bookings}
                  onChange={(e) => updateSetting('notifications', 'admin_new_bookings', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="admin_new_bookings" className="text-sm font-medium text-secondary-700">
                  New Booking Notifications
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="admin_driver_registrations"
                  checked={settings.notifications.admin_driver_registrations}
                  onChange={(e) => updateSetting('notifications', 'admin_driver_registrations', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="admin_driver_registrations" className="text-sm font-medium text-secondary-700">
                  Driver Registration Alerts
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && settings.security && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <Shield className="w-5 h-5 text-ice-500 mr-2" />
              Security Settings
            </h3>
            <button
              onClick={() => saveSettings('security')}
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
                JWT Token Expiry
              </label>
              <input
                type="text"
                value={settings.security.jwt_expiry}
                onChange={(e) => updateSetting('security', 'jwt_expiry', e.target.value)}
                className="input-field"
                placeholder="e.g., 24h"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Format: 1h, 24h, 7d, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                value={settings.security.password_min_length}
                onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                min="6"
                max="32"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                value={settings.security.max_login_attempts}
                onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                min="1"
                max="10"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.security.session_timeout}
                onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                min="5"
                max="1440"
                className="input-field"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="require_email_verification"
                checked={settings.security.require_email_verification}
                onChange={(e) => updateSetting('security', 'require_email_verification', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="require_email_verification" className="text-sm font-medium text-secondary-700">
                Require Email Verification
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Business Rules */}
      {activeTab === 'business' && settings.business && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <Truck className="w-5 h-5 text-ice-500 mr-2" />
              Business Rules
            </h3>
            <button
              onClick={() => saveSettings('business')}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auto_approve_drivers"
                checked={settings.business.auto_approve_drivers}
                onChange={(e) => updateSetting('business', 'auto_approve_drivers', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="auto_approve_drivers" className="text-sm font-medium text-secondary-700">
                Auto-approve Driver Registrations
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auto_approve_vehicles"
                checked={settings.business.auto_approve_vehicles}
                onChange={(e) => updateSetting('business', 'auto_approve_vehicles', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="auto_approve_vehicles" className="text-sm font-medium text-secondary-700">
                Auto-approve Vehicle Registrations
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Minimum Trip Amount ($)
              </label>
              <input
                type="number"
                value={settings.business.min_trip_amount}
                onChange={(e) => updateSetting('business', 'min_trip_amount', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Maximum Trip Duration (hours)
              </label>
              <input
                type="number"
                value={settings.business.max_trip_duration}
                onChange={(e) => updateSetting('business', 'max_trip_duration', parseInt(e.target.value))}
                min="1"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Booking Advance Notice (hours)
              </label>
              <input
                type="number"
                value={settings.business.booking_advance_hours}
                onChange={(e) => updateSetting('business', 'booking_advance_hours', parseInt(e.target.value))}
                min="0"
                className="input-field"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Minimum hours before trip start time that booking is allowed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Cancellation Notice (hours)
              </label>
              <input
                type="number"
                value={settings.business.cancellation_hours}
                onChange={(e) => updateSetting('business', 'cancellation_hours', parseInt(e.target.value))}
                min="0"
                className="input-field"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Minimum hours before trip start time that cancellation is allowed without fee
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && settings.payment && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <CreditCard className="w-5 h-5 text-ice-500 mr-2" />
              Payment Settings
            </h3>
            <button
              onClick={() => saveSettings('payment')}
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
                id="stripe_enabled"
                checked={settings.payment.stripe_enabled}
                onChange={(e) => updateSetting('payment', 'stripe_enabled', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="stripe_enabled" className="text-sm font-medium text-secondary-700">
                Enable Stripe Payments
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Stripe Public Key
                </label>
                <input
                  type="text"
                  value={settings.payment.stripe_public_key}
                  onChange={(e) => updateSetting('payment', 'stripe_public_key', e.target.value)}
                  className="input-field"
                  placeholder="pk_test_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Stripe Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets.stripe_secret_key ? 'text' : 'password'}
                    value={settings.payment.stripe_secret_key}
                    onChange={(e) => updateSetting('payment', 'stripe_secret_key', e.target.value)}
                    className="input-field pr-10"
                    placeholder="sk_test_..."
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility('stripe_secret_key')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    {showSecrets.stripe_secret_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="require_payment_upfront"
                checked={settings.payment.require_payment_upfront}
                onChange={(e) => updateSetting('payment', 'require_payment_upfront', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="require_payment_upfront" className="text-sm font-medium text-secondary-700">
                Require Payment Before Trip
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags */}
      {activeTab === 'features' && settings.features && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <Flag className="w-5 h-5 text-ice-500 mr-2" />
              Feature Flags
            </h3>
            <button
              onClick={() => saveSettings('features')}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="fleet_partners_enabled"
                checked={settings.features.fleet_partners_enabled}
                onChange={(e) => updateSetting('features', 'fleet_partners_enabled', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="fleet_partners_enabled" className="text-sm font-medium text-secondary-700">
                Enable Fleet Partner Features
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="multi_stop_trips"
                checked={settings.features.multi_stop_trips}
                onChange={(e) => updateSetting('features', 'multi_stop_trips', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="multi_stop_trips" className="text-sm font-medium text-secondary-700">
                Enable Multi-Stop Trips
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="real_time_tracking"
                checked={settings.features.real_time_tracking}
                onChange={(e) => updateSetting('features', 'real_time_tracking', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="real_time_tracking" className="text-sm font-medium text-secondary-700">
                Enable Real-Time Tracking
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="driver_ratings"
                checked={settings.features.driver_ratings}
                onChange={(e) => updateSetting('features', 'driver_ratings', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="driver_ratings" className="text-sm font-medium text-secondary-700">
                Enable Driver Ratings
              </label>
            </div>
          </div>
        </div>
      )}

      {/* System Settings */}
      {activeTab === 'system' && settings.system && (
        <div className="card slide-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-800 flex items-center">
              <Server className="w-5 h-5 text-ice-500 mr-2" />
              System Settings
            </h3>
            <button
              onClick={() => saveSettings('system')}
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
                Company Name
              </label>
              <input
                type="text"
                value={settings.system.company_name}
                onChange={(e) => updateSetting('system', 'company_name', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Company Email
              </label>
              <input
                type="email"
                value={settings.system.company_email}
                onChange={(e) => updateSetting('system', 'company_email', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Company Phone
              </label>
              <input
                type="text"
                value={settings.system.company_phone}
                onChange={(e) => updateSetting('system', 'company_phone', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.system.support_email}
                onChange={(e) => updateSetting('system', 'support_email', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={settings.system.website_url}
                onChange={(e) => updateSetting('system', 'website_url', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Timezone
              </label>
              <select
                value={settings.system.timezone}
                onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                className="input-field"
              >
                <option value="America/Toronto">America/Toronto</option>
                <option value="America/Vancouver">America/Vancouver</option>
                <option value="America/Montreal">America/Montreal</option>
                <option value="America/Halifax">America/Halifax</option>
                <option value="America/Edmonton">America/Edmonton</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={settings.system.maintenance_mode}
                onChange={(e) => updateSetting('system', 'maintenance_mode', e.target.checked)}
                className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
              />
              <label htmlFor="maintenance_mode" className="text-sm font-medium text-secondary-700">
                Maintenance Mode
              </label>
            </div>
          </div>

          {settings.system.maintenance_mode && (
            <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-warning-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-warning-800">Warning: Maintenance Mode is Enabled</h4>
                  <p className="text-sm text-warning-600 mt-1">
                    When maintenance mode is enabled, the system will be inaccessible to regular users.
                    Only administrators will be able to access the system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Settings