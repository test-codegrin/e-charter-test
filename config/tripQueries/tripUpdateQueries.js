const tripUpdateQueries = {
  updateTripStatus: `
    UPDATE trips 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `,

  assignCarToTrip: `
    UPDATE trips 
    SET car_id = ?, status = 'confirmed', updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `,

  updateTripPrice: `
    UPDATE trips 
    SET total_price = ?, base_price = ?, tax_amount = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `,

  updateTripLocation: `
    UPDATE trips 
    SET current_latitude = ?, current_longitude = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `,

  startTrip: `
    UPDATE trips 
    SET status = 'in_progress', actual_start_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `,
    checkInProgressTrip: `
    SELECT t.trip_id FROM trips t 
    JOIN car c ON t.car_id = c.car_id 
    WHERE t.trip_id = ? AND c.driver_id = ? AND t.status = 'in_progress'
  `,
  getTripDetailsForCompletion: `
    SELECT t.*, u.firstName, u.lastName, u.phoneNo 
    FROM trips t 
    JOIN car c ON t.car_id = c.car_id 
    JOIN users u ON t.user_id = u.user_id 
    WHERE t.trip_id = ? AND c.driver_id = ?
  `,
  completeTrip: `
    UPDATE trips 
    SET status = 'completed', actual_end_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `
};

module.exports = tripUpdateQueries;