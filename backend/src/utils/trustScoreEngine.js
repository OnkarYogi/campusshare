const Rating = require('../models/Rating');
const User = require('../models/User');

/**
 * Recalculates and updates the trust score for a user.
 * Formula balances review stars (1 to 5) with completed exchange volume:
 * Trust Score = clamp(1.0, 5.0, (avgRating * 0.8) + (completionBonus * 0.2))
 */
const recalculateTrustScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const ratings = await Rating.find({ ratee: userId });
    const totalReviews = ratings.length;

    let averageRating = 5.0;
    if (totalReviews > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      averageRating = sum / totalReviews;
    }

    // Volume completion incentive (caps at +1.0 for 10 completed loans)
    const completionBonus = Math.min(1.0, (user.totalCompletedLoans || 0) * 0.1);

    // Compute composite trust score
    let calculatedScore;
    if (totalReviews === 0) {
      // New member baseline
      calculatedScore = Math.min(5.0, 4.8 + completionBonus * 0.2);
    } else {
      calculatedScore = averageRating * 0.85 + (4.0 + completionBonus) * 0.15;
    }

    const finalScore = Math.max(1.0, Math.min(5.0, Number(calculatedScore.toFixed(1))));

    user.trustScore = finalScore;
    user.averageRating = Number(averageRating.toFixed(1));
    user.totalReviews = totalReviews;
    await user.save();

    return {
      trustScore: finalScore,
      averageRating: user.averageRating,
      totalReviews,
    };
  } catch (error) {
    console.error(`[Trust Score Engine Error] ${error.message}`);
    throw error;
  }
};

module.exports = { recalculateTrustScore };
