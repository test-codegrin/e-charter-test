const userPutQueries = {

  updateUserProfileById: `
    UPDATE users 
    SET firstName = ?, lastName = ?, address = ?, cityName = ?, zipCode = ?, phoneNo = ?, profileImage = ?
    WHERE user_id = ?
  `
  
};

module.exports = userPutQueries;