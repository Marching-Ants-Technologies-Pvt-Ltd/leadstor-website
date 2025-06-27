"use client";
import React, { useState, useMemo } from "react";
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
    <div className="relative w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-0 overflow-hidden animate-fadeIn pt-16">
      <button
        className="absolute left-1/2 -translate-x-1/2 top-4 text-4xl text-gray-500 hover:text-gray-700 transition-colors z-30"
        onClick={onCancel}
        aria-label="Close"
        type="button"
      >
        &times;
      </button>
      
      {/* Title */}
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold text-gray-800">Add Leads</h2>
      </div>
      
      {/* Info Note */}
      <div className="px-8 pt-6 pb-2">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-semibold text-gray-800">Email Id or Mobile is mandatory</span> to add data successfully.
        </p>
        
        {message && (
          <div className={`mb-4 p-2 rounded text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{message.text}</div>
        )}
      </div>
      {/* Form */}
      <form
        className="px-8 pb-8 pt-2 max-h-[70vh] overflow-y-auto"
        onSubmit={e => { e.preventDefault(); handleAddEnquiry(); }}
      >
        <div className="space-y-8">
          {rows.map((row, idx) => (
            <div key={idx} className="relative bg-white border border-gray-100 rounded-2xl shadow-sm p-6 group transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-blue-800">Candidate #{idx + 1}</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                    value={row.firstName}
                    onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, firstName: e.target.value } : r))}
                    placeholder="e.g. John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                    value={row.lastName}
                    onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, lastName: e.target.value } : r))}
                    placeholder="e.g. Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                    value={row.email}
                    onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, email: e.target.value } : r))}
                    placeholder="e.g. john.doe@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mobile <span className="text-red-500">*</span></label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                    value={row.mobile}
                    onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, mobile: e.target.value } : r))}
                    placeholder="e.g. 9876543210"
                    type="tel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{dynamicLabel}</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                    value={row.course}
                    onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, course: e.target.value } : r))}
                    placeholder={`e.g. ${dynamicLabel}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Source</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-blue-50"
                    value={row.location}
                    onChange={e => setRows(rows.map((r, i) => i === idx ? { ...r, location: e.target.value } : r))}
                    placeholder="e.g. New York"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Remarks</label>
                  <textarea
                    className="w-full px-4 py-5 border border-gray-300 rounded-lg text-sm focus:outline-none "
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
        <div className="mt-0 flex items-center gap-4">
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            onClick={() => setRows([...rows, { ...initialRow }])}
            type="button"
          >
            <span className="text-xl mr-2 font-light">+</span>Add Another Candidate
          </button>
          <button
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg flex items-center transition-all duration-200 text-base font-semibold shadow-md hover:shadow-lg disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            <span className="mr-2">✈️</span>{loading ? 'Adding...' : 'Add Enquiry'}
          </button>
        </div>
      </form>
    </div>
  );
} 