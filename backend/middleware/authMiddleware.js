const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Set req.user with the same shape downstream code expects
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      name: decoded.name || ''
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
