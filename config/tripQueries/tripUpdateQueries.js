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

  completeTrip: `
    UPDATE trips 
    SET status = 'completed', actual_end_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
    WHERE trip_id = ?
  `
};

module.exports = tripUpdateQueries;