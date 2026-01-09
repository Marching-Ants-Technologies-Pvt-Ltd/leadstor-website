'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  LeadFilters,
  LeadsCurrentPage,
  User,
  Corporate,
  TotalLeads, LeadSearch 
} from '@/utility/TinyDB';
import ManualCandidate from '@/components/dashboard/Lead/ManualCandidate.jsx';
import SendEmailModal from '@/components/dashboard/Lead/SendEmailModal.jsx';
import BulkUpdateDrawer from '@/components/dashboard/Lead/BulkUpdateDrawer';
import DailyReportModal from '@/components/dashboard/Lead/DailyReportModal.jsx';
import ExportEnquiriesModal from '@/components/dashboard/Lead/ExportEnquiriesModal.jsx';
import { xFetch } from '@/utility/xFetch';

export default function LeadsMenu({
  onOpenAdvanceFilter,
  leads = [],
  selectedLeadIds = [],
  onDownloadStart,
  onDownloadProgress,
  onDownloadEnd,
  onDownloadCancel,
  setCancelExportFunction,
  setOpenAddLead,
  onDeleteSelected
}) {
  const router = useRouter();

  /* ---------- UI STATE ---------- */
  const [openMenu, setOpenMenu] = useState(null); // export | filter | actions
  const menuRef = useRef(null);

  const [showManual, setShowManual] = useState(false);
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [showBulkUpdateDrawer, setShowBulkUpdateDrawer] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [dailyReport, setDailyReport] = useState(false);

  const [statusCounts, setStatusCounts] = useState({
    overdue: 0,
    todaysFollowUps: 0,
    newLeads: 0,
    hotLeads: 0,
    conversions: 0,
  });
  const [search, setSearch] = useState(LeadSearch.value());

  /* ---------- CLICK OUTSIDE ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ---------- HANDLERS ---------- */
  const handleAddLead = () => {
    if (setOpenAddLead) setOpenAddLead(true);
    else setShowManual(true);
  };
  const [refreshing, setRefreshing] = useState(false);

  const refreshLeadPage = () => {
    if (refreshing) return;
    setRefreshing(true);
    window.refreshLeadPage?.();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handelFollowUpFilters = () => {
    let today = new Date().toString().split(' ');
    today = `${today[2]}-${today[1]}-${today[3]}`;
    LeadFilters.reset();
    LeadFilters.setValue([{ title: 'FollowUps', value: today, query: 'followupDate' }]);
    LeadsCurrentPage.setValue(1);
    window.tableRefresh();
    setOpenMenu(null);
  };

  const handelBookmarks = () => {
    LeadFilters.reset();
    LeadFilters.setValue([{ title: 'Bookmarks', value: 1, query: 'bookmarkLeads' }]);
    LeadsCurrentPage.setValue(1);
    window.tableRefresh();
    setOpenMenu(null);
  };

  const getLeadStatusSummary = async() => {
      const res = await xFetch({
        path: `/services/dashboard/getLeadStatusSummary?userId=${User?._id}`,
      });
      if (!res) return;
      setStatusCounts({
        overdue: res.data.overdue || 0,
        todaysFollowUps: res.data.todaysFollowUps || 0,
        newLeads: res.data.newLeads || 0,
        hotLeads: res.data.hotLeads || 0,
        conversions: res.data.conversions || 0,
      });
    }

  /* ---------- SELECTED EMAILS ---------- */
  const selectedLeadEmails = leads
    .filter(l => selectedLeadIds.includes(l.invitationId))
    .map(l => l.emailId)
    .filter(Boolean);

  /* ---------- STATUS COUNTS ---------- */

  useEffect(() => {
    window.refreshLeadMenu = () => {
      getLeadStatusSummary();
    };

    return () => {
      delete window.refreshLeadMenu;
    };
  }, []);

  useEffect(() => {
    getLeadStatusSummary();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      LeadSearch.setValue(search);
      LeadsCurrentPage.setValue(1);
      window.tableRefresh?.();
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        {/* SEARCH */}
        <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2 w-[300px] ">
          <i className="fa fa-search text-blue-400 text-sm" />
          <input
            placeholder="Search by name / email / mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2" ref={menuRef}>
          <button onClick={handleAddLead} className="btn-primary-crm action-chip">
            <i className="fa fa-user-plus" />
            Add
          </button>

          {/* EXPORT */}
          <div className="relative">
            <button
              className="action-chip"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === 'export' ? null : 'export');
              }}
            >
              <i className="fa fa-file-excel-o text-emerald-600" />
              Export
              <i className="fa fa-caret-down text-xs opacity-60" />
            </button>

            {openMenu === 'export' && (
              <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
                <button className="drop-item" onClick={() => setDailyReport(true)}>
                  <i className="fa fa-calendar text-blue-500" />
                  Daily report
                </button>
                <button className="drop-item" onClick={() => setShowExportModal(true)}>
                  <i className="fa fa-download text-green-600" />
                  Export enquiries
                </button>
              </div>
            )}
          </div>

          {/* FILTER */}
          <div className="relative">
            <button
              className="action-chip"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === 'filter' ? null : 'filter');
              }}
            >
              <i className="fa fa-filter text-indigo-600" />
              Filter
              <i className="fa fa-caret-down text-xs opacity-60" />
            </button>

            {openMenu === 'filter' && (
              <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
                <button className="drop-item" onClick={handelFollowUpFilters}>
                  <i className="fa fa-clock-o text-orange-500" />
                  Pending Follow-ups
                </button>
                <button className="drop-item" onClick={handelBookmarks}>
                  <i className="fa fa-bookmark text-yellow-500" />
                  Bookmarks
                </button>
                <div className="dropdown-divider" />
                <button className="drop-item" onClick={onOpenAdvanceFilter}>
                  <i className="fa fa-sliders text-purple-500" />
                  Advanced
                </button>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="relative">
            <button
              className="action-chip"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === 'actions' ? null : 'actions');
              }}
            >
              <i className="fa fa-th-large text-sky-600" />
              Actions
              <i className="fa fa-caret-down text-xs opacity-60" />
            </button>

            {openMenu === 'actions' && (
              <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
                {selectedLeadIds.length > 0 && (
                  <button
                    className="drop-item flex items-center gap-2 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onDeleteSelected(); 
                      setOpenMenu(null);
                    }}
                  >
                    <i className="fa fa-trash" />
                    Delete Invite ({selectedLeadIds.length})
                  </button>
                )}
                <button className="drop-item" onClick={() => setShowSendEmail(true)}>
                  <i className="fa fa-envelope text-indigo-500" />
                  Send Email
                </button>
                <button
                  className="drop-item"
                  onClick={() => {
                    if (!selectedLeadIds.length) toast.error('Select at least one record');
                    else setShowBulkUpdateDrawer(true);
                  }}
                >
                  <i className="fa fa-database text-purple-500" />
                  Bulk Update
                </button>
              </div>
            )}
          </div>

          <button className="icon-btn" onClick={() => router.push('/leads/settings')}>
            <i className="fa fa-cog" />
          </button>
          <button className={`icon-btn refresh-btn ${refreshing ? 'spinning' : ''}`} onClick={() => refreshLeadPage()}>
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
          <div key={i} className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
            <div className={`text-xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* MODALS */}
      {showManual && <ManualCandidate onCancel={() => setShowManual(false)} />}
      {showSendEmail && (
        <SendEmailModal
          isOpen
          onClose={() => setShowSendEmail(false)}
          ids={selectedLeadIds}
          emails={selectedLeadEmails}
          corporateId={User?.corporateId}
        />
      )}
      {showBulkUpdateDrawer && (
        <BulkUpdateDrawer open onClose={() => setShowBulkUpdateDrawer(false)} />
      )}
      {dailyReport && <DailyReportModal isOpen onClose={() => setDailyReport(false)} />}
      {showExportModal && (
        <ExportEnquiriesModal
          isOpen
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
        .action-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15,23,42,0.08);
          font-size: 13px;
          cursor: pointer;
        }
        .action-chip.primary {
          background: linear-gradient(180deg, #0b5ed7, #084298);
          color: #fff;
          border: none;
        }
        .dropdown-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 6px;
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
        }
        .refresh-btn i {
          transition: transform 0.2s ease;
        }

        .refresh-btn.spinning i {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .refresh-btn.spinning {
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
