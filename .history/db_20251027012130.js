require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL pool connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL via pool');
    conn.release();
  }
});

module.exports = pool.promise(); // ✅ Use promise-based pool
