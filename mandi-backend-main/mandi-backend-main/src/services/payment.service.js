require("dotenv").config();
const Razorpay = require("razorpay");

let razorpay = null;
function getRazorpayInstance() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
    });
  }
  return razorpay;
}

// Create Razorpay order
async function createRazorpayOrder({ amount, receipt }) {
  const instance = getRazorpayInstance();
  const razorpayOrder = await instance.orders.create({
    amount: Math.round(amount * 100),
    // INR → paise
    currency: "INR",
    receipt,
  });
  return razorpayOrder;
}

async function getRazorpayPayment(paymentId) {
  const instance = getRazorpayInstance();
  const payment = await instance.payments.fetch(paymentId);
  return payment;
}

module.exports = { createRazorpayOrder, getRazorpayPayment };
