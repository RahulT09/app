const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const { uploadImage } = require("../services/cloudinary.service");

/**
 * Escapes all special RegExp metacharacters in a raw user string so it
 * is treated as a literal search term. Without this, a crafted input
 * like "(a+)+" causes catastrophic backtracking (ReDoS) in the MongoDB
 * regex engine and can hang the server.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//create prod
async function createProduct(req, res) {
  try {
    const { name, description, price, stock, category } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      stock === undefined ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price, stock and category are required",
      });
    }

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Check whether category exists
    const existingCategory = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    // Check images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // Upload images to Cloudinary
    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadImage(file.buffer, file.mimetype);

      uploadedImages.push(result.secure_url);
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      images: uploadedImages,
    });


    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//get all product (with pagination, search, filters)
async function getProducts(req, res) {
  try {
    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isActive: true };

    // Search by name or description
    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), "i");
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Filter by category ID
    if (req.query.category) {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      }
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (req.query.sort === "price_asc") sortOption = { price: 1 };
    else if (req.query.sort === "price_desc") sortOption = { price: -1 };
    else if (req.query.sort === "oldest") sortOption = { createdAt: 1 };
    else if (req.query.sort === "name_asc") sortOption = { name: 1 };
    else if (req.query.sort === "name_desc") sortOption = { name: -1 };

    // Execute query with pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//get single product
async function getProduct(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//update prod
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // multipart/form-data (when new image files are attached) sends every
    // other field as a string, so normalize before validating.
    const isMultipart = !!req.files;
    const { name, description, category } = req.body;

    const price =
      req.body.price !== undefined && req.body.price !== ""
        ? Number(req.body.price)
        : undefined;
    const stock =
      req.body.stock !== undefined && req.body.stock !== ""
        ? isMultipart
          ? parseInt(req.body.stock, 10)
          : req.body.stock
        : undefined;
    const isActive =
      req.body.isActive !== undefined
        ? isMultipart
          ? req.body.isActive === "true"
          : req.body.isActive
        : undefined;

    if (price !== undefined) {
      if (typeof price !== "number" || Number.isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a non-negative number",
        });
      }
      product.price = price;
    }

    if (stock !== undefined) {
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative integer",
        });
      }
      product.stock = stock;
    }

    // Existing images to retain: sent as a JSON array (JSON body) or a
    // JSON-encoded string field "existingImages" (multipart body).
    let keptImages;
    if (isMultipart) {
      if (req.body.existingImages !== undefined) {
        try {
          keptImages = JSON.parse(req.body.existingImages);
        } catch {
          return res.status(400).json({
            success: false,
            message: "existingImages must be a JSON array of URLs",
          });
        }
      }
    } else if (req.body.images !== undefined) {
      keptImages = req.body.images;
    }

    if (keptImages !== undefined && !Array.isArray(keptImages)) {
      return res.status(400).json({
        success: false,
        message: "Images must be an array",
      });
    }

    if (isMultipart && req.files.length > 0) {
      const uploadedImages = [];
      for (const file of req.files) {
        const result = await uploadImage(file.buffer, file.mimetype);
        uploadedImages.push(result.secure_url);
      }
      product.images = [...(keptImages ?? product.images), ...uploadedImages];
    } else if (keptImages !== undefined) {
      product.images = keptImages;
    }

    if (product.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A product must have at least one image",
      });
    }

    // If category is being changed, verify it exists
    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const existingCategory = await Category.findOne({
        _id: category,
        isActive: true,
      });

      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      product.category = category;
    }
    if (name !== undefined) {
      product.name = name;
    }
    if (description !== undefined) {
      product.description = description;
    }
    if (isActive !== undefined) {
      product.isActive = isActive;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//delete prod
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//admin: list all products, active or not, with pagination/search/filter
async function getAllProductsAdmin(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), "i");
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (
      req.query.category &&
      mongoose.Types.ObjectId.isValid(req.query.category)
    ) {
      filter.category = req.query.category;
    }

    if (req.query.status === "active") filter.isActive = true;
    if (req.query.status === "inactive") filter.isActive = false;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

//admin: fetch a single product regardless of active state
async function getProductAdmin(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductAdmin,
};
