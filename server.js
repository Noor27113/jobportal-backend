// 🌐 Environment Setup
require('dotenv').Config({
  path: process.env.NODE_ENV === 'production' ? '.env.railway' : '.env.local'
});
console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);

// 🚀 Core Imports
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require('./config/db');
const authRoutes = require('./routes/authroutes');

const app = express();

// 🔐 CORS Setup for Netlify Frontend
app.use(cors({
  origin: 'https://noorjobportal.netlify.app',
  credentials: true
}));

// 🛡️ Middleware Stack
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 📋 Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// 🔍 Health Check Route
app.get('/', (req, res) => {
  res.send('Job Portal Backend is Live');
});

// 🔐 Auth Routes
app.use('/api/auth', authRoutes);

// ❌ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// 💥 Central Error Handler
app.use((err, req, res, next) => {
  console.error('Internal error:', err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// 🧪 MySQL Connection Test
db.getConnection()
  .then(conn => {
    console.log(`Connected to MySQL via pool: ${process.env.DB_HOST}`);
    conn.release();
  })
  .catch(err => {
    console.log('MySQL pool connection failed:', err.message);
  });

// 🚀 Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
