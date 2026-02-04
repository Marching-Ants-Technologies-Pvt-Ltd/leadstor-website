'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import JoditEditor from 'jodit-react';

export default function JobPostingFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'add',
  initialData = null,
  corporateId,
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyName: '',
    jobTags: [],
    minExp: '',
    maxExp: '',
    locations: '',
    positionType: '',
    minSal: '',
    maxSal: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    owner: '',
    status: 'Open',
    replyToEmailIds: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [jobTagsOptions, setJobTagsOptions] = useState([]);
  const [owners, setOwners] = useState([]);
  const editor = useRef(null); // Ref for JoditEditor
  const statuses = ['In Progress', 'Placed', 'Closed'];

    // Load initial data (edit mode)
    useEffect(() => {
    if (mode === 'edit' && initialData) {
        // Use jobTagIds for pre-selection (array of string IDs)
        let preSelectedTags = [];

        if (Array.isArray(initialData.jobTagIds)) {
        preSelectedTags = initialData.jobTagIds
            .map(id => String(id).trim())     // force string: "2", "5", etc.
            .filter(Boolean);
        } else if (typeof initialData.jobTagIds === 'string' && initialData.jobTagIds.trim()) {
        preSelectedTags = initialData.jobTagIds
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
        }

        // Debug logs — check these in console when editing
        console.log('[EDIT] Raw jobTagIds from backend:', initialData.jobTagIds);
        console.log('[EDIT] Normalized tags for <select>:', preSelectedTags);
        console.log('[EDIT] Available option values:', jobTagsOptions.map(t => t.value));

        setFormData(prev => ({
        ...prev,
        title: initialData.title || '',
        description: initialData.description || '',
        companyName: initialData.companyName || '',
        jobTags: preSelectedTags,           // ← now uses IDs like ["2"]
        minExp: initialData.minExp || '',
        maxExp: initialData.maxExp || '',
        locations: Array.isArray(initialData.locations)
            ? initialData.locations.join(', ')
            : initialData.locations || '',
        positionType: initialData.positionType || '',
        minSal: initialData.minSal || '',
        maxSal: initialData.maxSal || '',
        contact_name: initialData.contact_name || '',
        contact_email: initialData.contact_email || '',
        contact_phone: initialData.contact_phone || '',
        owner: String(initialData.owner || ''),
        status: initialData.status || 'Open',
        replyToEmailIds: initialData.replyToEmailIds || '',
        }));
    }
    }, [mode, initialData, jobTagsOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const selected = [...e.target.selectedOptions].map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, jobTags: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation: Job Description is mandatory
    if (!formData.description?.trim()) {
      toast.error('Job Description is required');
      setLoading(false);
      return;
    }

    try {
      const mainFields = {
        corporateId: String(corporateId),
        ...(mode === 'edit' && initialData?.id && { jobId: String(initialData.id) }),
        jobTitle: formData.title?.trim() || '',
        companyName: formData.companyName?.trim() || '',
        minExp: formData.minExp ? String(Number(formData.minExp)) : '',
        maxExp: formData.maxExp ? String(Number(formData.maxExp)) : '',
        jobLocation: formData.locations?.trim() || '',
        positionType: formData.positionType?.trim() || '',
        minSal: formData.minSal ? String(Number(formData.minSal)) : '',
        maxSal: formData.maxSal ? String(Number(formData.maxSal)) : '',
        contact_name: formData.contact_name?.trim() || '',
        contact_email: formData.contact_email?.trim() || '',
        contact_phone: formData.contact_phone?.trim() || '',
        status: formData.status?.trim() || 'Open',
        replyToEmailIds: formData.replyToEmailIds?.trim() || '',
        owner: formData.owner || '',
      };

      const params = new URLSearchParams();

      Object.entries(mainFields).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });

      // Add jobTags[] INSIDE formData
      if (formData.jobTags?.length > 0) {
        formData.jobTags.forEach((tag) => {
          params.append('jobTags[]', String(tag));
        });
      }

      const formDataString = params.toString();

      // Base64-encode description
      const encodedDesc = btoa(formData.description?.trim() || '');

      // Build FormData
      const payload = new FormData();
      payload.append('formData', formDataString);
      payload.append('desc', encodedDesc);

      const endpoint = mode === 'add' ? '/services/job/addJob' : '/services/job/updateJob';

      await xFetch({
        path: endpoint,
        method: 'POST',
        payload,
        isFormData: true,
      });

      toast.success(mode === 'add' ? 'Job posted successfully' : 'Job updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Job save error:', err);
      toast.error('Failed to save job posting');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags & owners (unchanged)
  useEffect(() => {
    if (!isOpen || !corporateId) return;

    const fetchData = async () => {
      setFetching(true);
      try {
        const tagsRes = await xFetch({
          path: '/services/job/getJobTags',
          payload: { corporateId },
        });
        const tags = Array.isArray(tagsRes)
          ? tagsRes
          : tagsRes?.rows || tagsRes?.data || [];
        setJobTagsOptions(tags);

        await fetchOwners();
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
        toast.error('Could not load job tags or owners');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [isOpen, corporateId]);

  const fetchOwners = async () => {
    try {
      const data = await xFetch({
        path: '/services/profile/getUsers',
        payload: { basic: 1 },
      });

      if (data && Object.keys(data).length > 0) {
        const ownerList = Object.entries(data).map(([key, value]) => ({
          id: key,
          name: value,
        }));
        setOwners(ownerList);
      } else {
        setOwners([]);
      }
    } catch (error) {
      console.error('An error occurred while fetching owners', error);
      toast.error('Failed to load owners');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div
        className={`
          w-full max-w-[96vw] sm:max-w-[92vw] md:max-w-4xl lg:max-w-5xl
          max-h-[96vh] sm:max-h-[92vh]
          bg-white rounded-xl shadow-2xl overflow-hidden
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="px-6 py-2 flex justify-between items-center border-b backdrop-blur lead-header">
            <h2 className="text-[15px] font-semibold tracking-wide">
                {mode === 'add' ? 'Add New Job' : 'Update Job'}
            </h2>
            <button type="button" onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 hover:text-black transition"
            >
                ✕
            </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-7 py-5 sm:py-6">
          {fetching ? (
            <div className="flex items-center justify-center h-40 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              Loading job tags and owners...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
              {/* JOB DETAILS */}
              <div>
                <h3 className="text-base sm:text-lg font-bold uppercase text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  JOB DETAILS
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                      placeholder="Example: Senior Software Engineer - Core Java"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Experience (yrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="minExp"
                      value={formData.minExp}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                      placeholder="3.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Experience (yrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="maxExp"
                      value={formData.maxExp}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                      placeholder="7.5"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Location(s) (comma separated)</label>
                    <input
                      type="text"
                      name="locations"
                      value={formData.locations}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                      placeholder="Mumbai, Pune, Bangalore, Delhi"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Type</label>
                    <select
                      name="positionType"
                      value={formData.positionType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white text-sm sm:text-base"
                    >
                        <option value="">Select Position Type</option>
                        <option value="FT">Full Time</option>
                        <option value="PT">Part Time</option>
                        <option value="C">Contract</option>
                        <option value="C2H">Contract to Hire</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Salary (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="minSal"
                        value={formData.minSal}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Salary (LPA)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="maxSal"
                        value={formData.maxSal}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                        placeholder="12"
                      />
                    </div>
                  </div>

                  {/* JOB TAGS - FIXED & VISIBLE */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Job Tags (hold Ctrl/Cmd to select multiple)
                    </label>
                    <select
                      multiple
                      name="jobTags"
                      value={formData.jobTags}
                      onChange={handleTagsChange}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 text-sm sm:text-base bg-white"
                      disabled={fetching || jobTagsOptions.length === 0}
                    >
                      {jobTagsOptions.length === 0 ? (
                        <option disabled>No tags available</option>
                      ) : (
                        jobTagsOptions.map((tag, idx) => {
                          const value = tag.value || tag.id || tag;
                          const label = tag.text || tag.name || tag;
                          return (
                            <option key={idx} value={value}>
                              {label}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* JOB STATUS & COMMUNICATION */}
              <div>
                <h3 className="text-base sm:text-lg font-bold uppercase text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-200">
                  JOB STATUS & COMMUNICATION
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Owner</label>
                    <select
                      name="owner"
                      value={formData.owner}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
                      disabled={fetching || owners.length === 0}
                    >
                      <option value="">-- Select Owner --</option>
                      {owners.length === 0 ? (
                        <option disabled>No owners loaded</option>
                      ) : (
                        owners.map((owner, idx) => {
                          const value = owner.id || owner.employeeId || owner._id || owner.name;
                          const label = owner.name || owner.fullName || owner.email || 'Unnamed User';
                          return (
                            <option key={idx} value={value}>
                              {label}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person Name</label>
                    <input
                      type="text"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contact Person Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                      placeholder="+91XXXXXXXXXX"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reply-to Email(s) (comma separated)
                    </label>
                    <input
                      type="text"
                      name="replyToEmailIds"
                      value={formData.replyToEmailIds}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm sm:text-base"
                      placeholder="hr@company.com, manager@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <JoditEditor
                  ref={editor}
                  value={formData.description}
                  config={{
                    readonly: false,
                    height: 300,
                    toolbar: true,
                    buttons: 'bold,italic,underline,|,ul,ol,|,link,|,source',
                    placeholder: 'Enter detailed job description here...',
                  }}
                  onBlur={(newContent) => {
                    setFormData((prev) => ({ ...prev, description: newContent }));
                  }}
                />
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 left-0 right-0 bg-white pt-5 pb-2 border-t border-gray-200 -mx-4 sm:-mx-7 px-4 sm:px-7 mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-7 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium order-2 sm:order-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`
                      px-9 py-2.5 rounded-lg text-white font-medium transition
                      ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                      order-3
                    `}
                  >
                    {loading ? 'Saving...' : mode === 'add' ? 'Post Job' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}