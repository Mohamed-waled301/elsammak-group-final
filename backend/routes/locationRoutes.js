const express = require('express');
const locations = require('../utils/locations.json');

const router = express.Router();

// @desc    Get all locations
// @route   GET /api/locations
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ success: true, data: locations });
});

module.exports = router;
