const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../models/order.model");

const {
  createRazorpayOrder,
  getRazorpayPayment,
} = require("../services/payment.service");

//verify payment
async function verifyPayment(req, res) {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // 1. Validate required fields
    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // 2. Validate MongoDB order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }
    // 3. Find order belonging to logged-in user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // 4. Make sure the Razorpay order belongs to our order
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order does not match",
      });
    }

    // 5. Don't process an already-paid order
    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }
    // 6. Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // 7. Fetch actual payment from Razorpay
    const payment = await getRazorpayPayment(razorpay_payment_id);

    // 8. Make sure payment belongs to the same Razorpay order
    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this order",
      });
    }

    // 9. Check payment amount
    const expectedAmount = Math.round(order.totalAmount * 100);

    if (payment.amount !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order amount",
      });
    }

    // 10. Payment must actually be captured
    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment is not captured. Current status: ${payment.status}`,
      });
    }

    // 11. Update order
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = "PAID";
    order.status = "CONFIRMED";

    await order.save();

    // 12. Send response
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
        razorpayPaymentId: order.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not verify payment",
    });
  }
}

//creaye razorpay payment order
async function createPayment(req, res) {
  try {
    const { orderId } = req.body;
    // 1. Validate order ID
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // 2. Find order belonging to logged-in user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 3. Make sure order is still pending
    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This order cannot be paid",
      });
    }

    // 4. Make sure payment hasn't already been completed
    if (order.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // 5. If Razorpay order already exists,
    // return it instead of creating another one
    if (order.razorpayOrderId) {
      return res.status(200).json({
        success: true,
        message: "Payment order already created",
        data: {
          orderId: order._id,
          razorpayOrderId: order.razorpayOrderId,
          amount: order.totalAmount,
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    }

    // 6. Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: order.totalAmount,
      receipt: `order_${order._id}`,
    });

    // 7. Store Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    // 8. Return details to frontend
    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("CREATE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create payment",
    });
  }
}

module.exports = {
  createPayment,
  verifyPayment,
};
