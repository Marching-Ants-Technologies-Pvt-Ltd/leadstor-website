import React, { useState, useEffect, useMemo, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomSelect from '@/components/CustomSelect';
import { Corporate, User, Test, LeadFilters } from '@/utility/TinyDB';


const DateInputPicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const today = new Date();
  const minDate = new Date(2000, 0, 1);

  // Month and year options for CustomSelect
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = [];
  for (let y = today.getFullYear(); y >= minDate.getFullYear(); y--) {
    years.push(y);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={date => {
          onChange(date ? date.toISOString().slice(0, 10) : '');
        }}
        onCalendarClose={() => setShow(false)}
        onCalendarOpen={() => setShow(true)}
        minDate={minDate}
        maxDate={today}
        placeholderText={placeholder}
        dateFormat="dd-MMM-yyyy"
        className="minimal-date-input"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperPlacement="bottom-start"
        popperClassName="minimal-datepicker-popper"
        wrapperClassName="minimal-datepicker-wrapper"
        renderCustomHeader={({ date, changeYear, changeMonth }) => (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
            <CustomSelect
              options={months}
              value={months[date.getMonth()]}
              onChange={month => changeMonth(months.indexOf(month))}
              placeholder="Month"
              className="w-28"
            />
            <CustomSelect
              options={years}
              value={date.getFullYear()}
              onChange={changeYear}
              placeholder="Year"
              className="w-24"
            />
          </div>
        )}
        showOutsideDays={false}
        customInput={
          <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        readOnly
        value={formatDate(value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
                paddingRight: '40px',
          border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
          background: 'white',
          color: '#333',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      />
        <div style={{
          position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#999'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        }
      />
      <style>{`
        .minimal-datepicker-popper {
          z-index: 1002;
        }
        .minimal-datepicker-wrapper input:hover {
          border-color: #bbb !important;
        }
        .minimal-datepicker-wrapper input:focus {
          border-color: #007bff !important;
        }
        .react-datepicker__header {
          background: #f8f9fa !important;
          border-bottom: 1px solid #e9ecef !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 16px 20px 8px 20px !important;
          position: relative !important;
          min-height: 60px !important;
        }
        .react-datepicker__current-month {
          display: none !important;
        }
        .react-datepicker__month-year-container {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
          gap: 4px !important;
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          position: absolute !important;
          top: 16px !important;
          left: 20px !important;
          z-index: 2;
        }
        /* Hide previous/next month days */
        .react-datepicker__day--outside-month {
          visibility: hidden !important;
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
    </div>
  );
};

const FilterDrawer = ({ isOpen, onClose }) => {
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
    updatedDateTo: ''
  });
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

  // Fetch filter options from backend
  useEffect(() => {
    const fetchOptions = async () => {
      if (!sessionData?.test?._id) return;
      setLoading(true);
      try {
        const response = await (await import('@/utility/xFetch')).xFetch({
          method: 'GET',
          path: `/services/invite/api.php?x=getFilterParameters&testId=${sessionData.test._id}`
        });
        setFilterOptions({
          status: response.statuses || [],
          course: response.courses || [],
          source: response.sources || [],
          location: response.locations || [],
          owner: response.owners || [],
          courseMode: response.courseModes || [],
          probability: response.probabilities || []
        });
      } catch (e) {
        setFilterOptions({
          status: [], course: [], source: [], location: [], owner: [], courseMode: [], probability: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [sessionData]);

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
    setSelectedFilters({
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
      updatedDateTo: ''
    });
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
    
    const filters = buildLeadFilters();
    LeadFilters.setValue(filters);
    
    if (typeof window !== 'undefined' && typeof window.tableRefresh === 'function') {
      window.tableRefresh();
    }
    setApplying(false);
    onClose && onClose();
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
      
      <div style={overlayStyle} onClick={onClose}></div>
      {/* Drawer */}
      <div style={drawerStyle}>
        <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#333' }}>Filters</h2>
          <button style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666', padding: 0, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }} onClick={onClose}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, marginRight: 3 }} className="filter-drawer-scrollbar">
          {loading ? <div>Loading filter options...</div> : <>
          {/* Multi-select filters */}
          {['status', 'course', 'source', 'location'].map(type => (
              <div key={type} style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
              <div className="multi-select" style={{position: 'relative'}}>
                <div 
                  className={`multi-select-trigger ${activeDropdown === type ? 'active' : ''}`}
                  style={{width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: 'white', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
                  onClick={() => toggleMultiSelect(type)}
                >
                  <span>{getDisplayText(type)}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div className={`multi-select-dropdown ${activeDropdown === type ? 'active' : ''}`} style={{position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 6px 6px', maxHeight: 200, overflowY: 'auto', zIndex: 10, display: activeDropdown === type ? 'block' : 'none'}}>
                  {filterOptions[type] && filterOptions[type].length > 0 ? filterOptions[type].map(option => (
                    <div 
                      key={option}
                      className={`multi-select-option ${selectedFilters[type].includes(option) ? 'selected' : ''}`}
                      style={{padding: '8px 12px', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, background: selectedFilters[type].includes(option) ? '#e3f2fd' : 'white', color: selectedFilters[type].includes(option) ? '#1976d2' : '#333'}}
                      onClick={() => selectMultiOption(type, option)}
                    >
                      <div className={`checkbox ${selectedFilters[type].includes(option) ? 'checked' : ''}`} style={{width: 16, height: 16, border: '1px solid #ddd', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white', background: selectedFilters[type].includes(option) ? '#007bff' : 'white', marginRight: 8}}>
                        {selectedFilters[type].includes(option) ? '✓' : ''}
                      </div>
                      <span>{option}</span>
                    </div>
                  )) : <div style={{padding: '8px 12px', color: '#aaa'}}>No options</div>}
                </div>
              </div>
            </div>
          ))}

          {/* Single-select filters */}
          <div style={{marginBottom: 24}}>
            <label style={{display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14}}>Owner</label>
            <select 
              style={{width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: 'white', color: '#333'}} 
              value={selectedFilters.owner}
              onChange={(e) => updateSingleFilter('owner', e.target.value)}
            >
              <option value="">Select Owner</option>
              {filterOptions.owner && filterOptions.owner.length > 0 ? filterOptions.owner.map(option => (
                <option key={option} value={option}>{option}</option>
              )) : <option disabled>No options</option>}
            </select>
          </div>

          <div style={{marginBottom: 24}}>
            <label style={{display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14}}>Course Mode</label>
            <select 
              style={{width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: 'white', color: '#333'}} 
              value={selectedFilters.courseMode}
              onChange={(e) => updateSingleFilter('courseMode', e.target.value)}
            >
              <option value="">Select Course Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
            </select>
          </div>

          <div style={{marginBottom: 24}}>
            <label style={{display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14}}>Probability</label>
            <select 
              style={{width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, background: 'white', color: '#333'}} 
              value={selectedFilters.probability}
              onChange={(e) => updateSingleFilter('probability', e.target.value)}
            >
              <option value="">Select Probability</option>
                <option value="20">Low</option>
                <option value="55">Medium</option>
                <option value="85">High</option>
            </select>
          </div>

            {/* Modern Calendar for Enquiry Date */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14 }}>Enquiry Date</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <DateInputPicker
                value={selectedFilters.enquiryDateFrom}
                  onChange={date => updateSingleFilter('enquiryDateFrom', date)}
                  placeholder="From"
              />
                <span style={{ color: '#666', fontSize: 14, whiteSpace: 'nowrap' }}>to</span>
                <DateInputPicker
                value={selectedFilters.enquiryDateTo}
                  onChange={date => updateSingleFilter('enquiryDateTo', date)}
                  placeholder="To"
              />
            </div>
          </div>

            {/* Modern Calendar for Updated Date */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 500, color: '#333', marginBottom: 8, fontSize: 14 }}>Updated Date</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <DateInputPicker
                value={selectedFilters.updatedDateFrom}
                  onChange={date => updateSingleFilter('updatedDateFrom', date)}
                  placeholder="From"
              />
                <span style={{ color: '#666', fontSize: 14, whiteSpace: 'nowrap' }}>to</span>
                <DateInputPicker
                value={selectedFilters.updatedDateTo}
                  onChange={date => updateSingleFilter('updatedDateTo', date)}
                  placeholder="To"
              />
            </div>
          </div>
          </>}
        </div>
        <div style={{ padding: 20, borderTop: '1px solid #eee', display: 'flex', gap: 12, background: '#fafafa' }}>
          <button style={{ padding: '10px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: '#f8f9fa', color: '#666', border: '1px solid #ddd', flex: 1 }} onClick={clearFilters}>Clear All</button>
          <button
            style={{ padding: '10px 20px', border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: applying || !hasAnyFilter ? 'not-allowed' : 'pointer', background: '#007bff', color: 'white', flex: 1, opacity: applying || !hasAnyFilter ? 0.6 : 1 }}
            onClick={handleApplyFilters}
            disabled={applying || !hasAnyFilter}
            type="button"
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