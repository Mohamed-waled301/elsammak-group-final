require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// ✅ Middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : null;

app.use(corsOrigins
  ? cors({ origin: corsOrigins, credentials: true })
  : cors({ origin: true, credentials: true })
);
app.use(express.json({ limit: '1mb' }));

let dbReady = false;

// ✅ Test route مهم جدًا
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ Test route تاني
app.get("/test", (req, res) => {
  res.json({ message: "API works ✅" });
});

// ✅ Health route
app.get('/health', (req, res) => {
  if (dbReady) return res.status(200).json({ status: 'ok' });
  return res.status(503).json({ status: 'db_not_connected' });
});

const ensureDbReady = (req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({
      success: false,
      message: 'Service unavailable: database not connected'
    });
  }
  return next();
};

// ✅ Routes (guarded until DB is connected)
app.use('/api/auth', ensureDbReady, require('./routes/authRoutes'));
app.use('/api/users', ensureDbReady, require('./routes/userRoutes'));
app.use('/api/admin', ensureDbReady, require('./routes/adminRoutes'));
app.use('/api/locations', ensureDbReady, require('./routes/locationRoutes'));
app.use('/api/bookings', ensureDbReady, require('./routes/bookingRoutes'));
app.use('/api/org-structure', require('./routes/orgRoutes'));

// ❌ Error handler (مهم عشان مايكراش)
app.use((err, req, res, next) => {
  console.error("❌ GLOBAL ERROR:", err);

  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err && err.message) ? err.message : 'Internal server error';

  if (res.headersSent) return next(err);
  res.status(500).json({ success: false, message });
});

const PORT = process.env.PORT || 8080;

// ✅ شغل السيرفر بعد DB (but never hard-exit)
(async () => {
  try {
    await connectDB();
    dbReady = true;
    console.log("DB connected.");
  } catch (err) {
    console.error("❌ DB CONNECTION FAILED:", err && err.message ? err.message : err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
})();