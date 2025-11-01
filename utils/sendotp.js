const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendotp = async (email, otp) => {
  try {
    console.log('🔑 RESEND_API_KEY:', process.env.RESEND_API_KEY); // Debug
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🔐 Your OTP Code</h2>
          <p>Your one-time password is:</p>
          <h3 style="color: #007bff;">${otp}</h3>
          <p>This OTP will expire in 5 minutes.</p>
          <br>
          <p>— Job Portal Team</p>
        </div>
      `
    });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Resend OTP failed for ${email}:`, err.message);
    throw new Error('OTP delivery failed');
  }
};

module.exports = sendotp;
