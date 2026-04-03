/**
 * Must run after authenticate. Ensures JWT payload role is admin.
 */
function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Administrator access required.' });
  }
  return next();
}

module.exports = { requireAdmin };
