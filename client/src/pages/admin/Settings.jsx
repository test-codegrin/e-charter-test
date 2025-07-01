import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  DollarSign, 
  Percent, 
  Globe, 
  Mail, 
  Phone, 
  Shield, 
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('commission')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  
  const [settings, setSettings] = useState({
    // Commission Settings
    commission: {
      individual_driver_rate: 20,
      fleet_partner_rate: 15,
      tax_rate: 13,
      currency: 'CAD'
    },
    
    // Pricing Settings
    pricing: {
      base_rates: {
        sedan: { small: 50, medium: 60, large: 70 },
        suv: { small: 70, medium: 80, large: 90 },
        van: { small: 80, medium: 100, large: 120 },
        bus: { small: 150, medium: 200, large: 250 }
      },
      per_km_rates: {
        sedan: { small: 2.5, medium: 3.0, large: 3.5 },
        suv: { small: 3.5, medium: 4.0, large: 4.5 },
        van: { small: 4.0, medium: 5.0, large: 6.0 },
        bus: { small: 7.5, medium: 10.0, large: 12.5 }
      },
      per_hour_rates: {
        sedan: { small: 25, medium: 30, large: 35 },
        suv: { small: 35, medium: 40, large: 45 },
        van: { small: 40, medium: 50, large: 60 },
        bus: { small: 75, medium: 100, large: 125 }
      },
      midstop_rates: {
        sedan: { small: 15, medium: 20, large: 25 },
        suv: { small: 25, medium: 30, large: 35 },
        van: { small: 30, medium: 40, large: 50 },
        bus: { small: 60, medium: 80, large: 100 }
      }
    },
    
    // System Settings
    system: {
      company_name: 'eCharter',
      company_email: 'admin@echarter.co',
      company_phone: '+1-800-CHARTER',
      support_email: 'support@echarter.co',
      website_url: 'https://echarter.co',
      timezone: 'America/Toronto',
      date_format: 'YYYY-MM-DD',
      time_format: '24h'
    },
    
    // Email Settings
    email: {
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '',
      from_name: 'eCharter',
      from_email: 'noreply@echarter.co'
    },
    
    // SMS Settings
    sms: {
      twilio_sid: '',
      twilio_token: '',
      twilio_phone: '',
      enabled: false
    },
    
    // Security Settings
    security: {
      jwt_expiry: '24h',
      password_min_length: 8,
      require_email_verification: false,
      max_login_attempts: 5,
      session_timeout: 30
    },
    
    // Business Rules
    business: {
      auto_approve_drivers: false,
      auto_approve_vehicles: false,
      require_driver_documents: true,
      min_trip_amount: 25,
      max_trip_duration: 24,
      booking_advance_hours: 2,
      cancellation_hours: 4
    }
  })

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
        setSettings(prev => ({ ...prev, ...data.settings }))
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
        toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`)
      } else {
        toast.error('Failed to save settings')
      }
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

  const updateNestedSetting = (category, parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [childKey]: value
        }
      }
    }))
  }

  const updateDeepNestedSetting = (category, parentKey, childKey, grandChildKey, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentKey]: {
          ...prev[category][parentKey],
          [childKey]: {
            ...prev[category][parentKey][childKey],
            [grandChildKey]: value
          }
        }
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
    { id: 'commission', label: 'Commission & Pricing', icon: DollarSign },
    { id: 'system', label: 'System Settings', icon: SettingsIcon },
    { id: 'email', label: 'Email Configuration', icon: Mail },
    { id: 'sms', label: 'SMS Configuration', icon: Phone },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'business', label: 'Business Rules', icon: Database }
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">System Settings</h1>
        <p className="text-secondary-600">Configure system-wide settings and business rules</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-warning-600" />
          <p className="text-warning-800 font-medium">
            Caution: Changes to these settings affect the entire system. Please review carefully before saving.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
        {/* Commission & Pricing Settings */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            {/* Commission Rates */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Commission Rates</h3>
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
                    Individual Driver Commission (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.commission.individual_driver_rate}
                      onChange={(e) => updateSetting('commission', 'individual_driver_rate', parseFloat(e.target.value))}
                      className="input-field pr-8"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Driver gets {100 - settings.commission.individual_driver_rate}%, Admin gets {settings.commission.individual_driver_rate}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Fleet Partner Commission (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.commission.fleet_partner_rate}
                      onChange={(e) => updateSetting('commission', 'fleet_partner_rate', parseFloat(e.target.value))}
                      className="input-field pr-8"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Fleet gets {100 - settings.commission.fleet_partner_rate}%, Admin gets {settings.commission.fleet_partner_rate}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.commission.tax_rate}
                      onChange={(e) => updateSetting('commission', 'tax_rate', parseFloat(e.target.value))}
                      className="input-field pr-8"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  </div>
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
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Pricing */}
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-900 mb-6">Vehicle Pricing Configuration</h3>
              
              {Object.keys(settings.pricing.base_rates).map((vehicleType) => (
                <div key={vehicleType} className="mb-8">
                  <h4 className="text-md font-medium text-secondary-800 mb-4 capitalize">
                    {vehicleType} Pricing
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Base Rates */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Base Rates ($)
                      </label>
                      {Object.keys(settings.pricing.base_rates[vehicleType]).map((size) => (
                        <div key={size} className="mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={settings.pricing.base_rates[vehicleType][size]}
                              onChange={(e) => updateDeepNestedSetting('pricing', 'base_rates', vehicleType, size, parseFloat(e.target.value))}
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Per KM Rates */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Per KM Rates ($)
                      </label>
                      {Object.keys(settings.pricing.per_km_rates[vehicleType]).map((size) => (
                        <div key={size} className="mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={settings.pricing.per_km_rates[vehicleType][size]}
                              onChange={(e) => updateDeepNestedSetting('pricing', 'per_km_rates', vehicleType, size, parseFloat(e.target.value))}
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Per Hour Rates */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Per Hour Rates ($)
                      </label>
                      {Object.keys(settings.pricing.per_hour_rates[vehicleType]).map((size) => (
                        <div key={size} className="mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={settings.pricing.per_hour_rates[vehicleType][size]}
                              onChange={(e) => updateDeepNestedSetting('pricing', 'per_hour_rates', vehicleType, size, parseFloat(e.target.value))}
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Midstop Rates */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Midstop Rates ($)
                      </label>
                      {Object.keys(settings.pricing.midstop_rates[vehicleType]).map((size) => (
                        <div key={size} className="mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={settings.pricing.midstop_rates[vehicleType][size]}
                              onChange={(e) => updateDeepNestedSetting('pricing', 'midstop_rates', vehicleType, size, parseFloat(e.target.value))}
                              className="input-field text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Configuration</h3>
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
                  type="tel"
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
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                  <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                  <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.system.date_format}
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
                  value={settings.system.time_format}
                  onChange={(e) => updateSetting('system', 'time_format', e.target.value)}
                  className="input-field"
                >
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour (AM/PM)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Email Configuration</h3>
              <button
                onClick={() => saveSettings('email')}
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
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.email.smtp_host}
                  onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                  className="input-field"
                  placeholder="smtp.gmail.com"
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  SMTP Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.smtp_password ? 'text' : 'password'}
                    value={settings.email.smtp_password}
                    onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                    className="input-field pr-10"
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
                  value={settings.email.from_name}
                  onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                  className="input-field"
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
                />
              </div>
            </div>
          </div>
        )}

        {/* SMS Settings */}
        {activeTab === 'sms' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">SMS Configuration</h3>
              <button
                onClick={() => saveSettings('sms')}
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
                  id="sms_enabled"
                  checked={settings.sms.enabled}
                  onChange={(e) => updateSetting('sms', 'enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="sms_enabled" className="text-sm font-medium text-secondary-700">
                  Enable SMS Notifications
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Twilio Account SID
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.twilio_sid ? 'text' : 'password'}
                      value={settings.sms.twilio_sid}
                      onChange={(e) => updateSetting('sms', 'twilio_sid', e.target.value)}
                      className="input-field pr-10"
                      disabled={!settings.sms.enabled}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('twilio_sid')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPasswords.twilio_sid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Twilio Auth Token
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.twilio_token ? 'text' : 'password'}
                      value={settings.sms.twilio_token}
                      onChange={(e) => updateSetting('sms', 'twilio_token', e.target.value)}
                      className="input-field pr-10"
                      disabled={!settings.sms.enabled}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('twilio_token')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    >
                      {showPasswords.twilio_token ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Twilio Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.sms.twilio_phone}
                    onChange={(e) => updateSetting('sms', 'twilio_phone', e.target.value)}
                    className="input-field"
                    placeholder="+1234567890"
                    disabled={!settings.sms.enabled}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Security Configuration</h3>
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
                <select
                  value={settings.security.jwt_expiry}
                  onChange={(e) => updateSetting('security', 'jwt_expiry', e.target.value)}
                  className="input-field"
                >
                  <option value="1h">1 Hour</option>
                  <option value="8h">8 Hours</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Minimum Password Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.security.password_min_length}
                  onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.security.max_login_attempts}
                  onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={settings.security.session_timeout}
                  onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="require_email_verification"
                    checked={settings.security.require_email_verification}
                    onChange={(e) => updateSetting('security', 'require_email_verification', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="require_email_verification" className="text-sm font-medium text-secondary-700">
                    Require Email Verification for New Accounts
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Rules */}
        {activeTab === 'business' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Business Rules</h3>
              <button
                onClick={() => saveSettings('business')}
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Auto Approval Settings */}
              <div>
                <h4 className="text-md font-medium text-secondary-800 mb-4">Auto Approval Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="auto_approve_drivers"
                      checked={settings.business.auto_approve_drivers}
                      onChange={(e) => updateSetting('business', 'auto_approve_drivers', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="auto_approve_drivers" className="text-sm font-medium text-secondary-700">
                      Auto-approve new driver registrations
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="auto_approve_vehicles"
                      checked={settings.business.auto_approve_vehicles}
                      onChange={(e) => updateSetting('business', 'auto_approve_vehicles', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="auto_approve_vehicles" className="text-sm font-medium text-secondary-700">
                      Auto-approve new vehicle registrations
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="require_driver_documents"
                      checked={settings.business.require_driver_documents}
                      onChange={(e) => updateSetting('business', 'require_driver_documents', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="require_driver_documents" className="text-sm font-medium text-secondary-700">
                      Require driver documents for approval
                    </label>
                  </div>
                </div>
              </div>

              {/* Trip Settings */}
              <div>
                <h4 className="text-md font-medium text-secondary-800 mb-4">Trip Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Minimum Trip Amount ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.business.min_trip_amount}
                      onChange={(e) => updateSetting('business', 'min_trip_amount', parseFloat(e.target.value))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Maximum Trip Duration (hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={settings.business.max_trip_duration}
                      onChange={(e) => updateSetting('business', 'max_trip_duration', parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Booking Advance Notice (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="72"
                      value={settings.business.booking_advance_hours}
                      onChange={(e) => updateSetting('business', 'booking_advance_hours', parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Cancellation Notice (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={settings.business.cancellation_hours}
                      onChange={(e) => updateSetting('business', 'cancellation_hours', parseInt(e.target.value))}
                      className="input-field"
                    />
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

export default Settings