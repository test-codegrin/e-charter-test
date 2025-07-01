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
  History
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
                  ×
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

        {/* Add other tab content here following the same pattern... */}
        {/* For brevity, I'll show the structure for other tabs */}
        
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

        {/* Continue with other tabs... */}
      </div>
    </div>
  )
}

export default Settings