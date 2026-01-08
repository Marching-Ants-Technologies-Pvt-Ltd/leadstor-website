'use client';

import { useState, useEffect } from "react";
import { LeadFilters, LeadsCurrentPage } from '@/utility/TinyDB';

let globalOnCloseFn = null;

export function showAppliedFilter(items = [], onClose = null) {
  if (onClose && typeof onClose === 'function') {
    globalOnCloseFn = onClose;
  }
  // Trigger UI update via global setter
  if (typeof window !== 'undefined') {
    window.__setAppliedFilters?.(items?.length > 0 ? items : null);
  }
}

export default function AppliedFilters({ onOpenAdvanceFilter }) {
  const [filterOptions, setFilterOptions] = useState(null);

    // Expose setter globally so showAppliedFilter can update it
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.__setAppliedFilters = setFilterOptions;
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete window.__setAppliedFilters;
            }
        };
    }, []);

    const handleClearFilters = () => {
        // 1. Clear storage
        LeadFilters.reset();

        // 2. Reset pagination
        LeadsCurrentPage.setValue(1);

        // 3. Hide the filter bar
        setFilterOptions(null);

        // 4. Call any external onClose if provided
        if (globalOnCloseFn) {
            globalOnCloseFn();
            globalOnCloseFn = null;
        }

        // 5. Trigger table refresh
        if (typeof window.tableRefresh === 'function') {
            window.tableRefresh();
        }
        if (window.resetFilterDrawerForm) {
            window.resetFilterDrawerForm();
        }
    };

    // Listen for showAppliedFilter calls (your existing global mechanism)
    useEffect(() => {
        window.showAppliedFilter = (items = []) => {
        setFilters(items?.length > 0 ? items : []);
        };
        return () => {
            delete window.showAppliedFilter;
        };
    }, []);

  if (!filterOptions) return null;

  return (
    <div className="bg-orange-50 w-full p-3 flex items-center gap-4 border-b shadow-sm">
      <div className="flex items-center gap-2 text-gray-700 pr-4 border-r">
        <i className="ri-filter-fill text-lg"></i>
        <span className="font-medium text-sm">Active Filters</span>
      </div>

      <div className="flex-1 flex flex-wrap gap-2">
        {filterOptions
            .filter(opt => opt?.title !== 'Button')
            .map((opt, i) => (
                <div
                key={i}
                className="bg-white border border-gray-300 rounded px-3 py-1 text-sm"
                >
                <strong>{opt.title}:</strong> {opt.value}
                </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
            onClick={onOpenAdvanceFilter}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 
                        border border-gray-300 rounded-full transition-colors duration-200 
                        focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
            Modify Filters
        </button>
        <button
          onClick={handleClearFilters}
          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
          title="Clear & close"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>
    </div>
  );
}