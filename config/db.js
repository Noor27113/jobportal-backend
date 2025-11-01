require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise'); // ✅ Use promise-based client

// ─── MySQL Connection Pool ───────────────────────────────────
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_HOST !== 'localhost'
    ? { rejectUnauthorized: true } // ✅ Enforce SSL for Railway
    : undefined
});

// ─── Connection Test ─────────────────────────────────────────
(async () => {
  try {
    const [rows] = await db.query('SELECT 1');
    console.log('✅ MySQL pool connected. Test query result:', rows);
  } catch (err) {
    console.error('❌ MySQL pool connection failed:', err.message);
  }
})();

module.exports = db;
