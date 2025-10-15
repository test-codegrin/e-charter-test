const adminDeleteQueries = {
    deleteTripsById:`DELETE FROM trips WHERE user_id = 4`,
    
  deleteUserById: `DELETE FROM users WHERE user_id = ?`,

  deleteDriverById: `UPDATE drivers SET is_deleted = 1 WHERE driver_id = ?`,
  
  deleteVehicleById: `UPDATE vehicle SET is_deleted = 1 WHERE vehicle_id = ?`,
  
};

module.exports = adminDeleteQueries;
