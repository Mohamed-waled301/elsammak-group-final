const mongoose = require('mongoose');

/**
 * One active OTP per (email, intent). TTL removes expired rows from MongoDB.
 * Legacy documents used `code` / `expiresAt` — re-request OTP after deploy if needed.
 */
const otpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    intent: {
      type: String,
      enum: ['password-reset', 'register'],
      default: 'password-reset',
    },
    otpExpires: { type: Date, required: true },
  },
  { timestamps: true }
);

otpCodeSchema.index({ email: 1, intent: 1 });
otpCodeSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpCode', otpCodeSchema);
