import React from 'react';

const CampusShareLogo = ({ className = 'h-8 w-auto' }) => {
  return (
    <div className={`flex items-center gap-2 select-none cursor-pointer ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="h-8 w-8 flex-shrink-0"
        fill="none"
      >
        <rect x="0" y="0" width="48" height="48" rx="10" fill="#1E3A8A" />
        <path d="M24 12L10 19L24 26L38 19L24 12Z" fill="#38BDF8" />
        <path
          d="M16 23V31C16 33.5 19.5 36 24 36C28.5 36 32 33.5 32 31V23"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M34 21V29" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="22" r="2.5" fill="#10B981" />
      </svg>
      <div className="flex flex-col">
        <span className="font-headline font-bold text-xl tracking-tight text-primary leading-none">
          Campus<span className="text-secondary">Share</span>
        </span>
        <span className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase leading-tight">
          Academic Exchange
        </span>
      </div>
    </div>
  );
};

export default CampusShareLogo;
