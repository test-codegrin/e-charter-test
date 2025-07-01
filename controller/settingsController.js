const { db } = require("../config/db");
const asyncHandler = require("express-async-handler");

// Get system settings
const getSettings = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching system settings...");

    // Try to get settings from database
    let settings = {};
    
    try {
      // Check if settings table exists
      const [tableCheck] = await db.query(`
        SHOW TABLES LIKE 'system_settings'
      `);

      if (tableCheck.length > 0) {
        // Get settings from database
        const [settingsRows] = await db.query(`
          SELECT setting_key, setting_value, category FROM system_settings
        `);

        // Organize settings by category
        settingsRows.forEach(row => {
          if (!settings[row.category]) {
            settings[row.category] = {};
          }
          
          // Try to parse JSON values
          try {
            settings[row.category][row.setting_key] = JSON.parse(row.setting_value);
          } catch {
            settings[row.category][row.setting_key] = row.setting_value;
          }
        });
      }
    } catch (dbError) {
      console.log("Settings table doesn't exist, using defaults");
    }

    // Get current pricing from vehicle_pricing table
    try {
      const [pricingRows] = await db.query(`
        SELECT carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate
        FROM vehicle_pricing
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

        settings.pricing = pricing;
      }
    } catch (pricingError) {
      console.log("Could not fetch pricing data:", pricingError.message);
    }

    // Merge with default settings
    const defaultSettings = {
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
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        from_name: 'eCharter',
        from_email: 'noreply@echarter.co'
      },
      sms: {
        twilio_sid: '',
        twilio_token: '',
        twilio_phone: '',
        enabled: false
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

    // Merge defaults with database settings
    const finalSettings = { ...defaultSettings, ...settings };

    res.status(200).json({
      message: "Settings fetched successfully",
      settings: finalSettings
    });

  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update system settings
const updateSettings = asyncHandler(async (req, res) => {
  try {
    const { category, settings } = req.body;

    console.log(`Updating ${category} settings:`, settings);

    if (!category || !settings) {
      return res.status(400).json({ message: "Category and settings are required" });
    }

    // Create settings table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(50) NOT NULL,
        setting_key VARCHAR(100) NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_setting (category, setting_key)
      )
    `);

    // Handle pricing updates separately
    if (category === 'pricing') {
      await updatePricingSettings(settings);
    } else {
      // Update other settings
      for (const [key, value] of Object.entries(settings)) {
        const settingValue = typeof value === 'object' ? JSON.stringify(value) : value.toString();
        
        await db.query(`
          INSERT INTO system_settings (category, setting_key, setting_value)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, [category, key, settingValue]);
      }
    }

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

    for (const vehicleType of Object.keys(base_rates)) {
      for (const vehicleSize of Object.keys(base_rates[vehicleType])) {
        const baseRate = base_rates[vehicleType][vehicleSize];
        const perKmRate = per_km_rates[vehicleType][vehicleSize];
        const perHourRate = per_hour_rates[vehicleType][vehicleSize];
        const midstopRate = midstop_rates[vehicleType][vehicleSize];

        await db.query(`
          INSERT INTO vehicle_pricing (carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            base_rate = VALUES(base_rate),
            per_km_rate = VALUES(per_km_rate),
            per_hour_rate = VALUES(per_hour_rate),
            midstop_rate = VALUES(midstop_rate)
        `, [vehicleType, vehicleSize, baseRate, perKmRate, perHourRate, midstopRate]);
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
      SELECT setting_value FROM system_settings 
      WHERE category = ? AND setting_key = ?
    `, [category, key]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Setting not found" });
    }

    let value;
    try {
      value = JSON.parse(rows[0].setting_value);
    } catch {
      value = rows[0].setting_value;
    }

    res.status(200).json({
      message: "Setting fetched successfully",
      category,
      key,
      value
    });

  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Reset settings to defaults
const resetSettings = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;

    if (category) {
      // Reset specific category
      await db.query(`DELETE FROM system_settings WHERE category = ?`, [category]);
    } else {
      // Reset all settings
      await db.query(`DELETE FROM system_settings`);
    }

    res.status(200).json({
      message: category ? `${category} settings reset to defaults` : "All settings reset to defaults"
    });

  } catch (error) {
    console.error("Error resetting settings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = {
  getSettings,
  updateSettings,
  getSetting,
  resetSettings
};