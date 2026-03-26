const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  let token;

  if (typeof auth === 'string') {
    // Expect: "Bearer <token>"
    if (auth.toLowerCase().startsWith('bearer ')) {
      token = auth.split(' ')[1];
    }
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Allow strict fixed admin token without DB lookup.
    if (decoded && decoded.role === 'admin' && decoded.admin === true) {
      req.user = {
        id: decoded.id || 'admin',
        _id: decoded.id || 'admin',
        role: 'admin',
        email: decoded.email || process.env.ADMIN_EMAIL || 'elsamakgroup0@gmail.com',
        name: decoded.name || 'Admin'
      };
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

module.exports = { protect };
