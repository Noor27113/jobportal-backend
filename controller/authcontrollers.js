


const db = require('../db');
const bcrypt = require('bcryptjs');
const sendOtp = require('../utils/sendOtp');

// Register user and send OTP
const register = async (req, res) => {
  console.log('Register route triggered');
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      console.warn(' Missing registration fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const sql = `
      INSERT INTO users (name, email, phone, password, isVerified, otp, otpExpires)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [name, email, phone, hashedPassword, false, otp, otpExpires], async (err) => {
      if (err) {
        console.error(' MySQL insert error:', err.message);
        return res.status(400).json({ message: 'Registration failed', error: err.message });
      }

      try {
        await sendOtp(email, otp);
        console.log(` OTP sent to ${email}`);
        res.status(200).json({ message: 'OTP sent to email' });
      } catch (emailErr) {
        console.error(' Email sending failed:', emailErr.message);
        res.status(500).json({ error: 'Failed to send OTP email' });
      }
    });
  } catch (err) {
    console.error(' Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Verify OTP
const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    console.warn(' Missing OTP verification fields');
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(' MySQL select error:', err.message);
      return res.status(500).json({ message: 'Database error during OTP verification' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    if (user.otp !== otp || new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const updateSql = `
      UPDATE users SET isVerified = true, otp = NULL, otpExpires = NULL WHERE email = ?
    `;
    db.query(updateSql, [email], (err) => {
      if (err) {
        console.error(' MySQL update error:', err.message);
        return res.status(500).json({ message: 'Verification failed' });
      }
      res.status(200).json({ message: 'Email verified successfully' });
    });
  });
};

// Login
const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.warn(' Missing login fields');
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(' MySQL select error:', err.message);
      return res.status(500).json({ message: 'Database error during login' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful' });
  });
};

module.exports = {
  register,
  verifyOtp,
  login
};
