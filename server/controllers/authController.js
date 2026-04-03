const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const OtpCode = require('../models/OtpCode');
const User = require('../models/User');
const VerifiedPasswordReset = require('../models/VerifiedPasswordReset');
const { normalizeEmail, countAdminUsers, emailBelongsToAdmin } = require('../utils/adminAccess');
const { isConfigured, getMailFrom, waitForInterSendGap, recordSendCompleted } = require('../utils/mailer');
const { sendOtpEmail } = require('../utils/sendEmail');
const { signAuthToken, isAuthConfigured } = require('../utils/authToken');

const egyptLocations = require(path.join(__dirname, '..', '..', 'data', 'egyptLocations.json'));

const OTP_SEND_MAX_ATTEMPTS = 3;
const OTP_SEND_RETRY_MS = 2000;
const BCRYPT_ROUNDS = 10;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function randomSixDigit() {
  return String(crypto.randomInt(100000, 1000000));
}

function mailFailureResponse(res, err) {
  return res.status(502).json({
    success: false,
    message: 'Could not send email. Please try again in a moment.',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
}

/**
 * Send 6-digit OTP to the given address using the shared Nodemailer transporter (with retries).
 */
async function sendOtpEmailViaTransporter(to, code) {
  console.log('SENDING OTP TO:', to);
  await waitForInterSendGap();

  let lastErr;
  for (let attempt = 1; attempt <= OTP_SEND_MAX_ATTEMPTS; attempt++) {
    try {
      await sendOtpEmail({ to, otp: code });
      recordSendCompleted();
      console.log('OTP SENT');
      return;
    } catch (err) {
      lastErr = err;
      console.log('OTP ERROR:', err.message);
      if (attempt < OTP_SEND_MAX_ATTEMPTS) {
        await sleep(OTP_SEND_RETRY_MS);
      }
    }
  }
  throw lastErr || new Error('OTP email failed');
}

/**
 * POST /api/auth/register — create client account (email verification required before login).
 */
async function register(req, res, next) {
  try {
    if (!isAuthConfigured()) {
      return res.status(503).json({ success: false, message: 'Server authentication is not configured' });
    }

    const parsed = validateClientRegisterBody(req.body);
    if (parsed.error) {
      return res.status(400).json({ success: false, message: parsed.error });
    }
    const { name, email, password, phone, nationalId, governorate, city } = parsed.values;

    const nationalIdTaken = await User.findOne({
      role: 'client',
      nationalId,
      email: { $ne: email },
    })
      .select('_id')
      .lean();
    if (nationalIdTaken) {
      return res.status(409).json({
        success: false,
        message: 'This National ID is already registered.',
      });
    }

    if (await emailBelongsToAdmin(email)) {
      return res.status(403).json({
        success: false,
        message: 'This email is reserved for the administrator account.',
      });
    }

    if (!isConfigured()) {
      return res.status(503).json({ success: false, message: 'Email service is not configured' });
    }

    const existing = await User.findOne({ email });
    let userDoc;
    let isNewUser = false;

    if (existing) {
      if (existing.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'This email is reserved for the administrator account.',
        });
      }
      if (existing.emailVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in.',
        });
      }
      existing.name = name;
      existing.phone = phone;
      existing.nationalId = nationalId;
      existing.governorate = governorate;
      existing.city = city;
      existing.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await existing.save();
      userDoc = existing;
    } else {
      isNewUser = true;
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      userDoc = await User.create({
        email,
        passwordHash,
        name,
        phone,
        nationalId,
        governorate,
        city,
        emailVerified: false,
        role: 'client',
      });
    }

    await OtpCode.deleteMany({ email, intent: 'register' });
    const otpValue = randomSixDigit();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.create({
      email,
      otp: otpValue,
      intent: 'register',
      otpExpires,
    });

    try {
      await sendOtpEmailViaTransporter(email, otpValue);
    } catch (lastErr) {
      await OtpCode.deleteMany({ email, intent: 'register' });
      if (isNewUser) {
        await User.deleteOne({ _id: userDoc._id });
      }
      return mailFailureResponse(res, lastErr);
    }

    return res.json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err) {
    if (err?.code === 11000 && err.keyPattern && Object.prototype.hasOwnProperty.call(err.keyPattern, 'nationalId')) {
      return res.status(409).json({
        success: false,
        message: 'This National ID is already registered.',
      });
    }
    return next(err);
  }
}

