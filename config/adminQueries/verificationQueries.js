const verificationQueries = {


 checkDriverExists: `
    SELECT driver_id, driverName, email, registration_type 
    FROM drivers 
    WHERE driver_id = ?
  `,

  updateDriverStatus: `
    UPDATE drivers SET status = ? WHERE driver_id = ?
  `,

  checkCarExists: `
    SELECT c.car_id, c.carName, c.carNumber, d.driverName, d.email 
    FROM car c 
    JOIN drivers d ON c.driver_id = d.driver_id 
    WHERE c.car_id = ?
  `,

  updateCarStatus: `
    UPDATE car SET status = ? WHERE car_id = ?
  `,

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