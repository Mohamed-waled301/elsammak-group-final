/**

 * Ensure a User document exists so POST /api/auth/send-otp can send mail.

 * Usage (from server/): node scripts/seedUser.js you@example.com

 */

const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });



const mongoose = require('mongoose');

const User = require('../models/User');



const raw = process.argv[2];

const email = raw ? String(raw).trim().toLowerCase() : '';



async function main() {

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

    console.error('Usage: node scripts/seedUser.js <email>');

    process.exit(1);

  }

  const uri = process.env.MONGO_URI;

  if (!uri) {

    console.error('MONGO_URI is not set');

    process.exit(1);

  }

  await mongoose.connect(uri);

  const admin = await User.findOne({ email, role: 'admin' });

  if (admin) {

    console.error('This email is the administrator account. Do not seed it as a generic user.');

    process.exit(1);

  }

  await User.findOneAndUpdate({ email }, { email }, { upsert: true });

  console.log('User ready for OTP:', email);

  await mongoose.disconnect();

}



main().catch((e) => {

  console.error(e);

  process.exit(1);

});

