require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db'); // Your DB connection logic

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses form-data & x-www-form-urlencoded
app.use(morgan('dev')); // Logs HTTP requests

// Custom request logger (for debugging)
app.use((req, res, next) => {
  console.log(`📥 Incoming: ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('✅ Job Portal Backend is Live');
});

app.use('/api', require('./routes/authroutes'));
// app.use('/api/jobs', require('./routes/jobs')); // Enable when ready

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
