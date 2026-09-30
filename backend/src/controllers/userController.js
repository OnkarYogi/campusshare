const User = require('../models/User');
const Resource = require('../models/Resource');
const BorrowRequest = require('../models/BorrowRequest');
const Rating = require('../models/Rating');

// @desc    Get user profile by ID with activity summary
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const listedCount = await Resource.countDocuments({
      steward: user._id,
      status: { $ne: 'archived' },
      isModerated: false,
    });

    const reviews = await Rating.find({ ratee: user._id })
      .populate('rater', 'name role avatarUrl')
      .populate('resource', 'title category')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      profile: {
        ...user.toSafeObject(),
        listedResourcesCount: listedCount,
        recentReviews: reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const { department, bio, avatarUrl, campusId } = req.body;
    if (department !== undefined) user.department = department;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (campusId !== undefined) user.campusId = campusId;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user borrowing and lending history
// @route   GET /api/users/me/history
// @access  Private
const getMyHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const borrowedTransactions = await BorrowRequest.find({ borrower: userId })
      .populate('resource', 'title category identifiers images location')
      .populate('steward', 'name email department avatarUrl trustScore')
      .sort({ createdAt: -1 });

    const lentTransactions = await BorrowRequest.find({ steward: userId })
      .populate('resource', 'title category identifiers images location')
      .populate('borrower', 'name email department avatarUrl trustScore')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      history: {
        borrowed: borrowedTransactions,
        lent: lentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  getMyHistory,
};
