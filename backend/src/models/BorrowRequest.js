const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    steward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    purpose: {
      type: String,
      required: [true, 'Borrowing purpose is required'],
      trim: true,
      maxlength: [1000, 'Purpose cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    handoverNotes: {
      type: String,
      default: '',
    },
    returnNotes: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    borrowedAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    borrowerRated: {
      type: Boolean,
      default: false,
    },
    stewardRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

borrowRequestSchema.index({ borrower: 1, status: 1 });
borrowRequestSchema.index({ steward: 1, status: 1 });
borrowRequestSchema.index({ resource: 1, status: 1 });

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
