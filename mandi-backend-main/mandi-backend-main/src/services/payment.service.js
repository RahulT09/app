require("dotenv").config();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
async function createRazorpayOrder({ amount, receipt }) {
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    // INR → paise
    currency: "INR",
    receipt,
  });
  return razorpayOrder;
}




async function getRazorpayPayment(paymentId) {
  const payment = await razorpay.payments.fetch(paymentId);
  return payment;
}


module.exports = { createRazorpayOrder, getRazorpayPayment };
