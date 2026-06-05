'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

import JobPostingsTable from './table';
import JobPostingFormModal from '@/components/dashboard/placement/JobPostingFormModal';
import JobNotifications from '@/components/dashboard/placement/JobNotifications';
import SendToPlacementReady from '@/components/dashboard/placement/SendToPlacementReady';
import ManageCandidatesForJob from '@/components/dashboard/placement/ManageCandidatesForJob';
import ScheduledEmailStatus from '@/components/dashboard/placement/ScheduledEmailStatus';

export default function JobPostingsController() {
  const router = useRouter();
  const corporateId = Corporate?._id;
  const recruiterId = Corporate?.recruiterId || corporateId;

  // ─── Job List States ─────────────────────────────────────────────────────
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [ownerMap, setOwnerMap] = useState({});

  // ─── Modals & Views ──────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedJob, setSelectedJob] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSendToPlacement, setShowSendToPlacement] = useState(false);
  const [showManageCandidates, setShowManageCandidates] = useState(false);
  const [showScheduledStatus, setShowScheduledStatus] = useState(false);
  const [activeJob, setActiveJob] = useState(null); // shared for send, log, manage

  const getOwnerDisplayName = useCallback((ownerValue) => {
    if (ownerValue === null || ownerValue === undefined || ownerValue === '') return '';
    return ownerMap[String(ownerValue)] || String(ownerValue);
  }, [ownerMap]);

  // ─── Fetch Jobs ──────────────────────────────────────────────────────────
  const reloadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        corporateId: String(corporateId),
        search: search.trim() || undefined,
      };
      const [jobsRes, ownersRes] = await Promise.all([
        xFetch({ path: '/services/job/getJobs', payload: params }),
        xFetch({ path: '/services/profile/getUsers', payload: { basic: 1 } }).catch(() => ({})),
      ]);
      const list = Array.isArray(jobsRes) ? jobsRes : jobsRes?.rows || jobsRes?.data || [];
      const owners = ownersRes && typeof ownersRes === 'object' ? ownersRes : {};
      const normalizedOwnerMap = Object.fromEntries(
        Object.entries(owners).map(([id, name]) => [String(id), String(name)])
      );
      setOwnerMap(normalizedOwnerMap);
      setAllJobs(list);
    } catch (err) {
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  }, [search, corporateId]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!showNotifications && !showSendToPlacement && !showManageCandidates && !showScheduledStatus ) {
      reloadJobs();
    }
  }, [search, showNotifications, showSendToPlacement, showManageCandidates, showScheduledStatus, reloadJobs]);

  useEffect(() => {
    router.prefetch('/jobs/settings');
  }, [router]);

  // ─── Client-side Search + Pagination ─────────────────────────────────────
  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allJobs;
    return allJobs.filter((job) => (job?.title || '').toLowerCase().includes(term));
  }, [allJobs, search]);

  const total = filteredJobs.length;
  const totalPages = Math.ceil(total / limit);
  const jobs = filteredJobs.slice((page - 1) * limit, page * limit);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setModalMode('add');
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setModalMode('edit');
    setSelectedJob(job);
    setIsModalOpen(true);
  };
   
  const handleOpenSendToPlacement = (job) => {
    setActiveJob(job);
    setShowSendToPlacement(true);
  };

    const handleCheckScheduledStatus = (job) => {
        setActiveJob(job);
        setShowScheduledStatus(true);
    };

  const handleManageCandidates = (job) => {
    setActiveJob(job);
    setShowManageCandidates(true);
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return toast.warn('No jobs selected');
    if (!window.confirm(`Delete ${selectedIds.length} job(s)?`)) return;

    try {
      for (const id of selectedIds) {
        await xFetch({
          path: '/services/job/deleteJob',
          method: 'POST',
          payload: { jobId: id },
        });
      }
      toast.success(`${selectedIds.length} job(s) deleted`);
      setSelectedIds([]);
      reloadJobs();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleExport = () => {
    if (!jobs.length) return toast.warn('No data to export');

    const data = jobs.map((j) => ({
      'Job ID': j.id || '',
      'Job Title': j.title || '',
      'Company': j.companyName || '',
      'Location(s)': Array.isArray(j.locations) ? j.locations.join(', ') : j.locations || '',
      'Min Salary (LPA)': j.minSal || '',
      'Max Salary (LPA)': j.maxSal || '',
      'Min Exp (Yrs)': j.minExp || '',
      'Max Exp (Yrs)': j.maxExp || '',
      'Position Type': j.positionType || '',
      'Contact Person': j.contact_name || '',
      'Email': j.contact_email || '',
      'Phone': j.contact_phone || '',
      'Owner': getOwnerDisplayName(j.owner),
      'Status': j.status || '',
      'Job Tags': Array.isArray(j.jobTags) ? j.jobTags.join(', ') : '',
      'Last Updated': j.updateTime ? format(new Date(j.updateTime), 'dd-MMM-yyyy HH:mm') : '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Job Postings');
    XLSX.writeFile(wb, `job-postings-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Exported successfully');
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100">
      <ToastContainer theme="colored" transition={Bounce} position="top-right" autoClose={2200} />

      {!showNotifications &&
      !showSendToPlacement &&
      !showManageCandidates &&
      !showScheduledStatus ? (
        <>
          {/* ── Toolbar ──────────────────────────────────────────────────────── */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <i className="ri-add-circle-line text-base"></i>
                Add Job
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={!selectedIds.length}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedIds.length
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <i className="ri-delete-bin-2-line text-base"></i>
                Delete {selectedIds.length ? `(${selectedIds.length})` : ''}
              </button>

              <button
                onClick={() => setShowNotifications(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <i className="ri-notification-3-line text-base"></i>
                Job Notifications
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  className="w-full sm:w-64 pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>

              <button
                onClick={() => router.push('/jobs/settings')}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Settings"
              >
                <i className="ri-settings-3-line text-lg text-gray-600"></i>
              </button>

              <button
                onClick={reloadJobs}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <i className="ri-refresh-line text-lg text-gray-600"></i>
              </button>

              <button
                onClick={handleExport}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Export"
              >
                <i className="ri-download-2-line text-lg text-gray-600"></i>
              </button>
            </div>
          </div>

          {/* ── Job Table ────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-h-0 px-5 pb-6 overflow-hidden">
            <div className="flex-1 overflow-auto border border-gray-200/80 rounded-2xl bg-white shadow-lg">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-gray-600 font-medium">Loading job postings...</span>
                </div>
              ) : (
                <JobPostingsTable
                  rows={jobs}
                  ownerMap={ownerMap}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  onEdit={openEditModal}
                  onDelete={(id) => {
                    if (window.confirm('Delete this job posting?')) {
                      xFetch({
                        path: '/services/job/deleteJob',
                        method: 'POST',
                        payload: { jobId: id },
                      })
                        .then(() => {
                          toast.success('Job deleted');
                          reloadJobs();
                        })
                        .catch(() => toast.error('Delete failed'));
                    }
                  }}
                  onSendToPlacement={handleOpenSendToPlacement}
                  onManageCandidates={handleManageCandidates}
                  onCheckScheduledStatus={handleCheckScheduledStatus}
                />
              )}
            </div>

            {/* Pagination controls */}
            {!loading && total > 0 && (
              <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 px-2">
                <div className="flex items-center gap-3">
                    <span className="font-medium">
                      Showing <strong className="text-blue-600">{(page - 1) * limit + 1}</strong>–
                      <strong className="text-blue-600">{Math.min(page * limit, total)}</strong> of <strong className="text-blue-600">{total.toLocaleString()}</strong>
                    </span>

                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value))
                        setPage(1) // reset to first page
                      }}
                      className="border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                    </select>

                    <span className="font-medium">per page</span>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 transition-all font-semibold hover:shadow-md"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-full min-w-[40px] transition-all font-bold ${
                            page === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                              : 'border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    {totalPages > 10 && (
                      <>
                        <span className="px-2 text-gray-400">...</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          className={`px-4 py-2 rounded-full min-w-[40px] transition-all font-bold ${
                            page === totalPages
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                              : 'border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 disabled:opacity-40 transition-all font-semibold hover:shadow-md"
                    >
                      Next
                    </button>
                  </div>
              </div>
            )}
          </div>
        </>
      ) : showNotifications ? (
        <JobNotifications
          corporateId={corporateId}
          institutes={[]} // ← fetch if needed
          onBack={() => setShowNotifications(false)}
        />
      ) : showSendToPlacement && activeJob ? (
        <SendToPlacementReady
          jobId={activeJob.id}
          jobTagIds={activeJob.jobTagIds?.join(',') || ''}
          corporateId={corporateId}
          onClose={() => {
            setShowSendToPlacement(false);
            setActiveJob(null);
          }}
          onSuccess={() => {
            toast.success('Notifications sent');
            reloadJobs();
          }}
        />
      ) : showManageCandidates && activeJob ? (
        <ManageCandidatesForJob
          jobId={activeJob.id}
          jobTitle={activeJob.title}
          jobTagIds={activeJob.jobTagIds?.join(',') || ''}
          companyName={activeJob.companyName}
          corporateId={corporateId}
          onBack={() => {
            setShowManageCandidates(false);
            setActiveJob(null);
            reloadJobs(); // optional - refresh job list
          }}
        />
      ) : showScheduledStatus && activeJob ? (
        <ScheduledEmailStatus
            jobId={activeJob.id}
            title={activeJob.title || 'Scheduled Emails'}
            onBack={() => {
            setShowScheduledStatus(false);
            setActiveJob(null);
            }}
        />
    ) : null}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <JobPostingFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            reloadJobs();
            setIsModalOpen(false);
          }}
          mode={modalMode}
          initialData={selectedJob}
          corporateId={corporateId}
        />
      )}
    </div>
  );
}
