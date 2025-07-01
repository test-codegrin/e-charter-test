const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");

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
    const [settingsRows] = await db.query(`
      SELECT category, setting_key, setting_value, setting_type, is_sensitive 
      FROM system_settings 
      ORDER BY category, setting_key
    `);

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
      const [pricingRows] = await db.query(`
        SELECT carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate
        FROM vehicle_pricing
        ORDER BY carType, carSize
      `);

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
      const [currentSetting] = await db.query(`
        SELECT setting_id, setting_value FROM system_settings 
        WHERE category = ? AND setting_key = ?
      `, [category, key]);

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
      const [result] = await db.query(`
        INSERT INTO system_settings (category, setting_key, setting_value, setting_type)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          setting_value = VALUES(setting_value),
          setting_type = VALUES(setting_type),
          updated_at = CURRENT_TIMESTAMP
      `, [category, key, settingValue, settingType]);

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
    await db.query(`
      CREATE TABLE IF NOT EXISTS vehicle_pricing (
        pricing_id INT AUTO_INCREMENT PRIMARY KEY,
        carType VARCHAR(50) NOT NULL,
        carSize VARCHAR(50) NOT NULL,
        base_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
        per_km_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
        per_hour_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
        midstop_rate DECIMAL(8,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vehicle_type (carType, carSize)
      )
    `);

    // Update pricing for each vehicle type and size
    const { base_rates, per_km_rates, per_hour_rates, midstop_rates } = pricingSettings;

    if (base_rates) {
      for (const vehicleType of Object.keys(base_rates)) {
        for (const vehicleSize of Object.keys(base_rates[vehicleType])) {
          const baseRate = base_rates[vehicleType][vehicleSize];
          const perKmRate = per_km_rates?.[vehicleType]?.[vehicleSize] || 0;
          const perHourRate = per_hour_rates?.[vehicleType]?.[vehicleSize] || 0;
          const midstopRate = midstop_rates?.[vehicleType]?.[vehicleSize] || 0;

          await db.query(`
            INSERT INTO vehicle_pricing (carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              base_rate = VALUES(base_rate),
              per_km_rate = VALUES(per_km_rate),
              per_hour_rate = VALUES(per_hour_rate),
              midstop_rate = VALUES(midstop_rate),
              updated_at = CURRENT_TIMESTAMP
          `, [vehicleType, vehicleSize, baseRate, perKmRate, perHourRate, midstopRate]);
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

    const [rows] = await db.query(`
      SELECT setting_value, setting_type, is_sensitive FROM system_settings 
      WHERE category = ? AND setting_key = ?
    `, [category, key]);

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

    const [rows] = await db.query(`
      SELECT setting_key, setting_value, setting_type, is_sensitive, description
      FROM system_settings 
      WHERE category = ?
      ORDER BY setting_key
    `, [category]);

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

// Reset settings to defaults
const resetSettings = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const adminId = req.user?.admin_id;

    if (category) {
      // Reset specific category
      await db.query(`DELETE FROM system_settings WHERE category = ?`, [category]);
      
      // Log the reset
      await db.query(`
        INSERT INTO settings_audit_log (setting_id, category, setting_key, old_value, new_value, changed_by, change_reason, ip_address, user_agent)
        VALUES (0, ?, 'CATEGORY_RESET', 'ALL_SETTINGS', 'RESET_TO_DEFAULTS', ?, 'Category reset to defaults', ?, ?)
      `, [category, adminId, req.ip, req.get('User-Agent')]);
    } else {
      // Reset all settings
      await db.query(`DELETE FROM system_settings`);
      
      // Log the reset
      await db.query(`
        INSERT INTO settings_audit_log (setting_id, category, setting_key, old_value, new_value, changed_by, change_reason, ip_address, user_agent)
        VALUES (0, 'ALL', 'FULL_RESET', 'ALL_SETTINGS', 'RESET_TO_DEFAULTS', ?, 'Full system reset to defaults', ?, ?)
      `, [adminId, req.ip, req.get('User-Agent')]);
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

    let query = `
      SELECT 
        sal.*,
        a.adminName as changed_by_name,
        ss.description
      FROM settings_audit_log sal
      LEFT JOIN admin a ON sal.changed_by = a.admin_id
      LEFT JOIN system_settings ss ON sal.setting_id = ss.setting_id
    `;
    
    const params = [];
    
    if (category) {
      query += ` WHERE sal.category = ?`;
      params.push(category);
    }
    
    query += ` ORDER BY sal.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [auditLogs] = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM settings_audit_log`;
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

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings_audit_log (
        audit_id INT AUTO_INCREMENT PRIMARY KEY,
        setting_id INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        old_value TEXT,
        new_value TEXT NOT NULL,
        changed_by INT DEFAULT NULL,
        change_reason VARCHAR(255) DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error("Error ensuring settings tables exist:", error);
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
      currency: 'CAD'
    },
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