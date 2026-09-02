const userModel = require("../models/auth.model");
const { generateToken, hashToken } = require("../utils/token.js");
const { generateAccessToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/email.service");

//user register
async function userRegisterControl(req, res) {
  try {
    let { name, email, password, phoneNumber } = req.body;

    //basic validatio
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    //existing users
    const existingUser = await userModel.findOne({
      $or: [{ email }, ...(phoneNumber ? [{ phoneNumber }] : [])],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    //user creation
    const user = await userModel.create({
      name,
      email,
      password,
      phoneNumber,
    });

    //generate verification token
    const verificationToken = generateToken();
    //hast token in db
    user.emailVerificationToken = hashToken(verificationToken);
    //expiry in 15 min
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    //create evrification link
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // Fire-and-forget — a failed email must never crash registration.
    // The user account is already saved; log the error server-side.
    sendVerificationEmail(user.email, verificationUrl).catch((err) => {
      console.error("[email] sendVerificationEmail failed:", err.message);
    });

    // const token = jwt.sign(
    //   { id: user._id, role: user.role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "1d" },
    // );
    // res.cookie("JWT_TOKEN", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      // token,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//user login
async function userLoginControl(req, res) {
  try {
    let { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    //find user
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    //update last login
    user.lastLogin = new Date();
    await user.save();

    //gen jwt
    const token = generateAccessToken(user);

    //cookie
    // In production the Next.js proxy (Vercel) and the API (Render) are on
    // different domains, so the cookie must be SameSite=None; Secure to
    // survive the server-to-server hop. Locally we use Lax (no HTTPS needed).
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("JWT_TOKEN", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // token, // optional for testing
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//logout
async function userLogoutControl(req, res) {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("JWT_TOKEN", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successfull",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
}

//verify email
async function verifyEmailControl(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    //hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userModel
      .findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {
          $gt: Date.now(),
        },
      })
      .select("+emailVerificationToken +emailVerificationExpires");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    user.emailVerified = true;

    //remove token after successful verifi
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//forgot password
async function forgotPasswordControl(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    // Always return 200 regardless of whether the email exists.
    // This prevents attackers from enumerating valid accounts by
    // probing which emails return 404 vs 200.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = generateToken();

    //store hashed token
    user.passwordResetToken = hashToken(resetToken);

    // Token expires in 15 minutes
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    //reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Fire-and-forget — email failure must never crash this endpoint.
    sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
      console.error("[email] sendPasswordResetEmail failed:", err.message);
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//reset password
async function resetPasswordControl(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    //hash token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    //find valid token
    const user = await userModel
      .findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          $gt: Date.now(),
        },
      })
      .select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Change password
    user.password = password;

    // Delete reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

module.exports = {
  userRegisterControl,
  userLoginControl,
  userLogoutControl,
  verifyEmailControl,
  forgotPasswordControl,
  resetPasswordControl,
};
