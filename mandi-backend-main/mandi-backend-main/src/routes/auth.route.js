const express = require("express");
const authController = require("../controllers/auth.controller");
const { loginRateLimiter } = require("../middlewares/rateLimit.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} = require("../validations/auth.validation");

const router = express.Router();

//POST api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  authController.userRegisterControl,
);
router.post(
  "/login",
  validate(loginSchema),
  loginRateLimiter,
  authController.userLoginControl,
);
router.post("/logout", authController.userLogoutControl);

router.get("/verify-email/:token", authController.verifyEmailControl);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPasswordControl,
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  authController.resetPasswordControl,
);

module.exports = router;
