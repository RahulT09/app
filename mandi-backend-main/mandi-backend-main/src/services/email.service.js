const transporter = require("../config/email");

// In production (Resend): EMAIL_FROM = no-reply@yourdomain.com or onboarding@resend.dev
// In local dev (Gmail):   EMAIL_FROM = your@gmail.com  (or leave unset → falls back to EMAIL_USER)
const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.EMAIL_USER;

async function sendVerificationEmail(email, verificationUrl) {
  await transporter.sendMail({
    from: `"Mandi Store" <${FROM_ADDRESS}>`,
    to: email,
    subject: "Verify your email — Mandi",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#16213e">Welcome to Mandi!</h2>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#f0a202;color:#16213e;font-weight:700;border-radius:4px;text-decoration:none">
          Verify Email
        </a>
        <p style="color:#666;font-size:13px">This link expires in 15 minutes. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, resetUrl) {
  await transporter.sendMail({
    from: `"Mandi Store" <${FROM_ADDRESS}>`,
    to: email,
    subject: "Reset your password — Mandi",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#16213e">Password Reset</h2>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#f0a202;color:#16213e;font-weight:700;border-radius:4px;text-decoration:none">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px">This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
