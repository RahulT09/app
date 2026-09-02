require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/product.model');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await Product.find({});
  for (const p of products) {
    const badImages = p.images.filter(url => !url.startsWith('https://res.cloudinary.com'));
    if (badImages.length > 0) {
      p.images = p.images.filter(url => url.startsWith('https://res.cloudinary.com'));
      await p.save();
      console.log('Fixed product:', p.name, '- removed', badImages);
    }
  }
  console.log('Done');
  process.exit(0);
});
