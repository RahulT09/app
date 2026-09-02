const express = require("express");
const router = express.Router()

const protect = require("../middlewares/auth.middleware.js")
const { getProfile, updateProfile } = require('../controllers/profile.controller')


router.get("/me",protect, getProfile)
router.patch("/me", protect, updateProfile)

module.exports = router;