const express = require('express');
const { postQr } = require('../controllers/qrController');

const router = express.Router();
router.post('/', postQr);

module.exports = router;
