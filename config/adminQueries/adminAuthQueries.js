const adminAuthQueries = {
    
    adminMailCheck: `SELECT * FROM admin WHERE email = ?`,

    adminInsert: `
        INSERT INTO admin (adminName, email, password)
        VALUES (?, ?, ?)
    `,

}

module.exports = adminAuthQueries;