/**
 * Admin identity is defined only in the database (single user with role "admin").
 * No ADMIN_EMAIL / default admin in code or env.
 */
const User = require('../models/User');

function normalizeEmail(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

async function countAdminUsers() {
  return User.countDocuments({ role: 'admin' });
}

/** True if this email belongs to the stored administrator account. */
async function emailBelongsToAdmin(email) {
  const e = normalizeEmail(email);
  if (!e) return false;
  const u = await User.findOne({ email: e, role: 'admin' }).select('_id').lean();
  return Boolean(u);
}

module.exports = {
  normalizeEmail,
  countAdminUsers,
  emailBelongsToAdmin,
};
