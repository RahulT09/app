// Brevo (formerly Sendinblue) HTTP API — works from any cloud server (HTTPS port 443).
// Free tier: 300 emails/day to ANY email address. No custom domain needed.
// Just verify your Gmail address as a sender in the Brevo dashboard.
//
// Render env vars needed:
//   BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxx  (from brevo.com → API Keys)
//   EMAIL_FROM=your@gmail.com               (must be verified in Brevo dashboard)
//
// Local dev uses Gmail SMTP via nodemailer (EMAIL_USER + EMAIL_PASSWORD in .env)

const https = require("https");

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sends an email via Brevo HTTP API in production,
 * or nodemailer Gmail in local dev.
 */
async function sendEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  if (isProduction) {
    // Brevo HTTP API — no SMTP, no port blocking
    return new Promise((resolve, reject) => {
      const body = JSON.stringify({
        sender: { name: "Mandi Store", email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      });

      const options = {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  } else {
    // Local dev — nodemailer + Gmail
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({ from, to, subject, html });
  }
}

module.exports = { sendEmail };
