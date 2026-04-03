const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: null },
    name: { type: String, default: '' },
    /** Profile image URL (optional). */
    picture: { type: String, default: '' },
    phone: { type: String, default: '' },
    nationalId: { type: String, default: '' },
    governorate: { type: String, default: '' },
    city: { type: String, default: '' },
    emailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
  },
  { timestamps: true }
);

/** Unique among clients when nationalId is exactly 14 digits (legacy empty IDs excluded). */
userSchema.index(
  { nationalId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      role: 'client',
      nationalId: { $regex: /^\d{14}$/ },
    },
  }
);

userSchema.pre('save', async function enforceSingleAdmin(next) {
  if (this.role !== 'admin') {
    return next();
  }
  const UserModel = this.constructor;
  const filter = { role: 'admin' };
  if (this._id) {
    filter._id = { $ne: this._id };
  }
  try {
    const others = await UserModel.countDocuments(filter);
    if (others > 0) {
      const err = new Error('Only one administrator account is allowed.');
      err.statusCode = 403;
      return next(err);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('User', userSchema);
