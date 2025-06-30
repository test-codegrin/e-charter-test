const tripGetQueries = {
  getTripsByUserId: `
    SELECT 
      t.trip_id,
      t.pickupLocation,
      t.dropLocation,
      t.tripStartDate,
      t.tripEndDate,
      t.tripTime,
      t.durationHours,
      t.distance_km,
      t.status,
      t.total_price,
      t.created_at,
      c.carName,
      c.carType,
      d.driverName,
      d.phoneNo as driverPhone
    FROM trips t
    LEFT JOIN car c ON t.car_id = c.car_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `,

  getTripById: `
    SELECT 
      t.*,
      c.carName,
      c.carType,
      c.carNumber,
      d.driverName,
      d.phoneNo as driverPhone,
      d.email as driverEmail
    FROM trips t
    LEFT JOIN car c ON t.car_id = c.car_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    WHERE t.trip_id = ?
  `,

  getTripMidStops: `
    SELECT * FROM trip_midstops 
    WHERE trip_id = ? 
    ORDER BY stopOrder
  `,

  getAllTripsForAdmin: `
    SELECT 
      t.*,
      u.firstName,
      u.lastName,
      u.email as userEmail,
      u.phoneNo as userPhone,
      c.carName,
      c.carType,
      d.driverName,
      d.phoneNo as driverPhone
    FROM trips t
    JOIN users u ON t.user_id = u.user_id
    LEFT JOIN car c ON t.car_id = c.car_id
    LEFT JOIN drivers d ON c.driver_id = d.driver_id
    ORDER BY t.created_at DESC
  `,

  getTripsByDriverId: `
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
  `
};

module.exports = tripGetQueries;