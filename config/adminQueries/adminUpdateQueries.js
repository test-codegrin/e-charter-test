const adminUpdateQueries = {

   updateUserDetails: `
    UPDATE users SET 
      firstName = ?, 
      lastName = ?, 
      email = ?, 
      address = ?, 
      cityName = ?, 
      zipCode = ?, 
      phoneNo = ?
    WHERE user_id = ?
  `
  
};


module.exports = adminUpdateQueries;
