const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: true,
      index: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['borrower_to_steward', 'steward_to_borrower'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review from same rater on same transaction
ratingSchema.index({ transaction: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
