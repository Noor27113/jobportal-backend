//  Environment Setup 
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.railway' : '.env.local'
});
console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);


const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require('./config/db');
const authRoutes = require('./routes/authroutes');

const app = express();


app.use(cors());
app.use(helmet()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});


app.get('/', (req, res) => {
  res.send('Job Portal Backend is Live');
});


app.use('/api/auth', authRoutes);

// 404 Handler 
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Internal error:', err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// DB Connection Test
db.getConnection()
  .then(conn => {
    console.log(`Connected to MySQL via pool: ${process.env.DB_HOST}`);
    conn.release();
  })
  .catch(err => {
    console.log('MySQL pool connection failed:', err.message);
  });

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
