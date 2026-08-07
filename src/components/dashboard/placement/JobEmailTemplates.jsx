'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Trash2, X, Edit3, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { Corporate } from '@/utility/TinyDB';
import { xFetch } from '@/utility/xFetch';
import 'react-toastify/ReactToastify.min.css';

const CANDIDATE_STATUSES = [
  'Placement ready', 'Notified', 'Interested', 'Resume shared', 'Interview scheduled',
  'Offer letter issued', 'Placed', 'Better Luck Next Time', 'On hold', 'Abandoned',
  'Not Connected', 'Resume not shared, Profile Issue', 'Resume not shared, CV Issue',
  'No show', 'Offer Declined', 'Interview Not Attended'
];

const AVAILABLE_VARIABLES = [
  '{{ CANDIDATE_NAME }}', '{{ JOB_TITLE }}', '{{ OWNER_EMAIL }}', '{{ OWNER_MOBILE }}',
  '{{ OWNER }}', '{{ COMPANY_NAME }}', '{{ CORPORATE_NAME }}', '{{ REGISTERED_MOBILE }}',
  '{{ REGISTERED_EMAIL }}', '{{ USER }}', '{{ PLACEMENT_OFFICER }}', '{{ INTERVIEW_DATE }}'
];

export default function JobEmailTemplates() {
  const corporateId = Corporate?._id;
  const INITIAL_FORM = { id: 0, candidateStatus: '', corporateId: corporateId, subject: '', template: '', isActive: 1 };
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await xFetch({
        path: '/services/job/getAllEmailTemplates',
      });
      setData(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching email templates', error);
      setData([]);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return data.filter((item) =>
      item.candidateStatus.toLowerCase().includes(term) ||
      String(item.corporateId).includes(term)
    );
  }, [data, search]);

  useEffect(() => {
    setPage(1);
  }, [search, data]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const resetFormState = () => {
    setForm(INITIAL_FORM);
    setEditing(false);
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateTemplateVariables = (templateHtml) => {
    const matches = templateHtml.match(/{{\s*[A-Z_]+\s*}}/g) || [];
    const invalid = matches
      .map((m) => '{{ ' + m.replace(/[{}]/g, '').trim() + ' }}')
      .filter((m) => !AVAILABLE_VARIABLES.includes(m));
    return [...new Set(invalid)];
  };

  const handleSave = async () => {
    const nextErrors = {};
    if (!form.candidateStatus) nextErrors.candidateStatus = 'Status is required';
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required';
    if (!form.template.trim()) nextErrors.template = 'Template content is required';

    const invalidVars = validateTemplateVariables(form.template);
    if (invalidVars.length > 0) {
      nextErrors.template = `Unrecognized variable(s): ${invalidVars.join(', ')}. This variable is not accepted.`;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      await xFetch({
        path: '/services/job/saveEmailTemplate',
        method: 'POST',
        payload: {
          id: editing ? form.id : 0,
          candidateStatus: form.candidateStatus,
          subject: form.subject.trim(),
          template: form.template,
          isActive: form.isActive,
        },
      });

      toast.success(editing ? 'Template updated successfully' : 'Template added successfully');
      setShowModal(false);
      resetFormState();
      fetchData();
    } catch (error) {
      console.error('Error saving email template', error);
      toast.error(error?.message || 'Failed to save email template');
      setLoading(false);
    }
  };

  const handleDelete = async (id, status = '') => {
    const confirmMessage = status
      ? `Are you sure you want to delete the template for "${status}"?`
      : 'Are you sure you want to delete this template?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await xFetch({
        path: '/services/job/deleteEmailTemplate',
        method: 'POST',
        payload: { id },
      });
      toast.success('Template deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting email template', error);
      toast.error('Failed to delete email template');
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl">Job Email Templates</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search status or corporate ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8 pr-3 py-2 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => {
              resetFormState();
              setShowModal(true);
            }}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
            title="Add Template"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-auto max-h-[calc(100vh-220px)]">
          {loading ? (
            <p className="text-center py-4 text-gray-500">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr className="text-left">
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-2">{row.candidateStatus}</td>
                    <td className="p-2">{row.subject}</td>
                    <td className="p-2 text-center space-x-2">
                      <button
                        onClick={() => {
                          setForm({
                            id: row.id,
                            candidateStatus: row.candidateStatus,
                            corporateId: row.corporateId,
                            subject: row.subject,
                            template: row.template,
                            isActive: row.isActive,
                          });
                          setEditing(true);
                          setErrors({});
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id, row.candidateStatus)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end items-center mt-3 gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className={`px-3 py-1 rounded ${
              page === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages || 1}
          </span>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((prev) => prev + 1)}
            className={`px-3 py-1 rounded ${
              page === totalPages || totalPages === 0
                ? 'bg-gray-200 text-gray-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[600px] max-h-[90vh] overflow-y-auto shadow-lg">
            <h3 className="text-lg mb-4">{editing ? 'Update' : 'Add'} Email Template</h3>

            <label className="block text-sm text-gray-600 mb-1">Candidate Status</label>
            <select
              name="candidateStatus"
              value={form.candidateStatus}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mb-1 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select status</option>
              {CANDIDATE_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.candidateStatus && <p className="text-red-500 text-sm mb-2">{errors.candidateStatus}</p>}

            <label className="block text-sm text-gray-600 mb-1 mt-2">Subject</label>
            <input
              name="subject"
              placeholder="Email subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mb-1 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && <p className="text-red-500 text-sm mb-2">{errors.subject}</p>}

            <label className="block text-sm text-gray-600 mb-1 mt-2">Template HTML</label>
            <textarea
              name="template"
              placeholder="<div>...</div>"
              value={form.template}
              onChange={handleChange}
              rows={8}
              className="w-full border border-gray-300 rounded p-2 mb-1 bg-white text-gray-900 placeholder-gray-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.template && <p className="text-red-500 text-sm mb-2">{errors.template}</p>}

            <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2 text-xs text-gray-600">
              <span className="font-semibold">Available variables:</span> {AVAILABLE_VARIABLES.join(', ')}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetFormState();
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                title="Cancel"
              >
                <X size={15} />
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                title="Save"
              >
                <Check size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}