// components/dashboard/placement/ManageCandidatesForJob.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, ArrowLeft, RefreshCw, Download, Search, ExternalLink } from 'lucide-react';import { xFetch } from '@/utility/xFetch';
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
      // Assuming backend endpoint exists
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
    if (selectedIds.length === 0) return toast.warn('No candidates selected');

    try {
      // Your validation + send logic
      const response = await xFetch({
        path: '/services/job/sendCandidateResumeToHr',
        method: 'POST',
        payload: { jobId, candidates: selectedIds },
      });

      if (response === 'success' || response?.success) {
        toast.success('Resumes shared with HR');
      } else {
        toast.error(response?.message || 'Failed to share resumes');
      }
      loadCandidates();
    } catch (err) {
      toast.error('Share failed');
    }
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

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar - compact */}
      <div className="bg-white border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {jobId} - {jobTitle} {companyName ? `- ${companyName}` : ''}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={handleAddCandidate}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            <Plus size={16} />
            Add Candidate
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete ({selectedIds.length})
          </button>

          <button
            onClick={handleShareToHR}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            <Send size={16} />
            Share to HR
          </button>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search name, email, mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={loadCandidates}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={handleExport}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            title="Export to Excel"
          >
            <Download size={18} />
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="text-[13px] border-collapse bg-white">
            <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={paginatedCandidates.length > 0 && selectedIds.length === paginatedCandidates.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Mobile</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Remarks</th>
              <th className="p-2 text-left">Resume</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Course Start Date</th>
              <th className="p-2 text-left">Course End Date</th>
              <th className="p-2 text-left">Total Experience(Years)</th>
              <th className="p-2 text-left">Relevant Experience(Years)</th>
              <th className="p-2 text-left">Last Designation</th>
              <th className="p-2 text-left">Expected Designation</th>
              <th className="p-2 text-left">Last CTC</th>
              <th className="p-2 text-left">Expected CTC</th>
              <th className="p-2 text-left">Pending Payment</th>
              <th className="p-2 text-left">Updated Time</th>
              <th className="p-2 text-center font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-500">
                  Loading candidates...
                </td>
              </tr>
            ) : paginatedCandidates.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-500">
                  No candidates found for this job
                </td>
              </tr>
            ) : (
              paginatedCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={() => toggleSelectOne(candidate.id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                    <td className="p-2">{candidate.name || '-'}</td>
                    <td className="p-2">{candidate.email || '-'}</td>
                    <td className="p-2">{candidate.mobile || '-'}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          candidate.candidateStatus?.includes('Issue')
                            ? 'bg-red-100 text-red-800'
                            : candidate.candidateStatus === 'Interested'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {candidate.candidateStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="p-2">{candidate.remarks || '-'}</td>
                    <td className="p-2">
                      {candidate.resume ? (
                        <a
                          href={`/view-resume?file=${candidate.resume}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          {candidate.resumeName || 'View Resume'}
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2">{candidate.course || '-'}</td>
                    <td className="p-2">{candidate.courseStartDate || '-'}</td>
                    <td className="p-2">{candidate.courseEndDate || '-'}</td>
                    <td className="p-2">{candidate.totalExperience || '-'}</td>
                    <td className="p-2">{candidate.relevantExperience || '-'}</td>
                    <td className="p-2">{candidate.lastDesignation || '-'}</td>
                    <td className="p-2">{candidate.expectedDesignation || '-'}</td>
                    <td className="p-2">{candidate.lastCTC || '-'}</td>
                    <td className="p-2">{candidate.expectedCTC || '-'}</td>
                    <td className="p-2">{candidate.pending_payment || '-'}</td>
                    <td className="p-2">{candidate.updatedDate || '-'}</td>
                    <td className="p-2 text-center">
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs">
                        Details
                      </button>
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredCandidates.length > 0 && (
        <div className="bg-white border-t px-4 py-2.5 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of{' '}
            {filteredCandidates.length}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
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