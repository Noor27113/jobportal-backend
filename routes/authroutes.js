const express = require('express');
const router = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  login
} = require('../controller/authcontrollers');

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);

router.get('/ping', (req, res) => res.status(200).send('pong'));

module.exports = router;
