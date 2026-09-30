import React from 'react';

const ResourceCard = ({ resource, onSelect }) => {
  const isAvailable = resource.status === 'available';
  const isRequested = resource.status === 'requested';
  const isBorrowed = resource.status === 'borrowed';

  const defaultImage =
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  const displayImage = resource.images && resource.images.length > 0 ? resource.images[0] : defaultImage;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full">
      {/* 16:10 Aspect Ratio Image Container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={resource.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Availability Status Badge (Top-Left) */}
        <div className="absolute top-3 left-3">
          {isAvailable && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/95 backdrop-blur-sm border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available Now
            </span>
          )}
          {isRequested && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/95 backdrop-blur-sm border border-amber-200 text-amber-800 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Hold Requested
            </span>
          )}
          {isBorrowed && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/95 backdrop-blur-sm border border-slate-300 text-slate-700 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Checked Out
            </span>
          )}
        </div>

        {/* Category Pill (Top-Right) */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-bold uppercase tracking-wider shadow-sm border border-slate-200">
            {resource.category.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          {/* Department & Identifier */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-primary truncate max-w-[70%]">
              {resource.department}
            </span>
            {resource.identifiers && (
              <span className="text-[11px] text-slate-400 font-mono truncate">
                {resource.identifiers.split('•')[0]}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-headline font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {resource.title}
          </h3>

          {/* Location & Duration Expectations */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[16px] text-slate-400 flex-shrink-0">
                location_on
              </span>
              <span className="truncate">{resource.location}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[16px] text-slate-400 flex-shrink-0">
                schedule
              </span>
              <span>Max loan: {resource.maxLoanDurationDays} days</span>
            </div>
          </div>
        </div>

        {/* Steward Profile & Borrow CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          {/* Steward Info */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={
                resource.steward?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              }
              alt={resource.steward?.name || 'Steward'}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {resource.steward?.name || 'Academic Steward'}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                ⭐ {resource.steward?.trustScore || 5.0} Trust
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onSelect(resource)}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1 whitespace-nowrap"
          >
            <span>Borrow Resource</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
