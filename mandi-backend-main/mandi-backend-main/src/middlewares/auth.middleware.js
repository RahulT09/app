const userModel = require("../models/auth.model");
const jwt = require("jsonwebtoken");

async function protect(req, res, next) {
  try {
    const token = req.cookies?.JWT_TOKEN;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      const message =
        jwtError.name === "TokenExpiredError"
          ? "Session expired. Please log in again"
          : "Invalid authentication token";

      return res.status(401).json({
        success: false,
        message,
      });
    }

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("AUTH MIDDLEWARE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while authenticating",
    });
  }
}

module.exports = protect;
