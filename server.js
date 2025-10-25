
require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); //  Parses form-data & x-www-form-urlencoded

app.use(morgan('dev')); // HTTP request logger
//  Request Logger (for debugging routes)
app.use((req, res, next) => {
  console.log(` Incoming: ${req.method} ${JSON.stringify(req.originalUrl)}`);
  next();
});

//  API Routes
app.use('/api', require('./routes/authroutes'));
// app.use('/api/jobs', require('./routes/jobs')); // Enable when ready

// 404 Handler (must come after all routes)
app.use((req, res) => {

  res.status(404).send(`Route not found: ${req.method} ${req.originalUrl}`);
});

//  Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
