const User = require('../models/User');
const Resource = require('../models/Resource');
const BorrowRequest = require('../models/BorrowRequest');
const AuditLog = require('../models/AuditLog');

// @desc    Get system-wide metrics and dashboard KPIs
// @route   GET /api/admin/metrics
// @access  Private (Admin)
const getMetrics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });

    const totalListings = await Resource.countDocuments({ status: { $ne: 'archived' } });
    const availableListings = await Resource.countDocuments({ status: 'available', isModerated: false });
    const activeBorrowings = await BorrowRequest.countDocuments({
      status: { $in: ['approved', 'borrowed'] },
    });
    const completedLoans = await BorrowRequest.countDocuments({ status: 'returned' });

    // Category breakdown
    const categoryStats = await Resource.aggregate([
      { $match: { status: { $ne: 'archived' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          suspended: suspendedUsers,
        },
        catalog: {
          totalListings,
          availableListings,
          categoryBreakdown: categoryStats,
        },
        transactions: {
          activeBorrowings,
          completedLoans,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, isVerified, search, page = 1, limit = 25 } = req.query;
    const query = {};

    if (role && role !== 'all') query.role = role;
    if (isVerified !== undefined && isVerified !== 'all') query.isVerified = isVerified === 'true';

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { department: regex }, { campusId: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      users: users.map((u) => u.toSafeObject()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or set user verification status (FR-25)
// @route   PATCH /api/admin/users/:id/verify
// @access  Private (Admin)
const toggleUserVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : !user.isVerified;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: user.isVerified ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, isVerified: user.isVerified },
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: `User institutional verification set to ${user.isVerified}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or set user suspension status (FR-27)
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private (Admin)
const toggleUserSuspension = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isSuspended = req.body.isSuspended !== undefined ? req.body.isSuspended : !user.isSuspended;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: user.isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      targetType: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, isSuspended: user.isSuspended, reason: req.body.reason || 'Policy violation' },
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: `User account suspension set to ${user.isSuspended}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resources including moderated/archived
// @route   GET /api/admin/resources
// @access  Private (Admin)
const getAllResources = async (req, res, next) => {
  try {
    const resources = await Resource.find()
      .populate('steward', 'name email role department')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate or flag a resource listing (FR-26)
// @route   PATCH /api/admin/resources/:id/moderate
// @access  Private (Admin)
const moderateResource = async (req, res, next) => {
  try {
    const { isModerated, moderationReason } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    resource.isModerated = isModerated !== undefined ? isModerated : !resource.isModerated;
    if (moderationReason) resource.moderationReason = moderationReason;
    await resource.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'RESOURCE_MODERATED',
      targetType: 'Resource',
      targetId: resource._id.toString(),
      details: { title: resource.title, isModerated: resource.isModerated },
      ip: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: `Listing moderation set to ${resource.isModerated}.`,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system audit logs (FR-28, NFR-14)
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  getUsers,
  toggleUserVerification,
  toggleUserSuspension,
  getAllResources,
  moderateResource,
  getAuditLogs,
};
