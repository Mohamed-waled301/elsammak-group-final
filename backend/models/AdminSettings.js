const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'singleton', index: true },
    name: { type: String, required: true, trim: true, default: 'Admin' },
    email: { type: String, required: true, trim: true, lowercase: true, default: 'elsamakgroup0@gmail.com' },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);

