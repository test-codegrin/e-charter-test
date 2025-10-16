const userAuthQueries = {

     userInsert: `INSERT INTO users ( firstname,lastname,  email, password,gender,address, city_name, zip_code, phone_no, profile_image) 
                 VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)  `,

    userMailCheck: 'SELECT * FROM users WHERE email = ?',

    userLogin: `SELECT * FROM users WHERE email = ?`,

    GetUserOnMail: "SELECT * FROM users WHERE email = ?",

    PasswordUpdate: "UPDATE users SET password = ? WHERE email = ?",

    getHasedPassword: "SELECT password FROM users WHERE email = ?",

    changePassword: "UPDATE users SET password = ? WHERE user_id = ?",

    addFCMToken: `UPDATE users SET fcm_token = ? WHERE user_id = ?INSERT INTO users (fcm_token) VALUES (?) ON DUPLICATE KEY UPDATE fcm_token = VALUES(fcm_token)`
}

module.exports = userAuthQueries;