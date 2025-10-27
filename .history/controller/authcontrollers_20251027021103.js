const db = require('../db');
const bcrypt = require('bcryptjs');
const sendotp = require('../utils/sendotp');

// ─── Register ─────────────────────────────────────────────────
const register = async (req, res) => {
  console.log('📥 Register route triggered');
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for duplicate email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const sql = `
      INSERT INTO users (name, email, phone, password, isVerified, otp, otpExpires)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [name, email, phone, hashedPassword, false, otp, otpExpires]);

    await sendotp(email, otp);
    console.log(`✅ OTP sent to ${email}`);
    res.status(200).json({ message: 'OTP sent to email' });

  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    if (user.otp !== otp || new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await db.query(`
      UPDATE users SET isVerified = true, otp = NULL, otpExpires = NULL WHERE email = ?
    `, [email]);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('❌ OTP verification error:', err.message);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// ─── Login ────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
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
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  register,
  verifyOtp,
  login
};
