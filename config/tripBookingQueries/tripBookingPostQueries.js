const tripBookingPostQueries = {

createTrip: `
  INSERT INTO trips (
    user_id,
    car_id,
    pickupLocation, 
    pickupLatitude,
    pickupLongitude,
    dropLocation, 
    dropLatitude,
    dropLongitude,
    tripStartDate,
    tripEndDate, 
    tripTime, 
    durationHours,
    distance_km,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
getUserDetails: `SELECT user_id, firstName, lastName, email, phoneNo, address, cityName, profileImage FROM users WHERE user_id = ?`,

 getCarDetails: `
    SELECT c.*, d.driverName, d.email as driverEmail, d.phoneNo as driverPhone 
    FROM car c 
    JOIN drivers d ON c.driver_id = d.driver_id 
    WHERE c.car_id = ? AND c.status = 1
  `,
    updateTripWithCarAndPricing: `
    UPDATE trips 
    SET car_id = ?, total_price = ?, base_price = ?, tax_amount = ? 
    WHERE trip_id = ?
  `,

 createMidStop: `
  INSERT INTO trip_midstops (trip_id, stopName, stopOrder, latitude, longitude,stayDuration)
  VALUES ?
`

};

module.exports = tripBookingPostQueries;