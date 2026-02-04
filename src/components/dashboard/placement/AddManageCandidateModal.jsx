// components/dashboard/placement/AddManageCandidateModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Plus } from 'lucide-react';
import { xFetch } from '@/utility/xFetch';
import { toast } from 'react-toastify';

export default function AddManageCandidateModal({
  jobId,
  jobTagIds,
  corporateId,
  presentIds = '',
  isOpen,
  onClose,
  onSuccess,
}) {
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const presentIdsSet = new Set(presentIds.split(',').filter(Boolean));
  const filteredCandidates = candidates.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile?.includes(searchTerm)
  );

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  useEffect(() => {
    if (isOpen) {
      loadAvailableCandidates();
      setSelectedIds([]);
      setSearchTerm('');
      setCurrentPage(1);
    }
  }, [isOpen, jobTagIds, corporateId]);

  const loadAvailableCandidates = async () => {
    setLoading(true);
    try {
      const data = await xFetch({
        path: '/services/job/getPlacementReadyCandidatesBrancheWise',
        payload: {
          jobTags: jobTagIds,
          corporateId: String(corporateId),
        },
      });

      // The API returns array directly — no need for .rows or .data fallback
      const list = Array.isArray(data) ? data : [];
      setCandidates(list);
    } catch (err) {
      console.error('Failed to load candidates:', err);
      toast.error('Failed to load available candidates');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const selectable = paginatedCandidates.filter(
      (c) => !presentIdsSet.has(String(c.id))
    );

    if (selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable.map((c) => String(c.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const strId = String(id);
    if (presentIdsSet.has(strId)) return; // already added → can't select

    setSelectedIds((prev) =>
      prev.includes(strId)
        ? prev.filter((sid) => sid !== strId)
        : [...prev, strId]
    );
  };

  const handleAdd = async () => {
    if (selectedIds.length === 0) {
      toast.warn('Please select at least 1 candidate to add', {
        position: 'top-center',
        autoClose: 3000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await xFetch({
        path: '/services/job/addManageCandidates',
        method: 'POST',
        payload: {
          jobId: String(jobId),
          candidates: selectedIds,
        },
      });

      if (response === true) {
        toast.success(`Added ${selectedIds.length} candidate(s) successfully`);
        onSuccess(); // refresh parent table
        onClose();
      } else {
        toast.error(response?.message || 'Failed to add candidates');
      }
    } catch (err) {
      console.error('Add failed:', err);
      toast.error('Failed to add candidates');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-teal-600 text-white px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Candidates to Manage</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-white hover:bg-teal-700 p-1.5 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="border-b px-5 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, email, branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleAdd}
              disabled={submitting || selectedIds.length === 0 || loading}
              className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium shadow-sm transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add ({selectedIds.length})
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedCandidates.filter((c) => !presentIdsSet.has(String(c.id)))
                        .length > 0 &&
                      selectedIds.length ===
                        paginatedCandidates.filter((c) => !presentIdsSet.has(String(c.id))).length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Tags
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualification
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-3">
                      <Loader2 size={20} className="animate-spin text-teal-600" />
                      Loading available candidates...
                    </div>
                  </td>
                </tr>
              ) : paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    No candidates available to add
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((candidate) => {
                  const isDisabled = presentIdsSet.has(String(candidate.id));
                  const isSelected = selectedIds.includes(String(candidate.id));

                  return (
                    <tr
                      key={candidate.id}
                      className={`${
                        isDisabled
                          ? 'opacity-50 bg-gray-100 cursor-not-allowed'
                          : isSelected
                          ? 'bg-teal-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && toggleSelectOne(candidate.id)}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {candidate.branchName || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.jobTags?.join(', ') || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {candidate.name || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.email || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.mobile || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {candidate.qualification || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredCandidates.length > 0 && (
          <div className="bg-white border-t px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of{' '}
              {filteredCandidates.length}
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-1.5 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-1.5 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}