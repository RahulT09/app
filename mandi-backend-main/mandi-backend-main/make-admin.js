require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/auth.model');

// Usage: node make-admin.js your@email.com
const email = process.argv[2];
if (!email) { console.error('Usage: node make-admin.js <email>'); process.exit(1); }

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const res = await User.updateOne({ email }, { role: 'ADMIN' });
  if (res.matchedCount === 0) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`Done — ${email} is now ADMIN`);
  }
  process.exit(0);
});
