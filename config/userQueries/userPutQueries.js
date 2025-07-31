const userPutQueries = {

  getUserById: "SELECT * FROM users WHERE user_id = ?",
  
  updateUserProfile: `
    UPDATE users 
    SET firstName = ?, lastName = ?, address = ?, cityName = ?, zipCode = ?, phoneNo = ?, profileImage = ?
    WHERE user_id = ?
  `,
  
};

module.exports = userPutQueries;