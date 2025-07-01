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
  EyeOff,
  Bell,
  CreditCard,
  Zap,
  Activity,
  History,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('commission')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState({})
  const [auditLog, setAuditLog] = useState([])
  const [showAuditLog, setShowAuditLog] = useState(false)
  
  const [settings, setSettings] = useState({})

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

  const fetchAuditLog = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/settings/audit/log?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAuditLog(data.auditLogs)
      }
    } catch (error) {
      console.error('Error fetching audit log:', error)
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
          settings: settings[category] || {}
        })
      })
      
      if (response.ok) {
        toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`)
        // Refresh settings to get updated values
        await fetchSettings()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to save settings')
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
          ...prev[category]?.[parentKey],
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
          ...prev[category]?.[parentKey],
          [childKey]: {
            ...prev[category]?.[parentKey]?.[childKey],
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

  const resetCategory = async (category) => {
    if (!confirm(`Are you sure you want to reset all ${category} settings to defaults? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/settings/reset/${category}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        toast.success(`${category} settings reset to defaults`)
        await fetchSettings()
      } else {
        toast.error('Failed to reset settings')
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error('Failed to reset settings')
    }
  }

  const tabs = [
    { id: 'commission', label: 'Commission & Pricing', icon: DollarSign },
    { id: 'system', label: 'System Settings', icon: SettingsIcon },
    { id: 'email', label: 'Email Configuration', icon: Mail },
    { id: 'sms', label: 'SMS Configuration', icon: Phone },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'business', label: 'Business Rules', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment Settings', icon: CreditCard },
    { id: 'features', label: 'Feature Flags', icon: Zap },
    { id: 'maintenance', label: 'Maintenance', icon: Activity }
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
          <h1 className="text-2xl font-bold text-secondary-900">System Settings</h1>
          <p className="text-secondary-600">Configure system-wide settings and business rules</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setShowAuditLog(!showAuditLog)
              if (!showAuditLog) fetchAuditLog()
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <History className="w-4 h-4" />
            <span>Audit Log</span>
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

      {/* Warning Banner */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-warning-600" />
          <p className="text-warning-800 font-medium">
            Caution: Changes to these settings affect the entire system. Please review carefully before saving.
          </p>
        </div>
      </div>

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
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
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="table-header">Date</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Setting</th>
                      <th className="table-header">Changed By</th>
                      <th className="table-header">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {auditLog.map((log) => (
                      <tr key={log.audit_id} className="hover:bg-secondary-50">
                        <td className="table-cell text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="table-cell">
                          <span className="status-badge status-confirmed">{log.category}</span>
                        </td>
                        <td className="table-cell font-medium">{log.setting_key}</td>
                        <td className="table-cell">{log.changed_by_name || 'System'}</td>
                        <td className="table-cell text-sm">
                          <div className="max-w-xs truncate">
                            {log.old_value} → {log.new_value}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

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
        {/* Commission & Pricing Settings */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            {/* Commission Rates */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900">Commission Rates</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => resetCategory('commission')}
                    className="btn-secondary text-sm"
                  >
                    Reset to Defaults
                  </button>
                  <button
                    onClick={() => saveSettings('commission')}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
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
                      value={settings.commission?.individual_driver_rate || 20}
                      onChange={(e) => updateSetting('commission', 'individual_driver_rate', parseFloat(e.target.value))}
                      className="input-field pr-8"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Driver gets {100 - (settings.commission?.individual_driver_rate || 20)}%, Admin gets {settings.commission?.individual_driver_rate || 20}%
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
                      value={settings.commission?.fleet_partner_rate || 15}
                      onChange={(e) => updateSetting('commission', 'fleet_partner_rate', parseFloat(e.target.value))}
                      className="input-field pr-8"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  </div>
                  <p className="text-xs text-secondary-500 mt-1">
                    Fleet gets {100 - (settings.commission?.fleet_partner_rate || 15)}%, Admin gets {settings.commission?.fleet_partner_rate || 15}%
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
                      value={settings.commission?.tax_rate || 13}
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
                    value={settings.commission?.currency || 'CAD'}
                    onChange={(e) => updateSetting('commission', 'currency', e.target.value)}
                    className="input-field"
                  >
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Processing Fee (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={settings.commission?.payment_processing_fee || 2.9}
                      onChange={(e) => updateSetting('commission', 'payment_processing_fee', parseFloat(e.target.value))}
                      className="input-field pr-8"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Pricing */}
            {settings.pricing && (
              <div className="card">
                <h3 className="text-lg font-semibold text-secondary-900 mb-6">Vehicle Pricing Configuration</h3>
                
                {Object.keys(settings.pricing.base_rates || {}).map((vehicleType) => (
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
                        {Object.keys(settings.pricing.base_rates[vehicleType] || {}).map((size) => (
                          <div key={size} className="mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={settings.pricing.base_rates[vehicleType][size] || 0}
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
                        {Object.keys(settings.pricing.per_km_rates?.[vehicleType] || {}).map((size) => (
                          <div key={size} className="mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={settings.pricing.per_km_rates[vehicleType][size] || 0}
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
                        {Object.keys(settings.pricing.per_hour_rates?.[vehicleType] || {}).map((size) => (
                          <div key={size} className="mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={settings.pricing.per_hour_rates[vehicleType][size] || 0}
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
                        {Object.keys(settings.pricing.midstop_rates?.[vehicleType] || {}).map((size) => (
                          <div key={size} className="mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-secondary-500 w-12 capitalize">{size}:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={settings.pricing.midstop_rates[vehicleType][size] || 0}
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
            )}
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Configuration</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('system')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('system')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
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
                  type="tel"
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
                  Website URL
                </label>
                <input
                  type="url"
                  value={settings.system?.website_url || ''}
                  onChange={(e) => updateSetting('system', 'website_url', e.target.value)}
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
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour (AM/PM)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    checked={settings.system?.maintenance_mode || false}
                    onChange={(e) => updateSetting('system', 'maintenance_mode', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="maintenance_mode" className="text-sm font-medium text-secondary-700">
                    Enable Maintenance Mode
                  </label>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  When enabled, the system will show a maintenance page to users
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Email Configuration</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('email')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('email')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="smtp_enabled"
                  checked={settings.email?.smtp_enabled || false}
                  onChange={(e) => updateSetting('email', 'smtp_enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="smtp_enabled" className="text-sm font-medium text-secondary-700">
                  Enable Email Notifications
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
                    placeholder="smtp.gmail.com"
                    disabled={!settings.email?.smtp_enabled}
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
                    disabled={!settings.email?.smtp_enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={settings.email?.smtp_user === '***HIDDEN***' ? '' : settings.email?.smtp_user || ''}
                    onChange={(e) => updateSetting('email', 'smtp_user', e.target.value)}
                    className="input-field"
                    disabled={!settings.email?.smtp_enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.smtp_password ? 'text' : 'password'}
                      value={settings.email?.smtp_password === '***HIDDEN***' ? '' : settings.email?.smtp_password || ''}
                      onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                      className="input-field pr-10"
                      disabled={!settings.email?.smtp_enabled}
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
                    disabled={!settings.email?.smtp_enabled}
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
                    disabled={!settings.email?.smtp_enabled}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Settings */}
        {activeTab === 'sms' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">SMS Configuration</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('sms')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('sms')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sms_enabled"
                  checked={settings.sms?.enabled || false}
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
                    SMS Provider
                  </label>
                  <select
                    value={settings.sms?.provider || 'twilio'}
                    onChange={(e) => updateSetting('sms', 'provider', e.target.value)}
                    className="input-field"
                    disabled={!settings.sms?.enabled}
                  >
                    <option value="twilio">Twilio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Twilio Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.sms?.twilio_phone || ''}
                    onChange={(e) => updateSetting('sms', 'twilio_phone', e.target.value)}
                    className="input-field"
                    placeholder="+1234567890"
                    disabled={!settings.sms?.enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Twilio Account SID
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.twilio_sid ? 'text' : 'password'}
                      value={settings.sms?.twilio_sid === '***HIDDEN***' ? '' : settings.sms?.twilio_sid || ''}
                      onChange={(e) => updateSetting('sms', 'twilio_sid', e.target.value)}
                      className="input-field pr-10"
                      disabled={!settings.sms?.enabled}
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
                      value={settings.sms?.twilio_token === '***HIDDEN***' ? '' : settings.sms?.twilio_token || ''}
                      onChange={(e) => updateSetting('sms', 'twilio_token', e.target.value)}
                      className="input-field pr-10"
                      disabled={!settings.sms?.enabled}
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
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Security Configuration</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('security')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('security')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  JWT Token Expiry
                </label>
                <select
                  value={settings.security?.jwt_expiry || '24h'}
                  onChange={(e) => updateSetting('security', 'jwt_expiry', e.target.value)}
                  className="input-field"
                >
                  <option value="1h">1 Hour</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
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
                  value={settings.security?.password_min_length || 8}
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
                  value={settings.security?.max_login_attempts || 5}
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
                  min="5"
                  max="120"
                  value={settings.security?.session_timeout || 30}
                  onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="require_email_verification"
                    checked={settings.security?.require_email_verification || false}
                    onChange={(e) => updateSetting('security', 'require_email_verification', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="require_email_verification" className="text-sm font-medium text-secondary-700">
                    Require Email Verification
                  </label>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  When enabled, users must verify their email address before accessing the system
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Business Rules */}
        {activeTab === 'business' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Business Rules</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('business')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('business')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Minimum Trip Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.business?.min_trip_amount || 25}
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
                    max="72"
                    value={settings.business?.max_trip_duration || 24}
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
                    max="48"
                    value={settings.business?.booking_advance_hours || 2}
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
                    value={settings.business?.cancellation_hours || 4}
                    onChange={(e) => updateSetting('business', 'cancellation_hours', parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="auto_approve_drivers"
                    checked={settings.business?.auto_approve_drivers || false}
                    onChange={(e) => updateSetting('business', 'auto_approve_drivers', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
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
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="auto_approve_vehicles" className="text-sm font-medium text-secondary-700">
                    Auto-approve Vehicle Registrations
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="require_driver_documents"
                    checked={settings.business?.require_driver_documents || true}
                    onChange={(e) => updateSetting('business', 'require_driver_documents', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="require_driver_documents" className="text-sm font-medium text-secondary-700">
                    Require Driver Documents
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Notification Settings</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('notifications')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('notifications')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-md font-medium text-secondary-800">Email Notifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_booking_confirmation"
                    checked={settings.notifications?.email_booking_confirmation || true}
                    onChange={(e) => updateSetting('notifications', 'email_booking_confirmation', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="email_booking_confirmation" className="text-sm font-medium text-secondary-700">
                    Booking Confirmations
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_trip_updates"
                    checked={settings.notifications?.email_trip_updates || true}
                    onChange={(e) => updateSetting('notifications', 'email_trip_updates', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="email_trip_updates" className="text-sm font-medium text-secondary-700">
                    Trip Status Updates
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="email_payment_receipts"
                    checked={settings.notifications?.email_payment_receipts || true}
                    onChange={(e) => updateSetting('notifications', 'email_payment_receipts', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
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
                    checked={settings.notifications?.sms_booking_confirmation || true}
                    onChange={(e) => updateSetting('notifications', 'sms_booking_confirmation', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="sms_booking_confirmation" className="text-sm font-medium text-secondary-700">
                    Booking Confirmations
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_trip_started"
                    checked={settings.notifications?.sms_trip_started || true}
                    onChange={(e) => updateSetting('notifications', 'sms_trip_started', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="sms_trip_started" className="text-sm font-medium text-secondary-700">
                    Trip Started Alerts
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="sms_trip_completed"
                    checked={settings.notifications?.sms_trip_completed || true}
                    onChange={(e) => updateSetting('notifications', 'sms_trip_completed', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
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
                    checked={settings.notifications?.admin_new_bookings || true}
                    onChange={(e) => updateSetting('notifications', 'admin_new_bookings', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="admin_new_bookings" className="text-sm font-medium text-secondary-700">
                    New Booking Notifications
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="admin_driver_registrations"
                    checked={settings.notifications?.admin_driver_registrations || true}
                    onChange={(e) => updateSetting('notifications', 'admin_driver_registrations', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="admin_driver_registrations" className="text-sm font-medium text-secondary-700">
                    Driver Registration Notifications
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Payment Settings</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('payment')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('payment')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="stripe_enabled"
                  checked={settings.payment?.stripe_enabled || false}
                  onChange={(e) => updateSetting('payment', 'stripe_enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
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
                    value={settings.payment?.stripe_public_key || ''}
                    onChange={(e) => updateSetting('payment', 'stripe_public_key', e.target.value)}
                    className="input-field"
                    placeholder="pk_test_..."
                    disabled={!settings.payment?.stripe_enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Stripe Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.stripe_secret_key ? 'text' : 'password'}
                      value={settings.payment?.stripe_secret_key === '***HIDDEN***' ? '' : settings.payment?.stripe_secret_key || ''}
                      onChange={(e) => updateSetting('payment', 'stripe_secret_key', e.target.value)}
                      className="input-field pr-10"
                      placeholder="sk_test_..."
                      disabled={!settings.payment?.stripe_enabled}
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

              <div className="flex items-center space-x-3 mt-4">
                <input
                  type="checkbox"
                  id="require_payment_upfront"
                  checked={settings.payment?.require_payment_upfront || false}
                  onChange={(e) => updateSetting('payment', 'require_payment_upfront', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="require_payment_upfront" className="text-sm font-medium text-secondary-700">
                  Require Payment Upfront
                </label>
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                When enabled, customers must pay for trips at the time of booking
              </p>
            </div>
          </div>
        )}

        {/* Feature Flags */}
        {activeTab === 'features' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Feature Flags</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('features')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('features')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="fleet_partners_enabled"
                  checked={settings.features?.fleet_partners_enabled || true}
                  onChange={(e) => updateSetting('features', 'fleet_partners_enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="fleet_partners_enabled" className="text-sm font-medium text-secondary-700">
                  Fleet Partners
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="multi_stop_trips"
                  checked={settings.features?.multi_stop_trips || true}
                  onChange={(e) => updateSetting('features', 'multi_stop_trips', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="multi_stop_trips" className="text-sm font-medium text-secondary-700">
                  Multi-Stop Trips
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="real_time_tracking"
                  checked={settings.features?.real_time_tracking || true}
                  onChange={(e) => updateSetting('features', 'real_time_tracking', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="real_time_tracking" className="text-sm font-medium text-secondary-700">
                  Real-Time Tracking
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="driver_ratings"
                  checked={settings.features?.driver_ratings || true}
                  onChange={(e) => updateSetting('features', 'driver_ratings', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="driver_ratings" className="text-sm font-medium text-secondary-700">
                  Driver Ratings
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="trip_scheduling"
                  checked={settings.features?.trip_scheduling || true}
                  onChange={(e) => updateSetting('features', 'trip_scheduling', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="trip_scheduling" className="text-sm font-medium text-secondary-700">
                  Trip Scheduling
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="loyalty_program"
                  checked={settings.features?.loyalty_program || false}
                  onChange={(e) => updateSetting('features', 'loyalty_program', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="loyalty_program" className="text-sm font-medium text-secondary-700">
                  Loyalty Program
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="referral_program"
                  checked={settings.features?.referral_program || false}
                  onChange={(e) => updateSetting('features', 'referral_program', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="referral_program" className="text-sm font-medium text-secondary-700">
                  Referral Program
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="corporate_accounts"
                  checked={settings.features?.corporate_accounts || false}
                  onChange={(e) => updateSetting('features', 'corporate_accounts', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="corporate_accounts" className="text-sm font-medium text-secondary-700">
                  Corporate Accounts
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Settings */}
        {activeTab === 'maintenance' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">Maintenance Settings</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => resetCategory('maintenance')}
                  className="btn-secondary text-sm"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => saveSettings('maintenance')}
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="backup_enabled"
                  checked={settings.maintenance?.backup_enabled || true}
                  onChange={(e) => updateSetting('maintenance', 'backup_enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="backup_enabled" className="text-sm font-medium text-secondary-700">
                  Enable Automatic Backups
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Backup Frequency
                  </label>
                  <select
                    value={settings.maintenance?.backup_frequency || 'daily'}
                    onChange={(e) => updateSetting('maintenance', 'backup_frequency', e.target.value)}
                    className="input-field"
                    disabled={!settings.maintenance?.backup_enabled}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Log Level
                  </label>
                  <select
                    value={settings.maintenance?.log_level || 'info'}
                    onChange={(e) => updateSetting('maintenance', 'log_level', e.target.value)}
                    className="input-field"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Backup Retention (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.maintenance?.backup_retention_days || 30}
                    onChange={(e) => updateSetting('maintenance', 'backup_retention_days', parseInt(e.target.value))}
                    className="input-field"
                    disabled={!settings.maintenance?.backup_enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Log Retention (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.maintenance?.log_retention_days || 7}
                    onChange={(e) => updateSetting('maintenance', 'log_retention_days', parseInt(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-4">
                <input
                  type="checkbox"
                  id="health_check_enabled"
                  checked={settings.maintenance?.health_check_enabled || true}
                  onChange={(e) => updateSetting('maintenance', 'health_check_enabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="health_check_enabled" className="text-sm font-medium text-secondary-700">
                  Enable Health Checks
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings