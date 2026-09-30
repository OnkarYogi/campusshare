import React, { useState } from 'react';
import { ratingService } from '../services/api';

const RatingModal = ({ isOpen, onClose, transaction, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const res = await ratingService.submitRating({
        transactionId: transaction._id || transaction.id,
        rating,
        reviewText,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-surface-container-low p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <span className="material-symbols-outlined text-secondary text-[20px]">hotel_class</span>
            Rate Academic Exchange
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-red-50 text-xs text-error font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-500">Resource Exchanged</p>
            <p className="text-sm font-bold text-slate-900 line-clamp-1">
              {transaction.resource?.title || 'Academic Equipment'}
            </p>
          </div>

          {/* Interactive 5-Star Selector */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="text-amber-400 hover:scale-110 transition-transform p-1 focus:outline-none"
              >
                <span
                  className="material-symbols-outlined text-[32px]"
                  style={{
                    fontVariationSettings: `'FILL' ${
                      (hoverRating || rating) >= star ? 1 : 0
                    }`,
                  }}
                >
                  star
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs font-semibold text-slate-700">
            {rating === 5
              ? '⭐⭐⭐⭐⭐ Exceptional Exchange'
              : rating === 4
              ? '⭐⭐⭐⭐ Good Condition & Prompt'
              : rating === 3
              ? '⭐⭐⭐ Satisfactory'
              : 'Needs Improvement'}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Community Review Feedback
            </label>
            <textarea
              rows={3}
              placeholder="Was the equipment returned clean and on time? Any notes for fellow campus members?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-slate-900 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
