const resend = require("../config/email");

// Production: EMAIL_FROM must be a verified Resend sender (or onboarding@resend.dev for testing)
// Local dev:  falls back to EMAIL_USER
const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.EMAIL_USER;

async function sendVerificationEmail(email, verificationUrl) {
  const { error } = await resend.emails.send({
    from: `Mandi Store <${FROM_ADDRESS}>`,
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
        <p style="color:#666;font-size:13px">This link expires in 15 minutes. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message ?? JSON.stringify(error));
}

async function sendPasswordResetEmail(email, resetUrl) {
  const { error } = await resend.emails.send({
    from: `Mandi Store <${FROM_ADDRESS}>`,
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
        <p style="color:#666;font-size:13px">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
  if (error) throw new Error(error.message ?? JSON.stringify(error));
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
