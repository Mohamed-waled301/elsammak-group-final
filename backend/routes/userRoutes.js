const express = require('express');
const { getMe, updateMe, getUserQR } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Protect all user routes

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/:id/qr', getUserQR);

module.exports = router;
