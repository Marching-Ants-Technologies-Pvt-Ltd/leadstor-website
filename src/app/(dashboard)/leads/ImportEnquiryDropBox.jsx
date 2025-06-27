import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { xFetch } from '@/utility/xFetch';

export default function ImportEnquiryDropBox({ onCancel, testId }) {
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

  // Get session data (REQUIRED by backend)
  const sessionData = useMemo(() => {
    return JSON.parse(localStorage.getItem('CurrentSessionData') || {});
  }, []);

  // Dynamic label mapping (EXACTLY matches backend expectations)
  const dynamicLabel = useMemo(() => {
    const corporateType = sessionData?.corporate?.type;
    const corporateId = sessionData?.corporate?._id;
    
    // Backend expects these specific mappings:
    const serviceIds = [64, 1084, 1114, 1115, 1280, 1153]; // Matches backend logic
    const emvyGroups = 1152; // Matches backend constant
    
    if (corporateType === 800) return 'Country';
    if (corporateType === 100 && serviceIds.includes(corporateId)) return 'Service';
    if (corporateType === 100 && corporateId === emvyGroups) return 'Project';
    return 'Course'; // Default as expected by backend
  }, [sessionData]);

  // Backend-required columns (MUST match PHP script expectations)
  const getRequiredColumns = () => [
    'First Name',
    'Last Name',
    'Email',
    'Mobile',
    dynamicLabel, // Dynamic field based on corporate type
    'Location',
    'Source',
    'Remarks'
  ];

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
          setError(`File must contain these exact columns: ${requiredColumns.join(', ')}`);
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
        setError(`Error processing file: ${err.message}`);
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
      const email = row['Email']?.toString().trim();
      const mobile = (row['Mobile']?.toString().trim() || '').replace(/\D/g, '');
      const dynamicValue = row[dynamicLabel]?.toString().trim();

      // Validation rules (must match backend validation)
      if (!firstName) errors.push('Missing first name');
      if (!lastName && sessionData?.corporate?.type !== 700) errors.push('Missing last name');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email');
      if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) errors.push('Invalid mobile (10 digits starting with 6-9)');
      if (!dynamicValue) errors.push(`Missing ${dynamicLabel}`);

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
    XLSX.writeFile(wb, `Import_Template_${dynamicLabel}.xlsx`);
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
      return response.items || [];
    } catch (err) {
      console.error('Duplicate check failed:', err);
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
      // 1. Check duplicates (REQUIRED by backend)
      const emails = validRows.map(row => row['Email']);
      const mobiles = validRows.map(row => row['Mobile']?.toString().replace(/\D/g, ''));
      const duplicates = await checkDuplicates(emails, mobiles);
      setDuplicates(duplicates);

      // 2. Filter out duplicates
      // Normalize duplicates for case-insensitive and digit-only comparison
      const duplicatesNormalized = duplicates.map(d => (d ? d.toString().toLowerCase().replace(/\D/g, '') : ''));
      const uniqueRows = validRows.filter(row => {
        const email = (row['Email'] || '').toLowerCase();
        const mobile = (row['Mobile'] || '').replace(/\D/g, '');
        return !duplicatesNormalized.includes(email) && !duplicatesNormalized.includes(mobile);
      });
      console.log('Duplicates from backend:', duplicates);
      console.log('Rows before filtering:', validRows);
      console.log('Rows after filtering:', uniqueRows);

      // 3. Prepare payload (MUST match backend structure)
      const payload = {
        contacts: uniqueRows,
        testId: testId || sessionData?.test?._id,
        corporateType: sessionData?.corporate?.type,
        recruiterId: sessionData?.corporate?._id,
        manual: true, // REQUIRED by backend
        toDefer: uniqueRows.length > 500, // Matches backend's bunchLimit
        owner: sessionData?.user?._id,
        roleName: sessionData?.user?.role
      };

      // 4. Upload in chunks (matches backend's processing)
      const chunkSize = 50; // Optimal for backend performance
      const chunks = [];
      for (let i = 0; i < uniqueRows.length; i += chunkSize) {
        chunks.push(uniqueRows.slice(i, i + chunkSize));
      }

      for (let i = 0; i < chunks.length; i++) {
        const response = await xFetch({
          method: 'POST',
          path: '/services/invite/api.php?x=sendTestInvitations', // Updated backend endpoint
          payload: {
            ...payload,
            contacts: chunks[i] // Send current chunk
          }
        });

        // Handle backend response
        if (response.status !== 'OK') {
          throw new Error(response.errors?.join(', ') || 'Upload failed');
        }

        // Update progress
        setProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      setUploadComplete(true);
      setUploadFailed(false);
      if (typeof window.tableRefresh === 'function') window.tableRefresh();
    } catch (err) {
      setError(err.message);
      setUploadFailed(true);
    } finally {
      setUploading(false);
    }
  };

  // Render methods (UI remains consistent with backend flow)
  const renderFileSelect = () => (
    <div className="flex flex-col items-center">
      <img src="/icons/excel.png" alt="Excel Logo" className="w-12 h-12 mb-3 rounded-lg shadow-sm" />
      {/* File info (if file is selected) */}
      {file && (
        <div className="mb-4 text-gray-700 text-sm font-medium bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="truncate max-w-xs">{file.name}</span>
          <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center my-5 cursor-pointer transition-all shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-500 hover:bg-blue-50 w-full max-w-md"
        onDrop={handleFile}
        onDragOver={e => e.preventDefault()}
        onClick={() => document.querySelector('#import-file-input')?.click()}
        style={{ minHeight: 180 }}
      >
        <input 
          id="import-file-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />
        <p className="text-lg text-gray-700 font-medium">Drag & drop your Excel file here</p>
        <p className="text-gray-500">or click to browse</p>
        <p className="text-xs text-gray-400 mt-2">
          Required columns: {getRequiredColumns().join(', ')}
        </p>
      </div>
      {error && <div className="text-red-700 bg-red-100 px-4 py-2 rounded-md my-4 text-sm w-full max-w-md text-center">{error}</div>}
      <button 
        className="mt-4 text-blue-600 hover:text-blue-800 underline text-sm font-medium"
        onClick={downloadTemplate}
      >
        Download {dynamicLabel} Template
      </button>
    </div>
  );

  const renderValidationResults = () => (
    <div className="flex flex-col items-center">
      <img src="/icons/excel.png" alt="Excel Logo" className="w-20 h-20 mb-6 rounded-xl shadow" />
      {/* File info */}
      {file && (
        <div className="mb-4 text-gray-700 text-sm font-medium bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2">
          <span className="truncate max-w-xs">{file.name}</span>
          <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}
      <div className="w-full max-w-md flex flex-col items-center mb-8">
        <div className="flex w-full text-center border border-gray-400 rounded-lg overflow-hidden bg-white">
          {/* Total/Valid/Invalid Record boxes as before */}
          <div className="flex-1 py-2 border-r border-gray-300 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold mb-1">{totalRows}</span>
            <span className="text-xs text-gray-500">Total Record</span>
          </div>
          <div className="flex-1 py-2 border-r border-gray-300 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold mb-1">{validRows.length}</span>
            <span className="text-xs text-gray-500">Valid Record</span>
          </div>
          <button
            className="flex-1 py-2 flex flex-col items-center justify-center relative group focus:outline-none hover:bg-gray-100 transition cursor-pointer"
            onClick={downloadInvalid}
            style={{ border: 'none', background: 'none' }}
            type="button"
          >
            <span className="absolute top-1 right-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </span>
            <span className="text-2xl font-bold mb-1">{invalidRows.length}</span>
            <span className="text-xs text-gray-500">Invalid Record</span>
          </button>
        </div>
      </div>
      {/* Only Import button, centered */}
      <div className="flex justify-center mt-4 w-full max-w-md">
        <button
          className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md transition border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleImport}
          disabled={validRows.length === 0}
        >
          Import
        </button>
      </div>
    </div>
  );

  const renderUploadResult = () => {
    const hasDuplicates = duplicates && duplicates.length > 0;
    // Calculate values for the stats
    const validCount = validRows.length;
    let uploadedCount;
    if (uploadComplete) {
      uploadedCount = validRows.length - (duplicates.length || 0);
    } else {
      uploadedCount = Math.round(validRows.length * (progress/100));
    }
    // Ensure uploadedCount is never negative or zero if there are uploaded records
    if (uploadedCount < 0) uploadedCount = 0;
    if (uploadedCount === 0 && validRows.length > 0 && progress > 0) uploadedCount = 1;
    let duplicateCount = duplicates.length;
    if (duplicateCount > 0) duplicateCount = duplicateCount - 1;
    return (
      <div className="flex flex-col items-center">
        <img src="/icons/excel.png" alt="Excel Logo" className="w-20 h-20 mb-6 rounded-xl shadow" />
        {file && (
          <div className="mb-4 text-gray-700 text-sm font-medium bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2">
            <span className="truncate max-w-xs">{file.name}</span>
            <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
        {/* Upload Status Bar */}
        <div className="w-full max-w-md mb-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        {/* Stat Boxes */}
        <div className="w-full max-w-md flex flex-col items-center mb-8">
          <div className="flex w-full text-center border border-gray-400 rounded-lg overflow-hidden bg-white">
            <div className="flex-1 py-2 border-r border-gray-300 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold mb-1">{validCount}</span>
              <span className="text-xs text-gray-500">Valid Records</span>
            </div>
            <div className="flex-1 py-2 border-r border-gray-300 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold mb-1">{uploadedCount}</span>
              <span className="text-xs text-gray-500">Uploaded Records</span>
            </div>
            <button
              className="flex-1 py-2 flex flex-col items-center justify-center relative group focus:outline-none hover:bg-gray-100 transition cursor-pointer"
              onClick={downloadDuplicatesExcel}
              type="button"
            >
              <span className="absolute top-1 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              </span>
              <span className="text-2xl font-bold mb-1">{duplicateCount}</span>
              <span className="text-xs text-gray-500">Duplicate Records</span>
            </button>
          </div>
        </div>
        {/* Status Icon and Message */}
        {uploadComplete && !uploadFailed && (
          <div className="flex flex-col items-center justify-center" style={{ marginBottom: 0 }}>
            <span className="inline-flex items-center justify-center rounded-full bg-green-100" style={{ width: '40px', height: '40px', marginTop: -2 , marginBottom: -6}}>
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-green-700 font-semibold text-base" style={{ fontSize: '0.95rem', marginTop: '6px' }}>Upload Complete</span>
          </div>
        )}
        {uploadFailed && (
          <div className="mb-4 flex flex-col items-center">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 mb-2">
              <svg className="w-16 h-16 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </span>
            <span className="text-rose-700 font-semibold text-xl">Upload Failed</span>
            {error && <div className="text-rose-700 bg-rose-100 px-4 py-2 rounded-md my-2 text-sm w-full max-w-md text-center">{error}</div>}
          </div>
        )}
        <div className="flex gap-4 mt-4 w-full max-w-md">
          {uploading && !uploadComplete && !uploadFailed && (
            <button
              className="flex-1 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-lg shadow-md transition border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          {uploadFailed && (
            <button
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-lg shadow"
              onClick={handleImport}
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
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
      : validRows.filter(row => duplicates.includes(row['Email']) || duplicates.includes(row['Mobile']?.toString().replace(/\D/g, ''))).map(row => header.map(h => row[h] || ''));
    const ws = XLSX.utils.aoa_to_sheet([columns, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Duplicate Records');
    XLSX.writeFile(wb, 'Duplicate_Records.xlsx');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl relative flex flex-col items-center"
        style={{ height: '460px', width: '520px', minHeight: '460px', minWidth: '520px', maxHeight: '460px', maxWidth: '520px' }}>
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xl font-bold text-gray-800">Add Leads</div>
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition focus:outline-none z-10"
          style={{ fontSize: '1.5rem', lineHeight: 1 }}
          onClick={onCancel}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="w-full h-full flex-1 flex flex-col items-center justify-center overflow-y-auto pt-16 pb-4 px-2">
          {!file ? renderFileSelect() : 
           uploading || uploadComplete || uploadFailed ? renderUploadResult() : 
           renderValidationResults()}
        </div>
      </div>
    </div>
  );
}