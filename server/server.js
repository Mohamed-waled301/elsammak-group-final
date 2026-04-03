const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
// Load monorepo root .env, then server/.env with override so PORT, MONGO_URI, JWT_SECRET, etc. apply.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });

const { createCorsMiddleware } = require('./config/cors');
const connectDB = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const qrRoutes = require('./routes/qrRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { getTestOtp } = require('./controllers/authController');
const { sendMailWithRetry, isConfigured, getMailFrom } = require('./utils/mailer');
const errorHandler = require('./middleware/errorHandler');
const { isAuthConfigured } = require('./utils/authToken');

const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';
const devPortFile = path.join(__dirname, '..', '.dev-api-port');

if (!isAuthConfigured()) {
  console.warn('[server] JWT_SECRET is missing or shorter than 16 chars — login, register, and token reset will fail.');
}
const app = express();

// CORS must run before routes (including /api/auth/*).
// Allows https://elsammak-group-final-e1du.vercel.app + local dev; uses `cors` (see ./config/cors.js).
// For open testing only: CORS_ORIGIN=* in env (credentials disabled). Optional: app.use(cors());
app.use(createCorsMiddleware());
app.use(express.json({ limit: '512kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'elsammak-api' });
});

app.get('/test-otp', getTestOtp);

app.get('/test-email', async (req, res) => {
  if (!isConfigured()) {
    return res.send('Error: EMAIL_USER or EMAIL_PASS missing in server/.env');
  }
  const from = getMailFrom();
  try {
    console.log('[test-email] recipient:', from);
    const info = await sendMailWithRetry({
      from,
      to: from,
      subject: 'TEST EMAIL',
      text: 'If you receive this, email works!',
    });
    res.send('Email sent: ' + info.response);
  } catch (err) {
    console.log('[test-email] ERROR:', err.message);
    res.status(500).send('Error: ' + err.message);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/media', mediaRoutes);

app.use(errorHandler);

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('[startup] Database connection failed:', err.message);
    process.exit(1);
  }

  if (!isProd) {
    try {
      fs.unlinkSync(devPortFile);
    } catch (_) {
      /* ignore */
    }
  }

  const maxPort = PORT + 30;

  function listenOn(p) {
    const server = http.createServer(app);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && !isProd && p < maxPort) {
        console.warn(`[server] Port ${p} is in use, trying ${p + 1}…`);
        listenOn(p + 1);
        return;
      }
      console.error('[server] Listen failed:', err.message);
      process.exit(1);
    });

    server.listen(p, '0.0.0.0', () => {
      if (!isProd) {
        fs.writeFileSync(devPortFile, String(p), 'utf8');
      }
      if (p !== PORT && !isProd) {
        console.warn(`[server] Using port ${p} (default ${PORT} was busy). Client dev uses .dev-api-port / VITE_API_URL.`);
      }
      console.log(`[server] Listening on http://127.0.0.1:${p}`);
      console.log(`[server] Test email: http://127.0.0.1:${p}/test-email`);
      console.log(`[server] Test OTP:   http://127.0.0.1:${p}/test-otp`);
    });
  }

  listenOn(PORT);
}

start();
