// config/settingsQueries.js

const settingsQueries = {
  // System Settings
  selectAllSettings: `
    SELECT category, setting_key, setting_value, setting_type, is_sensitive 
    FROM system_settings 
    ORDER BY category, setting_key
  `,
  selectSettingByKey: `
    SELECT setting_value, setting_type, is_sensitive FROM system_settings 
    WHERE category = ? AND setting_key = ?
  `,
  selectSettingsByCategory: `
    SELECT setting_key, setting_value, setting_type, is_sensitive, description
    FROM system_settings 
    WHERE category = ?
    ORDER BY setting_key
  `,
  selectSettingRowForUpdate: `
    SELECT setting_id, setting_value FROM system_settings 
    WHERE category = ? AND setting_key = ?
  `,
  insertOrUpdateSetting: `
    INSERT INTO system_settings (category, setting_key, setting_value, setting_type)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      setting_value = VALUES(setting_value),
      setting_type = VALUES(setting_type),
      updated_at = CURRENT_TIMESTAMP
  `,
  deleteSettingsByCategory: `
    DELETE FROM system_settings WHERE category = ?
  `,
  deleteAllSettings: `
    DELETE FROM system_settings
  `,
  checkSettingsCount: `
    SELECT COUNT(*) as count FROM system_settings
  `,

  // Vehicle Pricing
  createVehiclePricingTable: `
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
  `,
  selectPricingData: `
    SELECT carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate
    FROM vehicle_pricing
    ORDER BY carType, carSize
  `,
  upsertPricing: `
    INSERT INTO vehicle_pricing (carType, carSize, base_rate, per_km_rate, per_hour_rate, midstop_rate)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      base_rate = VALUES(base_rate),
      per_km_rate = VALUES(per_km_rate),
      per_hour_rate = VALUES(per_hour_rate),
      midstop_rate = VALUES(midstop_rate),
      updated_at = CURRENT_TIMESTAMP
  `,

  // Audit Log
  createAuditLogTable: `
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
  `,
  insertAuditLog: `
    INSERT INTO settings_audit_log (setting_id, category, setting_key, old_value, new_value, changed_by, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  insertCategoryResetLog: `
    INSERT INTO settings_audit_log (setting_id, category, setting_key, old_value, new_value, changed_by, change_reason, ip_address, user_agent)
    VALUES (0, ?, 'CATEGORY_RESET', 'ALL_SETTINGS', 'RESET_TO_DEFAULTS', ?, 'Category reset to defaults', ?, ?)
  `,
  insertFullResetLog: `
    INSERT INTO settings_audit_log (setting_id, category, setting_key, old_value, new_value, changed_by, change_reason, ip_address, user_agent)
    VALUES (0, 'ALL', 'FULL_RESET', 'ALL_SETTINGS', 'RESET_TO_DEFAULTS', ?, 'Full system reset to defaults', ?, ?)
  `,
  getAuditLog: `
    SELECT 
      sal.*,
      a.adminName as changed_by_name,
      ss.description
    FROM settings_audit_log sal
    LEFT JOIN admin a ON sal.changed_by = a.admin_id
    LEFT JOIN system_settings ss ON sal.setting_id = ss.setting_id
  `,
  countAuditLog: `
    SELECT COUNT(*) as total FROM settings_audit_log
  `,
};

module.exports = settingsQueries;
