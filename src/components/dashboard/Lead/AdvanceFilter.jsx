'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomSelect from '@/components/CustomSelect';
import { Corporate, User, Test, LeadFilters,LeadsCurrentPage } from '@/utility/TinyDB';
import DateInputPicker from "@/components/DateInputPicker/DateInputPicker";

const FilterDrawer = ({ isOpen, onClose, onOpenAdvanceFilter }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    course: [],
    source: [],
    location: [],
    owner: '',
    courseMode: '',
    probability: '',
    enquiryDateFrom: '',
    enquiryDateTo: '',
    updatedDateFrom: '',
    updatedDateTo: '',
    followupDate: '',
    followupDate_end: '',
  });
  const resetDrawerForm = () => {
    setSelectedFilters({
      status: [], course: [], source: [], location: [], owner: '',
      courseMode: '', probability: '',
      enquiryDateFrom: '', enquiryDateTo: '',
      updatedDateFrom: '', updatedDateTo: '',
      followupDate: '', followupDate_end: '',
    });
  };
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    status: [],
    course: [],
    source: [],
    location: [],
    owner: [],
    courseMode: [],
    probability: []
  });
  const [loading, setLoading] = useState(false);

  // Get session data
  const sessionData = useMemo(() => {
    return { corporate: Corporate, user: User, test: Test };
  }, []);

  // Transform options to consistent {label, value} format
  const transformOptions = (options) => {
    if (!options) return [];
    
    // Handle object responses by converting to array
    let optionsArray;
    if (Array.isArray(options)) {
      optionsArray = options;
    } else if (typeof options === 'object' && options !== null) {
      optionsArray = Object.values(options);
    } else {
      return [];
    }
    
    return optionsArray.map(option => {
      if (typeof option === 'string') {
        return { label: option, value: option };
      }
      if (option && typeof option === 'object') {
        return {
          label: option.label || option.name || option.title || option.status || option.value || String(option),
          value: option.value || option.id || option.name || option.title || option.status || String(option)
        };
      }
      return { label: String(option), value: String(option) };
    });
  };

  const transformOwnerOptions = (owners) => {console.log("Owners Data:", owners);
    if (Object.keys(owners).length > 0) {
        return Object.entries(owners).map(([key, value]) => ({ key, value }));
      }
      return [];
  }

  // Fetch filter options from backend
  useEffect(() => {
    const fetchOptions = async () => {
      if (!sessionData?.test?._id) return;
      setLoading(true);
      try {
        // Add corporateType and isManager parameters like the original implementation
        const params = new URLSearchParams({
          testId: sessionData.test._id,
          corporateType: sessionData.corporate?.type ?? '',
          isManager: sessionData.user?.isManager ?? ''
        }).toString();

        const response = await (await import('@/utility/xFetch')).xFetch({
          method: 'GET',
          path: `/services/invite/getFilterParameters&${params}`
        });
        
        // Check if response is valid and has expected structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }
        
        setFilterOptions({
          status: transformOptions(response.statuses),
          course: transformOptions(response.courses),
          source: transformOptions(response.sources),
          location: transformOptions(response.locations),
          owner: transformOwnerOptions(response.owners),
          courseMode: transformOptions(response.courseModes),
          probability: transformOptions(response.probabilities)
        });
      } catch (e) {
        console.error('Error fetching filter options:', e);
        setFilterOptions({
          status: [], course: [], source: [], location: [], owner: [], courseMode: [], probability: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [sessionData]);

  // Expose reset function globally when drawer mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resetFilterDrawerForm = resetDrawerForm;
    }
    return () => {
      delete window.resetFilterDrawerForm;
    };
  }, []);

  const toggleMultiSelect = (type) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const selectMultiOption = (type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  const updateSingleFilter = (type, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const getDisplayText = (type) => {
    const selected = selectedFilters[type];
    if (!selected || selected.length === 0) {
      return `Select ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }
    if (selected.length === 1) {
      return selected[0];
    }
    return (
      <span>
        {selected[0]} <span className="selected-count">+{selected.length - 1}</span>
      </span>
    );
  };

  const clearFilters = () => {
    resetDrawerForm();
  };

  // Convert HTML5 date format (yyyy-MM-dd) to legacy format (dd-M-yyyy)
  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  
  const buildLeadFilters = () => {
    const filters = [];
      
      filters.push({
        title: 'Button',
        value: "FilterLeads",
        query: 'button'
      });

    // Multi-select filters - these should be arrays in the API call
    if (selectedFilters.status.length > 0) {
        filters.push({
        title: 'Status',
        value: selectedFilters.status.join(','),
        query: 'status'
      });
    }
    
    if (selectedFilters.course.length > 0) {
     
      const courseValue = selectedFilters.course.join(',');
      filters.push({
        title: 'Course',
        value: btoa(courseValue), 
        displayValue: courseValue,
        query: 'course'
        });
    }
    
    if (selectedFilters.source.length > 0) {
      filters.push({
        title: 'Source',
        value: selectedFilters.source.join(','),
        query: 'source'
      });
    }
    
    if (selectedFilters.location.length > 0) {
        filters.push({
        title: 'Location',
        value: selectedFilters.location.join(','),
        query: 'location'
        });
      }
    
    
    if (selectedFilters.owner) {
      filters.push({
        title: 'Owner',
        value: selectedFilters.owner,
        displayValue: filterOptions.owner.find(opt => opt.key === selectedFilters.owner)?.value || selectedFilters.owner,
        query: 'owner'
      });
    }
    
    if (selectedFilters.courseMode) {
      filters.push({
        title: 'Course Mode',
        value: selectedFilters.courseMode,
        query: 'courseModeFilter'
      });
    }
    
    if (selectedFilters.probability) {
      filters.push({
        title: 'Probability',
        value: selectedFilters.probability,
        displayValue: selectedFilters.probability === '20' ? 'Low' : selectedFilters.probability === '55' ? 'Medium' : 'High',
        query: 'leadProbability'
      });
    }
    
    
    if (selectedFilters.enquiryDateFrom || selectedFilters.enquiryDateTo) {
      if (selectedFilters.enquiryDateFrom) {
        filters.push({
          title: 'From Date',
          value: convertDateFormat(selectedFilters.enquiryDateFrom),
          query: 'frmDate'
        });
      }
      if (selectedFilters.enquiryDateTo) {
        filters.push({
          title: 'To Date',
          value: convertDateFormat(selectedFilters.enquiryDateTo),
          query: 'toDate'
        });
      }
    }
    
    if (selectedFilters.updatedDateFrom || selectedFilters.updatedDateTo) {
      if (selectedFilters.updatedDateFrom) {
        filters.push({
          title: 'Updated From',
          value: convertDateFormat(selectedFilters.updatedDateFrom),
          query: 'updatedFrmDate'
        });
      }
      if (selectedFilters.updatedDateTo) {
        filters.push({
          title: 'Updated To',
          value: convertDateFormat(selectedFilters.updatedDateTo),
          query: 'updatedToDate'
      });
    }
    }

    if (selectedFilters.followupDate || selectedFilters.followupDate) {
        if (selectedFilters.followupDate) {
          filters.push({
            title: 'Pending Followup From',
            value: convertDateFormat(selectedFilters.followupDate),
            query: 'followupDate'
          });
        }
        if (selectedFilters.followupDate_end) {
          filters.push({
            title: 'Pending Followup To',
            value: convertDateFormat(selectedFilters.followupDate_end),
            query: 'followupDate_end'
        });
      }
    }
    
    return filters;
  };

  
  const hasAnyFilter = Object.entries(selectedFilters).some(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== '';
  });
  const [applying, setApplying] = useState(false);

  const handleApplyFilters = async () => {
      if (!hasAnyFilter) return;
      setApplying(true);

      const filters = buildLeadFilters();console.log("Applied Filters:", filters);
      LeadFilters.setValue(filters);

      // Reset page when new filters are applied
      LeadsCurrentPage.setValue(1);

      if (window.tableRefresh) {
        window.tableRefresh();
      }
console.log(filterOptions);
      setApplying(false);
      onClose?.();
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.multi-select')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  
  const drawerStyle = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-400px',
    width: 400,
    height: '100vh',
    background: 'white',
    zIndex: 1001,
    transition: 'right 0.3s ease',
    boxShadow: '-2px 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
  };
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: 'all 0.3s ease',
  };

  return (
    <>
      
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white z-[1001] shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between lead-header">
          <h2 className="text-lg font-medium text-gray-800">Filters</h2>
          <button
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading ? (
            <div className="text-center text-gray-500">Loading filter options...</div>
          ) : (
            <>
              {/* Multi-selects */}
              {['status', 'course', 'source', 'location'].map(type => (
                <div key={type} className="mb-6">
                  <label className="block font-medium text-gray-700 mb-2 text-sm">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                  <div className="relative multi-select">
                    <div
                      className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer flex items-center justify-between hover:border-gray-400 transition ${
                        activeDropdown === type ? 'border-blue-500 ring-1 ring-blue-200' : ''
                      }`}
                      onClick={() => toggleMultiSelect(type)}
                    >
                      <span className="text-gray-700 truncate">{getDisplayText(type)}</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {activeDropdown === type && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-60 overflow-y-auto z-10">
                        {filterOptions[type]?.length > 0 ? (
                          filterOptions[type].map(option => (
                            <div
                              key={option.value}
                              className={`px-4 py-2.5 text-sm flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition ${
                                selectedFilters[type].includes(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                              onClick={() => selectMultiOption(type, option.value)}
                            >
                              <div
                                className={`w-4 h-4 border rounded-sm flex items-center justify-center text-white text-xs ${
                                  selectedFilters[type].includes(option.value) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                }`}
                              >
                                {selectedFilters[type].includes(option.value) && '✓'}
                              </div>
                              <span>{option.label}</span>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-400 text-sm">No options</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Owner - Native Select */}
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2 text-sm">
                  Owner
                </label>
                <select
                  value={selectedFilters.owner || ''} // Ensure controlled component
                  onChange={(e) => updateSingleFilter('owner', e.target.value)} // Sends only the KEY/ID
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm 
                            focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none
                            bg-white text-gray-800 cursor-pointer"
                >
                  <option value="">Select Owner</option>
                  {filterOptions.owner.map((opt, index) => (
                    <option 
                      key={index} 
                      value={opt.key || opt.value} // Use 'key' if available, fallback to 'value'
                      disabled={opt.disabled || false}
                    >
                      {opt.value || opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Mode */}
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2 text-sm">Course Mode</label>
                <select
                  value={selectedFilters.courseMode}
                  onChange={e => updateSingleFilter('courseMode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Course Mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              {/* Probability */}
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2 text-sm">Probability</label>
                <select
                  value={selectedFilters.probability}
                  onChange={e => updateSingleFilter('probability', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Probability</option>
                  <option value="20">Low</option>
                  <option value="55">Medium</option>
                  <option value="85">High</option>
                </select>
              </div>

              {/* Date Pickers */}
              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-2 text-sm">Enquiry Date</label>
                <div className="flex items-center gap-3">
                  <DateInputPicker
                    value={selectedFilters.enquiryDateFrom}
                    onChange={date => updateSingleFilter('enquiryDateFrom', date)}
                    placeholder="From"
                    isTimeInterval={false}
                    className="flex-1"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <DateInputPicker
                    value={selectedFilters.enquiryDateTo}
                    onChange={date => updateSingleFilter('enquiryDateTo', date)}
                    placeholder="To"
                    isTimeInterval={false}
                    className="flex-1"
                  />
                </div>
              </div>

            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={clearFilters}
            className="flex-1 px-5 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
          >
            Clear All
          </button>
          <button
            onClick={handleApplyFilters}
            disabled={applying || !hasAnyFilter}
            className="btn-primary-crm"
          >
            {applying ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>
      {/* Custom calendar styles */}
      <style>{`
        .my-calendar {
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 4px 32px rgba(80, 80, 120, 0.08);
          padding: 12px;
          font-family: 'Inter', sans-serif;
        }
        .my-calendar .rdp-day {
          border-radius: 10px;
          transition: background 0.2s, color 0.2s;
          font-weight: 500;
          font-size: 1.1em;
          margin: 2px;
        }
        .my-calendar .rdp-day_selected,
        .my-calendar .rdp-day:active {
          background: #f3e8ff;
          color: #7c3aed;
          border: 2px solid #a78bfa;
        }
        .my-calendar .rdp-day_today {
          border: 1.5px solid #a78bfa;
        }
        .my-calendar .rdp-day:hover {
          background: #f3f4f6;
          color: #7c3aed;
        }
        .my-calendar .rdp-caption_label {
          font-size: 1.2em;
          font-weight: 600;
        }
        .my-calendar .rdp-head_cell {
          color: #888;
          font-weight: 600;
          font-size: 1em;
        }
        .my-calendar .rdp-day_outside {
          color: #d1d5db;
          opacity: 0.5;
        }
        .my-calendar .rdp-day_disabled {
          color: #bbb !important;
          background: #f5f5f5 !important;
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          pointer-events: none;
        }
        .my-calendar .rdp-nav {
          display: none !important;
        }
        .my-calendar .rdp-caption_dropdowns {
          gap: 0.5em;
        }
        /* Hide navigation arrows */
        .react-datepicker__navigation--previous,
        .react-datepicker__navigation--next {
          display: none !important;
        }
        /* Ensure both dropdowns are the same size */
        .react-datepicker__month-select,
        .react-datepicker__year-select {
          min-width: 90px !important;
          max-width: 90px !important;
          width: 90px !important;
        }
      `}</style>
    </>
  );
};

export default FilterDrawer;