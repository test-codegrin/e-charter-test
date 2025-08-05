const userPutQueries = {

  getUserById: "SELECT * FROM users WHERE user_id = ?",
  
 updateUserProfile :`
UPDATE users
SET
  first_name = ?,
  last_name = ?,
  address = ?,
  city_name = ?,
  zip_code = ?,
  phone_no = ?,
  profile_image = COALESCE(?, profile_image)
WHERE user_id = ?;
`
  
};

module.exports = userPutQueries;