const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");
const settingsQueries = require("../config/settingsQueries/settingsQueries");

// Cache for settings to improve performance
let settingsCache = {};
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get all system settings with caching
const getSettings = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching system settings...");

    // Check cache first
    if (Date.now() < cacheExpiry && Object.keys(settingsCache).length > 0) {
      console.log("Returning cached settings");
      return res.status(200).json({
        message: "Settings fetched successfully (cached)",
        settings: settingsCache
      });
    }

    // Fetch from database
    const settings = await fetchSettingsFromDB();
    
    // Update cache
    settingsCache = settings;
    cacheExpiry = Date.now() + CACHE_DURATION;

    res.status(200).json({
      message: "Settings fetched successfully",
      settings
    });

  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Fetch settings from database with proper type conversion
const fetchSettingsFromDB = async () => {
  try {
    // Ensure settings table exists
    await ensureSettingsTableExists();

    // Get all settings
    const [settingsRows] = await db.query(
      settingsQueries.getAllSettings
    );

    // Organize settings by category
    const settings = {};
    
    settingsRows.forEach(row => {
      if (!settings[row.category]) {
        settings[row.category] = {};
      }
      
      // Convert value based on type
      let value = row.setting_value;
      
      switch (row.setting_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'json':
        case 'array':
          try {
            value = JSON.parse(value);
          } catch {
            value = row.setting_value;
          }
          break;
        default:
          // Keep as string
          break;
      }
      
      // Hide sensitive values in response
      if (row.is_sensitive && value) {
        value = '***HIDDEN***';
      }
      
      settings[row.category][row.setting_key] = value;
    });

    // Get current pricing from vehicle_pricing table
    try {
      const [pricingRows] = await db.query(
        settingsQueries.selectPricingData
      );

      if (pricingRows.length > 0) {
        const pricing = {
          base_rates: {},
          per_km_rates: {},
          per_hour_rates: {},
          midstop_rates: {}
        };

        pricingRows.forEach(row => {
          const type = row.carType.toLowerCase();
          const size = row.carSize.toLowerCase();

          if (!pricing.base_rates[type]) {
            pricing.base_rates[type] = {};
            pricing.per_km_rates[type] = {};
            pricing.per_hour_rates[type] = {};
            pricing.midstop_rates[type] = {};
          }

          pricing.base_rates[type][size] = parseFloat(row.base_rate);
          pricing.per_km_rates[type][size] = parseFloat(row.per_km_rate);
          pricing.per_hour_rates[type][size] = parseFloat(row.per_hour_rate);
          pricing.midstop_rates[type][size] = parseFloat(row.midstop_rate);
        });

        settings.pricing = { ...settings.pricing, ...pricing };
      }
    } catch (pricingError) {
      console.log("Could not fetch pricing data:", pricingError.message);
    }

    // If no settings exist, return defaults
    if (Object.keys(settings).length === 0) {
      return getDefaultSettings();
    }

    return settings;

  } catch (error) {
    console.error("Error fetching settings from database:", error);
    return getDefaultSettings();
  }
};

