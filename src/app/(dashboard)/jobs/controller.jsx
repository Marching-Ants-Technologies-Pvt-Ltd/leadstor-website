'use client';

import { useEffect, useState } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Pencil, Trash2, Send, Bell, Users } from 'lucide-react';

import JobPostingsTable from './table';
import JobPostingFormModal from '@/components/dashboard/placement/JobPostingFormModal';
import JobNotifications from '@/components/dashboard/placement/JobNotifications';
import SendToPlacementReady from '@/components/dashboard/placement/SendToPlacementReady';
import ManageCandidatesForJob from '@/components/dashboard/placement/ManageCandidatesForJob';
import ScheduledEmailStatus from '@/components/dashboard/placement/ScheduledEmailStatus';

export default function JobPostingsController() {
  const corporateId = Corporate?._id;
  const recruiterId = Corporate?.recruiterId || corporateId;

  // ─── Job List States ─────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ─── Modals & Views ──────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedJob, setSelectedJob] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSendToPlacement, setShowSendToPlacement] = useState(false);
  const [showManageCandidates, setShowManageCandidates] = useState(false);
  const [showScheduledStatus, setShowScheduledStatus] = useState(false);
  const [activeJob, setActiveJob] = useState(null); // shared for send, log, manage

  // ─── Fetch Jobs ──────────────────────────────────────────────────────────
  const reloadJobs = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params = {
        corporateId: String(corporateId),
        offset: String(offset),
        limit: String(limit),
        search: search.trim() || undefined,
      };
      const data = await xFetch({ path: '/services/job/getJobs', payload: params });
      const list = Array.isArray(data) ? data : data?.rows || data?.data || [];
      setJobs(list);
      setTotal(data?.total || list.length || 0);
    } catch (err) {
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showNotifications && !showSendToPlacement && !showManageCandidates && !showScheduledStatus ) {
      reloadJobs();
    }
  }, [page, limit, search, showNotifications, showSendToPlacement, showManageCandidates, showScheduledStatus]);

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
      'Owner': j.owner || '',
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
          <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openAddModal}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <i className="ri-add-circle-line text-lg transition-transform group-hover:rotate-90 duration-300"></i>
                Add Job
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={!selectedIds.length}
                className={`group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                  selectedIds.length
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm'
                }`}
              >
                <i className="ri-delete-bin-2-line text-lg transition-transform group-hover:scale-110 duration-200"></i>
                Delete {selectedIds.length ? `(${selectedIds.length})` : ''}
              </button>

              <button
                onClick={() => setShowNotifications(true)}
                className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <i className="ri-notification-3-line text-lg transition-transform group-hover:scale-110 duration-200"></i>
                Job Notifications
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  placeholder="Search job title, company, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              </div>

              <button
                onClick={reloadJobs}
                className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md shadow-sm transition-all duration-200"
                title="Refresh"
              >
                <i className="ri-refresh-line text-xl text-gray-700 transition-transform hover:rotate-180 duration-500"></i>
              </button>

              <button
                onClick={handleExport}
                className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md shadow-sm transition-all duration-200"
                title="Export to Excel"
              >
                <i className="ri-download-2-line text-xl text-gray-700"></i>
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

            {/* Pagination placeholder – add your real pagination here */}
            {!loading && total > 0 && (
              <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600 px-2">
                {/* Your pagination UI */}
                <div>Showing page {page} of {Math.ceil(total / limit)}</div>
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