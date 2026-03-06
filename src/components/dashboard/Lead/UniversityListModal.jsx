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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-semibold">University List</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="text-center py-10">Loading universities...</div>
          ) : universities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No universities added yet</p>
              <button
                onClick={openAddNew}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Add University
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Selected ({selectedIds.length})
                </button>
                <button
                  onClick={openAddNew}
                  className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Add University
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" onChange={handleSelectAll} />
                      </th>
                      <th className="px-4 py-3 text-left">University</th>
                      <th className="px-4 py-3 text-left">Country</th>
                      <th className="px-4 py-3 text-left">Course</th>
                      <th className="px-4 py-3 text-left">Mode</th>
                      <th className="px-4 py-3 text-left">App. Date</th>
                      <th className="px-4 py-3 text-left">Docs</th>
                      <th className="px-4 py-3 text-left">Submitted</th>
                      <th className="px-4 py-3 text-left">Via</th>
                      <th className="px-4 py-3 text-left">Offer</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities.map(uni => (
                      <tr key={uni.uvs_id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(uni.uvs_id)}
                            onChange={e => handleSelectOne(uni.uvs_id, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-3">{uni.university}</td>
                        <td className="px-4 py-3">{uni.country}</td>
                        <td className="px-4 py-3">{uni.course}</td>
                        <td className="px-4 py-3">{uni.application_mode}</td>
                        <td className="px-4 py-3">{uni.application_date || '-'}</td>
                        <td className="px-4 py-3">{uni.document_status || '-'}</td>
                        <td className="px-4 py-3">{uni.submission_date || '-'}</td>
                        <td className="px-4 py-3">{uni.submission_status || '-'}</td>
                        <td className="px-4 py-3">{uni.submission_by || '-'}</td>
                        <td className="px-4 py-3">{uni.offer_type || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => openEdit(uni)}
                            className="text-blue-600 hover:underline"
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

        {/* Edit/Add Form Modal - nested or separate component */}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50 sticky top-0">
          <h3 className="text-lg font-bold">
            {isEdit ? 'Edit' : 'Add'} University Info
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-3 pr-4 font-medium text-right w-1/3">University<span className="text-red-500 ml-1">*</span></td>
                <td className="py-3">
                  <input
                    type="text"
                    name="university"
                    value={form.university}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Country<span className="text-red-500 ml-1">*</span></td>
                <td className="py-3">
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Course<span className="text-red-500 ml-1">*</span></td>
                <td className="py-3">
                  <input
                    type="text"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Application Mode<span className="text-red-500 ml-1">*</span></td>
                <td className="py-3">
                  <select
                    name="application_mode"
                    value={form.application_mode}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose application mode</option>
                    <option value="Direct">Direct</option>
                    <option value="KC">KC</option>
                    <option value="SIUK">SIUK</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Application Submission Date</td>
                <td className="py-3">
                  <input
                    type="date"
                    name="application_date"
                    value={form.application_date}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Required Documents Checklist</td>
                <td className="py-3">
                  <select
                    name="document_status"
                    value={form.document_status}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose document status</option>
                    <option value="Uploaded">Uploaded</option>
                    <option value="Pending">Pending</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Date of Submission</td>
                <td className="py-3">
                  <input
                    type="date"
                    name="submission_date"
                    value={form.submission_date}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Submitted</td>
                <td className="py-3">
                  <select
                    name="submission_status"
                    value={form.submission_status}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose submission status</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Submitted Via</td>
                <td className="py-3">
                  <select
                    name="submission_by"
                    value={form.submission_by}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose submitter</option>
                    <option value="Aggregator">Aggregator</option>
                    <option value="Direct">Direct</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-right">Offer Management</td>
                <td className="py-3">
                  <select
                    name="offer_type"
                    value={form.offer_type}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose offer type</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Unconditional">Unconditional</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}