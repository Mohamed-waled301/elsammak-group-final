const express = require('express');
const { postTrainingBooking } = require('../controllers/trainingBookingController');

const router = express.Router();
router.post('/booking', postTrainingBooking);

module.exports = router;
