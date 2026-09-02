const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");

const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getAllCategoriesAdmin,
  getCategoryAdmin,
} = require("../controllers/category.controller");

//public
router.get("/", getCategories);

//admin routes (must come before "/:id" so they aren't swallowed by it)
router.get("/admin/all", protect, adminOnly, getAllCategoriesAdmin);
router.get("/admin/:id", protect, adminOnly, getCategoryAdmin);
router.post("/", protect, adminOnly, createCategory);
router.put("/:id", protect, adminOnly, updateCategory);
router.delete("/:id", protect, adminOnly, deleteCategory);

router.get("/:id", getCategory);

module.exports = router;
