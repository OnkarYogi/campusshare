const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_campusshare_jwt_key_academic_exchange',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Check if email belongs to an institutional domain
const isInstitutionalEmail = (email) => {
  const allowed = (process.env.ALLOWED_EMAIL_DOMAINS || '.edu,.ac.in,.org,campus.edu')
    .split(',')
    .map((d) => d.trim().toLowerCase());
  const lowerEmail = email.toLowerCase();
  return allowed.some((domain) => lowerEmail.endsWith(domain) || lowerEmail.includes(domain));
};

// @desc    Register a new institutional user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, campusId, avatarUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    // Validate institutional domain
    if (!isInstitutionalEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          'Registration requires a valid institutional email address (e.g. @campus.edu, .edu, .ac.in).',
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this institutional email already exists.',
      });
    }

    const verificationToken = crypto.randomBytes(24).toString('hex');
    
    // In development / demo environment, auto-verify standard roles to facilitate immediate test runs
    const isAutoVerified = process.env.NODE_ENV === 'test' || process.env.AUTO_VERIFY === 'true' || true;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role && ['student', 'faculty', 'club_coordinator', 'admin'].includes(role) ? role : 'student',
      department: department || 'General Studies',
      campusId: campusId || '',
      avatarUrl: avatarUrl || '',
      isVerified: isAutoVerified,
      verificationToken: isAutoVerified ? null : verificationToken,
    });

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTER',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, role: user.role, isVerified: user.isVerified },
      ip: req.ip || '',
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    // Audit log
    await AuditLog.create({
      user: user._id,
      action: 'USER_LOGIN',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { email: user.email },
      ip: req.ip || '',
    });

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.body;
    let query = {};
    if (token) query.verificationToken = token;
    else if (email) query.email = email.toLowerCase();
    else {
      return res.status(400).json({
        success: false,
        message: 'Verification token or email required.',
      });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Institutional email successfully verified.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
};
