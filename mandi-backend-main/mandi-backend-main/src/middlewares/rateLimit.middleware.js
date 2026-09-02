const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minute

  limit: 5, //max 5 attemp

  message: {
    success: false,
    message: "Too many login attempts. Please try again later",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginRateLimiter,
};
