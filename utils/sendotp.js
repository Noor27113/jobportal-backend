// /utils/sendotp.js or /services/sendotp.js

const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // TLS is auto-enabled on port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendotp = async (email, otp) => {
  const mailOptions = {
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🔐 Email Verification</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #2e6c80;">${otp}</h1>
        <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
        <br>
        <p>Thanks,<br>Job Portal Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send OTP to ${email}:`, err.message);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = sendotp;
