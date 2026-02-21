'use client';
import React, { useEffect, useState } from 'react';
import { xFetch } from '@/utility/xFetch';
import { Plus, Trash2, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

export default function StatusTemplateMapping() {
  const [mappings, setMappings] = useState([]); // list of mapping rows
  const [loading, setLoading] = useState(false);

  // dropdown data
  const [statuses, setStatuses] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [coursesForSelectedStatus, setCoursesForSelectedStatus] = useState([]);

  // modal form state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    statusId: '',
    statusName: '',
    courseId: '',
    courseName: '',
    emailTemplateId: ''
  });

  // UI & selection
  const [selectedIds, setSelectedIds] = useState([]); // selected mapping attributeId(s) for deletion
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // load initial data
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      await Promise.all([fetchMappings(), fetchStatuses(), fetchEmailTemplates()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMappings() {
    // attributeType must be 'Status::Course'
    try {
      const res = await xFetch({
        path: `/services/profile/getRuleManagersTemplates?attributeType=Status::Course`,
      });
      // Expect fields: attributeValue (Status::Course), attributeId, emailTempName
      const normalized = (res || []).map((r) => {
        // parse attributeValue into status/course
        const parts = (r.attributeValue || '').split('::');
        const status = parts[0] || '';
        const course = parts[1] || '';
        return {
          id: r.attributeId || r.attributeId || r.id || null,
          attributeValue: r.attributeValue,
          status,
          course,
          emailTempName: r.emailTempName || r.Email_Template || ''
        };
      });
      setMappings(normalized);
      setCurrentPage(1);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error fetching mappings', err);
      setMappings([]);
    }
  }

  async function fetchStatuses() {
    try {
      const res = await xFetch({ path: '/services/profile/getStatuses' });
      setStatuses(res || []);
    } catch (err) {
      console.error('Error fetching statuses', err);
      setStatuses([]);
    }
  }

  async function fetchEmailTemplates() {
    try {
      const res = await xFetch({ path: '/services/profile/getTemplates' });
      setEmailTemplates(res || []);
    } catch (err) {
      console.error('Error fetching email templates', err);
      setEmailTemplates([]);
    }
  }

  // when status changes in form, load available courses for that status (excluding courses already mapped for that status)
  async function handleStatusChange(statusId) {
    const status = statuses.find((s) => Number(s.id) === Number(statusId));
    const statusName = status ? status.status : '';
    setForm((p) => ({ ...p, statusId, statusName, courseId: '', courseName: '' }));
    if (!statusName) {
      setCoursesForSelectedStatus([]);
      return;
    }
    
    // call getFilteredCourse
    try {
      const res = await xFetch({
        path: `/services/profile/getFilteredCourse?selectedStatus=${encodeURIComponent(statusName)}`,
      });
      setCoursesForSelectedStatus(res || []);
    } catch (err) {
      console.error('Error fetching courses for status', err);
      setCoursesForSelectedStatus([]);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    // if course select updates name value
    if (name === 'courseId') {
      const c = coursesForSelectedStatus.find((x) => Number(x.id) === Number(value));
      setForm((p) => ({ ...p, courseId: value, courseName: c ? c.course : '' }));
    }
  }

  // Add mapping
  async function handleAddMapping() {
    // validation
    if (!form.statusName) return toast.error('Please select Status');
    if (!form.courseName) return toast.error('Please select Course');
    if (!form.emailTemplateId)
      return toast.error('Please select Email template');

    const attributeValue = `${form.statusName}::${form.courseName}`;

    try {
      setLoading(true);
      await xFetch({
        path: '/services/profile/addRuleManager',
        method: 'POST',
        payload: {
          attributeType: 'Status::Course',
          attributeValue,
          tid: form.emailTemplateId || '',
          sid: ''
        },
      });
      toast.success('Mapping added successfully');
      setShowModal(false);
      setForm({ statusId: '', statusName: '', courseId: '', courseName: '', emailTemplateId: '' });
      await fetchMappings();
    } catch (err) {
      console.error('Error adding mapping', err);
      toast.error('Failed to add mapping');
    } finally {
      setLoading(false);
    }
  }

  // delete single mapping by id (attributeId)
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this mapping?')) return;
    try {
      setLoading(true);
      await xFetch({
        path: '/services/profile/updateRuleManagers',
        method: 'POST',
        payload: {
          rid: id,
        },
      });
      toast.success('Mapping deleted successfully');
      await fetchMappings();
    } catch (err) {
      console.error('Error deleting mapping', err);
      toast.error('Failed to delete mapping');
    } finally {
      setLoading(false);
    }
  }

  // bulk delete
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return toast.error('No mappings selected');
    if (!window.confirm(`Delete ${selectedIds.length} mapping(s)?`)) return;
    try {
      setLoading(true);
      for (const id of selectedIds) {

        try {
          await xFetch({
            path: '/services/profile/updateRuleManagers',
            method: 'POST',
            payload: { rid: id },
          });
        } catch (err) {
          console.error('delete item failed', id, err);
        }
      }
      setSelectedIds([]);
      await fetchMappings();
      toast.success('Selected mappings deleted successfully');
    } finally {
      setLoading(false);
    }
  }

  // search + pagination
  const filtered = mappings.filter((m) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (m.status || '').toLowerCase().includes(s) ||
      (m.course || '').toLowerCase().includes(s) ||
      (m.emailTempName || '').toLowerCase().includes(s) 
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / recordsPerPage));
  const start = (currentPage - 1) * recordsPerPage;
  const currentRecords = filtered.slice(start, start + recordsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages]);

  // checkbox handlers
  function toggleSelectAllOnPage(checked) {
    if (checked) setSelectedIds(currentRecords.map((r) => r.id));
    else setSelectedIds([]);
  }

  function toggleSelectId(id) {
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl ">Status (Course Wise) - Template Mapping</h2>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search mapping..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1 border rounded bg-white"
          />

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded"
            title="Add New Status Template Mapping"
          >
            <Plus size={16} />
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded"
              title="Delete Selected"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className='text-left'>
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && currentRecords.every((r) => selectedIds.includes(r.id))}
                  onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                />
              </th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Email Template</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No records found</td>
              </tr>
            )}

            {currentRecords.map((row) => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelectId(row.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="p-2">{row.status}</td>
                <td className="p-2">{row.course}</td>
                <td className="p-2">{row.emailTempName || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3">
          <div className="text-sm text-gray-600">
            Showing {filtered.length === 0 ? 0 : start + 1} - {Math.min(start + recordsPerPage, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-sm">Page {currentPage} / {totalPages}</div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Mapping Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-[640px] max-w-full relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Status (Course Wise) Template Mapping</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Status select */}
              <div>
                <label className="block text-sm mb-1">Select Status <span className="text-red-500">*</span></label>
                <select
                  className="w-full border rounded p-2 bg-white text-black"
                  value={form.statusId}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="">Select Status</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.status}</option>
                  ))}
                </select>
              </div>

              {/* Course select */}
              <div>
                <label className="block text-sm mb-1">Select Course <span className="text-red-500">*</span></label>
                <select
                  className="w-full border rounded p-2 bg-white text-black"
                  name="courseId"
                  value={form.courseId}
                  onChange={handleFormChange}
                >
                  <option value="">Select Course</option>
                  {coursesForSelectedStatus.map((c) => (
                    <option key={c.id} value={c.id}>{c.course}</option>
                  ))}
                </select>
              </div>

              {/* Email template */}
              <div>
                <label className="block text-sm mb-1">Select Email Template</label>
                <select
                  className="w-full border rounded p-2 bg-white text-black"
                  name="emailTemplateId"
                  value={form.emailTemplateId}
                  onChange={handleFormChange}
                >
                  <option value="">Select Email Template</option>
                  {emailTemplates.map((t) => (
                    <option key={t.templateId || t.template_id} value={t.templateId || t.template_id}>
                      {t.templateName || t.template_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-3 py-2 rounded bg-gray-300 text-black" title='Cancel'>
                <X size={14} />
              </button>
              <button onClick={handleAddMapping} className="px-3 py-2 rounded bg-blue-600 text-white" title='Add Mapping'>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
