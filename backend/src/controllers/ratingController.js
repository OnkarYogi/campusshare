const Rating = require('../models/Rating');
const BorrowRequest = require('../models/BorrowRequest');
const Notification = require('../models/Notification');
const { recalculateTrustScore } = require('../utils/trustScoreEngine');

// @desc    Submit a review and rating after transaction return
// @route   POST /api/ratings
// @access  Private (Participant in returned transaction)
const submitRating = async (req, res, next) => {
  try {
    const { transactionId, rating, reviewText } = req.body;

    if (!transactionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID and star rating (1-5) are required.',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const transaction = await BorrowRequest.findById(transactionId).populate('resource');
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Borrow transaction not found.',
      });
    }

    // SRS Business Rule: Ratings are allowed only after completed transactions
    if (transaction.status !== 'returned') {
      return res.status(400).json({
        success: false,
        message:
          'SRS Rule Violation: Ratings can only be submitted after the item has been returned and confirmed.',
      });
    }

    const userIdStr = req.user._id.toString();
    const isBorrower = transaction.borrower.toString() === userIdStr;
    const isSteward = transaction.steward.toString() === userIdStr;

    if (!isBorrower && !isSteward) {
      return res.status(403).json({
        success: false,
        message: 'You are not a verified participant of this transaction.',
      });
    }

    const role = isBorrower ? 'borrower_to_steward' : 'steward_to_borrower';
    const rateeId = isBorrower ? transaction.steward : transaction.borrower;

    // Check if user already submitted rating for this transaction
    const existing = await Rating.findOne({
      transaction: transaction._id,
      rater: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a rating for this exchange.',
      });
    }

    const newRating = await Rating.create({
      transaction: transaction._id,
      resource: transaction.resource._id,
      rater: req.user._id,
      ratee: rateeId,
      role,
      rating: numRating,
      reviewText: reviewText || '',
    });

    // Mark rating completed flag on transaction
    if (isBorrower) {
      transaction.borrowerRated = true;
    } else {
      transaction.stewardRated = true;
    }
    await transaction.save();

    // Recalculate recipient's trust score
    const updatedTrust = await recalculateTrustScore(rateeId);

    // Send notification to recipient
    await Notification.create({
      recipient: rateeId,
      sender: req.user._id,
      type: 'rating_received',
      title: 'New Trust Review Received',
      message: `${req.user.name} rated your exchange ${numRating} stars: "${reviewText || 'Great exchange!'}"`,
      resource: transaction.resource._id,
      request: transaction._id,
    });

    res.status(201).json({
      success: true,
      message: 'Review and rating submitted successfully. Community trust score updated.',
      rating: newRating,
      updatedRateeTrustScore: updatedTrust,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews received by a user
// @route   GET /api/ratings/user/:id
// @access  Public
const getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.id })
      .populate('rater', 'name role avatarUrl trustScore')
      .populate('resource', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRating, getUserRatings };
