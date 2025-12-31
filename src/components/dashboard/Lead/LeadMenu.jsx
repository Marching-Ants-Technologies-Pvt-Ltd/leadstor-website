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
import { xFetch } from '@/utility/xFetch';

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
  const [statusCounts, setStatusCounts] = useState({
    overdue: 0,
    todaysFollowUps: 0,
    newLeads: 0,
    hotLeads: 0,
    conversions: 0,
  });

  const router = useRouter();

  // Fetch sources
  useEffect(() => {
    const corporateId = Corporate?._id;
    getStatusWiseLeadCount();
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

  const getStatusWiseLeadCount = async () => {
      const res = await xFetch({
        path: `/services/dashboard/getLeadStatusSummary`,
      });

      if (!res) return;
    
      setStatusCounts({
        overdue: res.data.overdue || 0,
        todaysFollowUps: res.data.todaysFollowUps || 0,
        newLeads: res.data.newLeads || 0,
        hotLeads: res.data.hotLeads || 0,
        conversions: res.data.conversions || 0,
      });
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
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2 w-[300px]">
            <i className="fa fa-search text-blue-400 text-sm " />
            <input
              placeholder="Search by name/email"
              className="bg-transparent outline-none w-full text-sm bg-slate-50"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            {/* ADD */}
            <button
              onClick={handleAddLead}
              className="action-chip primary"
            >
              <i className="fa fa-user-plus" />
              <span>Add</span>
            </button>

            {/* EXPORT */}
            <div className="relative group">
              <button className="action-chip">
                <i className="fa fa-file-excel-o text-emerald-600" />
                <span>Export</span>
                <i className="fa fa-caret-down text-xs opacity-60" />
              </button>

              <div className="dropdown-panel hidden group-hover:block">
                <button onClick={() => setDailyReport(true)} className="drop-item">
                  <i className="fa fa-calendar text-blue-500" />
                  Daily report
                </button>
                <button onClick={() => setShowExportModal(true)} className="drop-item">
                  <i className="fa fa-download text-green-600" />
                  Export enquiries
                </button>
              </div>
            </div>

            {/* FILTER */}
            <div className="relative group">
              <button className="action-chip">
                <i className="fa fa-filter text-indigo-600" />
                <span>Filter</span>
                <i className="fa fa-caret-down text-xs opacity-60" />
              </button>

              <div className="dropdown-panel hidden group-hover:block">
                <button onClick={handelFollowUpFilters} className="drop-item">
                  <i className="fa fa-clock-o text-orange-500" />
                  Pending Follow-ups
                </button>
                <button onClick={handelBookmarks} className="drop-item">
                  <i className="fa fa-bookmark text-yellow-500" />
                  Bookmarks
                </button>
                <div className="dropdown-divider" />
                <button onClick={onOpenAdvanceFilter} className="drop-item">
                  <i className="fa fa-sliders text-purple-500" />
                  Advanced
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="relative group">
              <button className="action-chip">
                <i className="fa fa-th-large text-sky-600" />
                <span>Actions</span>
                <i className="fa fa-caret-down text-xs opacity-60" />
              </button>

              <div className="dropdown-panel hidden group-hover:block">
                <button onClick={() => setShowSendSms(true)} className="drop-item">
                  <i className="fa fa-comment text-blue-500" />
                  Send SMS
                </button>
                <button onClick={() => setShowSendEmail(true)} className="drop-item">
                  <i className="fa fa-envelope text-indigo-500" />
                  Send Email
                </button>
                <button
                  className="drop-item"
                  onClick={() => {
                    if (!selectedLeadIds.length) {
                      toast.error('Select at least one record');
                    } else {
                      setShowBulkUpdateDrawer(true);
                    }
                  }}
                >
                  <i className="fa fa-database text-purple-500" />
                  Bulk Update
                </button>

                <div className="dropdown-divider" />

                <button className="drop-item text-rose-500 hover:bg-rose-50">
                  <i className="fa fa-trash" />
                  Delete
                </button>
              </div>
            </div>

            <button
              className="icon-btn"
              title="Settings"
              onClick={() => router.push('/leads/settings')}
            >
              <i className="fa fa-cog" />
            </button>

            <button
              className="icon-btn"
              title="Refresh"
              onClick={() => window.tableRefresh()}
            >
              <i className="fa fa-refresh" />
            </button>

          </div>
      </div>

      {/* KPI BAR */}
      <div className="flex gap-2 px-4 py-2 bg-[#f5f6f8] border-b">
        {[
          [statusCounts.overdue, 'Overdue', 'text-red-600'],
          [statusCounts.todaysFollowUps, "Today's Follow-ups", 'text-amber-500'],
          [statusCounts.newLeads, 'New Leads', 'text-blue-600'],
          [statusCounts.hotLeads, 'Hot Leads', 'text-fuchsia-600'],
          [statusCounts.conversions, 'Conversions this month', 'text-green-600'],
        ].map(([count, label, color], i) => (
          <div
            key={i}
            className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm"
          >
            <div className={`text-xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
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
        .action-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 10px;
            border: 1px solid rgba(15,23,42,0.08);
            background: #fff;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .action-chip:hover {
            background: #f1f5f9;
          }

          .action-chip.primary {
            /*background: linear-gradient(180deg, #0ea5e9, #0284c7);*/
            background: linear-gradient(180deg, #0B5ED7, #084298);
            color: #ffffff;
            border: none;
          }

          .dropdown-panel {
            position: absolute;
            top: 110%;
            right: 0;
            min-width: 190px;
            background: white;
            border-radius: 12px;
            border: 1px solid rgba(15,23,42,0.08);
            box-shadow: 0 10px 30px rgba(2,6,23,0.12);
            padding: 6px;
            z-index: 50;
          }

          .drop-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
          }

          .drop-item:hover {
            background: #f8fafc;
          }

          .dropdown-divider {
            height: 1px;
            background: #e5e7eb;
            margin: 6px 0;
          }

          .icon-btn {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            border: 1px solid rgba(15,23,42,0.06);
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #475569;
          }

          .icon-btn:hover {
            background: #f1f5f9;
          }

      `}</style>
    </>
  );
}
