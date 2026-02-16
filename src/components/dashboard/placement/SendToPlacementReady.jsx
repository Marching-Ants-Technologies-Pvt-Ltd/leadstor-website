// components/jobs/SendToPlacementReady.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, X, Loader2, Eye } from 'lucide-react';
import { xFetch } from '@/utility/xFetch';

export default function SendToPlacementReady({
  jobId,
  jobTagIds,
  corporateId,
  onClose,
  onSuccess,
}) {
  const [interviewDate, setInterviewDate] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Pagination (client-side)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      candidate.branchName?.toLowerCase().includes(searchTermLower) ||
      candidate.jobTags?.some(tag => tag.toLowerCase().includes(searchTermLower)) ||
      candidate.name?.toLowerCase().includes(searchTermLower) ||
      candidate.email?.toLowerCase().includes(searchTermLower) ||
      candidate.mobile?.toLowerCase().includes(searchTermLower) ||
      candidate.qualification?.toLowerCase().includes(searchTermLower)
    );
  });
  
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    loadCandidates();
  }, [jobId, jobTagIds, corporateId]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await xFetch({
        path: '/services/job/getPlacementReadyCandidatesBrancheWise',
        payload: {
          jobTags: jobTagIds,
          corporateId: String(corporateId),
        },
      });

      setCandidates(Array.isArray(data) ? data : data?.rows || data?.data || []);
    } catch (err) {
      console.error('Failed to load candidates', err);
    } finally {
      setLoading(false);
    }
  };

  // ── PREVIEW FUNCTION ──────────────────────────────────────────────────────
  const handlePreview = async () => {
    setPreviewLoading(true);
    setShowPreview(true);

    try {
      const previewData = await xFetch({
        path: '/services/job/sendJobEmailPreview',
        payload: {
          jobId: jobId,
          interviewDate: interviewDate || null, // Pass null if no date selected
        },
      });

      setPreviewHtml(
        typeof previewData === 'string'
          ? previewData
          : previewData?.html || previewData?.content || '<p>No preview content available</p>'
      );
    } catch (err) {
      console.error('Preview failed', err);
      setPreviewHtml('<p class="text-red-600">Failed to load preview. Please try again.</p>');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    if (!confirm(`Send job details to ${selectedIds.length} candidate(s)?`)) {
      return;
    }

    setSending(true);

    try {
      await xFetch({
        path: '/services/job/addJobNotification',
        method: 'POST',
        payload: {
          jobId,
          interviewDate: interviewDate || null, // Make interview date optional
          candidates: selectedIds.join(','),
          corporateId: String(corporateId),
        },
      });

      alert('Notifications sent successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Send failed', err);
      alert('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentCandidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-5 py-3.5 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Send Details to Placement Ready Candidates
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-indigo-700 p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="border-b px-5 py-3 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <Calendar size={18} className="text-gray-600" />
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search candidates by name, email, branch, qualification..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              </div>
            </div>

            <div className="flex gap-3 sm:ml-auto">
              <button
                onClick={handlePreview}
                disabled={sending || loading || previewLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
              >
                <Eye size={16} />
                Preview
              </button>

              <button
                onClick={handleSend}
                disabled={sending || selectedIds.length === 0 || loading}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium shadow-sm"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>

          {/* Table & Pagination – same as before */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={currentCandidates.length > 0 && selectedIds.length === currentCandidates.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                      Mobile
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Qualification
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-3">
                          <Loader2 size={20} className="animate-spin text-indigo-600" />
                          Loading candidates...
                        </div>
                      </td>
                    </tr>
                  ) : currentCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                        No matching records found
                      </td>
                    </tr>
                  ) : (
                    currentCandidates.map((candidate) => {
                      const isSelected = selectedIds.includes(candidate.id);
                      return (
                        <tr
                          key={candidate.id}
                          className={isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(candidate.id)}
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {candidate.branchName || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {candidate.jobTags?.join(', ') || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
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
            {!loading && candidates.length > 0 && (
              <div className="bg-white border-t border-gray-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
                <div>
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredCandidates.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCandidates.length}</span> candidates
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="font-medium">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {sending && (
            <div className="p-3 bg-red-50 text-red-700 text-center font-medium border-t border-red-100">
              Please wait while sending notifications...
            </div>
          )}
        </div>
      </div>

      {/* ── PREVIEW MODAL ─────────────────────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Preview Header */}
            <div className="bg-gray-800 text-white px-6 py-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-300 hover:text-white p-1.5 rounded-full hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {previewLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 size={32} className="animate-spin text-indigo-600" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}