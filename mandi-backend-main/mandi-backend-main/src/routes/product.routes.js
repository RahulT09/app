const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} = require("../validations/product.validation");

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
router.get("/admin/:id", protect, adminOnly, validate(productIdSchema), getProductAdmin);
router.post("/", protect, adminOnly, upload.array("images", 5), validate(createProductSchema), createProduct);
router.patch("/:id", protect, adminOnly, upload.array("images", 5), validate(updateProductSchema), updateProduct);
router.delete("/:id", protect, adminOnly, validate(productIdSchema), deleteProduct);

router.get("/:id", validate(productIdSchema), getProduct);

module.exports = router;
