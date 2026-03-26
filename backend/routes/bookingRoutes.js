const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createTrainingBooking,
  createConsultationBooking,
  getMyBookings,
  getAvailability,
} = require('../controllers/bookingController');

const router = express.Router();

router.use(protect);

// Availability calendar (must be authed)
router.get('/availability', getAvailability);

// Training booking
router.post('/training', createTrainingBooking);

// Consultation booking
router.post('/consultation', createConsultationBooking);

// My bookings
router.get('/me', getMyBookings);

module.exports = router;

