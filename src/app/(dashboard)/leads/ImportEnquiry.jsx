import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { xFetch } from '@/utility/xFetch';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Corporate, User, Test } from '@/utility/TinyDB';

export default function ImportEnquiryDropBox({ onCancel, testId, onSwitchToManual }) {
  // State management
  const [file, setFile] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [header, setHeader] = useState([]);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [uniqueRows, setUniqueRows] = useState([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
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

  // Process uploaded file (validates against backend requirements)
  const handleFile = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Get header to validate against and for later use
        const headerRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const fileHeader = headerRows[0] || [];
        setHeader(fileHeader);

        // Validate against backend-required columns
        const requiredColumns = getRequiredColumns();
        if (!requiredColumns.every(col => fileHeader.includes(col))) {
          toast.error(`File must contain these exact columns: ${requiredColumns.join(', ')}`);
          return;
        }

        // Convert sheet to JSON objects for robust mapping
        const jsonRows = XLSX.utils.sheet_to_json(sheet); // This does not include the header row

        // Validate each row according to backend rules
        const { valid, invalid } = validateRows(jsonRows);
        
        setTotalRows(jsonRows.length);
        setValidRows(valid);
        setInvalidRows(invalid);
        setFile(file);
        setError('');
      } catch (err) {
        toast.error(`Error processing file: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Row validation (matches backend validation logic)
  const validateRows = (rows) => {
    const valid = [];
    const invalid = [];

    rows.forEach((row, idx) => {
      const errors = [];
      const firstName = row['First Name']?.toString().trim();
      const lastName = row['Last Name']?.toString().trim();
      const email = row[columnConfig?.email || 'Email']?.toString().trim();
      const mobile = (row[columnConfig?.mobile || 'Mobile']?.toString().trim() || '').replace(/\D/g, '');
      const dynamicValue = row[columnConfig?.label || dynamicLabel]?.toString().trim();

      // Validation rules (must match backend validation)
      if (!firstName) errors.push('Missing first name');
      if (!lastName && sessionData?.corporate?.type !== 700) errors.push('Missing last name');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email');
      if (!mobile || !/^\d{10}$/.test(mobile)) errors.push('Invalid mobile (must be exactly 10 digits)');
      if (!dynamicValue) errors.push(`Missing ${columnConfig?.label || dynamicLabel}`);

      if (errors.length > 0) {
        invalid.push({ row, errors, lineNumber: idx + 2 });
      } else {
        // Push the whole object for robust backend mapping
        valid.push(row);
      }
    });

    return { valid, invalid };
  };

  // Download template (matches backend expected format)
  const downloadTemplate = () => {
    const columns = getRequiredColumns();
    const ws = XLSX.utils.aoa_to_sheet([columns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Import_Template_${columnConfig?.label || dynamicLabel}.xlsx`);
  };

  // Check duplicates (matches backend API)
  const checkDuplicates = async (emails, mobiles) => {
    try {
      const response = await xFetch({
        method: 'POST',
        path: '/services/invite/checkDuplicates',
        payload: {
          emails: emails.join(','),
          phones: mobiles.join(','),
          testId: testId || sessionData?.test?._id
        }
      });
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response && Array.isArray(response.items)) {
        return response.items;
      } else if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('Unexpected duplicate check response format:', response);
        return [];
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
      // Don't throw error, just return empty array to allow upload to continue
      return [];
    }
  };

  // Main import function (EXACTLY matches backend requirements)
  const handleImport = async () => {
    setUploading(true);
    setProgress(0);
    setError('');
    setUploadFailed(false);
    try {
      // Check if we have valid session data
      if (!sessionData?.test?._id) {
        toast.error('Session data not available. Please refresh the page.');
        setUploading(false);
        return;
      }

      // 1. Check duplicates (REQUIRED by backend)
      const emails = validRows.map(row => row[columnConfig?.email || 'Email']);
      const mobiles = validRows.map(row => String(row[columnConfig?.mobile || 'Mobile'] || '').replace(/\D/g, ''));
      const duplicates = await checkDuplicates(emails, mobiles);
      setDuplicates(duplicates);

      // 2. Filter out duplicates
      const duplicateEmails = new Set();
      const duplicateMobiles = new Set();

      if (duplicates && duplicates.length > 0) {
        // Check if the backend returned objects with contact details
        if (typeof duplicates[0] === 'object' && duplicates[0] !== null) {
          duplicates.forEach(record => {
            if (record.email_id) {
              duplicateEmails.add(record.email_id.toLowerCase());
            }
            if (record.mobile) {
              duplicateMobiles.add(String(record.mobile).replace(/\D/g, ''));
            }
          });
        } else {
          // Or if it returned a flat list of emails and mobiles
          duplicates.forEach(value => {
            const val = String(value);
            if (val.includes('@')) {
              duplicateEmails.add(val.toLowerCase());
            } else {
              duplicateMobiles.add(val.replace(/\D/g, ''));
            }
          });
        }
      }

      const uniqueRowsFiltered = validRows.filter(row => {
        const email = (row[columnConfig?.email || 'Email'] || '').toLowerCase();
        const mobile = String(row[columnConfig?.mobile || 'Mobile'] || '').replace(/\D/g, '');

        if (duplicateEmails.has(email)) {
          return false;
        }
        if (mobile && duplicateMobiles.has(mobile)) {
          return false;
        }
        return true;
      });
      
      setUniqueRows(uniqueRowsFiltered);
      setDuplicateCount(validRows.length - uniqueRowsFiltered.length);

      console.log('Duplicates from backend:', duplicates);
      console.log('Rows before filtering:', validRows);
      console.log('Rows after filtering:', uniqueRowsFiltered);

      // Stop if no unique rows to upload
      if (uniqueRowsFiltered.length === 0) {
        toast.warning('No records to upload after filtering duplicates.');
        setUploadComplete(true);
        setUploadFailed(false);
        return;
      }

      // 3. Prepare payload (MUST match backend structure)
      const payload = {
        contacts: uniqueRowsFiltered,
        testId: testId || sessionData?.test?._id,
        corporateType: sessionData?.corporate?.type,
        recruiterId: sessionData?.corporate?._id,
        manual: true, // REQUIRED by backend
        toDefer: uniqueRowsFiltered.length > 500, // Matches backend's bunchLimit
        owner: sessionData?.user?._id,
        roleName: sessionData?.user?.role
      };

      // 4. Upload in chunks (matches backend's processing)
      const chunkSize = 50; // Optimal for backend performance
      const chunks = [];
      for (let i = 0; i < uniqueRowsFiltered.length; i += chunkSize) {
        chunks.push(uniqueRowsFiltered.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        try {
          const formData = new FormData();
          // Append contacts as multi-dimensional array, legacy style
          chunks[i].forEach((contact, idx) => {
            const contactArr = [
              contact['First Name'] || '',
              contact['Last Name'] || '',
              contact[columnConfig?.email || 'Email'] || '',
              contact[columnConfig?.mobile || 'Mobile'] || '',
              contact[columnConfig?.label || dynamicLabel] || '',
              contact['Location'] || '',
              contact[columnConfig?.source || 'Source'] || '',
              contact[columnConfig?.remarks || 'Remarks'] || ''
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

          const token = localStorage.getItem('access_token');
          const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/leadstorredirect/sendTestInvitationEmail`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
              // DO NOT set Content-Type, browser will set it for FormData
            },
            body: formData,
            redirect: 'follow'
          });
          let response;
          try {
            response = await fetchResponse.json();
          } catch (e) {
            throw new Error('Invalid server response');
          }
          if (response && (response.status === 'OK' || response.success === true || response.message === 'Success')) {
            // Success case
          } else if (response && response.errors && Array.isArray(response.errors)) {
            throw new Error(response.errors.join(', '));
          } else if (response && response.error) {
            throw new Error(response.error);
          } else if (response && response.message && response.status !== 'OK') {
            throw new Error(response.message);
          } else if (!response) {
            throw new Error('No response from server');
          }
          // If we reach here, assume success

          // Update progress
          setProgress(Math.round(((i + 1) / chunks.length) * 100));
        } catch (chunkError) {
          console.error(`Error uploading chunk ${i + 1}:`, chunkError);
          throw new Error(`Failed to upload chunk ${i + 1}: ${chunkError.message}`);
        }
      }

      setUploadComplete(true);
      setUploadFailed(false);
      toast.success(`Uploaded ${uniqueRowsFiltered.length} record${uniqueRowsFiltered.length === 1 ? '' : 's'} successfully`);
      
      // Refresh table if function exists
      if (typeof window !== 'undefined' && typeof window.tableRefresh === 'function') {
        window.tableRefresh();
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Upload failed');
      setUploadFailed(true);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Download helpers
  const downloadInvalid = () => {
    // Only include invalid records, with an 'Error' column
    const columns = [...header, 'Error'];
    const data = invalidRows.map(({ row, errors }) => {
      const rowDataAsArray = header.map(h => row[h] || '');
      return [...rowDataAsArray, errors.join('; ')];
    });
    const ws = XLSX.utils.aoa_to_sheet([columns, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invalid Records');
    XLSX.writeFile(wb, 'Invalid_Records.xlsx');
  };

  // Download duplicates as Excel (for the third box)
  const downloadDuplicatesExcel = () => {
    if (!duplicates || duplicates.length === 0) return;
    // If backend returns full duplicate records, use them directly
    const columns = ['corporateId', 'email_id', 'mobile', 'first_name', 'last_name', 'course', 'status', 'remarks'];
    const data = Array.isArray(duplicates[0]) || typeof duplicates[0] === 'object'
      ? duplicates.map(d => columns.map(col => d[col] || ''))
      : validRows.filter(row => {
          const email = (row[columnConfig?.email || 'Email'] || '').toLowerCase();
          const mobile = String(row[columnConfig?.mobile || 'Mobile'] || '').replace(/\D/g, '');
          // This logic is complex; a simpler way is to check against `uniqueRows`
          // but that's not available here. Re-filtering is okay for now.
          const isDuplicate = !uniqueRows.find(uniqueRow => uniqueRow[columnConfig?.email || 'Email'] === row[columnConfig?.email || 'Email'] && uniqueRow[columnConfig?.mobile || 'Mobile'] === row[columnConfig?.mobile || 'Mobile']);
          return isDuplicate;
        }).map(row => header.map(h => row[h] || ''));
    const ws = XLSX.utils.aoa_to_sheet([columns, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Duplicate Records');
    XLSX.writeFile(wb, 'Duplicate_Records.xlsx');
  };

  // Render methods with fixed layout structure
  const renderFileSelect = () => (
    <div className="w-full h-full flex flex-col items-center justify-between px-4 py-0">
      {/* Centered Excel icon */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img src="icons/excel.png" alt="Excel Logo" className="w-20 h-20 mb-8 mt-2 rounded-lg border border-gray-200 bg-white object-contain shadow-none" />
        {/* Drop zone */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer bg-white w-full max-w-md mb-4" // Added mb-4 for gap below upload area
          onDrop={e => {
            e.preventDefault();
            e.stopPropagation();
            handleFile(e);
          }}
          onDragOver={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            // Only trigger file input, not template download
            e.stopPropagation();
            if (typeof document !== 'undefined') {
            document.querySelector('#import-file-input')?.click();
        }
          }}
          style={{ transition: 'none' }}
        >
          <input 
            id="import-file-input"
            type="file"
            accept=".xlsx,.xls"
            className="hidden text-gray-500 bg-white border border-gray-300 rounded-xl"
            onChange={handleFile}
          />
          <p className="text-lg font-semibold text-gray-800 mb-1">Select Excel file to import</p>
          <p className="text-sm text-gray-500 mb-2">or drag and drop your file here</p>
          <p className="text-xs text-gray-400">Maximum file size: 5MB</p>
        </div>
      </div>
      {/* Light blue notification bar with bulb icon and links */}
      <div className="w-full bg-blue-100 flex items-center gap-2 px-4 py-3 rounded-lg border border-blue-200 mt-0 mb-4">
        {/* Bulb Icon (SVG) - replaced for consistency with ManualCandidate */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a7 7 0 00-4.95 11.95c.2.2.32.47.32.75v.3a2.25 2.25 0 002.25 2.25h4.76a2.25 2.25 0 002.25-2.25v-.3c0-.28.12-.55.32-.75A7 7 0 0012 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
        </svg>
        <span className="text-sm text-blue-800">
          Don&apos;t have a template?{' '}
          <button
            className="text-blue-700 underline font-normal p-0 m-0 bg-transparent border-none outline-none shadow-none cursor-pointer"
            onClick={downloadTemplate}
            type="button"
          >
            Download here
          </button>
          {' '}or{' '}
          <span className="text-blue-700 underline cursor-pointer font-normal" onClick={onSwitchToManual}>
            switch to manual
          </span>
        </span>
      </div>
    </div>
  );

  const renderValidationResults = () => (
    <div className="w-full h-full flex flex-col items-center justify-between px-4 py-0">
      {/* Centered Excel icon and stats */}
      <div className="flex flex-col items-center justify-center flex-1">
        <img src="/icons/excel.png" alt="Excel Logo" className="w-20 h-20 mb-8 mt-2 rounded-lg border border-gray-200 bg-white object-contain shadow-none" />
        {/* Stats section */}
        <div className="w-[320px] mx-auto mb-6">
          <div className="flex text-center border border-gray-300 rounded-lg overflow-hidden bg-white w-full">
            <div className="flex-1 py-3 border-r border-gray-200 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold mb-1">{totalRows}</span>
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="flex-1 py-3 border-r border-gray-200 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold mb-1">{validRows.length}</span>
              <span className="text-xs text-gray-500">Valid</span>
            </div>
            <button
              className="flex-1 py-3 flex flex-col items-center justify-center relative group focus:outline-none bg-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
              onClick={downloadInvalid}
              type="button"
              disabled={invalidRows.length === 0}
              style={{ boxShadow: 'none', background: 'none', border: 'none', padding: 0, margin: 0 }}
            >
              <span className="absolute top-1 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              </span>
              <span className="text-2xl font-bold mb-1">{invalidRows.length}</span>
              <span className="text-xs text-gray-500">Invalid</span>
            </button>
          </div>
        </div>
        {/* Description */}
        <div className="max-w-[320px] mx-auto text-center text-sm text-gray-600 px-2 mb-6">
          {`Validation complete. ${validRows.length} records are valid${invalidRows.length > 0 ? `, ${invalidRows.length} invalid.` : '.'}`}
        </div>
        {/* Button section */}
        <div className="w-full max-w-md">
          <button
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md transition border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleImport}
            disabled={validRows.length === 0}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );

  const renderUploadResult = () => {
    const hasDuplicates = duplicates && duplicates.length > 0;
    // Calculate values for the stats
    const validCount = validRows.length;
    let uploadedCount;
    if (uploadComplete) {
      uploadedCount = uniqueRows.length;
    } else {
      uploadedCount = Math.round(uniqueRows.length * (progress/100));
    }
    // Ensure uploadedCount is never negative or zero if there are uploaded records
    if (uploadedCount < 0) uploadedCount = 0;
    if (uploadedCount === 0 && uniqueRows.length > 0 && progress > 0) uploadedCount = 1;

    return (
      <div className="w-full h-full flex flex-col items-center justify-between px-4 py-0">
        {/* Centered Excel icon and progress */}
        <div className="flex flex-col items-center justify-center flex-1">
          <img src="/icons/excel.png" alt="Excel Logo" className="w-20 h-20 mb-8 mt-2 rounded-lg border border-gray-200 bg-white object-contain shadow-none" />
          {/* Progress bar */}
          <div className="w-full max-w-md mb-6">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {/* Stats section */}
          <div className="w-[320px] mx-auto mb-6">
            <div className="flex text-center border border-gray-300 rounded-lg overflow-hidden bg-white w-full">
              <div className="flex-1 py-3 border-r border-gray-200 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold mb-1">{validCount}</span>
                <span className="text-xs text-gray-500">Valid</span>
              </div>
              <div className="flex-1 py-3 border-r border-gray-200 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold mb-1">{uploadedCount}</span>
                <span className="text-xs text-gray-500">Uploaded</span>
              </div>
              <button
                className="flex-1 py-3 flex flex-col items-center justify-center relative group focus:outline-none bg-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
                onClick={downloadDuplicatesExcel}
                type="button"
                disabled={duplicateCount === 0}
                style={{ boxShadow: 'none', background: 'none', border: 'none', padding: 0, margin: 0 }}
              >
                <span className="absolute top-1 right-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                </span>
                <span className="text-2xl font-bold mb-1">{duplicateCount}</span>
                <span className="text-xs text-gray-500">Duplicate</span>
              </button>
            </div>
          </div>
          {/* Description */}
          <div className="max-w-[320px] mx-auto text-center text-sm text-gray-600 px-2 mb-6">
            {uploadComplete
              ? `Upload complete. ${uniqueRows.length} records uploaded${duplicateCount > 0 ? `, ${duplicateCount} duplicates skipped.` : '.'}`
              : `Uploading ${uniqueRows.length} records...${duplicateCount > 0 ? ` (${duplicateCount} duplicates will be skipped)` : ''}`
            }
          </div>
          {/* Status section */}
          <div className="w-full max-w-md">
            {uploadFailed && (
              <div className="flex flex-col items-center mb-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-2">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
                <span className="text-rose-700 font-semibold text-lg">Upload Failed</span>
                {error && (
                  <div className="text-rose-700 bg-rose-100 px-4 py-2 rounded-md mt-2 text-sm max-w-md text-center">
                    {error}
                  </div>
                )}
              </div>
            )}
            {/* Buttons */}
            <div className="w-full max-w-md flex flex-col gap-2">
              {uploading && !uploadComplete && !uploadFailed && (
                <button
                  className="w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-lg shadow-md transition border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              )}
              {uploadFailed && (
                <button
                  className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-lg shadow"
                  onClick={handleImport}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="bg-white rounded-xl shadow-2xl relative w-[480px] h-[480px] flex flex-col">
        {/* Modal header only */}
        <div className="flex-shrink-0 relative h-16 flex items-center justify-center">
          <h2 className="text-2xl font-medium text-gray-500 w-full text-center">Import Leads</h2>
          <button
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent"
            style={{ color: '#9ca3af', background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none', transition: 'none' }}
            onClick={onCancel}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: '#9ca3af', background: 'transparent', transition: 'none' }}>
              <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Content area: only renderFileSelect for initial state */}
        <div className="flex-1 overflow-hidden">
          {!file ? renderFileSelect() : 
           uploading || uploadComplete || uploadFailed ? renderUploadResult() : 
           renderValidationResults()}
        </div>
      </div>
    </div>
  );
}