require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: false }
    : undefined
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL pool connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL via pool');
    conn.release();
  }
});

module.exports = pool.promise();
