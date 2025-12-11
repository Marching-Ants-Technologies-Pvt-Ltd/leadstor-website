'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import {
  LeadFilters,
  LeadsCurrentPage,
  User,
  Corporate,
  TotalLeads,
} from '@/utility/TinyDB';
import SearchBox from '@/components/elements/SearchBox';
import ImportEnquiryDropBox from '@/components/dashboard/Lead/ImportEnquiry.jsx';
import ManualCandidate from '@/components/dashboard/Lead/ManualCandidate.jsx';
import AddLead from '@/components/dashboard/Lead/AddLead.jsx';
import ColumnReorderPopup from '@/components/dashboard/Lead/ColumnReorderPopup.jsx';
import SendEmailModal from '@/components/dashboard/Lead/SendEmailModal.jsx';
import BulkUpdateDrawer from '@/components/dashboard/Lead/BulkUpdateDrawer';
import DailyReportModal from '@/components/dashboard/Lead/DailyReportModal.jsx';
import ExportEnquiriesModal from '@/components/dashboard/Lead/ExportEnquiriesModal.jsx';

// Props: onOpenAdvanceFilter, leads, selectedLeadIds, setSelectedLeadIds, onDownloadStart, onDownloadProgress, onDownloadEnd, onDownloadCancel, setCancelExportFunction, setOpenAddLead
export default function LeadsMenu({
  onOpenAdvanceFilter,
  leads = [],
  selectedLeadIds = [],
  setSelectedLeadIds,
  onDownloadStart,
  onDownloadProgress,
  onDownloadEnd,
  onDownloadCancel,
  setCancelExportFunction,
  setOpenAddLead,
}) {
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showColumnReorderPopup, setShowColumnReorderPopup] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [showBulkUpdateDrawer, setShowBulkUpdateDrawer] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dailyReport, setDailyReport] = useState(false);

  // burger / responsive
  const [burgerOpen, setBurgerOpen] = useState(false);
  const burgerRef = useRef(null);

  // dropdown / popover states (for desktop chips)
  const [openActions, setOpenActions] = useState(false);
  const actionsRef = useRef(null);

  // option lists
  const [sourceOptions, setSourceOptions] = useState([]);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const router = useRouter();

  // Fetch sources
  useEffect(() => {
    const corporateId = Corporate?._id;
    if (!corporateId) return;
    (async () => {
      try {
        const response = await (await import('@/utility/xFetch')).xFetch({
          method: 'GET',
          path: `/services/profile/getSources?corporateId=${corporateId}`,
        });
        setSourceOptions(Array.isArray(response) ? response.map(s => s.source) : []);
      } catch (e) {
        setSourceOptions([]);
      }
    })();
  }, [Corporate?._id]);

  // Fetch owners
  useEffect(() => {
    const corporateId = Corporate?._id;
    if (!corporateId) return;
    (async () => {
      try {
        const response = await (await import('@/utility/xFetch')).xFetch({
          method: 'GET',
          path: `/services/profile/getUsers?corporateId=${corporateId}`,
        });
        if (Array.isArray(response)) {
          setOwnerOptions(response.map(o => ({ label: o.name, value: o.id })));
        } else if (typeof response === 'object') {
          setOwnerOptions(Object.entries(response).map(([id, name]) => ({ label: name, value: id })));
        } else {
          setOwnerOptions([]);
        }
      } catch (e) {
        setOwnerOptions([]);
      }
    })();
  }, [Corporate?._id]);

  // Fetch courses
  useEffect(() => {
    const corporateId = Corporate?._id;
    if (!corporateId) return;
    (async () => {
      try {
        const response = await (await import('@/utility/xFetch')).xFetch({
          method: 'GET',
          path: `/services/profile/getCourseAndFee?corporateId=${corporateId}`,
        });
        setCourseOptions(Array.isArray(response) ? response.map(c => ({ label: c.course, value: c.course })) : []);
      } catch (e) {
        setCourseOptions([]);
      }
    })();
  }, [Corporate?._id]);

  // Fetch statuses
  useEffect(() => {
    const corporateId = Corporate?._id;
    if (!corporateId) return;
    (async () => {
      try {
        const response = await (await import('@/utility/xFetch')).xFetch({
          method: 'GET',
          path: `/services/profile/getStatuses?corporateId=${corporateId}`,
        });
        setStatusOptions(Array.isArray(response) ? response.map(s => ({ label: s.status || s, value: s.status || s })) : []);
      } catch (e) {
        setStatusOptions([]);
      }
    })();
  }, [Corporate?._id]);

  // click-away for burger
  useEffect(() => {
    function onDocClick(e) {
      if (burgerRef.current && !burgerRef.current.contains(e.target)) {
        setBurgerOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setOpenActions(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // helpers for filters/bookmarks
  const handelFollowUpFilters = () => {
    let today = new Date().toString().split(' ');
    if (today.length < 9) return;
    today = `${today[2]}-${today[1]}-${today[3]}`;
    LeadFilters.reset();
    LeadFilters.setValue([{ title: 'FollowUps', value: today, query: 'followupDate' }]);
    LeadsCurrentPage.setValue(1);
    window.tableState('Applying Filter...');
    window.tableRefresh();
  };

  const handelBookmarks = () => {
    LeadFilters.reset();
    LeadFilters.setValue([{ title: 'Bookmarks', value: 1, query: 'bookmarkLeads' }]);
    LeadsCurrentPage.setValue(1);
    window.tableState('Applying Filter...');
    window.tableRefresh();
  };

  // selected emails / mobiles
  const selectedLeadEmails = leads
    .filter(l => selectedLeadIds.includes(l.invitationId))
    .map(l => l.emailId)
    .filter(Boolean);

  const selectedLeadMobiles = leads
    .filter(l => selectedLeadIds.includes(l.invitationId))
    .map(l => l.mobile)
    .filter(Boolean);

  // Add lead handler (keeps same prop)
  const handleAddLead = () => {
    if (typeof setOpenAddLead === 'function') setOpenAddLead(true);
    else setShowManual(true);
  };

  // Small utility used in bulk update
  function getLeadById(invitationId) {
    return leads.find(lead => String(lead.invitationId) === String(invitationId)) || {};
  }

  // ensure option present
  const ensureOption = (options, value) => {
    if (!value) return options;
    if (options.includes(value)) return options;
    return [value, ...options];
  };

  return (
    <>
      <div className="lead-topbar compact">
          <div className="search-wrap">
            <SearchBox />
        </div>

        <div className="right">
          {/* Primary action: Add */}
          <div className="action-group desktop">
            <button
              onClick={handleAddLead}
              className="action-chip"
              title="Add lead (manual)"
              aria-label="Add lead"
            >
              <i className="ri-user-add-line" />
              <span className="label">Add</span>
            </button>

            <div className="divider" />

            {/* Export / Reports */}
            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer action-chip'>
                <i className="ri-file-excel-2-fill"></i>
                <span className="label">Export</span>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5"
                        onClick={() => setDailyReport(true) } >
                        <i className="ri-calendar-event-line text-lg mt-1"></i>
                        <span className='text-sm'>Daily report</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowExportModal(true)}>
                        <i className="ri-download-cloud-2-line text-lg mt-1"></i>
                        <span className='text-sm'>Export enquiries</span>
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer action-chip'>
                <i className="ri-filter-2-line text-xl"></i>
                <span className="label">Filter</span>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a onClick={handelFollowUpFilters} className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i className="ri-user-follow-line text-lg mt-1"></i>
                        <span className='text-sm'>Pending Followup</span>
                    </a>
                    <a onClick={handelBookmarks} className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i className="ri-bookmark-line text-lg mt-1"></i>
                        <span className='text-sm'>Bookmarks</span>
                    </a>
                    <div className="dropdown-divider my-1" role="separator"></div>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={onOpenAdvanceFilter}>
                        <i className="ri-equalizer-3-line text-lg mt-1"></i>
                        <span className='text-sm'>Advance</span>
                    </a>
                </div>
            </div>

            {/* Actions: grouped popover */}
            <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-0 action-chip'>
                <i className="ri-shapes-line text-xl"></i>
                <span className="label">Actions</span>
                <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowSendSms(true)}>
                        <i className="ri-chat-1-line text-lg mt-1"></i>
                        <span className='text-sm'>Send SMS</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowSendEmail(true)}>
                        <i className="ri-mail-ai-line text-lg mt-1"></i>
                        <span className='text-sm'>Send Email</span>
                    </a>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                        <i className="ri-user-voice-line text-lg"></i>
                        <span className='text-sm'>Invite Again</span>
                    </a>
                    {/* Bulk Update with submenu */}
                    <div className="dropdown dropdown-hover relative group">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 group" onClick={() => {
                            if (selectedLeadIds.length === 0) {
                                toast.error('Please select at least one record to bulk update.');
                            } else {
                                setShowBulkUpdateDrawer(true);
                            }
                        }}>
                            <i className="ri-database-2-line text-lg"></i>
                            <span className='text-sm'>Bulk Update</span>
                            <i className="ri-arrow-right-s-line text-xs ml-auto"></i>
                        </a>
                    </div>
                    <div className="dropdown-divider my-1" role="separator"></div>
                    <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 hover:bg-rose-100 text-rose-500">
                        <i className="ri-delete-bin-7-line text-lg"></i>
                        <span className='text-sm'>Delete Invite</span>
                    </a>
                </div>
            </div>

            {/* Analytics + Settings + Refresh */}
            <button className="action-chip muted" title="Analytics">
              <i className="ri-pie-chart-line" />
            </button>
            <button className="action-chip muted" title="Settings" onClick={() => router.push('/leads/settings')}>
              <i className="ri-settings-line" />
            </button>
            <button className="action-chip muted" title="Refresh" onClick={() => window.tableRefresh()}>
              <i className="ri-refresh-line" />
            </button>
          </div>

          {/* Compact / mobile burger */}
          <div className="burger mobile" ref={burgerRef}>
            <button
              className="burger-btn"
              onClick={() => setBurgerOpen(v => !v)}
              aria-label="Open menu"
              aria-expanded={burgerOpen}
            >
              <i className="ri-menu-3-line" />
            </button>

            {burgerOpen && (
              <div className="burger-panel">
                <button className="burger-item" onClick={handleAddLead}><i className="ri-user-add-line" /> <span>Add</span></button>
                <button className="burger-item" onClick={() => { setShowImport(true); setBurgerOpen(false); }}><i className="ri-upload-cloud-2-line" /> <span>Import</span></button>
                <button className="burger-item" onClick={() => { setShowExportModal(true); setBurgerOpen(false); }}><i className="ri-file-excel-2-fill" /> <span>Export</span></button>
                <button className="burger-item" onClick={() => { onOpenAdvanceFilter?.(); setBurgerOpen(false); }}><i className="ri-filter-2-line" /> <span>Filter</span></button>
                <button className="burger-item" onClick={() => { setShowSendEmail(true); setBurgerOpen(false); }}><i className="ri-mail-ai-line" /> <span>Send Email</span></button>
                <button className="burger-item" onClick={() => { setShowBulkUpdateDrawer(true); setBurgerOpen(false); }}><i className="ri-database-2-line" /> <span>Bulk Update</span></button>
                <div className="burger-divider" />
                <button className="burger-item" onClick={() => { router.push('/leads/settings'); setBurgerOpen(false); }}><i className="ri-settings-line" /> <span>Settings</span></button>
                <button className="burger-item" onClick={() => { window.tableRefresh(); setBurgerOpen(false); }}><i className="ri-refresh-line" /> <span>Refresh</span></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals and drawers (kept as-is) */}
      {showImport && (
        <ImportEnquiryDropBox
          onCancel={() => setShowImport(false)}
          onSwitchToManual={() => { setShowImport(false); setShowManual(true); }}
        />
      )}
      {showManual && (
        <ManualCandidate
          onCancel={() => setShowManual(false)}
          onSwitchToImport={() => { setShowManual(false); setShowImport(true); }}
        />
      )}
      {showColumnReorderPopup && (
        <ColumnReorderPopup
          isOpen={showColumnReorderPopup}
          setIsOpen={setShowColumnReorderPopup}
        />
      )}
      {showSendEmail && (
        <SendEmailModal
          isOpen={showSendEmail}
          onClose={() => setShowSendEmail(false)}
          ids={selectedLeadIds}
          emails={selectedLeadEmails}
          corporateId={User?.corporateId}
        />
      )}
      {showBulkUpdateDrawer && (
        <BulkUpdateDrawer
          open={showBulkUpdateDrawer}
          onClose={() => setShowBulkUpdateDrawer(false)}
          sourceOptions={sourceOptions}
          ownerOptions={ownerOptions}
          courseOptions={courseOptions}
          statusOptions={statusOptions}
          selectedIds={selectedLeadIds}
          onUpdate={async (fields, selectedIds) => {
            if (!fields || !selectedIds || selectedIds.length === 0) {
              return { success: false, message: 'No fields or leads selected' };
            }

            let successCount = 0;
            let failCount = 0;

            for (const invitationId of selectedIds) {
              try {
                const lead = getLeadById(invitationId);
                const payload = {
                  invitationId,
                  updatedBy: User?.userId || User?._id || undefined,
                  name: lead.firstName || lead.name || '',
                  email: lead.emailId || lead.email || '',
                  mobile: lead.mobile || '',
                  altMobile: lead.altMobile || '',
                  remarks: lead.remarks || '',
                  location: lead.location || '',
                  testId: lead.testId || lead.test_id || ''
                };

                if (fields.source) payload.source = fields.source;
                if (fields.owner) payload.assignedTo = typeof fields.owner === 'object' ? fields.owner.value : fields.owner;
                if (fields.course) payload.course = typeof fields.course === 'object' ? fields.course.value : fields.course;
                if (fields.status) payload.status = typeof fields.status === 'object' ? fields.status.value : fields.status;

                if (!payload.assignedTo) payload.assignedTo = lead.assignedTo || lead.owner || lead.assignedUserId || User?._id || undefined;
                if (!payload.course) payload.course = lead.course || lead.courseName || lead.course_id || undefined;
                if (!payload.status) payload.status = lead.status || undefined;
                if (!payload.source) payload.source = lead.source || lead.sourceName || lead.source_id || undefined;

                await (await import('@/utility/xFetch')).xFetch({
                  method: 'POST',
                  path: '/services/invite/updateInviteDetails',
                  payload
                });
                successCount++;
              } catch (e) {
                console.error('Bulk update error for invitation:', invitationId, e);
                failCount++;
              }
            }

            if (successCount > 0) toast.success(`Updated ${successCount} lead(s)`);
            if (failCount > 0) toast.error(`Failed to update ${failCount} lead(s)`);

            if (successCount > 0) {
              setTimeout(() => {
                if (typeof window !== 'undefined' && window.tableRefresh) window.tableRefresh();
              }, 500);
            }

            return {
              success: successCount > 0,
              successCount,
              failCount,
              message: successCount > 0 ? `Updated ${successCount} lead(s)` : 'No leads were updated'
            };
          }}
        />
      )}

      {dailyReport && (
        <DailyReportModal
          isOpen={dailyReport}
          onClose={() => setDailyReport(false)}
        />
      )}

      {showExportModal && (
        <ExportEnquiriesModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          totalLeads={TotalLeads.value()}
          onDownloadStart={onDownloadStart}
          onDownloadProgress={onDownloadProgress}
          onDownloadEnd={onDownloadEnd}
          onDownloadCancel={onDownloadCancel}
          setCancelExportFunction={setCancelExportFunction}
        />
      )}

      <style jsx>{`
        /* Compact HubSpot-like topbar */
        .lead-topbar.compact {
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 6px 12px;
          background: #fff;
        }
        .lead-topbar .left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1 1 auto;
          min-width: 0;
        }
        .lead-topbar .right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-wrap { display:flex; align-items:center; }
        .search-wrap { flex: 1 1 420px; min-width: 220px; }

        /* Action group (desktop) */
        .action-group.desktop {
          display: flex;
          align-items: center;
          gap: 8px;
          align-self: stretch;
        }

        .action-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.06);
          font-size: 14px;
          color: #0f172a;
          cursor: pointer;
          transition: transform .08s ease, background .08s ease, box-shadow .08s ease;
          height: 36px;
        }
        .action-chip.primary {
          background: linear-gradient(180deg,#0ea5a0,#06b6d4);
          color: #fff;
          border: none;
          box-shadow: 0 2px 8px rgba(6,95,70,0.06);
        }
        .action-chip.primary .label { font-weight: 600; }
        .action-chip.muted {
          background: transparent;
          border: 1px solid rgba(15,23,42,0.04);
        }

        .action-chip .label {
          display: inline-block;
          line-height: 1;
          font-size: 13px;
        }

        /* ACTION CHIP HOVER — keep icon white, fill background */
        .action-chip:hover {
        background: #F1BBEA !important;  /* your theme blue/teal */
        border-color: transparent;
        }

        /* Ensure icons stay white on hover */
        .action-chip:hover i {
        }

        /* Primary chip hover (Add button) */
        .action-chip.primary:hover {
        background: linear-gradient(180deg,#0ea5a0,#06b6d4);
        opacity: 0.92;
        }


        /* dropdown panel */
        .dropdown-panel {
          position: absolute;
          margin-top: 6px;
          right: 12px;
          background: white;
          border: 1px solid rgba(15,23,42,0.06);
          border-radius: 10px;
          box-shadow: 0 6px 18px rgba(2,6,23,0.08);
          min-width: 180px;
          z-index: 60;
          padding: 6px;
        }
        .dropdown-panel.wide { min-width: 240px; }
        .drop-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          width: 100%;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #0f172a;
          text-align: left;
        }
        .drop-item:hover { background: #f8fafc; }

        .dropdown-divider {
          height: 1px;
          background: rgba(15,23,42,0.04);
          margin: 6px 0;
        }

        .drop-item.text-rose { color: #e11d48; }

        /* burger (mobile) */
        .burger.mobile { display: none; position: relative; }
        .burger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(15,23,42,0.06);
          background: white;
          cursor: pointer;
        }

        .burger-panel {
          position: absolute;
          right: 0;
          top: 46px;
          min-width: 200px;
          background: white;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.06);
          box-shadow: 0 6px 18px rgba(2,6,23,0.08);
          padding: 8px;
          z-index: 80;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .burger-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: transparent;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          color: #0f172a;
          text-align: left;
        }
        .burger-item:hover { background: #f8fafc; }

        .burger-divider { height: 1px; background: rgba(15,23,42,0.04); margin: 6px 0; }

        /* responsiveness */
        @media (max-width: 1024px) {
          .action-group.desktop { display: none; }
          .burger.mobile { display: block; }
          .search-wrap { min-width: 160px; }
        }

        @media (max-width: 640px) {
          .search-wrap { display: none; }
        }
      `}</style>
    </>
  );
}
