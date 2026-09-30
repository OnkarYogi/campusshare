import React, { useState } from 'react';
import { resourceService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddResourceModal = ({ isOpen, onClose, onResourceAdded }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    identifiers: '',
    category: 'electronics',
    condition: 'like_new',
    description: '',
    department: user?.department || 'Robotics & Mechatronics Lab',
    location: 'North MakerSpace Station • Room 204',
    maxLoanDurationDays: 7,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    pledgeAgreed: false,
  });

  if (!isOpen) return null;

  const categories = [
    { id: 'textbooks', label: 'Textbooks', icon: 'menu_book' },
    { id: 'electronics', label: 'Electronics', icon: 'devices' },
    { id: 'lab_gear', label: 'Lab Gear', icon: 'science' },
    { id: 'project_kits', label: 'Project Kits', icon: 'biotech' },
    { id: 'sports', label: 'Sports & Rec', icon: 'sports_tennis' },
    { id: 'other', label: 'Other Tools', icon: 'category' },
  ];

  const conditions = [
    { id: 'brand_new', label: 'Brand New', desc: 'Unused in original box' },
    { id: 'like_new', label: 'Like New', desc: 'Pristine, no visible wear' },
    { id: 'good', label: 'Good', desc: 'Minor cosmetic wear, 100% operational' },
    { id: 'fair', label: 'Fair', desc: 'Functional with noticeable wear' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pledgeAgreed) {
      setError('Please agree to the Academic Honor Pledge before listing.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await resourceService.createResource({
        title: formData.title,
        identifiers: formData.identifiers,
        category: formData.category,
        condition: formData.condition,
        description: formData.description,
        department: formData.department,
        location: formData.location,
        maxLoanDurationDays: Number(formData.maxLoanDurationDays),
        images: formData.imageUrl ? [formData.imageUrl] : [],
      });

      if (res.success) {
        onResourceAdded(res.resource);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to list resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-surface-container-low p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px]">eco</span>
                Circular Campus Commons
              </div>
              <h2 className="font-headline text-xl font-bold text-slate-900">
                Share a Resource with Campus
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* 3-Step Indicator Bar */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <div
              className={`p-2.5 rounded-lg flex items-center gap-2 border transition-all ${
                step === 1
                  ? 'bg-white border-primary shadow-sm text-primary font-bold'
                  : 'bg-slate-100/80 border-transparent text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 1 ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                1
              </div>
              <span className="text-xs truncate">Resource Info</span>
            </div>

            <div
              className={`p-2.5 rounded-lg flex items-center gap-2 border transition-all ${
                step === 2
                  ? 'bg-white border-primary shadow-sm text-primary font-bold'
                  : 'bg-slate-100/80 border-transparent text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 2 ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                2
              </div>
              <span className="text-xs truncate">Location & Rules</span>
            </div>

            <div
              className={`p-2.5 rounded-lg flex items-center gap-2 border transition-all ${
                step === 3
                  ? 'bg-white border-primary shadow-sm text-primary font-bold'
                  : 'bg-slate-100/80 border-transparent text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 3 ? 'bg-primary text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                3
              </div>
              <span className="text-xs truncate">Honor & Publish</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-error font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* STEP 1: Resource Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Item Title & Identifiers *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Campbell Biology 11th Edition, Rigol DS1054Z Oscilloscope..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Model / ISBN / Asset Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asset #EQ-8842, ISBN 978-0134093413"
                  value={formData.identifiers}
                  onChange={(e) => setFormData({ ...formData, identifiers: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: c.id })}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                        formData.category === c.id
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{c.icon}</span>
                      <span className="text-xs">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Physical Condition *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {conditions.map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, condition: cond.id })}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        formData.condition === cond.id
                          ? 'border-primary bg-primary/5 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{cond.label}</p>
                      <p className="text-[11px] text-slate-500">{cond.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Item Description & Included Kit *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail specifications, cables included, usage expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location & Rules */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Department Affiliation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robotics & Mechatronics Lab, Biology & Chem..."
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Campus Pick-up Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North MakerSpace Station • Room 204 or Reserve Desk"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Maximum Allowable Loan Span (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={formData.maxLoanDurationDays}
                  onChange={(e) => setFormData({ ...formData, maxLoanDurationDays: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <span className="text-[11px] text-slate-500">
                  Standard university recommendation is 7 to 14 days.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Equipment Photo URL
                </label>
                <input
                  type="url"
                  placeholder="Paste direct image URL (Unsplash or campus repository)"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                {formData.imageUrl && (
                  <div className="mt-2 h-32 w-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/resource-placeholder.svg';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Verification Review & Honor Pledge */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Listing Summary Review
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Title:</span>{' '}
                    <span className="font-semibold text-slate-800">{formData.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Category:</span>{' '}
                    <span className="font-semibold text-slate-800">{formData.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span>{' '}
                    <span className="font-semibold text-slate-800">{formData.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Duration:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {formData.maxLoanDurationDays} Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Honor Pledge */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pledgeAgreed}
                    onChange={(e) => setFormData({ ...formData, pledgeAgreed: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-secondary accent-primary"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    <strong>Academic Honor Pledge:</strong> I confirm this equipment or book belongs
                    to me or my designated club/department and is in safe, working condition. I agree
                    to adhere to non-monetary community exchange guidelines.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !formData.title) {
                    setError('Please provide an item title.');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-slate-900 rounded-lg transition-colors shadow-sm"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-xs font-bold text-white bg-secondary hover:bg-teal-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
