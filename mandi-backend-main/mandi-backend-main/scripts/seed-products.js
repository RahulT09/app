require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../src/models/product.model.js");
const Category = require("../src/models/category.model.js");
const { uploadImage } = require("../src/services/cloudinary.service.js");

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected");

    console.log("Fetching products from dummyjson...");
    const response = await fetch("https://dummyjson.com/products?limit=20");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from dummyjson: ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.products;

    let createdCount = 0;

    for (const p of products) {
      // Skip if product already exists
      const existingProduct = await Product.findOne({ name: p.title });
      if (existingProduct) {
        console.log(`Skipped: Product "${p.title}" already exists.`);
        continue;
      }

      // Find or create Category
      const categoryName = p.category;
      let categoryDoc = await Category.findOne({ name: categoryName });
      
      if (!categoryDoc) {
        categoryDoc = await Category.create({
          name: categoryName,
          description: `All things ${categoryName}`,
        });
      }

      // Download and upload thumbnail
      let imageUrl = "";
      if (p.thumbnail) {
        try {
          const imgResponse = await fetch(p.thumbnail);
          if (!imgResponse.ok) {
            throw new Error(`Failed to download image: ${imgResponse.status}`);
          }
          
          const arrayBuffer = await imgResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          const uploadResult = await uploadImage(buffer);
          imageUrl = uploadResult.secure_url;
        } catch (imgError) {
          console.error(`Failed to process image for "${p.title}":`, imgError.message);
          // We still proceed even if image upload fails
        }
      }

      // Create Product
      const productPriceInINR = Math.round(p.price * 85);
      const randomStock = Math.floor(Math.random() * (50 - 5 + 1)) + 5;

      await Product.create({
        name: p.title,
        description: p.description,
        price: productPriceInINR,
        stock: randomStock,
        category: categoryDoc._id,
        images: imageUrl ? [imageUrl] : [],
        isActive: true,
      });

      console.log(`Created: Product "${p.title}" (Category: ${categoryName}, Price: ₹${productPriceInINR})`);
      createdCount++;
    }

    console.log(`\nSeed completed successfully! Total new products created: ${createdCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();
