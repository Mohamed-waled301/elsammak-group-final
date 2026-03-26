require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Case = require('../models/Case');
const TrainingBooking = require('../models/TrainingBooking');
const ConsultationBooking = require('../models/ConsultationBooking');

const TEST_USER_QUERY = {
  role: 'user',
  $or: [
    { name: { $regex: 'otp', $options: 'i' } },
    { email: { $regex: 'otp', $options: 'i' } },
    { email: { $regex: 'example\\.com$', $options: 'i' } },
    { email: { $regex: 'test', $options: 'i' } },
  ],
};

(async () => {
  try {
    await connectDB();
    const users = await User.find(TEST_USER_QUERY).select('_id email name');
    if (!users.length) {
      console.log('No test users found. Nothing to delete.');
      process.exit(0);
    }

    const ids = users.map((u) => u._id);
    console.log('Deleting users:', users.map((u) => `${u.email} (${u.name})`).join(', '));

    const [casesRes, trainingsRes, consultsRes, usersRes] = await Promise.all([
      Case.deleteMany({ userId: { $in: ids } }),
      TrainingBooking.deleteMany({ userId: { $in: ids } }),
      ConsultationBooking.deleteMany({ userId: { $in: ids } }),
      User.deleteMany({ _id: { $in: ids } }),
    ]);

    console.log('Deleted cases:', casesRes.deletedCount);
    console.log('Deleted trainings:', trainingsRes.deletedCount);
    console.log('Deleted consultations:', consultsRes.deletedCount);
    console.log('Deleted users:', usersRes.deletedCount);
    process.exit(0);
  } catch (e) {
    console.error('Cleanup failed:', e);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
})();

