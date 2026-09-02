const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart.controller");


//get my cart
router.get("/", protect, getCart);

//add prod
router.post("/items", protect, addToCart);

// Update quantity
router.patch("/items/:productId", protect, updateCartItem);

// Remove product
router.delete("/items/:productId", protect, removeCartItem);

// Clear cart
router.delete("/", protect, clearCart);


module.exports = router;
