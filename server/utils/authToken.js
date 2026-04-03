const jwt = require('jsonwebtoken');

function getSecret() {
  const s = (process.env.JWT_SECRET || '').trim();
  if (!s || s.length < 16) return null;
  return s;
}

function isAuthConfigured() {
  return Boolean(getSecret());
}

/**
 * @param {{ _id: unknown, email: string, role?: string }} user
 */
function signAuthToken(user) {
  const secret = getSecret();
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role || 'client',
    },
    secret,
    { expiresIn: '7d' }
  );
}

function verifyAuthToken(token) {
  const secret = getSecret();
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.verify(token, secret);
}

module.exports = {
  getSecret,
  isAuthConfigured,
  signAuthToken,
  verifyAuthToken,
};
