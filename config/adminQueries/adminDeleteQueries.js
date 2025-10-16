const adminDeleteQueries = {
    deleteTripsById:`UPDATE trips SET is_deleted = 1, updated_at = NOW() WHERE user_id = 4`,
    
  deleteUserById: `UPDATE users SET is_deleted = 1, updated_at = NOW() WHERE user_id = ?`,

  deleteDriverById: `UPDATE drivers SET is_deleted = 1, updated_at = NOW() WHERE driver_id = ?`,
  
  deleteVehicleById: `UPDATE vehicle SET is_deleted = 1, updated_at = NOW() WHERE vehicle_id = ?`,

   deleteFleetCompany: `
    UPDATE fleet_companies 
    SET is_deleted = 1, updated_at = NOW() 
    WHERE fleet_company_id = ?
  `,
  
};

module.exports = adminDeleteQueries;
