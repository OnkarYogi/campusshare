import React, { useState, useEffect } from 'react';
import CatalogHero from './CatalogHero';
import ResourceCard from './ResourceCard';
import { resourceService } from '../services/api';

const CatalogDashboard = ({ onSelectResource, onOpenAddResource }) => {
  const [resources, setResources] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [availableNow, setAvailableNow] = useState(false);

  const departments = [
    { id: 'all', label: 'All Departments' },
    { id: 'Computer Science', label: 'Computer Science' },
    { id: 'Biology', label: 'Biology & Chem' },
    { id: 'Mechanical', label: 'Mechanical Eng' },
    { id: 'Film', label: 'Film & Media' },
    { id: 'Robotics', label: 'Robotics & Mechatronics' },
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'electronics', label: 'Electronics & Gear' },
    { id: 'textbooks', label: 'Textbooks' },
    { id: 'lab_gear', label: 'Lab Instruments' },
    { id: 'project_kits', label: 'Project Kits' },
    { id: 'sports', label: 'Sports & Rec' },
  ];

  useEffect(() => {
    fetchResources();
  }, [dept, category, condition, availableNow]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (dept !== 'all') params.department = dept;
      if (category !== 'all') params.category = category;
      if (condition !== 'all') params.condition = condition;
      if (availableNow) params.availableNow = true;

      const res = await resourceService.getResources(params);
      if (res.success) {
        setResources(res.resources);
        setTotalCount(res.total);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner with Campus Lending Circle Stats */}
      <CatalogHero totalListings={totalCount || 1420} />

      {/* Search & Interactive Filter Control Deck (From Stitch Design) */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
        {/* Main Search Bar */}
        <div className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[22px]">
            search
          </span>
          <input
            data-testid="catalog-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search textbooks, TI-84 calculators, lab oscilloscopes, cameras, robotics kits..."
            className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-secondary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Department Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Dept:
            </span>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setDept(d.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  dept === d.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Toggles & Condition Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:bg-white focus:ring-1 focus:ring-secondary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Condition Dropdown */}
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:bg-white focus:ring-1 focus:ring-secondary"
            >
              <option value="all">All Conditions</option>
              <option value="like_new">Like New / Mint</option>
              <option value="brand_new">Brand New</option>
              <option value="good">Good Condition</option>
              <option value="fair">Fair (Usable)</option>
            </select>

            {/* Available Now Switch */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors select-none">
              <input
                type="checkbox"
                checked={availableNow}
                onChange={(e) => setAvailableNow(e.target.checked)}
                className="w-4 h-4 rounded text-secondary focus:ring-0 accent-secondary cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Available Now
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Resource Listings Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline font-bold text-lg text-slate-900">
            Verified Campus Equipment Catalog{' '}
            <span className="text-slate-400 font-normal text-sm">({resources.length})</span>
          </h2>

          <button
            onClick={onOpenAddResource}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            List an Item
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Fetching academic inventory...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <span className="material-symbols-outlined text-[48px] text-slate-300">
              inventory_2
            </span>
            <h3 className="font-headline font-bold text-base text-slate-800">
              No matching academic resources found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find any resources matching your search filters. Try adjusting your
              keywords or department filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setDept('all');
                setCategory('all');
                setCondition('all');
                setAvailableNow(false);
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {resources.map((item) => (
              <ResourceCard key={item._id || item.id} resource={item} onSelect={onSelectResource} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogDashboard;
