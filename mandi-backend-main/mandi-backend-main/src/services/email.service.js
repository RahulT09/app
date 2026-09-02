const transporter = require("../config/email");

async function sendVerificationEmail(email, verificationUrl) {
  await transporter.sendMail({
    from: `"E-Commerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Welcome to our E-Commerce App</h2>

      <p>Please click the button below to verify your email:</p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>This link will expire in 15 minutes.</p>
    `,
  });
}

async function sendPasswordResetEmail(email, resetUrl) {
  await transporter.sendMail({
    from: `"E-Commerce App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>

      <p>
        You requested to reset your password.
      </p>

      <p>
        Click the button below to reset it:
      </p>

      <a href="${resetUrl}">
        Reset Password
      </a>

      <p>
        This link will expire in 15 minutes.
      </p>

      <p>
        If you didn't request this, you can ignore this email.
      </p>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
