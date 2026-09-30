const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Institutional email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'club_coordinator', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      default: 'General Studies',
      trim: true,
    },
    campusId: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    trustScore: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    totalCompletedLoans: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization (strip password)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    campusId: this.campusId,
    avatarUrl: this.avatarUrl,
    bio: this.bio,
    isVerified: this.isVerified,
    isSuspended: this.isSuspended,
    trustScore: Number(this.trustScore.toFixed(1)),
    totalCompletedLoans: this.totalCompletedLoans,
    totalReviews: this.totalReviews,
    averageRating: Number(this.averageRating.toFixed(1)),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
