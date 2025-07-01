import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Mail, 
  Bell, 
  Shield, 
  FileText, 
  CreditCard, 
  Flag, 
  Server, 
  Sliders, 
  Eye, 
  EyeOff, 
  Clock, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  X
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('commission')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const [auditLogs, setAuditLogs] = useState([])
  const [showAuditLog, setShowAuditLog] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getSettings()
      console.log('Settings loaded:', response.data.settings)
      setSettings(response.data.settings || {})
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true)
      const response = await adminAPI.getSettingsAuditLog({ limit: 50 })
      setAuditLogs(response.data.auditLogs || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setAuditLoading(false)
    }
  }

  const saveSettings = async (category) => {
    try {
      setSaving(true)
      const settingsToSave = settings[category]
      const response = await adminAPI.updateSettings(category, settingsToSave)
      toast.success(response.data.message || 'Settings updated successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const toggleAuditLog = () => {
    if (!showAuditLog) {
      fetchAuditLogs()
    }
    setShowAuditLog(!showAuditLog)
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch (error) {
      return dateString
    }
  }

  // Tabs configuration
  const tabs = [
    { id: 'commission', label: 'Commission', icon: DollarSign },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'business', label: 'Business Rules', icon: FileText },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'features', label: 'Features', icon: Flag },
    { id: 'system', label: 'System', icon: Server },
    { id: 'pricing', label: 'Pricing', icon: Sliders }
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
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleAuditLog}
            className="btn-secondary flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>{showAuditLog ? 'Hide Audit Log' : 'View Audit Log'}</span>
          </button>
          <button
            onClick={fetchSettings}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-secondary-900">Settings Audit Log</h3>
                <button
                  onClick={() => setShowAuditLog(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {auditLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ice-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-secondary-200">
                        <th className="table-header">Date</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Setting</th>
                        <th className="table-header">Changed By</th>
                        <th className="table-header">Old Value</th>
                        <th className="table-header">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {auditLogs.map((log) => (
                        <tr key={log.audit_id} className="hover:bg-secondary-50">
                          <td className="table-cell">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="table-cell font-medium capitalize">
                            {log.category}
                          </td>
                          <td className="table-cell">
                            {log.setting_key}
                          </td>
                          <td className="table-cell">
                            {log.changed_by_name || 'System'}
                          </td>
                          <td className="table-cell">
                            <div className="max-w-xs truncate">
                              {log.old_value || '-'}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="max-w-xs truncate">
                              {log.new_value}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {auditLogs.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-secondary-500">No audit logs found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
        {/* Commission Settings */}
        {activeTab === 'commission' && (
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
                  value={settings.commission?.individual_driver_rate || 20}
                  onChange={(e) => updateSetting('commission', 'individual_driver_rate', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Percentage of trip fare retained by the platform from individual drivers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Fleet Partner Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.commission?.fleet_partner_rate || 15}
                  onChange={(e) => updateSetting('commission', 'fleet_partner_rate', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Percentage of trip fare retained by the platform from fleet partners
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.commission?.tax_rate || 13}
                  onChange={(e) => updateSetting('commission', 'tax_rate', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  HST/GST tax rate applied to trip fares
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={settings.commission?.currency || 'CAD'}
                  onChange={(e) => updateSetting('commission', 'currency', e.target.value)}
                  className="input-field"
                >
                  <option value="CAD">Canadian Dollar (CAD)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payment Processing Fee (%)
                </label>
                <input
                  type="number"
                  value={settings.commission?.payment_processing_fee || 2.9}
                  onChange={(e) => updateSetting('commission', 'payment_processing_fee', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Fee charged by payment processors (e.g., Stripe, PayPal)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
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
                  checked={settings.email?.smtp_enabled || false}
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
                    value={settings.email?.smtp_host || ''}
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
                    value={settings.email?.smtp_port || 587}
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
                    value={settings.email?.smtp_user || ''}
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
                      type={showPasswords.smtp_password ? 'text' : 'password'}
                      value={settings.email?.smtp_password || ''}
                      onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                      className="input-field pr-10"
                      placeholder="Enter SMTP password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('smtp_password')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPasswords.smtp_password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={settings.email?.from_name || ''}
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
                    value={settings.email?.from_email || ''}
                    onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                    className="input-field"
                    placeholder="e.g., support@echarter.co"
                  />
                </div>
              </div>

              <div className="p-4 bg-ice-50 rounded-lg border border-ice-200">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-ice-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-ice-800">Email Configuration</h4>
                    <p className="text-sm text-ice-600 mt-1">
                      For Gmail, you may need to use an App Password instead of your regular password.
                      <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-ice-700 underline ml-1">
                        Learn more
                      </a>
                    </p>
                  </div>
                </div>
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
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_booking_confirmation"
                    checked={settings.notifications?.email_booking_confirmation || false}
                    onChange={(e) => updateSetting('notifications', 'email_booking_confirmation', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="email_booking_confirmation" className="text-sm font-medium text-secondary-700">
                    Send booking confirmation emails
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_trip_updates"
                    checked={settings.notifications?.email_trip_updates || false}
                    onChange={(e) => updateSetting('notifications', 'email_trip_updates', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="email_trip_updates" className="text-sm font-medium text-secondary-700">
                    Send trip status update emails
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_payment_receipts"
                    checked={settings.notifications?.email_payment_receipts || false}
                    onChange={(e) => updateSetting('notifications', 'email_payment_receipts', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="email_payment_receipts" className="text-sm font-medium text-secondary-700">
                    Send payment receipt emails
                  </label>
                </div>
              </div>

              <h4 className="text-md font-medium text-secondary-800 mt-6">SMS Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_booking_confirmation"
                    checked={settings.notifications?.sms_booking_confirmation || false}
                    onChange={(e) => updateSetting('notifications', 'sms_booking_confirmation', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="sms_booking_confirmation" className="text-sm font-medium text-secondary-700">
                    Send booking confirmation SMS
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_trip_started"
                    checked={settings.notifications?.sms_trip_started || false}
                    onChange={(e) => updateSetting('notifications', 'sms_trip_started', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="sms_trip_started" className="text-sm font-medium text-secondary-700">
                    Send trip started SMS
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_trip_completed"
                    checked={settings.notifications?.sms_trip_completed || false}
                    onChange={(e) => updateSetting('notifications', 'sms_trip_completed', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="sms_trip_completed" className="text-sm font-medium text-secondary-700">
                    Send trip completed SMS
                  </label>
                </div>
              </div>

              <h4 className="text-md font-medium text-secondary-800 mt-6">Admin Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="admin_new_bookings"
                    checked={settings.notifications?.admin_new_bookings || false}
                    onChange={(e) => updateSetting('notifications', 'admin_new_bookings', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="admin_new_bookings" className="text-sm font-medium text-secondary-700">
                    Notify admin of new bookings
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="admin_driver_registrations"
                    checked={settings.notifications?.admin_driver_registrations || false}
                    onChange={(e) => updateSetting('notifications', 'admin_driver_registrations', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="admin_driver_registrations" className="text-sm font-medium text-secondary-700">
                    Notify admin of driver registrations
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="admin_vehicle_registrations"
                    checked={settings.notifications?.admin_vehicle_registrations || false}
                    onChange={(e) => updateSetting('notifications', 'admin_vehicle_registrations', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="admin_vehicle_registrations" className="text-sm font-medium text-secondary-700">
                    Notify admin of vehicle registrations
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
                  value={settings.security?.jwt_expiry || '24h'}
                  onChange={(e) => updateSetting('security', 'jwt_expiry', e.target.value)}
                  className="input-field"
                  placeholder="e.g., 24h, 7d"
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
                  value={settings.security?.password_min_length || 8}
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
                  value={settings.security?.max_login_attempts || 5}
                  onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Number of failed attempts before account lockout
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security?.session_timeout || 30}
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
                  checked={settings.security?.require_email_verification || false}
                  onChange={(e) => updateSetting('security', 'require_email_verification', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="require_email_verification" className="text-sm font-medium text-secondary-700">
                  Require Email Verification
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="two_factor_enabled"
                  checked={settings.security?.two_factor_enabled || false}
                  onChange={(e) => updateSetting('security', 'two_factor_enabled', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="two_factor_enabled" className="text-sm font-medium text-secondary-700">
                  Enable Two-Factor Authentication
                </label>
              </div>
            </div>

            <div className="mt-6 p-4 bg-ice-50 rounded-lg border border-ice-200">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-ice-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-ice-800">Security Best Practices</h4>
                  <p className="text-sm text-ice-600 mt-1">
                    Enabling email verification and two-factor authentication significantly improves account security.
                    Consider requiring strong passwords with a minimum length of 8 characters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Rules */}
        {activeTab === 'business' && (
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <FileText className="w-5 h-5 text-ice-500 mr-2" />
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
                  checked={settings.business?.auto_approve_drivers || false}
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
                  checked={settings.business?.auto_approve_vehicles || false}
                  onChange={(e) => updateSetting('business', 'auto_approve_vehicles', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="auto_approve_vehicles" className="text-sm font-medium text-secondary-700">
                  Auto-approve Vehicle Registrations
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="auto_approve_fleet_partners"
                  checked={settings.business?.auto_approve_fleet_partners || false}
                  onChange={(e) => updateSetting('business', 'auto_approve_fleet_partners', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="auto_approve_fleet_partners" className="text-sm font-medium text-secondary-700">
                  Auto-approve Fleet Partners
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="require_driver_documents"
                  checked={settings.business?.require_driver_documents || true}
                  onChange={(e) => updateSetting('business', 'require_driver_documents', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="require_driver_documents" className="text-sm font-medium text-secondary-700">
                  Require Driver Documents
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Minimum Trip Amount ($)
                </label>
                <input
                  type="number"
                  value={settings.business?.min_trip_amount || 25}
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
                  value={settings.business?.max_trip_duration || 24}
                  onChange={(e) => updateSetting('business', 'max_trip_duration', parseInt(e.target.value))}
                  min="1"
                  max="168"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Booking Advance Notice (hours)
                </label>
                <input
                  type="number"
                  value={settings.business?.booking_advance_hours || 2}
                  onChange={(e) => updateSetting('business', 'booking_advance_hours', parseInt(e.target.value))}
                  min="0"
                  max="72"
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
                  value={settings.business?.cancellation_hours || 4}
                  onChange={(e) => updateSetting('business', 'cancellation_hours', parseInt(e.target.value))}
                  min="0"
                  max="72"
                  className="input-field"
                />
                <p className="text-xs text-secondary-500 mt-1">
                  Minimum hours before trip start time for free cancellation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
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
                  checked={settings.payment?.stripe_enabled || false}
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
                    Stripe Publishable Key
                  </label>
                  <input
                    type="text"
                    value={settings.payment?.stripe_public_key || ''}
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
                      type={showPasswords.stripe_secret_key ? 'text' : 'password'}
                      value={settings.payment?.stripe_secret_key || ''}
                      onChange={(e) => updateSetting('payment', 'stripe_secret_key', e.target.value)}
                      className="input-field pr-10"
                      placeholder="sk_test_..."
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('stripe_secret_key')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPasswords.stripe_secret_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="require_payment_upfront"
                  checked={settings.payment?.require_payment_upfront || false}
                  onChange={(e) => updateSetting('payment', 'require_payment_upfront', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="require_payment_upfront" className="text-sm font-medium text-secondary-700">
                  Require Payment Before Trip
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Accepted Payment Methods
                </label>
                <div className="space-y-2">
                  {['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'].map(method => (
                    <div key={method} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`payment_method_${method}`}
                        checked={(settings.payment?.payment_methods || []).includes(method)}
                        onChange={(e) => {
                          const methods = settings.payment?.payment_methods || []
                          if (e.target.checked) {
                            updateSetting('payment', 'payment_methods', [...methods, method])
                          } else {
                            updateSetting('payment', 'payment_methods', methods.filter(m => m !== method))
                          }
                        }}
                        className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                      />
                      <label htmlFor={`payment_method_${method}`} className="text-sm text-secondary-700 capitalize">
                        {method.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Flags */}
        {activeTab === 'features' && (
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="fleet_partners_enabled"
                  checked={settings.features?.fleet_partners_enabled || true}
                  onChange={(e) => updateSetting('features', 'fleet_partners_enabled', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="fleet_partners_enabled" className="text-sm font-medium text-secondary-700">
                  Enable Fleet Partners
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="multi_stop_trips"
                  checked={settings.features?.multi_stop_trips || true}
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
                  checked={settings.features?.real_time_tracking || true}
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
                  checked={settings.features?.driver_ratings || true}
                  onChange={(e) => updateSetting('features', 'driver_ratings', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="driver_ratings" className="text-sm font-medium text-secondary-700">
                  Enable Driver Ratings
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="trip_scheduling"
                  checked={settings.features?.trip_scheduling || true}
                  onChange={(e) => updateSetting('features', 'trip_scheduling', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="trip_scheduling" className="text-sm font-medium text-secondary-700">
                  Enable Trip Scheduling
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="loyalty_program"
                  checked={settings.features?.loyalty_program || false}
                  onChange={(e) => updateSetting('features', 'loyalty_program', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="loyalty_program" className="text-sm font-medium text-secondary-700">
                  Enable Loyalty Program
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="referral_program"
                  checked={settings.features?.referral_program || false}
                  onChange={(e) => updateSetting('features', 'referral_program', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="referral_program" className="text-sm font-medium text-secondary-700">
                  Enable Referral Program
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="corporate_accounts"
                  checked={settings.features?.corporate_accounts || false}
                  onChange={(e) => updateSetting('features', 'corporate_accounts', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="corporate_accounts" className="text-sm font-medium text-secondary-700">
                  Enable Corporate Accounts
                </label>
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
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
                  value={settings.system?.company_name || ''}
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
                  value={settings.system?.company_email || ''}
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
                  value={settings.system?.company_phone || ''}
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
                  value={settings.system?.support_email || ''}
                  onChange={(e) => updateSetting('system', 'support_email', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.system?.timezone || 'America/Toronto'}
                  onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                  className="input-field"
                >
                  <option value="America/Toronto">Eastern Time (ET) - Toronto</option>
                  <option value="America/Vancouver">Pacific Time (PT) - Vancouver</option>
                  <option value="America/Edmonton">Mountain Time (MT) - Edmonton</option>
                  <option value="America/Winnipeg">Central Time (CT) - Winnipeg</option>
                  <option value="America/Halifax">Atlantic Time (AT) - Halifax</option>
                  <option value="America/St_Johns">Newfoundland Time (NT) - St. John's</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.system?.date_format || 'YYYY-MM-DD'}
                  onChange={(e) => updateSetting('system', 'date_format', e.target.value)}
                  className="input-field"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Time Format
                </label>
                <select
                  value={settings.system?.time_format || '24h'}
                  onChange={(e) => updateSetting('system', 'time_format', e.target.value)}
                  className="input-field"
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="maintenance_mode"
                  checked={settings.system?.maintenance_mode || false}
                  onChange={(e) => updateSetting('system', 'maintenance_mode', e.target.checked)}
                  className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                />
                <label htmlFor="maintenance_mode" className="text-sm font-medium text-secondary-700">
                  Maintenance Mode
                </label>
              </div>
            </div>

            <div className="mt-6 p-4 bg-ice-50 rounded-lg border border-ice-200">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-ice-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-ice-800">System Information</h4>
                  <p className="text-sm text-ice-600 mt-1">
                    Application Version: {settings.system?.app_version || '1.0.0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Settings */}
        {activeTab === 'pricing' && (
          <div className="card slide-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-800 flex items-center">
                <Sliders className="w-5 h-5 text-ice-500 mr-2" />
                Pricing Settings
              </h3>
              <button
                onClick={() => saveSettings('pricing')}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Base Rates */}
              <div>
                <h4 className="text-md font-medium text-secondary-800 mb-4">Base Rates (per trip)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-secondary-200">
                        <th className="table-header">Vehicle Type</th>
                        <th className="table-header">Small</th>
                        <th className="table-header">Medium</th>
                        <th className="table-header">Large</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {['sedan', 'suv', 'van', 'bus'].map(type => (
                        <tr key={`base-${type}`} className="hover:bg-secondary-50">
                          <td className="table-cell font-medium capitalize">{type}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.base_rates?.[type]?.small || 0}
                                onChange={(e) => {
                                  const baseRates = { ...(settings.pricing?.base_rates || {}) }
                                  if (!baseRates[type]) baseRates[type] = {}
                                  baseRates[type].small = parseFloat(e.target.value)
                                  updateSetting('pricing', 'base_rates', baseRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.base_rates?.[type]?.medium || 0}
                                onChange={(e) => {
                                  const baseRates = { ...(settings.pricing?.base_rates || {}) }
                                  if (!baseRates[type]) baseRates[type] = {}
                                  baseRates[type].medium = parseFloat(e.target.value)
                                  updateSetting('pricing', 'base_rates', baseRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.base_rates?.[type]?.large || 0}
                                onChange={(e) => {
                                  const baseRates = { ...(settings.pricing?.base_rates || {}) }
                                  if (!baseRates[type]) baseRates[type] = {}
                                  baseRates[type].large = parseFloat(e.target.value)
                                  updateSetting('pricing', 'base_rates', baseRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per Kilometer Rates */}
              <div>
                <h4 className="text-md font-medium text-secondary-800 mb-4">Per Kilometer Rates</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-secondary-200">
                        <th className="table-header">Vehicle Type</th>
                        <th className="table-header">Small</th>
                        <th className="table-header">Medium</th>
                        <th className="table-header">Large</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {['sedan', 'suv', 'van', 'bus'].map(type => (
                        <tr key={`km-${type}`} className="hover:bg-secondary-50">
                          <td className="table-cell font-medium capitalize">{type}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.per_km_rates?.[type]?.small || 0}
                                onChange={(e) => {
                                  const perKmRates = { ...(settings.pricing?.per_km_rates || {}) }
                                  if (!perKmRates[type]) perKmRates[type] = {}
                                  perKmRates[type].small = parseFloat(e.target.value)
                                  updateSetting('pricing', 'per_km_rates', perKmRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.per_km_rates?.[type]?.medium || 0}
                                onChange={(e) => {
                                  const perKmRates = { ...(settings.pricing?.per_km_rates || {}) }
                                  if (!perKmRates[type]) perKmRates[type] = {}
                                  perKmRates[type].medium = parseFloat(e.target.value)
                                  updateSetting('pricing', 'per_km_rates', perKmRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.per_km_rates?.[type]?.large || 0}
                                onChange={(e) => {
                                  const perKmRates = { ...(settings.pricing?.per_km_rates || {}) }
                                  if (!perKmRates[type]) perKmRates[type] = {}
                                  perKmRates[type].large = parseFloat(e.target.value)
                                  updateSetting('pricing', 'per_km_rates', perKmRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per Hour Rates */}
              <div>
                <h4 className="text-md font-medium text-secondary-800 mb-4">Per Hour Rates</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-secondary-200">
                        <th className="table-header">Vehicle Type</th>
                        <th className="table-header">Small</th>
                        <th className="table-header">Medium</th>
                        <th className="table-header">Large</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {['sedan', 'suv', 'van', 'bus'].map(type => (
                        <tr key={`hour-${type}`} className="hover:bg-secondary-50">
                          <td className="table-cell font-medium capitalize">{type}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.per_hour_rates?.[type]?.small || 0}
                                onChange={(e) => {
                                  const perHourRates = { ...(settings.pricing?.per_hour_rates || {}) }
                                  if (!perHourRates[type]) perHourRates[type] = {}
                                  perHourRates[type].small = parseFloat(e.target.value)
                                  updateSetting('pricing', 'per_hour_rates', perHourRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.per_hour_rates?.[type]?.medium || 0}
                                onChange={(e) => {
                                  const perHourRates = { ...(settings.pricing?.per_hour_rates || {}) }
                                  if (!perHourRates[type]) perHourRates[type] = {}
                                  perHourRates[type].medium = parseFloat(e.target.value)
                                  updateSetting('pricing', 'per_hour_rates', perHourRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.per_hour_rates?.[type]?.large || 0}
                                onChange={(e) => {
                                  const perHourRates = { ...(settings.pricing?.per_hour_rates || {}) }
                                  if (!perHourRates[type]) perHourRates[type] = {}
                                  perHourRates[type].large = parseFloat(e.target.value)
                                  updateSetting('pricing', 'per_hour_rates', perHourRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mid-Stop Rates */}
              <div>
                <h4 className="text-md font-medium text-secondary-800 mb-4">Mid-Stop Rates (per stop)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-secondary-200">
                        <th className="table-header">Vehicle Type</th>
                        <th className="table-header">Small</th>
                        <th className="table-header">Medium</th>
                        <th className="table-header">Large</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {['sedan', 'suv', 'van', 'bus'].map(type => (
                        <tr key={`midstop-${type}`} className="hover:bg-secondary-50">
                          <td className="table-cell font-medium capitalize">{type}</td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.midstop_rates?.[type]?.small || 0}
                                onChange={(e) => {
                                  const midstopRates = { ...(settings.pricing?.midstop_rates || {}) }
                                  if (!midstopRates[type]) midstopRates[type] = {}
                                  midstopRates[type].small = parseFloat(e.target.value)
                                  updateSetting('pricing', 'midstop_rates', midstopRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.midstop_rates?.[type]?.medium || 0}
                                onChange={(e) => {
                                  const midstopRates = { ...(settings.pricing?.midstop_rates || {}) }
                                  if (!midstopRates[type]) midstopRates[type] = {}
                                  midstopRates[type].medium = parseFloat(e.target.value)
                                  updateSetting('pricing', 'midstop_rates', midstopRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center">
                              <span className="text-secondary-500 mr-2">$</span>
                              <input
                                type="number"
                                value={settings.pricing?.midstop_rates?.[type]?.large || 0}
                                onChange={(e) => {
                                  const midstopRates = { ...(settings.pricing?.midstop_rates || {}) }
                                  if (!midstopRates[type]) midstopRates[type] = {}
                                  midstopRates[type].large = parseFloat(e.target.value)
                                  updateSetting('pricing', 'midstop_rates', midstopRates)
                                }}
                                min="0"
                                step="0.01"
                                className="w-20 px-2 py-1 border border-secondary-300 rounded"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Pricing Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Minimum Fare ($)
                  </label>
                  <input
                    type="number"
                    value={settings.pricing?.minimum_fare || 15}
                    onChange={(e) => updateSetting('pricing', 'minimum_fare', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Cancellation Fee ($)
                  </label>
                  <input
                    type="number"
                    value={settings.pricing?.cancellation_fee || 10}
                    onChange={(e) => updateSetting('pricing', 'cancellation_fee', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="input-field"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="dynamic_pricing"
                    checked={settings.pricing?.dynamic_pricing || false}
                    onChange={(e) => updateSetting('pricing', 'dynamic_pricing', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="dynamic_pricing" className="text-sm font-medium text-secondary-700">
                    Enable Dynamic Pricing
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="surge_pricing"
                    checked={settings.pricing?.surge_pricing || false}
                    onChange={(e) => updateSetting('pricing', 'surge_pricing', e.target.checked)}
                    className="w-4 h-4 text-ice-600 border-secondary-300 rounded focus:ring-ice-500"
                  />
                  <label htmlFor="surge_pricing" className="text-sm font-medium text-secondary-700">
                    Enable Surge Pricing
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings