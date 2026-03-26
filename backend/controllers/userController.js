const User = require('../models/User');
const Case = require('../models/Case');
const QRCode = require('qrcode');

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const cases = await Case.find({ userId: user._id });

    res.status(200).json({ 
      success: true, 
      data: {
        user,
        cases,
        qrCode: user?.qrCode || null,
        qrValue: user?.qrValue || null
      }
    });
  } catch (err) {
    console.error('❌ Get Me Error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Update current logged in user (name/email/phone) + regenerate QR
// @route   PUT /api/users/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const nameRaw = req.body?.name;
    const emailRaw = req.body?.email;
    const phoneRaw = req.body?.phone;

    const update = {};
    if (typeof nameRaw === 'string' && nameRaw.trim()) update.name = nameRaw.trim();
    if (typeof phoneRaw === 'string' && phoneRaw.trim()) update.phone = phoneRaw.trim();
    if (typeof emailRaw === 'string' && emailRaw.trim()) update.email = emailRaw.trim().toLowerCase();

    if (!update.name && !update.email && !update.phone) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    // Prevent email collisions
    if (update.email) {
      const exists = await User.findOne({ email: update.email, _id: { $ne: req.user.id } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Always regenerate QR after profile update
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const qrValue = `${frontendUrl}/user/${user._id}`;
      const qrCode = await QRCode.toDataURL(qrValue);
      user.qrValue = qrValue;
      user.qrCode = qrCode;
      await user.save({ validateBeforeSave: false });
    } catch (qrErr) {
      console.error('⚠️ QR regeneration failed:', qrErr && qrErr.message ? qrErr.message : qrErr);
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
        qrCode: user.qrCode || null,
        qrValue: user.qrValue || null,
      },
    });
  } catch (err) {
    console.error('❌ updateMe Error:', err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get User QR Code
// @route   GET /api/users/:id/qr
// @access  Private (User/Admin)
exports.getUserQR = async (req, res) => {
  try {
    // Check if the user is requesting their own QR, or if they are admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findById(req.params.id).select('qrCode qrValue');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, qrCode: user.qrCode || null, qrValue: user.qrValue || null });
  } catch (err) {
    console.error('❌ Get User QR Error:', err && err.message ? err.message : err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
