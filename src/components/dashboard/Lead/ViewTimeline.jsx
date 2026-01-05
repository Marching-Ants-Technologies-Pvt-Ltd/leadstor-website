'use client'
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { MdClose } from "react-icons/md";
import {
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Rocket
} from "lucide-react";
import { Owners } from "@/utility/TinyDB";
import { xFetch } from "@/utility/xFetch";
import UpdateLead from "@/components/dashboard/Lead/UpdateLead";

/* ---------- DEMO FALLBACK DATA ---------- */
const DEMO_TIMELINE = {
  "31 Dec 2025 · 17:20": {
    title: "Call Follow-up Logged",
    remarks: "Call back later",
    updated_by: 2,
    badge: "Follow-up Needed",
    badgeType: "warning",
    icon: "success"
  },
  "31 Dec 2025 · 17:20 #1": {
    title: "Status Updated",
    status: "Follow Up (31 Dec)",
    updated_by: 2,
    badge: "Active",
    badgeType: "info",
    icon: "pin"
  },
  "31 Dec 2025 · 11:59": {
    title: "Call Attempted",
    remarks: "No response",
    updated_by: 2,
    badge: "No Contact",
    badgeType: "danger",
    icon: "call"
  },
  "30 Dec 2025 · 19:36": {
    title: "Lead Created",
    status: "Invited",
    updated_by: -3,
    badge: "Lead Opened",
    badgeType: "success",
    icon: "rocket"
  }
};

/* ---------- ICON MAP ---------- */
const ICONS = {
  success: { Icon: CheckCircle, bg: "#E6F9F0", color: "#10B981" },
  call: { Icon: Phone, bg: "#EEF2FF", color: "#4F46E5" },
  pin: { Icon: Clock, bg: "#F1F5F9", color: "#64748B" },
  rocket: { Icon: Rocket, bg: "#ECFDF5", color: "#16A34A" },
  danger: { Icon: XCircle, bg: "#FEE2E2", color: "#EF4444" },
};

const BADGE_COLORS = {
  warning: "#FEF3C7",
  info: "#E0E7FF",
  danger: "#FEE2E2",
  success: "#DCFCE7",
};

const Timeline = ({ leadDetails, isOpen, onClose, xLeads }) => {
  const [timelineData, setTimelineData] = useState({});
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  useEffect(() => {
    if (isOpen) fetchTimeline();
  }, [isOpen]);

  const fetchTimeline = async () => {
    try {
      const res = await xFetch({
        path: "/services/invite/getCandidateTimeLine",
        payload: { invitationId: leadDetails.invitationId, time: Date.now() },
      });

      // 👇 Fallback to demo if empty
      if (!res || Object.keys(res).length === 0) {
        setTimelineData(DEMO_TIMELINE);
      } else {
        setTimelineData(res);
      }
    } catch {
      setTimelineData(DEMO_TIMELINE);
    }
  };

  const getUpdatedByName = (id) => {
    if (id === -1) return "Admin";
    if (id === -3) return "System";
    const user = Object.entries(Owners).find(([k]) => Number(k) === Number(id));
    return user ? user[1] : "Unknown";
  };

  const header = `${leadDetails.firstName || "shivani jaiswal"} ${
    leadDetails.mobile ? `(${leadDetails.mobile})` : "(06306462395)"
  }`;

  return (
    <>
      <Modal
        isOpen={isOpen && !showUpdatePopup}
        onRequestClose={onClose}
        ariaHideApp={false}
        className="leadstor-modal"
        overlayClassName="modal-overlay"
      >
        {/* HEADER */}
        <div className="timeline-header">
          <span>{header}</span>
          <button onClick={onClose}><MdClose size={20} /></button>
        </div>

        {/* OVERDUE BANNER */}
        <div className="overdue-banner">
          <b>⚠ Follow-up overdue</b>
          <span>Overdue by <b>4h 12m</b> · Recommended: <b>Call now</b></span>
        </div>

        {/* BODY */}
        <div className="timeline-body">
          {Object.entries(timelineData).map(([date, item], idx) => {
            const { Icon, bg, color } = ICONS[item.icon] || ICONS.success;

            return (
              <div className="timeline-row" key={idx}>
                <div className="timeline-icon" style={{ background: bg, color }}>
                  <Icon size={16} />
                </div>

                <div className="timeline-card">
                  <div className="timeline-date">{date}</div>
                  <h4>{item.title}</h4>

                  {item.status && (
                    <p><b>Status:</b> {item.status}</p>
                  )}

                  {item.remarks && (
                    <p><b>Remark:</b> {item.remarks}</p>
                  )}

                  <p className="updated-by">
                    Updated by: {getUpdatedByName(item.updated_by)}
                  </p>

                  <span
                    className="badge"
                    style={{ background: BADGE_COLORS[item.badgeType] }}
                  >
                    {item.badge}
                  </span>
                </div>
              </div>
            );
          })}

          <div className="timeline-footer">
            <button className="btn-primary" onClick={() => setShowUpdatePopup(true)}>
              Edit
            </button>
          </div>
        </div>
      </Modal>

      {showUpdatePopup && (
        <UpdateLead
          selectedLead={leadDetails}
          onCancel={() => setShowUpdatePopup(false)}
          onSuccess={() => {
            setShowUpdatePopup(false);
            onClose();
            xLeads && xLeads();
          }}
        />
      )}

      {/* STYLES */}
      <style>{`
        .leadstor-modal {
          max-width: 900px;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
        }

        .timeline-header {
          padding: 14px 20px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
        }

        .overdue-banner {
          background: #FFF7ED;
          border: 1px solid #FDE68A;
          padding: 10px 16px;
          margin: 16px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }

        .timeline-body {
          padding: 0 16px 20px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .timeline-row {
          display: flex;
          gap: 14px;
          margin-bottom: 16px;
        }

        .timeline-icon {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .timeline-card {
          flex: 1;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .timeline-card h4 {
          margin: 6px 0;
          font-size: 14px;
        }

        .timeline-date {
          font-size: 12px;
          color: #6b7280;
        }

        .updated-by {
          font-size: 12px;
          color: #6b7280;
        }

        .badge {
          display: inline-block;
          margin-top: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
        }

        .timeline-footer {
          text-align: right;
          margin-top: 10px;
        }

        .btn-primary {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default Timeline;
