const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

module.exports = (req, res, next) => {
  const headerKey = 'authorization';
  const authHeader = req.headers[headerKey];

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided in header' });
  }

  const parts = authHeader.trim().split(' ');
  const scheme = parts[0]?.toLowerCase();
  const token = parts[1];

  if (parts.length !== 2 || scheme !== 'bearer') {
    return res.status(401).json({ message: 'Invalid token format (expected Bearer <token>)' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Token verification failed:', err.message);
    }
    return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
  }
};
