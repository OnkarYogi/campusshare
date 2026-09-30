import React, { useState } from 'react';
import { borrowService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ResourceDetailsModal = ({ resource, isOpen, onClose, onRequestSuccess, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Form state
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const defaultReturn = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(defaultReturn);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !resource) return null;

  const images =
    resource.images && resource.images.length > 0
      ? resource.images
      : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'];

  const isSteward = user && resource.steward && (user._id === resource.steward._id || user.id === resource.steward._id || user.email === resource.steward.email);
  const isAvailable = resource.status === 'available';

  // Calculate days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (isSteward) {
      setError('You cannot borrow your own resource (SRS Rule 5.5).');
      return;
    }

    if (!purpose.trim()) {
      setError('Please describe your academic purpose or project.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await borrowService.createRequest({
        resourceId: resource._id || resource.id,
        startDate,
        endDate,
        purpose,
      });

      if (res.success) {
        setSuccessMsg('Your borrow request has been sent to the steward for review!');
        setTimeout(() => {
          if (onRequestSuccess) onRequestSuccess();
          onClose();
        }, 1800);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit borrow request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Top Breadcrumb & Status Bar */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Catalog</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="capitalize">{resource.category.replace('_', ' ')}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {resource.identifiers || 'Asset #EQ-8842'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Academic Commons Certified
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (60%): Images, Description, Specs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Title & Department */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                    {resource.department}
                  </span>
                  <span className="text-xs text-slate-500 font-medium capitalize">
                    Condition: {resource.condition.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="font-headline text-2xl font-extrabold text-slate-900 leading-tight">
                  {resource.title}
                </h2>
              </div>

              {/* Gallery */}
              <div className="space-y-2">
                <div className="relative aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img
                    src={images[selectedPhotoIndex] || images[0]}
                    alt={resource.title}
                    className="w-full h-full object-cover transition-opacity duration-200"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px]">location_on</span>
                    {resource.location}
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPhotoIndex === idx
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-headline font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Equipment Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {resource.description}
                </p>
              </div>

              {/* Hand-off Timeline Component (Stitch Design Specification) */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-headline font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Exchange Lifecycle Protocol
                </h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-1">
                      1
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800">Requested</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mb-1">
                      2
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Approved</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mb-1">
                      3
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Picked Up</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mb-1">
                      4
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600">Returned</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (40%): Steward Card & Borrow Request Form */}
            <div className="lg:col-span-5 space-y-6">
              {/* Steward Profile Card */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <img
                  src={
                    resource.steward?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={resource.steward?.name || 'Steward'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {resource.steward?.name || 'Academic Steward'}
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[16px]">
                      verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{resource.steward?.department}</p>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    ⭐ {resource.steward?.trustScore || 5.0} Trust Score • {resource.steward?.totalCompletedLoans || 0} Loans
                  </p>
                </div>
              </div>

              {/* Borrow Request Form Box */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-headline font-bold text-slate-900 text-base">
                    Borrow Request
                  </h3>
                  <span className="text-xs font-bold text-secondary bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Max: {resource.maxLoanDurationDays} Days
                  </span>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-error font-medium">
                    {error}
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {successMsg}
                  </div>
                )}

                {!isAvailable && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
                    This resource currently has pending holds or is in custody. You may still submit a request to reserve next in queue.
                  </div>
                )}

                {isSteward ? (
                  <div className="p-4 rounded-lg bg-blue-50 text-blue-900 text-xs font-medium text-center">
                    You are the steward of this resource. You can manage incoming requests from the{' '}
                    <strong>My Borrowings & Lending</strong> tab.
                  </div>
                ) : (
                  <form onSubmit={handleBorrowSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Pick-up Date
                        </label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Return Due Date
                        </label>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 font-medium">
                      Calculated Duration: <strong>{durationDays} Days</strong>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Academic Purpose / Project Note *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Explain coursework, experiment, or capstone need..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || !!successMsg}
                        className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loading ? (
                          'Submitting Request...'
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">send</span>
                            Request to Borrow
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center">
                      Zero rental fees • Governed by Campus Honor Code
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsModal;
