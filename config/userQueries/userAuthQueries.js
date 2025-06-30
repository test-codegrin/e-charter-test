const userAuthQueries = {

     userInsert: `INSERT INTO users ( firstName,lastName,  email, password,address, cityName, zipCord, phoneNo, profileImage) 
                 VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)  `,

    userMailCheck: 'SELECT * FROM users WHERE email = ?',

    userLogin: `SELECT * FROM users WHERE email = ?`,

    GetUserOnMail: "SELECT * FROM users WHERE email = ?",

    PasswordUpdate: "UPDATE users SET password = ? WHERE email = ?",

    getHasedPassword: "SELECT password FROM users WHERE email = ?",

    changePassword: "UPDATE users SET password = ? WHERE user_id = ?"
}

module.exports = userAuthQueries;