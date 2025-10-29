require('dotenv').config();
const mysql = require('mysql2');

console.log(`Connecting to MySQL at: ${process.env.DB_HOST}`);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, conn) => {
  if (err) {
    console.error(' MySQL pool connection failed:', err.code || err.message);
  } else {
    console.log('MySQL pool is healthy');
    conn.release();
  }
});

module.exports = pool.promise();
