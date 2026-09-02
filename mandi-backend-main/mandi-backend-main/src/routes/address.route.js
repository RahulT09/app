const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/address.controller");

//get all address
router.get("/", protect, getAddresses);

//create addres
router.post("/", protect, createAddress);

//update address
router.patch("/:id", protect, updateAddress);

//del addres
router.delete("/:id", protect, deleteAddress);

// Set default address
router.patch("/:id/default", protect, setDefaultAddress);

module.exports = router;
