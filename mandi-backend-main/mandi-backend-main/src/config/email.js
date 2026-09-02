const nodemailer = require("nodemailer");

// Uses Resend SMTP in production (reliable on all cloud servers — no IP blocks).
// Falls back to Gmail App Password for local development.
//
// Production env vars needed on Render/Railway:
//   RESEND_API_KEY=re_xxxxxxxxxxxx   (from resend.com — free 3k/month)
//   EMAIL_FROM=no-reply@yourdomain.com  (verified domain in Resend, or use onboarding@resend.dev for testing)
//
// Local dev env vars (.env):
//   EMAIL_USER=your@gmail.com
//   EMAIL_PASSWORD=your-gmail-app-password

const isProduction = process.env.NODE_ENV === "production";

const transporter = isProduction
  ? nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    })
  : nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error.message);
  } else {
    console.log(`Email ready [${isProduction ? "Resend" : "Gmail"}]`);
  }
});

module.exports = transporter;
