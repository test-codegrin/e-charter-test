const { db } = require("../config/db");

class SettingsService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  }

  // Get a specific setting with caching
  async getSetting(category, key, defaultValue = null) {
    const cacheKey = `${category}.${key}`;
    
    // Check cache first
    if (this.cache.has(cacheKey) && Date.now() < this.cacheExpiry.get(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const [rows] = await db.query(`
        SELECT setting_value, setting_type FROM system_settings 
        WHERE category = ? AND setting_key = ?
      `, [category, key]);

      if (rows.length === 0) {
        return defaultValue;
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

      // Cache the value
      this.cache.set(cacheKey, value);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return value;
    } catch (error) {
      console.error(`Error getting setting ${category}.${key}:`, error);
      return defaultValue;
    }
  }

  // Get all settings for a category
  async getCategorySettings(category) {
    try {
      const [rows] = await db.query(`
        SELECT setting_key, setting_value, setting_type FROM system_settings 
        WHERE category = ?
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
        
        settings[row.setting_key] = value;
      });

      return settings;
    } catch (error) {
      console.error(`Error getting category settings ${category}:`, error);
      return {};
    }
  }

  // Update a setting
  async updateSetting(category, key, value, type = null) {
    try {
      // Determine type if not provided
      if (!type) {
        if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'object') {
          type = Array.isArray(value) ? 'array' : 'json';
        } else {
          type = 'string';
        }
      }

      // Convert value to string for storage
      let settingValue;
      if (type === 'json' || type === 'array') {
        settingValue = JSON.stringify(value);
      } else {
        settingValue = value.toString();
      }

      await db.query(`
        INSERT INTO system_settings (category, setting_key, setting_value, setting_type)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          setting_value = VALUES(setting_value),
          setting_type = VALUES(setting_type),
          updated_at = CURRENT_TIMESTAMP
      `, [category, key, settingValue, type]);

      // Clear cache for this setting
      const cacheKey = `${category}.${key}`;
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);

      return true;
    } catch (error) {
      console.error(`Error updating setting ${category}.${key}:`, error);
      return false;
    }
  }

  // Clear all cache
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Get commission rates
  async getCommissionRates() {
    const individualRate = await this.getSetting('commission', 'individual_driver_rate', 20);
    const fleetRate = await this.getSetting('commission', 'fleet_partner_rate', 15);
    const taxRate = await this.getSetting('commission', 'tax_rate', 13);

    return {
      individual_driver_rate: individualRate,
      fleet_partner_rate: fleetRate,
      tax_rate: taxRate
    };
  }

  // Get business rules
  async getBusinessRules() {
    return await this.getCategorySettings('business');
  }

  // Get security settings
  async getSecuritySettings() {
    return await this.getCategorySettings('security');
  }

  // Get notification settings
  async getNotificationSettings() {
    return await this.getCategorySettings('notifications');
  }

  // Check if a feature is enabled
  async isFeatureEnabled(featureName) {
    return await this.getSetting('features', featureName, false);
  }

  // Get system info
  async getSystemInfo() {
    return await this.getCategorySettings('system');
  }
}

// Export singleton instance
module.exports = new SettingsService();