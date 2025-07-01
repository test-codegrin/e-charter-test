const driverSettingsQueries = {
  getNotificationSettings: `
    SELECT settings_data FROM driver_settings 
    WHERE driver_id = ? AND category = 'notifications'
  `,

  updateNotificationSettings: `
    INSERT INTO driver_settings (driver_id, category, settings_data)
    VALUES (?, 'notifications', ?)
    ON DUPLICATE KEY UPDATE settings_data = VALUES(settings_data)
  `,

  getFleetSettings: `
    SELECT settings_data FROM driver_settings 
    WHERE driver_id = ? AND category = 'fleet'
  `,

  updateFleetSettings: `
    INSERT INTO driver_settings (driver_id, category, settings_data)
    VALUES (?, 'fleet', ?)
    ON DUPLICATE KEY UPDATE settings_data = VALUES(settings_data)
  `,

  createSettingsTable: `
    CREATE TABLE IF NOT EXISTS driver_settings (
      setting_id INT AUTO_INCREMENT PRIMARY KEY,
      driver_id INT NOT NULL,
      category VARCHAR(50) NOT NULL,
      settings_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_driver_setting (driver_id, category),
      FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
    )
  `
};

module.exports = driverSettingsQueries;