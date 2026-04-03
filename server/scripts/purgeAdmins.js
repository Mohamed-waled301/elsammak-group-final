/**
 * Remove all administrator users from MongoDB (lets you use first-time bootstrap again).
 * Usage (from server/): node scripts/purgeAdmins.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const r = await User.deleteMany({ role: 'admin' });
  console.log('Deleted admin users:', r.deletedCount);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
