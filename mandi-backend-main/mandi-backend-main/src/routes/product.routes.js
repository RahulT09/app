const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");


const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductAdmin,
} = require("../controllers/product.controller");

//public routes
router.get("/", getProducts);

//admin routes (must come before "/:id" so they aren't swallowed by it)
router.get("/admin/all", protect, adminOnly, getAllProductsAdmin);
router.get("/admin/:id", protect, adminOnly, getProductAdmin);
router.post("/", protect, adminOnly, upload.array("images", 5), createProduct);
router.patch("/:id", protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

router.get("/:id", getProduct);

module.exports = router;
