const mongoose = require('mongoose');

const trainingBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    bookingDate: { type: String, required: true, trim: true }, // YYYY-MM-DD (seat reservation date)
    governorate: { type: String, trim: true },
    city: { type: String, trim: true },

    startDate: { type: String, required: true, trim: true }, // e.g. 2026-04-01
    schedule: { type: String, required: true, trim: true }, // human readable
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingBooking', trainingBookingSchema);

