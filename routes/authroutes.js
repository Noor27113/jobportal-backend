// /routes/authroutes.js

const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  login
} = require('../controller/authcontrollers');

// ─── Auth Endpoints ───────────────────────────────────────────
router.post('/register', register);       // Handles user registration
router.post('/verify-otp', verifyOtp);    // Verifies OTP after registration
router.post('/resend-otp', resendOtp);    // Resends OTP if needed
router.post('/login', login);             // Handles user login

// ─── Health Check (Optional) ─────────────────────────────────
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

module.exports = router;
