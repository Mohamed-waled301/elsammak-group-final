const express = require('express');
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.post('/register', auth.register);
router.get('/status', auth.getAuthStatus);
router.post('/bootstrap-admin', auth.bootstrapAdmin);
router.post('/login', auth.login);
router.get('/me', authenticate, auth.getMe);

router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
