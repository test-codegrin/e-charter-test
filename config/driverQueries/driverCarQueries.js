const driverCarQueries = {
  // Check if carNumber already exists
  checkExistingCarNumber: `SELECT car_id FROM car WHERE carNumber = ?`,

  // Get driver details by ID
  getDriverStatusById: `SELECT driver_id, status FROM drivers WHERE driver_id = ?`,

  // Insert a new car
  insertNewCar: `
 INSERT INTO car 
(driver_id, carName, carNumber, carSize, carType, car_image, bus_capacity, vehicle_age, vehicle_condition, specialized_services, wheelchair_accessible, vehicle_features, maintenance_schedule, insurance_expiry, license_plate_expiry, status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,

  // Get all cars by driver ID
  getCarsByDriver: `
    SELECT 
      car_id, carName, carNumber, carSize, carType, car_image, status,
      bus_capacity, vehicle_age, vehicle_condition, specialized_services,
      wheelchair_accessible, vehicle_features, maintenance_schedule,
      insurance_expiry, license_plate_expiry, created_at
    FROM car 
    WHERE driver_id = ?
    ORDER BY created_at DESC
  `,

  // Get specific car details by car_id and driver_id
  getCarById: `
    SELECT 
      car_id, carName, carNumber, carSize, carType,car_image, status,
      bus_capacity, vehicle_age, vehicle_condition, specialized_services,
      wheelchair_accessible, vehicle_features, maintenance_schedule,
      insurance_expiry, license_plate_expiry, created_at
    FROM car 
    WHERE car_id = ? AND driver_id = ?
  `,

  // Check if another car already has the same carNumber
  checkDuplicateCarNumber: `SELECT car_id FROM car WHERE carNumber = ? AND car_id != ?`,

  // Get existing car before update (status check)
  getExistingCarById: `SELECT car_id, status FROM car WHERE car_id = ? AND driver_id = ?`,

  // Update car - constructed dynamically in controller

  // Get car after update
getUpdatedCarById: `
  SELECT 
    car_id, carName, carNumber, carSize, carType, status,
    car_image,
    bus_capacity, vehicle_age, vehicle_condition, specialized_services,
    wheelchair_accessible, vehicle_features, maintenance_schedule,
    insurance_expiry, license_plate_expiry
  FROM car 
  WHERE car_id = ?
`,


  // Check if car exists before delete
  getCarForDelete: `SELECT car_id, carName, carNumber FROM car WHERE car_id = ? AND driver_id = ?`,

  // Check active trips before deletion
  checkActiveTrips: `SELECT trip_id FROM trips WHERE car_id = ? AND status IN ('confirmed', 'in_progress')`,

  // Delete car
  deleteCar: `DELETE FROM car WHERE car_id = ?`
};

module.exports = driverCarQueries;
