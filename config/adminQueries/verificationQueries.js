const verificationQueries = {


 checkDriverExists: `
    SELECT * 
    FROM drivers 
    WHERE driver_id = ?
  `,

  updateDriverStatus: `
    UPDATE drivers SET status = ? WHERE driver_id = ?
  `,


  checkVehicleExists: `
    SELECT * 
    FROM vehicle 
    WHERE vehicle_id = ?
  `,
  updateVehicleStatus: `
    UPDATE vehicle SET status = ? WHERE vehicle_id = ?
  `,

  // Fleet company queries
  checkFleetCompanyExists: 'SELECT * FROM fleet_companies WHERE fleet_company_id = ? AND is_deleted = 0',
  updateFleetCompanyStatus: 'UPDATE fleet_companies SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE fleet_company_id = ?',









  getPendingDrivers: `
    SELECT 
      driver_id,
      driverName,
      email,
      phoneNo,
      cityName,
      registration_type,
      company_name,
      created_at
    FROM drivers 
    WHERE status = 0
    ORDER BY created_at DESC
  `,

  getPendingVehicles: `
    SELECT 
      c.car_id,
      c.carName,
      c.carNumber,
      c.carType,
      c.carSize,
      d.driverName,
      d.email,
      d.registration_type,
      c.created_at
    FROM car c
    JOIN drivers d ON c.driver_id = d.driver_id
    WHERE c.status = 0
    ORDER BY c.created_at DESC
  `

}

module.exports = verificationQueries;