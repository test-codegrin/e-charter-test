const adminUpdateQueries = {
    
  updateUserById: `
    UPDATE users 
    SET firstName = ?, lastName = ?, email = ?, phoneNo = ?
    WHERE user_id = ?
  `
};

module.exports = adminUpdateQueries;
