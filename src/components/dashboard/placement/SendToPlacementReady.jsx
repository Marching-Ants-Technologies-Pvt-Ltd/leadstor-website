// components/jobs/SendToPlacementReady.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, X, Loader2, Eye, Send, Search, ChevronLeft, ChevronRight, Mail, Users, CheckCircle } from 'lucide-react';
import { xFetch } from '@/utility/xFetch';
import { toast } from 'react-toastify';

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
  const [itemsPerPage, setItemsPerPage] = useState(1000);

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

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const currentCandidateIds = currentCandidates.map((c) => c.id);
  const isCurrentPageFullySelected =
    currentCandidateIds.length > 0 &&
    currentCandidateIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    loadCandidates();
  }, [jobId, jobTagIds, corporateId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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

  const handlePreview = async () => {
    setPreviewLoading(true);
    setShowPreview(true);

    try {
      const previewData = await xFetch({
        path: '/services/job/sendJobEmailPreview',
        payload: {
          jobId: jobId,
          interviewDate: interviewDate || null,
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
      toast.warn('Please select at least one candidate');
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
          interviewDate: interviewDate || null,
          candidates: selectedIds.join(','),
          corporateId: String(corporateId),
        },
      });

      toast.success(`Shared to ${selectedIds.length} candidate(s)!`, {
        className: 'bg-green-600 text-white',
        iconClassName: 'text-white',
      });

    } catch (err) {
      console.error('Send failed', err);
      toast.error('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const toggleSelectAll = () => {
    if (isCurrentPageFullySelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentCandidateIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentCandidateIds])));
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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden border border-gray-200">
          {/* Header - Modern Lead Page Style */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Send to Placement Ready Candidates</h2>
                <p className="text-xs text-emerald-100 flex items-center gap-1">
                  <Users size={12} />
                  {candidates.length} candidates available
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-all hover:rotate-90"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Toolbar - Lead Page Modern Style */}
          <div className="border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex flex-wrap items-center gap-3">
            {/* Interview Date - Pill Style */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
              <Calendar size={16} className="text-emerald-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Interview:</span>
              <input
                type="datetime-local"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                className="text-sm border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
              />
            </div>

            {/* Search - Modern Input */}
            <div className="relative flex-1 min-w-[300px] max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm hover:shadow-md transition-all"
              />
            </div>

            {/* Action Buttons - Lead Page Style */}
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                onClick={handlePreview}
                disabled={sending || loading || previewLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <Eye size={16} />
                Preview
              </button>

              <button
                onClick={handleSend}
                disabled={sending || selectedIds.length === 0 || loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending{selectedIds.length ? ` (${selectedIds.length})` : ''}...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Now{selectedIds.length ? ` (${selectedIds.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table - Modern Design */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-3.5 w-12">
                      <input
                        type="checkbox"
                        checked={isCurrentPageFullySelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Job Tags
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Candidate Name
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email ID
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Qualification
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 size={32} className="animate-spin text-emerald-600" />
                          <span className="text-gray-600 font-semibold">Loading candidates...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Search size={40} className="text-gray-400" />
                          </div>
                          <span className="font-semibold text-lg">No candidates found</span>
                          <span className="text-sm">Try adjusting your search criteria</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentCandidates.map((candidate) => {
                      const isSelected = selectedIds.includes(candidate.id);
                      return (
                        <tr
                          key={candidate.id}
                          className={`transition-all ${
                            isSelected 
                              ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-l-4 border-emerald-500' 
                              : 'hover:bg-gray-50 border-l-4 border-transparent'
                          }`}
                        >
                          <td className="px-4 py-4 align-top">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(candidate.id)}
                              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                            />
                          </td>
                          <td className="px-4 py-4 text-sm align-top">
                            <span className="font-semibold text-gray-900">{candidate.branchName || '-'}</span>
                          </td>
                          <td className="px-4 py-4 align-top">
                            {candidate.jobTags?.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {candidate.jobTags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="font-bold text-gray-900 text-base">{candidate.name || '-'}</div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 align-top">
                            <a href={`mailto:${candidate.email}`} className="hover:text-emerald-600 hover:underline transition-colors">
                              {candidate.email || '-'}
                            </a>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 align-top">
                            <a href={`tel:${candidate.mobile}`} className="hover:text-emerald-600 hover:underline transition-colors">
                              {candidate.mobile || '-'}
                            </a>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 align-top">
                            <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                              {candidate.qualification || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Lead Page Modern Style */}
            {!loading && candidates.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-emerald-600" />
                    <span className="text-gray-600">
                      Showing <span className="font-bold text-emerald-600">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-bold text-emerald-600">
                        {Math.min(indexOfLastItem, filteredCandidates.length)}
                      </span>{' '}
                      of <span className="font-bold text-emerald-600">{filteredCandidates.length}</span> candidates
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                    </select>
                    <span className="text-gray-600 font-medium">per page</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-full hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-gray-700 transition-all hover:shadow-md"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                              pageNum === currentPage
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-110'
                                : 'hover:bg-emerald-50 text-gray-700 hover:scale-105'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-full hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold text-gray-700 transition-all hover:shadow-md"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {sending && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-t border-emerald-200">
              <div className="flex items-center justify-center gap-3">
                <Loader2 size={20} className="animate-spin text-emerald-600" />
                <span className="text-emerald-800 font-semibold">Sending notifications to candidates...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Eye size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold">Email Preview</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-300 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {previewLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 size={32} className="animate-spin text-emerald-600" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
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
