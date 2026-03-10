'use client';

import { useState, useEffect } from 'react';
import { xFetch } from '@/utility/xFetch';
import { User } from '@/utility/TinyDB';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UniversityListModal({
  invitationId,
  isOpen,
  onClose,
  onRefresh,
}) {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);

  useEffect(() => {
    if (!isOpen || !invitationId) return;
    loadUniversities();
  }, [isOpen, invitationId]);

  const loadUniversities = async () => {
    setLoading(true);
    try {
      const data = await xFetch({
        path: `/services/invite/universityList?invitationId=${invitationId}&time=${Date.now()}`,
      });
      setUniversities(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load universities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(universities.map(u => u.uvs_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (uvs_id, checked) => {
    setSelectedIds(prev =>
      checked ? [...prev, uvs_id] : prev.filter(id => id !== uvs_id)
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} university record(s)?`)) return;

    try {
      await xFetch({
        path: `/services/invite/deleteUniversity`,
        method: 'GET',
        payload: { invitationId, universityIds: selectedIds },
      });
      toast.success('Deleted successfully');
      setSelectedIds([]);
      loadUniversities();
    } catch (err) {
      toast.error('Delete failed', 'error');
    }
  };

  const openAddNew = () => {
    setEditingUniversity({ invitation_id: invitationId });
    setShowEditForm(true);
  };

  const openEdit = (uni) => {
    setEditingUniversity(uni);
    setShowEditForm(true);
  };

  const handleSaveEdit = async (formData) => {
    const owner = User?._id ?? -1;
    try {
      await xFetch({
        path: '/services/invite/university',
        method: 'POST',
        payload: {
          ...formData,
          owner, // ← replace with real user id from context/auth
          time: Date.now(),
        },
      });
      toast.success('Saved successfully');
      setShowEditForm(false);
      setEditingUniversity(null);
      loadUniversities();
    } catch (err) {
      toast.error('Save failed', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[94vh] flex flex-col overflow-hidden border border-gray-200/70">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">University List</h2>
            <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-light leading-none p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
            ×
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 overflow-auto">
            {loading ? (
            <div className="text-center py-12 text-gray-500">Loading universities...</div>
            ) : universities.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
                <p className="text-base font-medium mb-4">No universities added yet</p>
                <button
                onClick={openAddNew}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                + Add University
                </button>
            </div>
            ) : (
            <>
                <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.length === 0}
                    className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${selectedIds.length === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    }
                    `}
                >
                    Delete Selected ({selectedIds.length})
                </button>

                <button
                    onClick={openAddNew}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    + Add University
                </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50/80">
                    <tr>
                        <th className="w-10 px-3 py-3 text-left">
                        <input
                            type="checkbox"
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">University</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Country</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Course</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">App. Mode</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Deadline</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Documents</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Submitted On</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Submitted</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Via</th>
                        <th className="px-3 py-3 text-left font-medium text-gray-700">Offer</th>
                        <th className="w-16 px-3 py-3 text-left font-medium text-gray-700">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                    {universities.map(uni => (
                        <tr
                        key={uni.uvs_id}
                        className="hover:bg-indigo-50/40 transition-colors duration-100"
                        >
                        <td className="px-3 py-3">
                            <input
                            type="checkbox"
                            checked={selectedIds.includes(uni.uvs_id)}
                            onChange={e => handleSelectOne(uni.uvs_id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{uni.university || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{uni.country || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{uni.course || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{uni.application_mode || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">
                            {uni.application_date?.split(' ')[0] || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{uni.document_status || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">
                            {uni.submission_date?.split(' ')[0] || '-'}
                        </td>
                        <td className="px-3 py-3 text-gray-600">{uni.submission_status || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{uni.submission_by || '-'}</td>
                        <td className="px-3 py-3 text-gray-600">{uni.offer_type || '-'}</td>
                        <td className="px-3 py-3">
                            <button
                            onClick={() => openEdit(uni)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline transition-colors"
                            >
                            Edit
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </>
            )}
        </div>

        {/* Nested Edit Modal */}
        {showEditForm && editingUniversity && (
            <UniversityEditForm
            university={editingUniversity}
            invitationId={invitationId}
            onSave={handleSaveEdit}
            onCancel={() => {
                setShowEditForm(false);
                setEditingUniversity(null);
            }}
            />
        )}
        </div>
    </div>
    );
}

// You can extract this into its own component or keep it here
function UniversityEditForm({
  university,
  invitationId,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    uvs_id: university?.uvs_id || '',
    invitation_id: university?.invitation_id || invitationId || '',
    university: university?.university || '',
    country: university?.country || '',
    course: university?.course || '',
    application_mode: university?.application_mode || '',
    application_date: university?.application_date || '',
    document_status: university?.document_status || '',
    submission_date: university?.submission_date || '',
    submission_status: university?.submission_status || '',
    submission_by: university?.submission_by || '',
    offer_type: university?.offer_type || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.university || !form.country || !form.course || !form.application_mode) {
      toast.error('You must provide data for required fields marked as *');
      return;
    }

    onSave(form);
  };

  const isEdit = !!form.uvs_id;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-gray-200/70">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white sticky top-0 z-10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit' : 'Add'} University
            </h3>
            <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-900 text-2xl font-light p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
            ×
            </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* University */}
            <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                University <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="university"
                value={form.university}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm hover:shadow"
                placeholder="e.g. University of Example"
            />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm hover:shadow"
                placeholder="e.g. IND, UK, AUS"
            />
            </div>

            {/* Course */}
            <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                Course <span className="text-red-500">*</span>
            </label>
            <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow shadow-sm hover:shadow"
                placeholder="e.g. MSc Computer Science"
            />
            </div>

            {/* Application Mode */}
            <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                Application Mode <span className="text-red-500">*</span>
            </label>
            <select
                name="application_mode"
                value={form.application_mode}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:shadow transition-shadow"
            >
                <option value="">Select mode</option>
                <option value="Direct">Direct</option>
                <option value="KC">KC</option>
                <option value="SIUK">SIUK</option>
            </select>
            </div>

            {/* Application Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                Application Deadline
                </label>
                <input
                type="date"
                name="application_date"
                value={form.application_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow transition-shadow"
                />
            </div>

            {/* Submission Date */}
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                Date of Submission
                </label>
                <input
                type="date"
                name="submission_date"
                value={form.submission_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow transition-shadow"
                />
            </div>
            </div>

            {/* Documents + Submitted + Via */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                Documents Checklist
                </label>
                <select
                name="document_status"
                value={form.document_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:shadow transition-shadow"
                >
                <option value="">Select status</option>
                <option value="Uploaded">Uploaded</option>
                <option value="Pending">Pending</option>
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                Submitted
                </label>
                <select
                name="submission_status"
                value={form.submission_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:shadow transition-shadow"
                >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                Submitted Via
                </label>
                <select
                name="submission_by"
                value={form.submission_by}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:shadow transition-shadow"
                >
                <option value="">Select</option>
                <option value="Aggregator">Aggregator</option>
                <option value="Direct">Direct</option>
                </select>
            </div>
            </div>

            {/* Offer Management */}
            <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
                Offer Management
            </label>
            <select
                name="offer_type"
                value={form.offer_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm hover:shadow transition-shadow"
            >
                <option value="">Select offer type</option>
                <option value="Conditional">Conditional</option>
                <option value="Unconditional">Unconditional</option>
                <option value="Rejected">Rejected</option>
            </select>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-200">
            <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium flex items-center gap-2"
            >
                {isEdit ? 'Update' : 'Save'} University
            </button>
            </div>
        </form>
        </div>
    </div>
);
}