function validateAdminPasswordRules(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return 'Password must include uppercase, lowercase, number, and special character.';
  }
  return null;
}

function isValidEgyptGovernorateDistrict(governorate, district) {
  const districts = egyptLocations[governorate];
  return Array.isArray(districts) && districts.includes(district);
}

function validateClientRegisterBody(body) {
  const name = String(body?.name ?? '').trim();
  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? '');
  const confirmPassword = String(body?.confirmPassword ?? '');
  const phone = String(body?.phone ?? '').trim();
  const nationalIdRaw = String(body?.nationalId ?? '').replace(/\s/g, '');
  const governorate = String(body?.governorate ?? '').trim();
  const city = String(body?.city ?? body?.district ?? '').trim();

  if (!name || name.length > 200) {
    return { error: 'Full name is required (max 200 characters).' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'A valid email address is required.' };
  }
  const pwdErr = validateAdminPasswordRules(password.trim());
  if (pwdErr) return { error: pwdErr };
  if (password.trim() !== confirmPassword.trim()) {
    return { error: 'Passwords do not match.' };
  }
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 7) {
    return { error: 'A valid phone number is required (at least 7 digits).' };
  }
  if (phone.length > 40) {
    return { error: 'Phone number is too long.' };
  }
  if (!nationalIdRaw) {
    return { error: 'National ID is required.' };
  }
  if (!/^\d{14}$/.test(nationalIdRaw)) {
    return { error: 'National ID must be exactly 14 digits.' };
  }
  const nationalId = nationalIdRaw;
  if (!governorate) {
    return { error: 'Governorate is required.' };
  }
  if (!city) {
    return { error: 'District is required.' };
  }
  if (governorate.length > 120 || city.length > 120) {
    return { error: 'Governorate or district value is too long.' };
  }
  if (!isValidEgyptGovernorateDistrict(governorate, city)) {
    return { error: 'Invalid governorate or district selection.' };
  }
  return {
    values: { name, email, password: password.trim(), phone, nationalId, governorate, city },
  };
}

/**
 * GET /api/auth/status — whether an admin exists (for first-time setup UI).
 */