// Update system settings with audit logging
const updateSettings = asyncHandler(async (req, res) => {
  try {
    const { category, settings } = req.body;
    const adminId = req.user?.admin_id;

    console.log(`Updating ${category} settings:`, settings);

    if (!category || !settings) {
      return res.status(400).json({ message: "Category and settings are required" });
    }

    // Ensure settings table exists
    await ensureSettingsTableExists();

    // Handle pricing updates separately
    if (category === 'pricing' && (settings.base_rates || settings.per_km_rates || settings.per_hour_rates || settings.midstop_rates)) {
      await updatePricingSettings(settings);
    }

    // Update other settings
    for (const [key, value] of Object.entries(settings)) {
      if (key === 'base_rates' || key === 'per_km_rates' || key === 'per_hour_rates' || key === 'midstop_rates') {
        continue; // Skip pricing rates as they're handled separately
      }

      // Get current value for audit log
      const [currentSetting] = await db.query(
        settingsQueries.selectSettingRowForUpdate,
         [category, key]);

      // Determine setting type and convert value
      let settingValue;
      let settingType = 'string';

      if (typeof value === 'boolean') {
        settingType = 'boolean';
        settingValue = value.toString();
      } else if (typeof value === 'number') {
        settingType = 'number';
        settingValue = value.toString();
      } else if (typeof value === 'object') {
        settingType = Array.isArray(value) ? 'array' : 'json';
        settingValue = JSON.stringify(value);
      } else {
        settingValue = value.toString();
      }

      // Update or insert setting
      const [result] = await db.query(
        settingsQueries.insertOrUpdateSetting, [category, key, settingValue, settingType]);

      // Log the change for audit
      if (currentSetting.length > 0) {
        await logSettingChange(
          currentSetting[0].setting_id,
          category,
          key,
          currentSetting[0].setting_value,
          settingValue,
          adminId,
          req.ip,
          req.get('User-Agent')
        );
      }
    }

    // Clear cache
    settingsCache = {};
    cacheExpiry = 0;

    res.status(200).json({
      message: `${category.charAt(0).toUpperCase() + category.slice(1)} settings updated successfully`
    });

  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update pricing settings in vehicle_pricing table
const updatePricingSettings = async (pricingSettings) => {
  try {
    // Ensure vehicle_pricing table exists
    await db.query(
      settingsQueries.createVehiclePricingTable
    );

    // Update pricing for each vehicle type and size
    const { base_rates, per_km_rates, per_hour_rates, midstop_rates } = pricingSettings;

    if (base_rates) {
      for (const vehicleType of Object.keys(base_rates)) {
        for (const vehicleSize of Object.keys(base_rates[vehicleType])) {
          const baseRate = base_rates[vehicleType][vehicleSize];
          const perKmRate = per_km_rates?.[vehicleType]?.[vehicleSize] || 0;
          const perHourRate = per_hour_rates?.[vehicleType]?.[vehicleSize] || 0;
          const midstopRate = midstop_rates?.[vehicleType]?.[vehicleSize] || 0;

          await db.query(
            settingsQueries.upsertPricing
            , [vehicleType, vehicleSize, baseRate, perKmRate, perHourRate, midstopRate]);
        }
      }
    }

    console.log("Pricing settings updated successfully");
  } catch (error) {
    console.error("Error updating pricing settings:", error);
    throw error;
  }
};

// Get specific setting value
const getSetting = asyncHandler(async (req, res) => {
  try {
    const { category, key } = req.params;

    const [rows] = await db.query(
      settingsQueries.selectSettingByKey
     , [category, key]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Setting not found" });
    }

    const setting = rows[0];
    let value = setting.setting_value;

    // Convert value based on type
    switch (setting.setting_type) {
      case 'number':
        value = parseFloat(value);
        break;
      case 'boolean':
        value = value === 'true' || value === '1';
        break;
      case 'json':
      case 'array':
        try {
          value = JSON.parse(value);
        } catch {
          value = setting.setting_value;
        }
        break;
    }

    // Hide sensitive values
    if (setting.is_sensitive && value) {
      value = '***HIDDEN***';
    }

    res.status(200).json({
      message: "Setting fetched successfully",
      category,
      key,
      value,
      type: setting.setting_type,
      is_sensitive: setting.is_sensitive
    });

  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get settings by category
const getSettingsByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;

    const [rows] = await db.query(
      settingsQueries.selectSettingsByCategory, [category]);

    const settings = {};
    
    rows.forEach(row => {
      let value = row.setting_value;
      
      // Convert value based on type
      switch (row.setting_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'json':
        case 'array':
          try {
            value = JSON.parse(value);
          } catch {
            value = row.setting_value;
          }
          break;
      }
      
      // Hide sensitive values
      if (row.is_sensitive && value) {
        value = '***HIDDEN***';
      }
      
      settings[row.setting_key] = {
        value,
        type: row.setting_type,
        is_sensitive: row.is_sensitive,
        description: row.description
      };
    });

    res.status(200).json({
      message: `${category} settings fetched successfully`,
      category,
      settings
    });

  } catch (error) {
    console.error("Error fetching settings by category:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Reset settings to defaults - FIXED: Handle both cases properly
const resetSettings = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params; // This will be undefined for /reset route
    const adminId = req.user?.admin_id;

    if (category) {
      // Reset specific category
      await db.query(`DELETE FROM system_settings WHERE category = ?`, [category]);
      
      // Log the reset
      await db.query(
        settingsQueries.insertCategoryResetLog
      , [category, adminId, req.ip, req.get('User-Agent')]);
    } else {
      // Reset all settings
      await db.query(`DELETE FROM system_settings`);
      
      // Log the reset
      await db.query(
        settingsQueries.insertFullResetLog
      , [adminId, req.ip, req.get('User-Agent')]);
    }

    // Clear cache
    settingsCache = {};
    cacheExpiry = 0;

    res.status(200).json({
      message: category ? `${category} settings reset to defaults` : "All settings reset to defaults"
    });

  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get settings audit log
const getSettingsAuditLog = asyncHandler(async (req, res) => {
  try {
    const { limit = 50, offset = 0, category } = req.query;

    let query = settingsQueries.getAuditLog;
    
    const params = [];
    
    if (category) {
      query += ` WHERE sal.category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY sal.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [auditLogs] = await db.query(query, params);

    // Get total count
    let countQuery = settingsQueries.countAuditLog;
    const countParams = [];
    
    if (category) {
      countQuery += ` WHERE category = ?`;
      countParams.push(category);
    }
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      message: "Settings audit log fetched successfully",
      auditLogs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    });

  } catch (error) {
    console.error("Error fetching settings audit log:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Helper function to ensure settings table exists
const ensureSettingsTableExists = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NOT NULL,
        setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
        description TEXT DEFAULT NULL,
        is_sensitive BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_setting (category, setting_key)
      )
    `);

    await db.query(
      settingsQueries.createAuditLogTable
    );

    // Insert default settings if none exist
    const [existingSettings] = await db.query(`SELECT COUNT(*) as count FROM system_settings`);
    if (existingSettings[0].count === 0) {
      await insertDefaultSettings();
    }
  } catch (error) {
    console.error("Error ensuring settings tables exist:", error);
  }
};

// Insert default settings
const insertDefaultSettings = async () => {
  try {
    const defaultSettings = [
      // Commission Settings
      ['commission', 'individual_driver_rate', '20', 'number', 'Commission rate for individual drivers (%)', false],
      ['commission', 'fleet_partner_rate', '15', 'number', 'Commission rate for fleet partners (%)', false],
      ['commission', 'tax_rate', '13', 'number', 'Tax rate (HST) (%)', false],
      ['commission', 'currency', 'CAD', 'string', 'Default currency', false],
      ['commission', 'payment_processing_fee', '2.9', 'number', 'Payment processing fee (%)', false],

      // System Settings
      ['system', 'company_name', 'eCharter', 'string', 'Company name', false],
      ['system', 'company_email', 'admin@echarter.co', 'string', 'Company email address', false],
      ['system', 'company_phone', '+1-800-CHARTER', 'string', 'Company phone number', false],
      ['system', 'support_email', 'support@echarter.co', 'string', 'Support email address', false],
      ['system', 'website_url', 'https://echarter.co', 'string', 'Company website URL', false],
      ['system', 'timezone', 'America/Toronto', 'string', 'Default timezone', false],
      ['system', 'date_format', 'YYYY-MM-DD', 'string', 'Date format', false],
      ['system', 'time_format', '24h', 'string', 'Time format (12h/24h)', false],
      ['system', 'maintenance_mode', 'false', 'boolean', 'Maintenance mode status', false],

      // Email Settings
      ['email', 'smtp_enabled', 'true', 'boolean', 'Enable SMTP email', false],
      ['email', 'smtp_host', 'smtp.gmail.com', 'string', 'SMTP server host', false],
      ['email', 'smtp_port', '587', 'number', 'SMTP server port', false],
      ['email', 'smtp_user', '', 'string', 'SMTP username', true],
      ['email', 'smtp_password', '', 'string', 'SMTP password', true],
      ['email', 'from_name', 'eCharter', 'string', 'Email sender name', false],
      ['email', 'from_email', 'noreply@echarter.co', 'string', 'Email sender address', false],

      // SMS Settings
      ['sms', 'enabled', 'false', 'boolean', 'Enable SMS notifications', false],
      ['sms', 'provider', 'twilio', 'string', 'SMS provider (twilio)', false],
      ['sms', 'twilio_sid', '', 'string', 'Twilio Account SID', true],
      ['sms', 'twilio_token', '', 'string', 'Twilio Auth Token', true],
      ['sms', 'twilio_phone', '', 'string', 'Twilio phone number', false],

      // Security Settings
      ['security', 'jwt_expiry', '24h', 'string', 'JWT token expiry time', false],
      ['security', 'password_min_length', '8', 'number', 'Minimum password length', false],
      ['security', 'require_email_verification', 'false', 'boolean', 'Require email verification', false],
      ['security', 'max_login_attempts', '5', 'number', 'Maximum login attempts', false],
      ['security', 'session_timeout', '30', 'number', 'Session timeout (minutes)', false],

      // Business Rules
      ['business', 'auto_approve_drivers', 'false', 'boolean', 'Auto-approve driver registrations', false],
      ['business', 'auto_approve_vehicles', 'false', 'boolean', 'Auto-approve vehicle registrations', false],
      ['business', 'require_driver_documents', 'true', 'boolean', 'Require driver documents', false],
      ['business', 'min_trip_amount', '25', 'number', 'Minimum trip amount ($)', false],
      ['business', 'max_trip_duration', '24', 'number', 'Maximum trip duration (hours)', false],
      ['business', 'booking_advance_hours', '2', 'number', 'Minimum booking advance notice (hours)', false],
      ['business', 'cancellation_hours', '4', 'number', 'Cancellation notice required (hours)', false],

      // Notification Settings
      ['notifications', 'email_booking_confirmation', 'true', 'boolean', 'Email booking confirmations', false],
      ['notifications', 'email_trip_updates', 'true', 'boolean', 'Email trip status updates', false],
      ['notifications', 'sms_booking_confirmation', 'true', 'boolean', 'SMS booking confirmations', false],
      ['notifications', 'sms_trip_started', 'true', 'boolean', 'SMS when trip starts', false],
      ['notifications', 'admin_new_bookings', 'true', 'boolean', 'Notify admin of new bookings', false],

      // Payment Settings
      ['payment', 'stripe_enabled', 'false', 'boolean', 'Enable Stripe payments', false],
      ['payment', 'stripe_public_key', '', 'string', 'Stripe publishable key', false],
      ['payment', 'stripe_secret_key', '', 'string', 'Stripe secret key', true],
      ['payment', 'require_payment_upfront', 'false', 'boolean', 'Require payment before trip', false],

      // Feature Flags
      ['features', 'fleet_partners_enabled', 'true', 'boolean', 'Enable fleet partner features', false],
      ['features', 'multi_stop_trips', 'true', 'boolean', 'Enable multi-stop trips', false],
      ['features', 'real_time_tracking', 'true', 'boolean', 'Enable real-time tracking', false],
      ['features', 'driver_ratings', 'true', 'boolean', 'Enable driver ratings', false],

      // Maintenance Settings
      ['maintenance', 'backup_enabled', 'true', 'boolean', 'Enable automatic backups', false],
      ['maintenance', 'log_level', 'info', 'string', 'Application log level', false],
      ['maintenance', 'health_check_enabled', 'true', 'boolean', 'Enable health checks', false]
    ];

    for (const [category, key, value, type, description, is_sensitive] of defaultSettings) {
      await db.query(`
        INSERT IGNORE INTO system_settings (category, setting_key, setting_value, setting_type, description, is_sensitive)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [category, key, value, type, description, is_sensitive]);
    }

    console.log("Default settings inserted successfully");
  } catch (error) {
    console.error("Error inserting default settings:", error);
  }
};

// Helper function to log setting changes
const logSettingChange = async (settingId, category, key, oldValue, newValue, changedBy, ipAddress, userAgent) => {
  try {
    await db.query(`
      INSERT INTO settings_audit_log (setting_id, category, setting_key, old_value, new_value, changed_by, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [settingId, category, key, oldValue, newValue, changedBy, ipAddress, userAgent]);
  } catch (error) {
    console.error("Error logging setting change:", error);
  }
};

// Helper function to get default settings
const getDefaultSettings = () => {
  return {
    commission: {
      individual_driver_rate: 20,
      fleet_partner_rate: 15,
      tax_rate: 13,
      currency: 'CAD',
      payment_processing_fee: 2.9
    },
    system: {
      company_name: 'eCharter',
      company_email: 'admin@echarter.co',
      company_phone: '+1-800-CHARTER',
      support_email: 'support@echarter.co',
      website_url: 'https://echarter.co',
      timezone: 'America/Toronto',
      date_format: 'YYYY-MM-DD',
      time_format: '24h',
      maintenance_mode: false
    },
    email: {
      smtp_enabled: true,
      smtp_host: 'smtp.gmail.com',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '***HIDDEN***',
      from_name: 'eCharter',
      from_email: 'noreply@echarter.co'
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      twilio_sid: '***HIDDEN***',
      twilio_token: '***HIDDEN***',
      twilio_phone: ''
    },
    security: {
      jwt_expiry: '24h',
      password_min_length: 8,
      require_email_verification: false,
      max_login_attempts: 5,
      session_timeout: 30
    },
    business: {
      auto_approve_drivers: false,
      auto_approve_vehicles: false,
      require_driver_documents: true,
      min_trip_amount: 25,
      max_trip_duration: 24,
      booking_advance_hours: 2,
      cancellation_hours: 4
    },
    notifications: {
      email_booking_confirmation: true,
      email_trip_updates: true,
      sms_booking_confirmation: true,
      sms_trip_started: true,
      admin_new_bookings: true
    },
    payment: {
      stripe_enabled: false,
      stripe_public_key: '',
      stripe_secret_key: '***HIDDEN***',
      require_payment_upfront: false
    },
    features: {
      fleet_partners_enabled: true,
      multi_stop_trips: true,
      real_time_tracking: true,
      driver_ratings: true
    },
    maintenance: {
      backup_enabled: true,
      log_level: 'info',
      health_check_enabled: true
    }
  };
};

module.exports = {
  getSettings,
  updateSettings,
  getSetting,
  getSettingsByCategory,
  resetSettings,
  getSettingsAuditLog
};