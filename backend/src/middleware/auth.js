const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_campusshare_jwt_key_academic_exchange'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by campus administration.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please sign in again.',
      });
    }
    next(error);
  }
};

// Middleware: Require verified institutional account
const requireVerified = (req, res, next) => {
  if (!req.user || !req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Institutional verification required to perform this action.',
    });
  }
  next();
};

// Middleware: Require specific role(s)
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of the following roles: [${roles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = { auth, requireVerified, requireRole };
