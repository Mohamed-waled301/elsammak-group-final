const express = require('express');
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

/** Public — no JWT or admin middleware */
router.post('/register', auth.register);
router.get('/status', auth.getAuthStatus);
router.post('/bootstrap-admin', auth.bootstrapAdmin);
/** Public — no JWT, role checks are handled in controller (password only) */
router.post('/login', auth.login);
router.get('/me', authenticate, auth.getMe);

router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', auth.verifyOtp);
router.post('/reset-password', auth.resetPassword);

module.exports = router;
