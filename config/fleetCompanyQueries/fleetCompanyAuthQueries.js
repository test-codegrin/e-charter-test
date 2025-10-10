const fleetCompanyAuthQueries = {

    companyInsert: `
        INSERT INTO fleet_companies (company_name, email, password,phone_no,fcm_token,profile_image,website,address,city_name,postal_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,

    companyMailCheck: `SELECT * FROM fleet_companies WHERE email = ?`,

    // driverLogin: `SELECT driver_id, email, password, status FROM drivers WHERE email = ?`,

    // getDriverByEmail: `SELECT * FROM drivers WHERE email = ?`,

    // getHashedPassword: `SELECT password FROM drivers WHERE email = ?`,
    
    // passwordUpdate: `UPDATE drivers SET password = ? WHERE email = ?`,
    
}

module.exports = fleetCompanyAuthQueries;