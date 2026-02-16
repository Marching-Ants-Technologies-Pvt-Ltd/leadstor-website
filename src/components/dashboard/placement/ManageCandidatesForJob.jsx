// components/dashboard/placement/ManageCandidatesForJob.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Send, ArrowLeft, RefreshCw, Download, Search, ExternalLink, UserCheck } from 'lucide-react';
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
    if (selectedIds.length === 0) return toast.warn('No candidates selected');

    const candidatesWithoutResume = selectedIds.filter(id => {
      const candidate = candidates.find(c => c.id === id);
      return !candidate?.resume;
    });

    if (candidatesWithoutResume.length > 0) {
      if (!confirm(`Some selected candidates don't have resumes. Continue?`)) {
        return;
      }
    }

    try {
      const response = await xFetch({
        path: '/services/job/sendCandidateResumeToHr',
        method: 'POST',
        payload: { jobId, candidates: selectedIds },
      });

      if (response === 'success' || response?.success) {
        toast.success('Resumes shared with HR');
        setTimeout(() => {
          loadCandidates();
        }, 500);
      } else {
        toast.error(response?.message || 'Failed to share resumes');
      }
    } catch (err) {
      console.error('Error sharing resumes:', err);
      toast.error('Share failed: ' + (err.message || 'Unknown error'));
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus) => {
    const remarks = prompt('Enter remarks for this status change (optional):', '');
    
    try {
      const response = await xFetch({
        path: '/services/job/updateCandidateStatus',
        method: 'GET',
        payload: {
          id: String(candidateId),
          status: newStatus,
          remarks: remarks || '',
          interview_date: ''
        },
      });

      if (response) {
        toast.success('Status updated successfully');
        loadCandidates();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      console.error('Failed to update candidate status:', err);
      toast.error('Failed to update status');
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{jobTitle}</h2>
            <p className="text-sm text-gray-500">{companyName} • Job ID: {jobId}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddCandidate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Candidate
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Delete {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
          </button>

          <button
            onClick={handleShareToHR}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            <Send size={16} />
            Share to HR
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export
          </button>

          <div className="flex-1"></div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <button
            onClick={loadCandidates}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={paginatedCandidates.length > 0 && selectedIds.length === paginatedCandidates.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Experience</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Designation</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">CTC (LPA)</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Resume</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                        <RefreshCw size={20} className="animate-spin" />
                        <span>Loading candidates...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <UserCheck size={40} className="text-gray-300" />
                        <span>No candidates found for this job</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(candidate.id)}
                          onChange={() => toggleSelectOne(candidate.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{candidate.name || '-'}</div>
                        <div className="text-xs text-gray-500">{candidate.qualification || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{candidate.email || '-'}</div>
                        <div className="text-sm text-gray-500">{candidate.mobile || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={candidate.candidateStatus || 'Pending'}
                          onChange={(e) => updateCandidateStatus(candidate.id, e.target.value)}
                          className={`px-3 py-1 text-xs font-medium rounded-full border-none focus:outline-none focus:ring-0 cursor-pointer ${
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
                          <option value="Pending">Pending</option>
                          <option value="Interested">Interested</option>
                          <option value="Not Interested">Not Interested</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Issue">Issue</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {candidate.totalExperience ? `${candidate.totalExperience} yrs` : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Rel: {candidate.relevantExperience ? `${candidate.relevantExperience} yrs` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{candidate.lastDesignation || '-'}</div>
                        <div className="text-xs text-gray-500">{candidate.expectedDesignation || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{candidate.lastCTC ? `₹${candidate.lastCTC} L` : '-'}</div>
                        <div className="text-xs text-gray-500">
                          Exp: {candidate.expectedCTC ? `₹${candidate.expectedCTC} L` : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {candidate.resume ? (
                          <a
                            href={`/view-resume?file=${candidate.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                          >
                            <ExternalLink size={14} />
                            {candidate.resumeName || 'View'}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => updateCandidateStatus(candidate.id, 'Interested')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                          title="Mark as Interested"
                        >
                          Mark Interested
                        </button>
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
            <div className="text-sm text-gray-600">
              Showing <strong className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredCandidates.length)}</strong> of{' '}
              <strong className="text-gray-900">{filteredCandidates.length}</strong> candidates
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 font-medium text-gray-700 bg-gray-100 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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