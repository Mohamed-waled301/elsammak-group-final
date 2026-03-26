const mongoose = require('mongoose');

const consultationBookingSchema = new mongoose.Schema(
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
    serviceType: { type: String, required: true, trim: true }, // legal | accounting | etc
    bookingDate: { type: String, required: true, trim: true }, // YYYY-MM-DD
    notes: { type: String, trim: true, default: '' },
    governorate: { type: String, trim: true },
    city: { type: String, trim: true },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConsultationBooking', consultationBookingSchema);

