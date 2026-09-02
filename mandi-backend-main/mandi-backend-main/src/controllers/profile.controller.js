const userModel = require("../models/auth.model");

async function getProfile(req, res) {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

//update name / phone number only — email and password change through their own flows
async function updateProfile(req, res) {
  try {
    const { name, phoneNumber } = req.body;

    const updates = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length < 2 || trimmed.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 100 characters",
        });
      }
      updates.name = trimmed;
    }

    if (phoneNumber !== undefined) {
      const trimmed = String(phoneNumber).trim();
      if (trimmed && !/^\d{10}$/.test(trimmed)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits",
        });
      }
      updates.phoneNumber = trimmed || undefined;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That phone number is already in use",
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

module.exports = { getProfile, updateProfile };
