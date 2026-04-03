const mongoose = require('mongoose');

const trainingBookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    course: { type: String, required: true, trim: true },
    bookingDate: { type: String, required: true, trim: true },
    governorate: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingBooking', trainingBookingSchema);
