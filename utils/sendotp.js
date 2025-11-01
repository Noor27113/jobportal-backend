const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendotp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🔐 Your OTP Code</h2>
          <p>Hello,</p>
          <p>Your one-time password is:</p>
          <h3 style="color: #007bff;">${otp}</h3>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p>— Job Portal Team</p>
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
