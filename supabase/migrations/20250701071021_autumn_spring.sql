-- Create driver settings table
CREATE TABLE IF NOT EXISTS driver_settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  settings_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_driver_setting (driver_id, category),
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Create fleet settings table
CREATE TABLE IF NOT EXISTS fleet_settings (
  setting_id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  settings_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_fleet_setting (driver_id, category),
  FOREIGN KEY (driver_id) REFERENCES drivers(driver_id) ON DELETE CASCADE
);

-- Insert default notification settings for existing drivers
INSERT IGNORE INTO driver_settings (driver_id, category, settings_data)
SELECT driver_id, 'notifications', '{"email_trip_assignments":true,"email_trip_updates":true,"sms_trip_assignments":true,"sms_trip_updates":true,"app_notifications":true}'
FROM drivers;

-- Add created_at column to tables that don't have it
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE car ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;