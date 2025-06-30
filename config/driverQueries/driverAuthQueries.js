const driverAuthQueries = {

    driverInsert: `
        INSERT INTO drivers (driverName, email,password,  address, cityName, zipCord, phoneNo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `,

    driverMailCheck: `SELECT * FROM drivers WHERE email = ?`,

    driverLogin: `SELECT driver_id, email, password, status FROM drivers WHERE email = ?`,

    getDriverByEmail: `SELECT * FROM drivers WHERE email = ?`,

    getHashedPassword: `SELECT password FROM drivers WHERE email = ?`,
    
    passwordUpdate: `UPDATE drivers SET password = ? WHERE email = ?`,
    
}

module.exports = driverAuthQueries;