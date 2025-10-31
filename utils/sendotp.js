const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendotp = async (email, otp) => {
  await transporter.sendMail({
    from: `"Job Portal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
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
};

module.exports = sendotp;
