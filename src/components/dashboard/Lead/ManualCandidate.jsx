"use client";
import React, { useState, useMemo, useEffect } from "react";
import { xFetch } from '@/utility/xFetch';
import { Corporate, User, Test } from '@/utility/TinyDB';
import CustomSelect from '@/components/CustomSelect';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialRow = { firstName: "", lastName: "", email: "", mobile: "", course: "", location: "", source: "", remarks: "" };

export default function ManualCandidate({ onCancel, onSwitchToImport, onRefreshTable }) {
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stat, setStat] = useState({ total: 0, valid: 0, duplicate: 0, uploaded: 0 });
  const [duplicates, setDuplicates] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [columnConfig, setColumnConfig] = useState(null);
  const [dynamicLabel, setDynamicLabel] = useState('Course');

  // Session data - fixed to handle SSR and localStorage access
  const [sessionData, setSessionData] = useState({});
  
  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const data = { corporate: Corporate, user: User, test: Test };
      setSessionData(data);
    }
  }, []);

  // Fetch source options from backend per corporateId
  useEffect(() => {
    const fetchSourceOptions = async () => {
      const corporateId = sessionData?.corporate?._id;
      if (corporateId) {
        try {
          const response = await xFetch({
            method: 'GET',
            path: `/services/profile/getSources?corporateId=${corporateId}`
          });
          if (Array.isArray(response)) {
            setSourceOptions(response.map(src => src.source));
          } else {
            setSourceOptions([]);
          }
        } catch (error) {
          setSourceOptions([]);
        }
      }
    };
    if (sessionData?.corporate?._id) {
      fetchSourceOptions();
    }
  }, [sessionData]);

  // Fetch column configuration from backend
  useEffect(() => {
    const fetchColumnConfig = async () => {
      if (sessionData?.corporate?._id) {
        try {
          const response = await xFetch({
            method: 'GET',
            path: '/services/joinees/columns'
          });
          if (response && typeof response === 'object') {
            setColumnConfig(response);
            // Extract the dynamic label from the response
            setDynamicLabel(response.label || 'Course');
          }
        } catch (error) {
          console.error('Failed to fetch column config:', error);
          // Fallback to default
          setDynamicLabel('Course');
        }
      }
    };
    if (sessionData?.corporate?._id) {
      fetchColumnConfig();
    }
  }, [sessionData]);

  // Fetch course options from backend per corporateId
  useEffect(() => {
    const fetchCourseOptions = async () => {
      const corporateId = sessionData?.corporate?._id;
      if (corporateId) {
        try {
          const response = await xFetch({
            method: 'GET',
            path: `/services/profile/getCourses?corporateId=${corporateId}`
          });
          if (Array.isArray(response)) {
            setCourseOptions(response.map(course => course.course || course.name || course));
          } else {
            setCourseOptions([]);
          }
        } catch (error) {
          setCourseOptions([]);
        }
      }
    };
    if (sessionData?.corporate?._id) {
      fetchCourseOptions();
    }
  }, [sessionData]);

  // Backend-required columns
  const getRequiredColumns = () => {
    if (columnConfig) {
      // Use backend column configuration
      return [
        'First Name',
        'Last Name',
        columnConfig.email || 'Email',
        columnConfig.mobile || 'Mobile',
        columnConfig.label || dynamicLabel,
        'Location',
        columnConfig.source || 'Source',
        columnConfig.remarks || 'Remarks'
      ];
    }
    // Fallback to default columns
    return [
      'First Name',
      'Last Name',
      'Email',
      'Mobile',
      dynamicLabel,
      'Location',
      'Source',
      'Remarks'
    ];
  };

  // Map UI row to backend object
  const mapRowToBackend = (row) => {
    const labelKey = columnConfig?.label || dynamicLabel;
    return {
      'First Name': row.firstName,
      'Last Name': row.lastName,
      'Email': row.email,
      'Mobile': row.mobile,
      [labelKey]: row.course,
      'Location': row.location,
      'Source': row.source,
      'Remarks': row.remarks
    };
  };

  // Validate row (matches ImportEnquiryDropBox)
  const validateRow = (row) => {
    const errors = [];
    if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push('Invalid email');
    }
    if (!row.mobile || !/^\+?[0-9\s-]{7,15}$/.test(row.mobile)) {
      errors.push('Invalid mobile (should be 7-15 digits, may start with +, spaces/dashes allowed)');
    }
    // Check for required fields
    if (!row.firstName.trim()) {
      errors.push('First name is required');
    }
    return errors;
  };

  // Duplicate check (matches ImportEnquiryDropBox)
  const checkDuplicates = async (emails, mobiles) => {
    try {
      const response = await xFetch({
        method: 'POST',
        path: '/services/invite/checkDuplicatesOnManualImport',
        payload: {
          emails: emails.join(','),
          phones: mobiles.join(','),
          testId: sessionData?.test?._id
        }
      });
      return response.items || [];
    } catch (err) {
      console.error("Error checking duplicates:", err);
      return [];
    }
  };

  // Function to refresh table
  const refreshTable = () => {
    // Try multiple methods to refresh the table
    try {
      // Method 1: Call onRefreshTable prop if provided
      if (onRefreshTable && typeof onRefreshTable === 'function') {
        onRefreshTable();
        return;
      }

      // Method 2: Call window.tableRefresh if it exists
      if (typeof window !== 'undefined' && typeof window.tableRefresh === 'function') {
        window.tableRefresh();
        return;
      }

      // Method 3: Dispatch custom event for table refresh
      if (typeof window !== 'undefined') {
        const refreshEvent = new CustomEvent('refreshTable', {
          detail: { source: 'ManualCandidate' }
        });
        window.dispatchEvent(refreshEvent);
      }

      // Method 4: Try to find and call any table refresh methods in the global scope
      if (typeof window !== 'undefined') {
        // Look for common table refresh function names
        const refreshMethods = ['refreshTable', 'reloadTable', 'updateTable', 'fetchTableData'];
        for (const method of refreshMethods) {
          if (typeof window[method] === 'function') {
            window[method]();
            break;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to refresh table:', error);
    }
  };

  // Main submit handler
  const handleAddEnquiry = async () => {
    setLoading(true);
    setMessage(null);
    setUploadComplete(false);
    setStat({ total: 0, valid: 0, duplicate: 0, uploaded: 0 });
    setDuplicates([]);
    
    try {
      // Check if we have valid session data
      if (!sessionData?.test?._id) {
        toast.error('Session data not available. Please refresh the page.');
        setLoading(false);
        return;
      }

      // 1. Validate rows
      const mappedRows = rows.map(mapRowToBackend);
      const validRows = [];
      const invalidRows = [];
      
      mappedRows.forEach((row, idx) => {
        const errors = validateRow({
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email: row['Email'],
          mobile: row['Mobile'],
          course: row[columnConfig?.label || dynamicLabel],
        });
        if (errors.length === 0) {
          validRows.push(row);
        } else {
          invalidRows.push({ row, errors, idx });
        }
      });

      if (invalidRows.length > 0) {
        const errorMessage = invalidRows.map(item => 
          `Lead #${item.idx + 1}: ${item.errors.join(', ')}`
        ).join('\n');
        
        toast.error(`Please fix the following errors:\n${errorMessage}`);
        setLoading(false);
        return;
      }

      // 2. Check duplicates
      const emails = validRows.map(r => r['Email']).filter(Boolean);
      const mobiles = validRows.map(r => r['Mobile']?.toString().replace(/\D/g, '')).filter(Boolean);
      
      const duplicatesFromBackend = await checkDuplicates(emails, mobiles);
      setDuplicates(duplicatesFromBackend);
      
      if (duplicatesFromBackend.length > 0) {
        toast.error(`There are ${duplicatesFromBackend.length} duplicate entr${duplicatesFromBackend.length === 1 ? 'y' : 'ies'} found in the database. Please remove or update them before submitting.`);
        setLoading(false);
        return;
      }

      // 3. Prepare payload
      const payload = {
        contacts: validRows,
        testId: sessionData?.test?._id,
        corporateType: sessionData?.corporate?.type,
        recruiterId: sessionData?.corporate?._id,
        manual: true,
        toDefer: validRows.length > 500,
        owner: sessionData?.user?._id,
        roleName: sessionData?.user?.role
      };

      // 4. Upload in chunks
      const chunkSize = 50;
      const chunks = [];
      for (let i = 0; i < validRows.length; i += chunkSize) {
        chunks.push(validRows.slice(i, i + chunkSize));
      }

      let uploaded = 0;
      for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData();
        // Append contacts as multi-dimensional array, legacy style
        chunks[i].forEach((contact, idx) => {
          // contact is an object, convert to array in legacy order
          const contactArr = [
            contact['First Name'] || '',
            contact['Last Name'] || '',
            contact['Email'] || '',
            contact['Mobile'] || '',
            contact[columnConfig?.label || dynamicLabel] || '',
            contact['Location'] || '',
            contact['Source'] || '',
            contact['Remarks'] || ''
          ];
          contactArr.forEach((val, j) => {
            formData.append(`contacts[${idx}][${j}]`, val);
          });
        });
        formData.append('testId', payload.testId);
        formData.append('corporateType', payload.corporateType);
        formData.append('recruiterId', payload.recruiterId);
        formData.append('manual', payload.manual);
        formData.append('toDefer', payload.toDefer);
        formData.append('owner', payload.owner);
        formData.append('roleName', payload.roleName);

        const response = await xFetch({
          method: 'POST',
          path: '/leadstorredirect/sendTestInvitationEmail',
          payload: formData,
          isFormData: true
        });
        
        if (response.status !== 'OK') {
          throw new Error(response.errors?.join(', ') || 'Upload failed');
        }
        uploaded += chunks[i].length;
      }

      toast.success(`Successfully uploaded ${uploaded} record${uploaded === 1 ? '' : 's'}`);
      setRows([{ ...initialRow }]);
      setUploadComplete(true);
      
      // Refresh table using improved method
      refreshTable();
      
    } catch (error) {
      console.error("Error adding enquiry:", error);
      toast.error(error.message || 'Failed to add candidate.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddEnquiry();
  };

  // Prevent Enter key from submitting the form
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Handle input changes with proper validation
  const handleInputChange = (idx, field, value) => {
    setRows(rows.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  // Handle row removal
  const handleRemoveRow = (idx) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== idx));
    }
  };

  // Handle add new row
  const handleAddRow = () => {
    setRows([...rows, { ...initialRow }]);
  };

  // Handle close modal
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle switch to import
  const handleSwitchToImport = (e) => {
    e.preventDefault();
    if (onCancel) onCancel();
    if (onSwitchToImport) onSwitchToImport();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 relative">
        {/* Title and Close Button */}
        <div className="px-8 pt-8 pb-3 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-gray-500">Add Lead(s)</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent -mr-2"
            style={{ marginRight: '-0.7rem' }}
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 015.05 3.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Form */}
        <form
          className="px-8 pb-6 pt-2 max-h-[74vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onSubmit={handleSubmit}
          onKeyDown={handleFormKeyDown}
        >
          <div className="space-y-6">
            {rows.map((row, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-2xl font-medium text-gray-500">Lead #{idx + 1}</h3>
                  {rows.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(idx)}
                      className="text-gray-400 text-sm font-bold rounded-md w-6 h-6 flex items-center justify-center focus:outline-none border border-gray-200 bg-white hover:bg-gray-50"
                      title="Remove Lead"
                      type="button"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                      value={row.firstName}
                      onChange={e => handleInputChange(idx, 'firstName', e.target.value)}
                      placeholder="e.g. John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                      value={row.lastName}
                      onChange={e => handleInputChange(idx, 'lastName', e.target.value)}
                      placeholder="e.g. Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                      value={row.email}
                      onChange={e => handleInputChange(idx, 'email', e.target.value)}
                      placeholder="e.g. john.doe@example.com"
                      type="email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                      value={row.mobile}
                      onChange={e => handleInputChange(idx, 'mobile', e.target.value)}
                      placeholder="e.g. 9876543210"
                      type="tel"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{dynamicLabel}</label>
                    {courseOptions.length > 0 ? (
                      <CustomSelect
                        options={courseOptions}
                        value={row.course}
                        onChange={(value) => handleInputChange(idx, 'course', value)}
                        placeholder={`Select ${dynamicLabel}`}
                        required
                      />
                    ) : (
                      <input
                        className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                        value={row.course}
                        onChange={e => handleInputChange(idx, 'course', e.target.value)}
                        placeholder={`e.g. ${dynamicLabel}`}
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                    {sourceOptions.length > 0 ? (
                      <CustomSelect
                        options={sourceOptions}
                        value={row.source}
                        onChange={(value) => handleInputChange(idx, 'source', value)}
                        placeholder="Select Source"
                      />
                    ) : (
                      <input
                        className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                        value={row.source}
                        onChange={e => handleInputChange(idx, 'source', e.target.value)}
                        placeholder="e.g. Source"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <input
                      className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                      value={row.location}
                      onChange={e => handleInputChange(idx, 'location', e.target.value)}
                      placeholder="e.g. New York"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 resize-none focus:outline-none focus:border-gray-400"
                      value={row.remarks}
                      onChange={e => handleInputChange(idx, 'remarks', e.target.value)}
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Info Box for Excel Import */}
          <div className="w-full flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-4 py-3 mb-6 mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm">
              If you have data available on Excel,{' '}
              <a href="#" className="font-semibold underline hover:text-blue-900" onClick={handleSwitchToImport}>
                Click here to import.
              </a>
            </span>
          </div>
          
          <div className="mt-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-start">
              <button
                className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none hover:bg-gray-50 transition-colors"
                onClick={handleAddRow}
                type="button"
              >
                + Add Another Lead
              </button>
              <button
                className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold focus:outline-none hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Enquiry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}