const mongoose = require('mongoose');

const qrDataSchema = new mongoose.Schema(
  {
    data: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
  },
  { timestamps: true }
);

qrDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('QRData', qrDataSchema);
