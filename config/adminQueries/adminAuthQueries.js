const adminAuthQueries = {
    
    adminMailCheck: `SELECT * FROM admin WHERE admin_email = ?`,

    adminInsert: `
        INSERT INTO admin (admin_name, admin_email, admin_password)
        VALUES (?, ?, ?)
    `,

}

module.exports = adminAuthQueries;