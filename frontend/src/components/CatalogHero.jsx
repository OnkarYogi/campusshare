import React from 'react';

const CatalogHero = ({ totalListings = 1420 }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-[#1e3a8a] to-[#202b3d] text-white shadow-xl p-6 sm:p-8 lg:p-10 mb-8">
      {/* Decorative Background Crest Vector */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
        <svg className="w-full h-full" fill="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="160" stroke="currentColor" strokeDasharray="20 12" strokeWidth="40" />
          <path d="M120 200L180 260L280 140" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="24" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 text-[#89f5e7] text-xs font-semibold uppercase tracking-wider backdrop-blur-sm border border-secondary/30">
            <span className="inline-block w-2 h-2 rounded-full bg-[#89f5e7] animate-pulse" />
            Academic Year Active Circle • MIT World Peace University, Pune
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Campus Lending Circle
          </h1>

          <p className="font-body text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-xl">
            Share academic textbooks, lab instrument kits, and digital production gear across departments for free. Zero rental fees, 100% student and faculty sustained.
          </p>
        </div>

        {/* Quick Campus Metrics Visualizer */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 lg:p-5 border border-white/15">
          <div className="flex flex-col">
            <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#89f5e7] leading-none">
              {totalListings}
            </span>
            <span className="text-xs text-blue-200 font-medium mt-1">Active Listings</span>
            <span className="text-[11px] text-teal-300 mt-0.5">↑ 14% this week</span>
          </div>

          <div className="flex flex-col border-l border-white/20 pl-3 sm:pl-4">
            <span className="font-headline text-2xl sm:text-3xl font-extrabold text-white leading-none">
              98%
            </span>
            <span className="text-xs text-blue-200 font-medium mt-1">On-Time Returns</span>
            <span className="text-[11px] text-blue-300 mt-0.5">Campus Locker Hubs</span>
          </div>

          <div className="flex flex-col border-l border-white/20 pl-3 sm:pl-4">
            <span className="font-headline text-2xl sm:text-3xl font-extrabold text-[#6bd8cb] leading-none">
              42
            </span>
            <span className="text-xs text-blue-200 font-medium mt-1">Student Clubs</span>
            <span className="text-[11px] text-blue-300 mt-0.5">Autonomous Pools</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CatalogHero;
