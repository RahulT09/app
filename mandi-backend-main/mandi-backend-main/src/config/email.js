// Render and most cloud servers BLOCK outbound SMTP ports (465/587).
// Solution: use Resend's HTTP API (port 443 — always open) in production.
// Local dev still uses nodemailer + Gmail for convenience.

const isProduction = process.env.NODE_ENV === "production";

let resendClient = null;

if (isProduction) {
  const { Resend } = require("resend");
  resendClient = new Resend(process.env.RESEND_API_KEY);
  console.log("Email ready [Resend HTTP API]");
} else {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
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
      console.log("Email ready [Gmail]");
    }
  });
  // Wrap nodemailer in the same interface as Resend for email.service.js
  resendClient = {
    emails: {
      send: async ({ from, to, subject, html }) => {
        await transporter.sendMail({ from, to, subject, html });
        return { data: { id: "local" }, error: null };
      },
    },
  };
}

module.exports = resendClient;