async function getAuthStatus(req, res, next) {
  try {
    const adminExists = (await countAdminUsers()) > 0;
    return res.json({ adminExists });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/bootstrap-admin — create the only admin account (allowed once).
 */
async function bootstrapAdmin(req, res, next) {
  try {
    if (!isAuthConfigured()) {
      return res.status(503).json({ success: false, message: 'Server authentication is not configured' });
    }

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? '').trim();
    const confirmPassword = String(req.body?.confirmPassword ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const pwdErr = validateAdminPasswordRules(password);
    if (pwdErr) {
      return res.status(400).json({ success: false, message: pwdErr });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // No Mongo transaction: standalone mongod (typical local dev) does not support transactions
    // without a replica set. The User model pre('save') hook still enforces a single admin.
    const admins = await User.countDocuments({ role: 'admin' });
    if (admins > 0) {
      return res.status(403).json({
        success: false,
        message: 'An administrator account already exists. Sign in instead.',
      });
    }
    const taken = await User.findOne({ email });
    if (taken) {
      return res.status(409).json({
        success: false,
        message: 'This email is already in use. Choose another address.',
      });
    }
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await User.create({
      email,
      passwordHash,
      name: 'Administrator',
      role: 'admin',
      emailVerified: true,
      nationalId: '',
      phone: '',
      governorate: '',
      city: '',
    });
    return res.status(201).json({
      success: true,
      message: 'Administrator account created. You can sign in with the Admin tab.',
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already in use. Choose another address.',
      });
    }
    console.log('BOOTSTRAP ADMIN ERROR:', err.message);
    return next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  const debugLogin = process.env.DEBUG_LOGIN === '1';
  console.log('LOGIN ROUTE HIT');
  try {
    if (!isAuthConfigured()) {
      return res.status(503).json({ success: false, message: 'Server authentication is not configured' });
    }

    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const rawPassword = String(req.body?.password ?? '');
    const password = rawPassword.trim();
    const adminMode = req.body?.mode === 'admin';

    if (debugLogin) {
      console.log('[auth/login DEBUG] inputs:', {
        email,
        passwordLength: password.length,
        rawLength: rawPassword.length,
        adminMode,
      });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (!adminMode && (await emailBelongsToAdmin(email))) {
      return res.status(403).json({
        success: false,
        message: 'Use the Admin tab to sign in with this account.',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      if (debugLogin) {
        console.log('[auth/login DEBUG] no user for email', { email, adminMode });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (adminMode && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This account is not an administrator.',
      });
    }

    if (!adminMode && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Use the Admin tab to sign in as administrator.',
      });
    }

    if (!user.passwordHash) {
      return res.status(401).json({
        success: false,
        message:
          'No password on file. Use Forgot password on the sign-in page to set one.',
      });
    }

    if (debugLogin && user.passwordHash) {
      console.log('[auth/login DEBUG] stored hash prefix:', String(user.passwordHash).slice(0, 7));
    }

    let passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (debugLogin) {
      console.log('[auth/login DEBUG] bcrypt.compare(trimmed):', passwordOk);
    }
    if (!passwordOk && rawPassword !== password) {
      passwordOk = await bcrypt.compare(rawPassword, user.passwordHash);
      if (debugLogin) {
        console.log('[auth/login DEBUG] bcrypt.compare(raw):', passwordOk);
      }
    }

    if (!passwordOk) {
      if (debugLogin) {
        console.log('[auth/login DEBUG] password rejected', { email, adminMode, userRole: user.role });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.emailVerified && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email using the code we sent.',
      });
    }

    const token = signAuthToken(user);
    return res.json({
      success: true,
      message: 'OK',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || '',
        phone: user.phone,
        nationalId: user.nationalId,
        governorate: user.governorate,
        city: user.city,
        role: user.role,
      },
    });
  } catch (err) {
    console.log('LOGIN ERROR:', err.message);
    return next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let qrCode = null;
    try {
      const { buildClientQrDataUrl } = require('../utils/userQr');
      qrCode = await buildClientQrDataUrl(user);
    } catch (qrErr) {
      console.warn('[auth] getMe QR generation failed:', qrErr.message);
    }

    return res.json({
      data: {
        user: {
          _id: user._id,
          name: user.name || '',
          email: user.email,
          picture: user.picture || '',
          phone: user.phone || '',
          nationalId: user.nationalId || '',
          governorate: user.governorate || '',
          city: user.city || '',
          role: user.role === 'admin' ? 'admin' : 'client',
        },
        trainings: [],
        consultations: [],
        qrCode,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/send-otp
 */
async function sendOtp(req, res, next) {
  console.log('OTP ROUTE HIT');
  console.log('BODY:', req.body);
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('OTP: no user for email:', email);
      return res.status(404).json({
        success: false,
        message: 'No account exists for this email address.',
      });
    }

    if (!isConfigured()) {
      console.log('[auth] EMAIL ERROR: transporter not configured');
      return res.status(503).json({ success: false, message: 'Email service is not configured' });
    }

    const otpValue = randomSixDigit();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await OtpCode.deleteMany({ email, intent: 'password-reset' });
    await OtpCode.create({
      email,
      otp: otpValue,
      intent: 'password-reset',
      otpExpires,
    });

    try {
      await sendOtpEmailViaTransporter(email, otpValue);
    } catch (lastErr) {
      await OtpCode.deleteMany({ email, intent: 'password-reset' });
      return mailFailureResponse(res, lastErr);
    }

    return res.json({
      success: true,
      message: 'Verification code sent to your email.',
    });
  } catch (err) {
    console.log('[auth] OTP HANDLER FAILURE:', err.message);
    try {
      const email = String(req.body?.email || '')
        .trim()
        .toLowerCase();
      if (email) await OtpCode.deleteMany({ email, intent: 'password-reset' });
    } catch {
      /* ignore */
    }
    if (err.message && /mail|smtp|transporter|configured/i.test(err.message)) {
      return mailFailureResponse(res, err);
    }
    return next(err);
  }
}

/**
 * POST /api/auth/verify-otp
 * Body: { email, otp } — optional intent: 'register' | 'password-reset' (default: password-reset)
 */
async function verifyOtp(req, res, next) {
  console.log('VERIFY-OTP ROUTE HIT');
  console.log('REQUEST BODY:', { ...req.body, otp: req.body?.otp ? '[redacted]' : undefined });
  try {
    if (!isAuthConfigured()) {
      return res.status(503).json({ success: false, message: 'Server authentication is not configured' });
    }

    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const otpRaw = req.body?.otp ?? req.body?.code;
    const otp = String(otpRaw != null ? otpRaw : '').replace(/\s/g, '');
    const intent = req.body?.intent === 'register' ? 'register' : 'password-reset';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email and 6-digit code are required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const doc = await OtpCode.findOne({ email, intent }).sort({ createdAt: -1 });
    if (!doc) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const exp = doc.otpExpires;
    if (!exp || exp.getTime() <= Date.now()) {
      await OtpCode.deleteMany({ email, intent });
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (doc.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    await OtpCode.deleteMany({ email, intent });

    if (intent === 'register') {
      if (user.role === 'admin') {
        return res.status(403).json({ success: false, message: 'Invalid request.' });
      }
      user.emailVerified = true;
      await user.save();
      const token = signAuthToken(user);
      return res.json({
        success: true,
        message: 'Account activated.',
        token,
        user: {
          _id: user._id,
          name: user.name || '',
          email: user.email,
          picture: user.picture || '',
          phone: user.phone,
          nationalId: user.nationalId,
          governorate: user.governorate,
          city: user.city,
          role: 'client',
        },
      });
    }

    await VerifiedPasswordReset.deleteMany({ email });
    await VerifiedPasswordReset.create({
      email,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return res.json({ success: true, message: 'Code verified' });
  } catch (err) {
    console.log('VERIFY-OTP ERROR:', err.message);
    return next(err);
  }
}

/**
 * POST /api/auth/reset-password  { email, newPassword }
 */
async function resetPassword(req, res, next) {
  console.log('RESET-PASSWORD ROUTE HIT');
  console.log('REQUEST BODY:', { ...req.body, newPassword: req.body?.newPassword ? '[redacted]' : undefined });
  try {
    if (!isAuthConfigured()) {
      return res.status(503).json({ success: false, message: 'Server authentication is not configured' });
    }

    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Email and password (6+ chars) required' });
    }

    const session = await VerifiedPasswordReset.findOne({
      email,
      expiresAt: { $gt: new Date() },
    });
    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired or invalid. Request a new code.',
      });
    }

    await VerifiedPasswordReset.deleteMany({ email });

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account exists for this email address.' });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { passwordHash, emailVerified: true } }
    );
    const updated = await User.findById(user._id);
    const token = signAuthToken(updated);

    return res.json({
      success: true,
      message: 'Password updated',
      token,
    });
  } catch (err) {
    console.log('RESET-PASSWORD ERROR:', err.message);
    return next(err);
  }
}

/**
 * GET /test-otp — SMTP check to owner inbox.
 */
async function getTestOtp(req, res) {
  console.log('TEST-OTP ROUTE HIT');
  if (!isConfigured()) {
    return res.status(503).send('Error: email not configured');
  }
  const owner = getMailFrom();
  const dummy = '123456';
  try {
    console.log('[auth] test-otp recipient:', owner);
    await sendOtpEmail({ to: owner, otp: dummy });
    return res.send(`Test OTP email sent to ${owner} with code ${dummy}`);
  } catch (err) {
    console.log('[auth] TEST-OTP ERROR:', err.message);
    return res.status(500).send('Error: ' + err.message);
  }
}

module.exports = {
  register,
  getAuthStatus,
  bootstrapAdmin,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
  getTestOtp,
};
