const mongoose = require('mongoose');

/** Created after OTP verify; allows one password change within the window */
const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

schema.index({ email: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerifiedPasswordReset', schema);
