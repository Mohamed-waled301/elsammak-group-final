const express = require('express');

const {
  register,
  login,
  adminLogin,
  verifyOTP,
  getMe,
  forgotPassword,
  resetPassword,
  resendOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ================= AUTH ROUTES =================
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;