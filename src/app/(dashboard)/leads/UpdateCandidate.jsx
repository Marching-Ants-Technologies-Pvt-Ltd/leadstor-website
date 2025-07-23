import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { xFetch } from '@/utility/xFetch';
import CustomSelect from '@/components/CustomSelect';
import { Corporate, User, Test } from '@/utility/TinyDB';

const initialFields = {
  invitationId: '',
  name: '',
  email: '',
  mobile: '',
  altMobile: '',
  status: '',
  remarks: '',
  course: '',
  source: '',
  testId: '',
};

export default function UpdateCandidate({ candidate, onCancel, onSuccess }) {
  // Use TinyDB for sessionData (like manualCandidate.jsx)
  const [sessionData, setSessionData] = useState({});
  const [statusOptions, setStatusOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [fields, setFields] = useState({ ...initialFields });
  const [originalFields, setOriginalFields] = useState({ ...initialFields }); // <-- add this line
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Set sessionData from TinyDB (like manualCandidate.jsx)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSessionData({ corporate: Corporate, user: User, test: Test });
    }
  }, []);

  // Debug: Log sessionData after it is set
  useEffect(() => {
    console.log('UpdateCandidate sessionData:', sessionData);
  }, [sessionData]);

  // Dynamic label logic (copied from manualCandidate.jsx)
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

  // Fetch source options (like manualCandidate.jsx)
  useEffect(() => {
    const fetchSourceOptions = async () => {
      const corporateId = sessionData?.corporate?._id;
      const corporateType = sessionData?.corporate?.type;
      console.log('Source fetch corporateId:', corporateId, 'corporateType:', corporateType);
      if (corporateId) {
        const url = `/services/profile/getSources?corporateId=${corporateId}`;
        console.log('Fetching source options from:', url);
        try {
          const response = await xFetch({
            method: 'GET',
            path: url
          });
          console.log('Source options API response:', response);
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

  // Fetch course options (like manualCandidate.jsx)
  useEffect(() => {
    const fetchDropdownValues = async () => {
      const testId = sessionData?.test?._id;
      const corporateId = sessionData?.corporate?._id;
      const corporateType = sessionData?.corporate?.type;
      console.log('Course fetch testId:', testId, 'corporateId:', corporateId, 'corporateType:', corporateType);
      if (testId) {
        const url = `/services/invite/api.php?x=getFilterParameters&testId=${testId}`;
        console.log('Fetching course options from:', url);
        try {
          const response = await xFetch({
            method: 'GET',
            path: url,
          });
          console.log('Course options API response:', response);
          const optionsKey = `${dynamicLabel.toLowerCase()}s`;
          if (response && response[optionsKey]) {
            setCourseOptions(response[optionsKey]);
          } else if (response && response.courses) {
            setCourseOptions(response.courses);
          } else {
            setCourseOptions([]);
          }
        } catch (error) {
          setCourseOptions([]);
        }
      }
    };
    if (Object.keys(sessionData).length > 0) {
      fetchDropdownValues();
    }
  }, [sessionData, dynamicLabel]);

  // Fetch status options (keep as before)
  useEffect(() => {
    const fetchStatusOptions = async () => {
      const corporateId = sessionData?.corporate?._id;
      const corporateType = sessionData?.corporate?.type;
      console.log('Status fetch corporateId:', corporateId, 'corporateType:', corporateType);
      if (corporateId) {
        const url = `/services/profile/getStatuses?corporateId=${corporateId}`;
        console.log('Fetching status options from:', url);
        try {
          const response = await xFetch({
            method: 'GET',
            path: url
          });
          console.log('Status options API response:', response);
          if (Array.isArray(response)) {
            setStatusOptions(response.map(s => s.status));
          } else {
            setStatusOptions([]);
          }
        } catch (error) {
          setStatusOptions([]);
        }
      }
    };
    if (sessionData?.corporate?._id) {
      fetchStatusOptions();
    }
  }, [sessionData]);

  // Fetch full candidate data from backend when popup opens
  useEffect(() => {
    const fetchCandidateDetails = async (invitationId) => {
      setFetching(true);
      try {
        const response = await xFetch({
          method: 'GET',
          path: `/services/invite/getInviteDetails?invitationId=${invitationId}`,
        });
        let newFields;
        if (response && response.invite) {
          newFields = {
            invitationId: response.invite.invitationId || response.invite.id || '',
            name: response.invite.name || response.invite.firstName || '',
            email: response.invite.email || response.invite.emailid || '',
            mobile: response.invite.mobile || response.invite.mobile_no || '',
            altMobile: response.invite.altMobile || response.invite.alt_mobile || '',
            status: response.invite.status || '',
            remarks: response.invite.remarks || response.invite.comments || '',
            course: response.invite.course || '',
            source: response.invite.source || '',
            testId: response.invite.testId || sessionData?.test?._id || '',
          };
        } else {
          newFields = {
            invitationId: candidate.invitationId || candidate.id || '',
            name: candidate.name || candidate.firstName || '',
            email: candidate.email || candidate.emailid || '',
            mobile: candidate.mobile || candidate.mobile_no || '',
            altMobile: candidate.altMobile || candidate.alt_mobile || '',
            status: candidate.status || '',
            remarks: candidate.remarks || candidate.comments || '',
            course: candidate.course || '',
            source: candidate.source || '',
            testId: candidate.testId || sessionData?.test?._id || '',
          };
        }
        setFields(newFields);
        setOriginalFields(newFields); // <-- set original fields here
      } catch (error) {
        const fallbackFields = {
          invitationId: candidate.invitationId || candidate.id || '',
          name: candidate.name || candidate.firstName || '',
          email: candidate.email || candidate.emailid || '',
          mobile: candidate.mobile || candidate.mobile_no || '',
          altMobile: candidate.altMobile || candidate.alt_mobile || '',
          status: candidate.status || '',
          remarks: candidate.remarks || candidate.comments || '',
          course: candidate.course || '',
          source: candidate.source || '',
          testId: candidate.testId || sessionData?.test?._id || '',
        };
        setFields(fallbackFields);
        setOriginalFields(fallbackFields); // <-- set original fields here
      } finally {
        setFetching(false);
      }
    };
    if (candidate && (candidate.invitationId || candidate.id)) {
      fetchCandidateDetails(candidate.invitationId || candidate.id);
    }
  }, [candidate, sessionData]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }));
  };

  // Utility to ensure current value is in options
  const ensureOption = (options, value) => {
    if (!value) return options;
    if (options.includes(value)) return options;
    return [value, ...options];
  };

  // Debug: Log options before rendering dropdowns
  console.log('Course options:', courseOptions, 'Current:', fields.course);
  console.log('Source options:', sourceOptions, 'Current:', fields.source);
  console.log('Status options:', statusOptions, 'Current:', fields.status);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare payload, fallback to originalFields if blank
      const payload = {
        invitationId: fields.invitationId || originalFields.invitationId || '',
        name: fields.name || originalFields.name || '',
        email: fields.email || originalFields.email || '',
        mobile: fields.mobile || originalFields.mobile || '',
        altMobile: fields.altMobile || originalFields.altMobile || '',
        status: fields.status || originalFields.status || '',
        remarks: fields.remarks || originalFields.remarks || '',
        course: fields.course || originalFields.course || '',
        source: fields.source || originalFields.source || '',
        testId: fields.testId || originalFields.testId || '',
      };
      const response = await xFetch({
        method: 'POST',
        path: '/services/invite/updateInviteDetails',
        payload
      });
      if (response && response.status === 'OK') {
        toast.success('Candidate updated successfully!');
        if (onSuccess) onSuccess();
      } else {
        toast.error(response?.error || 'Failed to update candidate.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update candidate.');
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 relative">
        <div className="px-8 pt-8 pb-3 flex items-center justify-between">
          <h2 className="text-2xl font-medium text-gray-500">Update Lead</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 focus:outline-none border-none bg-transparent -mr-2"
            style={{ marginRight: '-0.7rem' }}
            onClick={handleClose}
            aria-label="Close"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <form className="px-8 pb-6 pt-2 max-h-[74vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  value={fields.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  disabled={fetching}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  value={fields.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  type="email"
                  required
                  disabled={fetching}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  value={fields.mobile}
                  onChange={e => handleChange('mobile', e.target.value)}
                  placeholder="e.g. 9876543210"
                  type="tel"
                  required
                  disabled={fetching}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Mobile</label>
                <input
                  className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                  value={fields.altMobile}
                  onChange={e => handleChange('altMobile', e.target.value)}
                  placeholder="e.g. 9876543211"
                  type="tel"
                  disabled={fetching}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{dynamicLabel}</label>
                {courseOptions.length > 0 ? (
                  <CustomSelect
                    options={ensureOption(courseOptions, fields.course)}
                    value={fields.course}
                    onChange={value => handleChange('course', value)}
                    placeholder={`Select ${dynamicLabel}`}
                    disabled={fetching}
                  />
                ) : (
                  <input
                    className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                    value={fields.course}
                    onChange={e => handleChange('course', e.target.value)}
                    placeholder={`e.g. ${dynamicLabel}`}
                    disabled={fetching}
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                {sourceOptions.length > 0 ? (
                  <CustomSelect
                    options={ensureOption(sourceOptions, fields.source)}
                    value={fields.source}
                    onChange={value => handleChange('source', value)}
                    placeholder="Select Source"
                    disabled={fetching}
                  />
                ) : (
                  <input
                    className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                    value={fields.source}
                    onChange={e => handleChange('source', e.target.value)}
                    placeholder="e.g. Source"
                    disabled={fetching}
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                {statusOptions.length > 0 ? (
                  <CustomSelect
                    options={ensureOption(statusOptions, fields.status)}
                    value={fields.status}
                    onChange={value => handleChange('status', value)}
                    placeholder="Select Status"
                    disabled={fetching}
                  />
                ) : (
                  <input
                    className="w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 focus:outline-none focus:border-gray-400"
                    value={fields.status}
                    onChange={e => handleChange('status', e.target.value)}
                    placeholder="e.g. Status"
                    disabled={fetching}
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  className="w-full h-20 px-3 py-2 border border-gray-300 rounded text-sm outline-none bg-white text-gray-700 resize-none focus:outline-none focus:border-gray-400"
                  value={fields.remarks}
                  onChange={e => handleChange('remarks', e.target.value)}
                  placeholder="Any additional notes..."
                  disabled={fetching}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-row items-center gap-3 justify-end">
            <button
              className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none hover:bg-gray-50 transition-colors"
              onClick={handleClose}
              type="button"
              disabled={loading || fetching}
            >
              Cancel
            </button>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold focus:outline-none hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              type="submit"
              disabled={loading || fetching}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 