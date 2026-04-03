const { getSecret, verifyAuthToken } = require('../utils/authToken');

function authenticate(req, res, next) {
  const secret = getSecret();
  if (!secret) {
    return res.status(503).json({ success: false, message: 'Server authentication is not configured' });
  }

  const authz = req.headers.authorization;
  if (!authz || !authz.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization required' });
  }

  try {
    const token = authz.slice(7).trim();
    const payload = verifyAuthToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'client',
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
}

module.exports = { authenticate };
