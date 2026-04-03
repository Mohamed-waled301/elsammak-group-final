const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20_000,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
  },
  { timestamps: true }
);

contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
