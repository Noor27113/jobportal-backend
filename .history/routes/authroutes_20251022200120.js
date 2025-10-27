

const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  login
} = require('../controller/authcontrollers');

// Auth routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

// Test route
router.get('/ping', (req, res) => {
  res.send('pong');
});

module.exports = router;


