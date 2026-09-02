const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
  createPayment,
  verifyPayment,
} = require("../controllers/payment.controller");

router.post("/create", protect, createPayment);

router.post("/verify", protect, verifyPayment);

module.exports = router;
