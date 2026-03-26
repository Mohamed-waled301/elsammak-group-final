const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Do not return password by default
  },
  nationalId: {
    type: String,
    required: [true, 'Please add a National ID'],
    minlength: 14,
    maxlength: 14
  },
  phone: {
    type: String, // WhatsApp
    required: [true, 'Please add a phone number']
  },
  governorate: {
    type: String,
    required: [true, 'Please add a governorate']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  resetToken: {
    type: String
  },
  resetTokenExpires: {
    type: Date
  },
  qrValue: {
    type: String
  },
  qrCode: {
    type: String // data URL (base64)
  }
}, {
  timestamps: true // createdAt and updatedAt
});

// Hash password before saving if modified.
// Use an async pre hook without `next` callback to avoid runtime issues.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
