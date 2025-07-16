const driverDashboardQueries = {



  getCarsByDriverId: `
    SELECT * FROM car 
    WHERE driver_id = ?
    ORDER BY created_at DESC
  `,

  getTripsEnhanced: `
    SELECT 
      t.*,
      u.firstName,
      u.lastName,
      u.email as userEmail,
      u.phoneNo as userPhone
    FROM trips t
    JOIN users u ON t.user_id = u.user_id
    JOIN car c ON t.car_id = c.car_id
    WHERE c.driver_id = ?
    ORDER BY t.created_at DESC
  `,

  getTripsBasic: `
    SELECT t.* FROM trips t
    JOIN car c ON t.car_id = c.car_id
    WHERE c.driver_id = ?
    ORDER BY t.created_at DESC
  `,

  getTripsWithStatusEnhanced: `
    SELECT 
      t.*,
      u.firstName,
      u.lastName,
      u.email as userEmail,
      u.phoneNo as userPhone,
      c.carName,
      c.carType
    FROM trips t
    JOIN users u ON t.user_id = u.user_id
    JOIN car c ON t.car_id = c.car_id
    WHERE c.driver_id = ?
  `,

  getTripsWithStatusBasic: `
    SELECT t.* FROM trips t
    JOIN car c ON t.car_id = c.car_id
    WHERE c.driver_id = ?
  `,

  getMidStopsByTripId: `
    SELECT * FROM trip_midstops WHERE trip_id = ? ORDER BY stopOrder
  `,

  getDriverProfile: `
    SELECT driver_id, driverName, email, address, cityName, zipCode, phoneNo, status, 
           company_name, registration_type, fleet_size, years_experience
    FROM drivers WHERE driver_id = ?
  `,

  updateDriverProfile: `
    UPDATE drivers 
    SET driverName = ?, email = ?, phoneNo = ?, address = ?, cityName = ?, zipCode = ?
    WHERE driver_id = ?
  `,

  createSettingsTable: `
    CREATE TABLE IF NOT EXISTS driver_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      driver_id INT,
      category VARCHAR(255),
      settings_data TEXT,
      UNIQUE(driver_id, category)
    )
  `,

  getNotificationSettings: `
    SELECT settings_data FROM driver_settings 
    WHERE driver_id = ? AND category = 'notification'
  `,

  updateNotificationSettings: `
    INSERT INTO driver_settings (driver_id, category, settings_data)
    VALUES (?, 'notification', ?)
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

  getPaymentSettings: `
    SELECT settings_data FROM driver_settings 
    WHERE driver_id = ? AND category = 'payment'
  `,

  updatePaymentSettings: `
    INSERT INTO driver_settings (driver_id, category, settings_data)
    VALUES (?, 'payment', ?)
    ON DUPLICATE KEY UPDATE settings_data = VALUES(settings_data)
  `
};

module.exports = driverDashboardQueries;