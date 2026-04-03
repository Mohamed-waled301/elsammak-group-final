const express = require('express');
const { postContact } = require('../controllers/contactController');

const router = express.Router();
router.post('/', postContact);

module.exports = router;
