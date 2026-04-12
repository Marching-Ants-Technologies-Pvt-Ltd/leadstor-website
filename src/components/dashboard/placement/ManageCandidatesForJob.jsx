'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2, Send, ArrowLeft, RefreshCw, Download, Search, ExternalLink, UserCheck, Clock, FileText, Loader2, Edit2 } from 'lucide-react';
import { xFetch } from '@/utility/xFetch';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import AddManageCandidateModal from './AddManageCandidateModal';

export default function ManageCandidatesForJob({
  jobId,
  jobTitle,
  jobTagIds,
  companyName,
  corporateId,
  onBack,
}) {
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sharingToHr, setSharingToHr] = useState(false);

  // Timeline modal state
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);

  // Edit status modal state
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [editStatus, setEditStatus] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editInterviewDate, setEditInterviewDate] = useState('');
  const [highlightedNoResume, setHighlightedNoResume] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobile?.includes(searchTerm)
  );

  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  useEffect(() => {
    loadCandidates();
  }, [jobId]);

  const loadCandidates = async () => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const data = await xFetch({
        path: '/services/job/getManageCandidates',
        payload: { jobId: String(jobId) },
      });
      setCandidates(Array.isArray(data) ? data : data?.rows || []);
    } catch (err) {
      toast.error('Failed to load candidates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async () => {
    setShowAddModal(true);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return toast.warn('No candidates selected');

    if (!confirm(`Delete ${selectedIds.length} candidate(s)?`)) return;

    try {
      await xFetch({
        path: '/services/job/removeCandidates',
        method: 'POST',
        payload: { ids: selectedIds },
      });
      toast.success('Candidates removed');
      setSelectedIds([]);
      loadCandidates();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleShareToHR = async () => {
    if (selectedIds.length === 0) {
      toast.warn('No candidates selected');
      return;
    }

    setSharingToHr(true);
    setHighlightedNoResume([]); // reset previous highlights

    try {
      // Step 1: Get real candidate IDs (management IDs → candidate IDs)
      const idsFormData = new FormData();
      selectedIds.forEach(id => {
        idsFormData.append('ids[]', id); // or 'ids' if backend expects comma-separated
      });

      const candidateIdsRes = await xFetch({
        path: '/services/job/getCandidateIdsByManagemnet',
        method: 'POST',
        payload: idsFormData,
        isFormData: true,
      });

      // Extract real candidate IDs (adjust key if needed after console.log)
      let realCandidateIds = Array.isArray(candidateIdsRes)
        ? candidateIdsRes
        : candidateIdsRes?.candidate_ids ||
          candidateIdsRes?.data ||
          candidateIdsRes?.ids ||
          [];

      if (!realCandidateIds?.length) {
        toast.error('No valid candidate IDs returned');
        return;
      }

      // Step 2: Validate (check resumes)
      const validationFormData = new FormData();
      realCandidateIds.forEach(id => {
        validationFormData.append('candidate_ids[]', id);
      });
      validationFormData.append('job_id', jobId);

      const validationRes = await xFetch({
        path: '/services/job/validationResumeShare',
        method: 'POST',
        payload: validationFormData,
        isFormData: true,
      });

      // If validation returns a message → warn & highlight rows → stop
      if (validationRes?.message && validationRes.message.trim() !== '') {
        toast.warn(validationRes.message);

        const noResumeIds = validationRes.noResumeId || [];
        if (noResumeIds.length > 0) {
          setHighlightedNoResume(noResumeIds.map(String)); // highlight these rows
        }

        return; // stop here like old code "return false"
      }

      // Step 3: Send real candidate IDs to HR
      const sendFormData = new FormData();
      sendFormData.append('jobId', jobId);

      realCandidateIds.forEach(id => {
        sendFormData.append('candidates[]', id);
      });

      const finalRes = await xFetch({
        path: '/services/job/sendCandidateResumeToHr',
        method: 'POST',
        payload: sendFormData,
        isFormData: true,
      });

      if (finalRes === 'success' || finalRes?.success) {
        toast.success('An email has been sent to HR');
        setSelectedIds([]); // clear checkboxes
        setHighlightedNoResume([]); // clear highlights
        setTimeout(() => {
          loadCandidates(); // refresh list
        }, 400);
      } else {
        toast.error(finalRes || 'Failed to share resumes');
      }
    } catch (err) {
      console.error('Share resumes error:', err);
      toast.error('Share failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSharingToHr(false);
    }
  };

  const handleShareSingleToHR = async (candidateId) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate?.resume) {
      toast.warn('Candidate does not have a resume');
      return;
    }

    try {
      const response = await xFetch({
        path: '/services/job/sendCandidateResumeToHr',
        method: 'POST',
        payload: { jobId, candidates: [candidateId] },
      });

      if (response === 'success' || response?.success) {
        toast.success('Resume shared with HR');
        loadCandidates();
      } else {
        toast.error(response?.message || 'Failed to share resume');
      }
    } catch (err) {
      console.error('Error sharing resume:', err);
      toast.error('Share failed: ' + (err.message || 'Unknown error'));
    }
  };

  const showInstituteCandidateTimeLine = async (index) => {
    const cData = paginatedCandidates[index];
    if (!cData?.id) return;

    try {
      const data = await xFetch({
        path: '/services/job/getCandidateTimeLine',
        payload: { id: cData.id },
      });
      setTimelineData(data);
      setSelectedCandidateIndex(index);
      setShowTimelineModal(true);
    } catch (err) {
      toast.error('Failed to load timeline');
    }
  };

  const openEditStatusModal = async (index) => {
    const cData = paginatedCandidates[index];
    setEditingCandidate({ ...cData, index });
    setEditStatus(cData.candidateStatus || 'Pending');
    setEditRemarks(cData.remarks || '');
    setEditInterviewDate('');

    // Fetch status list
    try {
      const data = await xFetch({
        path: '/services/job/getCandidateStatuses',
        payload: { corporateId: String(corporateId) },
      });
      setStatusList(Array.isArray(data) ? data : []);
      setShowEditStatusModal(true);
    } catch (err) {
      console.error('Failed to load statuses:', err);
      toast.error('Failed to load status options');
    }
  };

  const refreshTimelineForCurrentCandidate = async () => {
    if (selectedCandidateIndex === null) return;
    const cData = paginatedCandidates[selectedCandidateIndex];
    if (!cData?.id) return;

    try {
      const data = await xFetch({
        path: '/services/job/getCandidateTimeLine',
        payload: { id: cData.id },
      });
      setTimelineData(data);
    } catch {}
  };

  const afterStatusUpdate = () => {
    loadCandidates();
    if (showTimelineModal) {
      refreshTimelineForCurrentCandidate();
    }
    setShowEditStatusModal(false);
  };

  const handleUpdateStatus = async () => {
    if (!editingCandidate?.id) return;

    try {
      const payload = {
        id: String(editingCandidate.id),
        status: editStatus,
        remarks: editRemarks.trim(),
        interview_date: editInterviewDate || null,
      };

      const res = await xFetch({
        path: '/services/job/updateCandidateStatus',
        method: 'GET',
        payload,
      });

      if (res) {
        toast.success('Status updated successfully');
        afterStatusUpdate();
      } else {
        toast.error(res?.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const editInstituteCandidate = (index) => {
    const cData = paginatedCandidates[index];
    // Open edit modal with candidate data
    setShowAddModal(true);
    // You may need to pass candidate data to the modal for editing
  };

  const handleExport = () => {
    if (!candidates.length) return toast.warn('No data to export');

    const exportData = candidates.map((c) => ({
      Name: c.name || '',
      Email: c.email || '',
      Mobile: c.mobile || '',
      Status: c.candidateStatus || '',
      Remarks: c.remarks || '',
      Course: c.course || '',
      'Course Start': c.courseStartDate || '',
      'Course End': c.courseEndDate || '',
      'Total Exp (Yrs)': c.totalExperience || '',
      'Relevant Exp (Yrs)': c.relevantExperience || '',
      'Last Designation': c.lastDesignation || '',
      'Expected Designation': c.expectedDesignation || '',
      'Last CTC': c.lastCTC || '',
      'Expected CTC': c.expectedCTC || '',
      'Pending Payment': c.pending_payment || '',
      'Updated': c.updatedDate || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
    XLSX.writeFile(wb, `job-${jobId}-candidates.xlsx`);
    toast.success('Exported successfully');
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCandidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDownloadResume = async (resumeFile, resumeName) => {
    if (!resumeFile) return;

    try {
      // Create download link
      const downloadUrl = `/view-resume?file=${encodeURIComponent(resumeFile)}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = resumeName || 'resume.pdf';
      link.target = '_blank';
      link.click();
    } catch (err) {
      toast.error('Failed to download resume');
    }
  };

  // Helper function to strip HTML tags
  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Replace Font Awesome INR icon with actual ₹ symbol before stripping
    let cleanHtml = html.replace(/<i\s+class="fa fa-inr"[^>]*><\/i>/gi, '₹');
    const tmp = document.createElement('div');
    tmp.innerHTML = cleanHtml;
    return tmp.textContent || tmp.innerText || '';
  };

  useEffect(() => {
    if (showTimelineModal && selectedCandidateIndex !== null) {
      refreshTimelineForCurrentCandidate();
    }
  }, [showTimelineModal, selectedCandidateIndex]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header - Single Line Layout */}
      <div className="bg-white border-b px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-800 truncate">{jobTitle}</h2>
            <p className="text-xs text-gray-500 truncate">{companyName} • Job ID: {jobId}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleAddCandidate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium transition-colors"
            >
              <Plus size={14} />
              Add
            </button>

            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              <Trash2 size={14} />
              Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </button>

            <button
              onClick={handleShareToHR}
              disabled={selectedIds.length === 0 || sharingToHr}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              {sharingToHr ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Share to HR
                </>
              )}
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-xs font-medium transition-colors"
            >
              <Download size={14} />
              Export
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={loadCandidates}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={paginatedCandidates.length > 0 && selectedIds.length === paginatedCandidates.length}
                      onChange={toggleSelectAll}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Mobile</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Remarks</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Resume</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Course</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Course Start</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Course End</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Total Exp</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Relevant Exp</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Last Designation</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Expected Designation</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Last CTC</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Expected CTC</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Pending Payment</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Updated Time</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={19} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                        <RefreshCw size={20} className="animate-spin" />
                        <span>Loading candidates...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <UserCheck size={40} className="text-gray-300" />
                        <span>No candidates found for this job</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map((candidate, idx) => (
                      <tr
                          key={candidate.id}
                          className={`
                            hover:bg-gray-50 transition-colors align-top
                            ${highlightedNoResume.includes(String(candidate.id)) ? 'bg-red-100 !important' : ''}
                            ${selectedIds.includes(candidate.id) ? 'bg-blue-50' : ''}
                          `}
                        >
                      <td className="px-3 py-2 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(candidate.id)}
                          onChange={() => toggleSelectOne(candidate.id)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="font-medium text-gray-900">{candidate.name || '-'}</div>
                      </td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.email || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.mobile || '-'}</td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-start gap-1.5">
                          <button
                            onClick={() => showInstituteCandidateTimeLine(idx)}
                            className="p-0.5 hover:bg-gray-200 rounded"
                            title="View timeline"
                          >
                            <Clock size={14} className="text-gray-600" />
                          </button>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              candidate.candidateStatus?.includes('Issue')
                                ? 'bg-red-100 text-red-800'
                                : candidate.candidateStatus === 'Interested'
                                ? 'bg-green-100 text-green-800'
                                : candidate.candidateStatus === 'Shortlisted'
                                ? 'bg-blue-100 text-blue-800'
                                : candidate.candidateStatus === 'Rejected'
                                ? 'bg-gray-300 text-gray-700'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {candidate.candidateStatus || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top text-gray-600 max-w-xs truncate">{candidate.remarks || '-'}</td>
                      <td className="px-3 py-2 align-top">
                        {candidate.resume ? (
                          <button
                            onClick={() => handleDownloadResume(candidate.resume, candidate.resumeName)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium"
                          >
                            <FileText size={12} />
                            {candidate.resumeName || 'Download'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.course || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.courseStartDate || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.courseEndDate || '-'}</td>
                      <td className="px-3 py-2 align-top text-center text-gray-900">
                        {candidate.totalExperience ? `${candidate.totalExperience} yrs` : '-'}
                      </td>
                      <td className="px-3 py-2 align-top text-center text-gray-500">
                        {candidate.relevantExperience ? `${candidate.relevantExperience} yrs` : '-'}
                      </td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.lastDesignation || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-900">{candidate.expectedDesignation || '-'}</td>
                      <td className="px-3 py-2 align-top text-center text-gray-900">
                        {candidate.lastCTC ? `₹${candidate.lastCTC} L` : '-'}
                      </td>
                      <td className="px-3 py-2 align-top text-center text-gray-900">
                        {candidate.expectedCTC ? `₹${candidate.expectedCTC} L` : '-'}
                      </td>
                      <td className="px-3 py-2 align-top text-center text-gray-900 whitespace-pre-wrap">
                        {candidate.pending_payment ? (
                          <div className="text-sm leading-tight">
                            {candidate.pending_payment.split(/<br\s*\/?>/i).map((line, i) => {
                              // Clean each line individually
                              const cleanLine = stripHtmlTags(line.trim());
                              return cleanLine ? (
                                <div key={i} className="py-0.5">
                                  {cleanLine}
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-2 align-top text-gray-500">
                        {candidate.updatedDate ? new Date(candidate.updatedDate).toLocaleString() : '-'}
                      </td>
                      <td className="px-3 py-2 align-top text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditStatusModal(idx)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit status"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleShareSingleToHR(candidate.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Share resume to HR"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredCandidates.length > 0 && (
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <strong className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredCandidates.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredCandidates.length}</strong> candidates
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {showEditStatusModal && editingCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Update Status - {editingCandidate.name || ''}
              </h3>
              <button
                onClick={() => setShowEditStatusModal(false)}
                className="text-white hover:bg-blue-700 p-1.5 rounded-full"
              >
                <ArrowLeft size={20} className="rotate-180" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusList.length > 0 ? (
                    statusList.map((item, idx) => {
                      const value = typeof item === 'string' ? item : (item.status || item.name || '');
                      const label = typeof item === 'string' ? item : (item.status || item.name || '');
                      return (
                        <option key={idx} value={value}>
                          {label}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="Pending">Pending</option>
                      <option value="Interested">Interested</option>
                      <option value="Not Interested">Not Interested</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Issue">Issue</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter remarks..."
                />
              </div>
            </div>

            <div className="border-t px-5 py-3 flex justify-end gap-2">
              <button
                onClick={() => setShowEditStatusModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <i className="ri-save-line"></i>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && timelineData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-blue-600 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Timeline - {paginatedCandidates[selectedCandidateIndex]?.name || ''}
              </h3>
              <button
                onClick={() => {
                  setShowTimelineModal(false);      
                  setTimeout(() => {
                    openEditStatusModal(selectedCandidateIndex);
                  }, 150);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Edit2 size={14} />
                Edit Status
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {Object.keys(timelineData || {}).length === 0 ? (
                <p className="text-center text-gray-500 py-8">No timeline data available</p>
              ) : (
                <ul className="space-y-4">
                  {Object.entries(timelineData).map(([dateTime, entry], i) => {
                    // ──────────────────────────────────────────────
                    // Normalize what "entry" can be
                    let statusText = "—";
                    let remarksText = "";

                    if (typeof entry === "string") {
                      statusText = entry;
                    } else if (entry && typeof entry === "object") {
                      // Most common case now
                      if (entry.status && typeof entry.status === "string") {
                        statusText = entry.status;
                      } else if (entry.status && typeof entry.status === "object" && entry.status.status) {
                        // Very nested case (rare, but happens)
                        statusText = entry.status.status;
                      }

                      if (typeof entry.remarks === "string") {
                        remarksText = entry.remarks;
                      }
                    }

                    return (
                      <li key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                        <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Clock size={12} />
                            {dateTime}
                          </div>

                          <div className="text-sm">
                            <span className="font-semibold text-gray-800">Status:</span>{" "}
                            <span className="font-medium">{statusText}</span>
                          </div>

                          {remarksText && (
                            <div className="mt-1.5 text-sm text-gray-600">
                              <span className="font-semibold">Remarks:</span> {remarksText}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t px-5 py-3 flex justify-end gap-2">
              <button
                onClick={() => setShowTimelineModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowTimelineModal(false);
                  openEditStatusModal(selectedCandidateIndex);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Edit2 size={14} />
                Edit Status
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddManageCandidateModal
          jobId={jobId}
          jobTagIds={jobTagIds || ''}
          corporateId={corporateId}
          presentIds={candidates.map((c) => c.id).join(',')}
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadCandidates();
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
