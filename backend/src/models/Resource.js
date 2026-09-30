const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'textbooks',
        'electronics',
        'lab_gear',
        'project_kits',
        'sports',
        'other',
      ],
      default: 'other',
    },
    identifiers: {
      type: String,
      trim: true,
      default: '', // ISBN, Serial number, Model number
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: ['brand_new', 'like_new', 'good', 'fair'],
      default: 'good',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'General',
    },
    location: {
      type: String,
      required: [true, 'Campus pickup location is required'],
      trim: true, // e.g. "North MakerSpace Station • Room 204"
    },
    maxLoanDurationDays: {
      type: Number,
      required: [true, 'Maximum loan duration is required'],
      min: [1, 'Loan duration must be at least 1 day'],
      max: [90, 'Loan duration cannot exceed 90 days'],
      default: 14,
    },
    images: {
      type: [String],
      default: [],
    },
    steward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'requested', 'borrowed', 'maintenance', 'archived'],
      default: 'available',
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderationReason: {
      type: String,
      default: '',
    },
    specifications: [
      {
        label: String,
        value: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Full text search index
resourceSchema.index({
  title: 'text',
  description: 'text',
  identifiers: 'text',
  department: 'text',
});

module.exports = mongoose.model('Resource', resourceSchema);
