const mongoose = require('mongoose');

/**
 * Connect to MongoDB. Throws on failure so the caller can exit or handle.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || !String(uri).trim()) {
    const err = new Error('MONGO_URI is missing or empty. Set it in server/.env');
    err.code = 'MONGO_URI_MISSING';
    throw err;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Mongoose disconnected');
  });

  mongoose.connection.on('error', (e) => {
    console.error('[db] Mongoose connection error:', e.message);
  });

  console.log('[db] MongoDB connected');
}

module.exports = connectDB;
