const adminDeleteQueries = {
    deleteTripsById:`DELETE FROM trips WHERE user_id = 4`,
    
  deleteUserById: `DELETE FROM users WHERE user_id = ?`
};

module.exports = adminDeleteQueries;
