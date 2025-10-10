const driverAuthQueries = {

    driverInsert: `
        INSERT INTO drivers (firstname,lastname, email, password,phone_no,gender,driver_type,fleet_company_id, address, city_name, zip_code,year_of_experiance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,

    driverMailCheck: `SELECT * FROM drivers WHERE email = ?`,

    driverLogin: `SELECT driver_id, email, password, status FROM drivers WHERE email = ?`,

    getDriverByEmail: `SELECT * FROM drivers WHERE email = ?`,

    getHashedPassword: `SELECT password FROM drivers WHERE email = ?`,
    
    passwordUpdate: `UPDATE drivers SET password = ? WHERE email = ?`,
    
}

module.exports = driverAuthQueries;