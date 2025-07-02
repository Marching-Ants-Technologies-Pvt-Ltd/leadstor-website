"use client";
import React, { useState, useMemo, useEffect } from "react";
import { xFetch } from '@/utility/xFetch';
import { Test, User } from '@/utility/TinyDB';

const initialRow = { firstName: "", lastName: "", email: "", mobile: "", course: "", location: "", source: "", remarks: "" };

export default function ManualCandidate({ onCancel }) {
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stat, setStat] = useState({ total: 0, valid: 0, duplicate: 0, uploaded: 0 });
  const [duplicates, setDuplicates] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);

  // Session data (matches ImportEnquiryDropBox)
  const sessionData = useMemo(() => {
    return JSON.parse(localStorage.getItem('CurrentSessionData') || '{}');
  }, []);

  // Dynamic label (matches ImportEnquiryDropBox)
  const dynamicLabel = useMemo(() => {
    const corporateType = sessionData?.corporate?.type;
    const corporateId = sessionData?.corporate?._id;
    const serviceIds = [64, 1084, 1114, 1115, 1280, 1153];
    const emvyGroups = 1152;
    if (corporateType === 800) return 'Country';
    if (corporateType === 100 && serviceIds.includes(corporateId)) return 'Service';
    if (corporateType === 100 && corporateId === emvyGroups) return 'Project';
    return 'Course';
  }, [sessionData]);

  useEffect(() => {
    const fetchDropdownValues = async () => {
      if (sessionData?.test?._id) {
        try {
          const response = await xFetch({
            method: 'GET',
            path: `/services/invite/api.php?x=getFilterParameters&testId=${sessionData.test._id}`,
          });
          
          const optionsKey = `${dynamicLabel.toLowerCase()}s`;
          
          if (response && response[optionsKey]) {
            setCourseOptions(response[optionsKey]);
          } else if (response && response.courses) {
            // Fallback for default 'Course' type
            setCourseOptions(response.courses);
          }

        } catch (error) {
          console.error("Failed to fetch dropdown values:", error);
        }
      }
    };
    fetchDropdownValues();
  }, [sessionData]);

  // Backend-required columns
  const getRequiredColumns = () => [
    'First Name',
    'Last Name',
    'Email',
    'Mobile',
    dynamicLabel,
    'Location',
    'Source',
    'Remarks'
  ];

  // Map UI row to backend object
  const mapRowToBackend = (row) => ({
    'First Name': row.firstName,
    'Last Name': row.lastName,
    'Email': row.email,
    'Mobile': row.mobile,
    [dynamicLabel]: row.course,
    'Location': row.location,
    'Source': row.source,
    'Remarks': row.remarks
  });

  // Validate row (matches ImportEnquiryDropBox)
  const validateRow = (row) => {
    const errors = [];
    if (!row.firstName) errors.push('Missing first name');
    if (!row.lastName && sessionData?.corporate?.type !== 700) errors.push('Missing last name');
    if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push('Invalid email');
    if (!row.mobile || !/^[6-9]\d{9}$/.test(row.mobile)) errors.push('Invalid mobile (10 digits starting with 6-9)');
    if (!row.course) errors.push(`Missing ${dynamicLabel}`);
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
      return [];
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
          course: row[dynamicLabel],
        });
        if (errors.length === 0) validRows.push(row);
        else invalidRows.push({ row, errors, idx });
      });
      if (invalidRows.length > 0) {
        setMessage({ type: 'error', text: `There are ${invalidRows.length} invalid entr${invalidRows.length === 1 ? 'y' : 'ies'} in the form. Please correct them before submitting.` });
        setLoading(false);
        return;
      }
      // 2. Check duplicates
      const emails = validRows.map(r => r['Email']);
      const mobiles = validRows.map(r => r['Mobile']?.toString().replace(/\D/g, ''));
      const duplicatesFromBackend = await checkDuplicates(emails, mobiles);
      setDuplicates(duplicatesFromBackend);
      if (duplicatesFromBackend.length > 0) {
        setMessage({ type: 'error', text: `There are ${duplicatesFromBackend.length} duplicate entr${duplicatesFromBackend.length === 1 ? 'y' : 'ies'} found in the database. Please remove or update them before submitting.` });
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
        const response = await xFetch({
          method: 'POST',
          path: '/services/invite/api.php?x=sendTestInvitations',
          payload: {
            ...payload,
            contacts: chunks[i]
          }
        });
        if (response.status !== 'OK') {
          throw new Error(response.errors?.join(', ') || 'Upload failed');
        }
        uploaded += chunks[i].length;
      }
      setMessage({ type: 'success', text: 'Candidate(s) added successfully!' });
      setRows([{ ...initialRow }]);
      setUploadComplete(true);
      if (typeof window.tableRefresh === 'function') window.tableRefresh();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to add candidate.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-0 overflow-hidden animate-fadeIn pt-10">
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition focus:outline-none z-30"
          onClick={onCancel}
          aria-label="Close"
          type="button"
          style={{ fontSize: '1.5rem', lineHeight: 1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
          </svg>
        </button>
        {/* Title */}
        <div className="absolute top-6 left-6">
          <h2 className="text-xl font-semibold text-gray-800">Add Leads</h2>
        </div>
        {/* Info Note */}
        <div className="px-4 pt-4 pb-1">
          {message && (
            <div className={`mb-3 p-1.5 rounded text-center text-xs ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{message.text}</div>
          )}
        </div>
        {/* Form */}
        <form
          className="px-4 pb-5 pt-2 max-h-[74vh] overflow-y-auto"
          onSubmit={e => { e.preventDefault(); handleAddEnquiry(); }}
        >
          <div className="space-y-6">
            {rows.map((row, idx) => (
              <div key={idx} className="relative bg-white border border-gray-100 rounded-2xl shadow-sm p-5 group transition-all">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-base text-blue-800">Leads #{idx + 1}</h3>
                  {rows.length > 1 && (
                    <button
                      onClick={() => setRows(rows.filter((_, i) => i !== idx))}
                      className="text-gray-300 hover:text-red-500 transition-colors text-xl font-bold rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-red-200"
                      title="Remove Candidate"
                      type="button"
                    >
                      &times;
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">First Name</label>
                    <input
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                      value={row.firstName}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, firstName: e.target.value } : r))}
                      placeholder="e.g. John"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Last Name</label>
                    <input
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                      value={row.lastName}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, lastName: e.target.value } : r))}
                      placeholder="e.g. Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Email <span className="text-red-500">*</span></label>
                    <input
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                      value={row.email}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, email: e.target.value } : r))}
                      placeholder="e.g. john.doe@example.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Mobile <span className="text-red-500">*</span></label>
                    <input
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                      value={row.mobile}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, mobile: e.target.value } : r))}
                      placeholder="e.g. 9876543210"
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">{dynamicLabel}</label>
                    {courseOptions.length > 0 ? (
                      <select
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                        value={row.course}
                        onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, course: e.target.value } : r))}
                      >
                        <option value="">Select {dynamicLabel}</option>
                        {courseOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="w-full px-3 py-1.5 border border-ray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                        value={row.course}
                        onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, course: e.target.value } : r))}
                        placeholder={`e.g. ${dynamicLabel}`}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Source</label>
                    <select
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                      value={row.source}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, source: e.target.value } : r))}
                    >
                      <option value="">Select Source</option>
                      <option value="Manual">Manual</option>
                      <option value="WebSync">WebSync</option>
                      <option value="Facebook">Facebook</option>
                      <option value="IndiaMart">IndiaMart</option>
                      <option value="Justdial">Justdial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Location</label>
                    <input
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                      value={row.location}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, location: e.target.value } : r))}
                      placeholder="e.g. New York"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Remarks</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none"
                      value={row.remarks}
                      onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, remarks: e.target.value } : r))}
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Add Row Button */}
          <div className="mt-1 flex items-center gap-4">
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded flex items-center transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={() => setRows([...rows, { ...initialRow }])}
              type="button"
            >
              <span className="text-lg mr-1 font-light">+</span>Add Another Lead
            </button>
            <button
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-1.5 rounded flex items-center transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 