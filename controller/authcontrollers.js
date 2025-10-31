const db = require('../config/db');
const bcrypt = require('bcryptjs');
const sendotp = require('../utils/sendotp');
const dayjs = require('dayjs');

// ─── Register ─────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = dayjs().add(5, 'minute').format('YYYY-MM-DD HH:mm:ss');

    await db.query(
      `INSERT INTO users (name, email, phone, password, isVerified, otp, otpExpires)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone.trim(), hashedPassword, false, otp, otpExpires]
    );

    await sendotp(email.trim(), otp);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT otp, otpExpires, isVerified FROM users WHERE email = ?',
      [email.trim()]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP already used or missing' });
    }

    const enteredOtp = String(otp).trim();
    const storedOtp = String(user.otp).trim();
    const isExpired = dayjs().isAfter(dayjs(user.otpExpires));
    const isMatch = enteredOtp === storedOtp;

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    if (isExpired) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    await db.query(
      'UPDATE users SET isVerified = true, otp = NULL, otpExpires = NULL WHERE email = ?',
      [email.trim()]
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ OTP verification error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// ─── Resend OTP ───────────────────────────────────────────────
const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT isVerified FROM users WHERE email = ?',
      [email.trim()]
    );
    const user = rows[0];

    if (!user || user.isVerified) {
      return res.status(400).json({ success: false, message: 'Invalid request or already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = dayjs().add(5, 'minute').format('YYYY-MM-DD HH:mm:ss');

    await db.query(
      'UPDATE users SET otp = ?, otpExpires = ? WHERE email = ?',
      [otp, otpExpires, email.trim()]
    );

    await sendotp(email.trim(), otp);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Resend OTP error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during OTP resend' });
  }
};

// ─── Login ────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim()]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login
};
