const mysql = require('mysql2/promise');
require('dotenv').config();
const util = require("util");

// Use connection pool instead of a single connection
const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Promisify the pool.query method
// pool.query = util.promisify(pool.query);

// module.exports = pool;
module.exports = { db }
    