const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} = require("../controllers/order.controller");

// Checkout / create order
router.post("/", protect, createOrder);

// Get my orders
router.get("/", protect, getMyOrders);

// Admin: get all orders (must come before "/:id" so it isn't swallowed by it)
router.get("/admin/all", protect, adminOnly, getAllOrdersAdmin);

// Admin: update order status
router.patch("/:id/status", protect, adminOnly, updateOrderStatusAdmin);

// Get single order
router.get("/:id", protect, getOrderById);

// Cancel order
router.post("/:id/cancel", protect, cancelOrder);

module.exports = router;
