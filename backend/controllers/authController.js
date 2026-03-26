const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const QRCode = require('qrcode');
const Case = require('../models/Case');
const bcrypt = require('bcryptjs');
const TrainingBooking = require('../models/TrainingBooking');
const ConsultationBooking = require('../models/ConsultationBooking');
const AdminSettings = require('../models/AdminSettings');

// Email validation regex
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Generate JWT
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Strict fixed admin credentials (do not store plain password).
// PASSWORD: Waled1981@
const FIXED_ADMIN_EMAIL = 'elsamakgroup0@gmail.com';
// bcrypt hash for "Waled1981@" (10 rounds)
const FIXED_ADMIN_PASSWORD_HASH = '$2b$10$uOXtOuh.UiRRfNBroLYUIelfnBpMioZA/gV1TC5vJWhei/UG922gy';

exports.adminLogin = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    const passwordRaw = req.body?.password;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
    const password = typeof passwordRaw === 'string' ? passwordRaw : '';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Load admin settings (if present) to allow profile updates, while still enforcing a single admin account.
    const settings = await AdminSettings.findOne({ key: 'singleton' }).select('email name passwordHash');
    const adminEmail = settings?.email || FIXED_ADMIN_EMAIL;
    const adminName = settings?.name || 'Admin';
    const adminHash = settings?.passwordHash || FIXED_ADMIN_PASSWORD_HASH;

    if (email !== adminEmail) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const ok = await bcrypt.compare(password, adminHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({
      success: true,
      token: jwt.sign(
        { id: 'admin', role: 'admin', admin: true, email: adminEmail, name: adminName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
      )
    });
  } catch (err) {
    console.error('❌ Admin Login Error:', err);
    return res.status(500).json({ success: false, message: 'Login error' });
  }
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    console.log("🔥 Register Hit");

    const { name, email: emailRaw, password, nationalId, phone, governorate, city } = req.body;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

    if (!name || !email || !password || !nationalId || !phone || !governorate || !city) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password,
      nationalId,
      phone,
      governorate,
      city,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000
    });

    console.log("✅ User created");

    // Generate and store QR (client id/profile URL)
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const qrValue = `${frontendUrl}/user/${user._id}`;
      const qrCode = await QRCode.toDataURL(qrValue);
      user.qrValue = qrValue;
      user.qrCode = qrCode;
      await user.save({ validateBeforeSave: false });
    } catch (qrErr) {
      console.error('⚠️ QR generation failed:', qrErr && qrErr.message ? qrErr.message : qrErr);
    }

    // Send OTP to email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Verification OTP',
        message: `Your OTP for email verification is: ${otp}\n\nThis OTP will expire in 5 minutes.`
      });
    } catch (emailErr) {
      console.error("⚠️ Email sending failed:", emailErr.message);
      // Don't fail the registration if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: "User registered. Please check your email for OTP"
    });

  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ success: false, message: "Registration error" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
  try {
    const { email: emailRaw, otp } = req.body;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';
    const otpValue = otp === undefined || otp === null ? '' : String(otp).trim();

    if (!email || !otpValue) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required"
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const user = await User.findOne({ email });

    const otpExpiresAt = user?.otpExpires instanceof Date ? user.otpExpires.getTime() : (user?.otpExpires ? new Date(user.otpExpires).getTime() : NaN);
    if (!user || user.otp !== otpValue || !Number.isFinite(otpExpiresAt) || otpExpiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error('❌ Verify OTP Error:', err);
    res.status(500).json({
      success: false,
      // Avoid leaking internal details in production.
      message:
        process.env.NODE_ENV === 'production'
          ? 'Verify error'
          : `Verify error: ${
              err === undefined
                ? 'undefined'
                : err === null
                  ? 'null'
                  : (err.message || err.name || String(err))
            }`
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email: emailRaw, password } = req.body;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Verify your email first"
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login error" });
  }
};

// ================= RESEND OTP =================
exports.resendOTP = async (req, res) => {
  try {
    console.log("🔥 Resend OTP Hit");

    const { email: emailRaw } = req.body;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    console.log("🔢 OTP:", otp);

    // Send OTP to email
    try {
      await sendEmail({
        to: user.email,
        subject: 'OTP Resend - Email Verification',
        message: `Your new OTP for email verification is: ${otp}\n\nThis OTP will expire in 5 minutes.`
      });
    } catch (emailErr) {
      console.error("⚠️ Email sending failed:", emailErr.message);
      // Still return success as OTP was generated, but log the email failure
    }

    res.status(200).json({
      success: true,
      message: "OTP resent to your email"
    });

  } catch (err) {
    console.error("❌ Resend Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Resend OTP error"
    });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const emailRaw = req.body?.email;
    const email = typeof emailRaw === 'string' ? emailRaw.trim().toLowerCase() : '';

    // Always return success to prevent user enumeration.
    if (!email || !isValidEmail(email)) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, we have sent a reset link to it.'
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: 'Password Reset',
          message:
            `You requested a password reset.\n\n` +
            `Reset link (valid for 10 minutes):\n${resetLink}\n\n` +
            `If you did not request this, you can ignore this email.`
        });
      } catch (emailErr) {
        // Don't fail the request if email sending fails.
        console.error('⚠️ Reset email sending failed:', emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'If the email exists, we have sent a reset link to it.'
    });
  } catch (err) {
    console.error('❌ Forgot Password Error:', err.message);
    return res.status(500).json({ success: false, message: 'Forgot password error' });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const resetToken = typeof req.params?.resettoken === 'string' ? req.params.resettoken : '';
    const passwordRaw = req.body?.password ?? req.body?.newPassword;
    const password = typeof passwordRaw === 'string' ? passwordRaw : '';

    if (!resetToken || !password) {
      return res.status(400).json({ success: false, message: 'Reset token and password are required' });
    }

    // Basic password safety (schema will hash; keep this lightweight).
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      resetToken,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error('❌ Reset Password Error:', err.message);
    return res.status(500).json({ success: false, message: 'Reset password error' });
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Best-effort QR generation for legacy users (created before QR fields existed).
    if (!user.qrCode || !user.qrValue) {
      try {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrValue = `${frontendUrl}/user/${user._id}`;
        const qrCode = await QRCode.toDataURL(qrValue);
        user.qrValue = qrValue;
        user.qrCode = qrCode;
        await user.save({ validateBeforeSave: false });
      } catch (qrErr) {
        console.error('⚠️ QR generation in getMe failed:', qrErr && qrErr.message ? qrErr.message : qrErr);
      }
    }

    const [cases, trainings, consultations] = await Promise.all([
      Case.find({ userId: user._id }),
      TrainingBooking.find({ userId: user._id }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId: user._id }).sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user,
        cases,
        trainings,
        consultations,
        qrCode: user.qrCode || null,
        qrValue: user.qrValue || null
      }
    });
  } catch (err) {
    console.error('❌ Get Me Error:', err.message);
    return res.status(500).json({ success: false, message: 'Get me error' });
  }
};