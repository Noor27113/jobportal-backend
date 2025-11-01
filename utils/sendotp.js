const nodemailer = require('nodemailer');

// ─── Transporter Setup ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: parseInt(process.env.EMAIL_PORT, 10), // 587
  secure: false, // TLS over port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // ✅ Accept Railway's self-signed cert
  }
});

// ─── OTP Email Sender ──────────────────────────────────────
const sendotp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">🔐 Your OTP Code</h2>
          <p>Hello,</p>
          <p>Your one-time password is:</p>
          <h3 style="color: #007bff; font-size: 24px;">${otp}</h3>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p style="color: #555;">— Job Portal Team</p>
        </div>
      `
    });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (err) {
    console.error(`❌ OTP email failed for ${email}:`, err.message);
    throw new Error('OTP delivery failed');
  }
};

module.exports = sendotp;
