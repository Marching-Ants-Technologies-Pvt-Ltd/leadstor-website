'use client'
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Owners } from "@/utility/TinyDB";
import { xFetch } from "@/utility/xFetch";
import { MdAccessTime, MdClose } from "react-icons/md";
import UpdateLead from "@/components/dashboard/Lead/UpdateLead";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const Timeline = ({ leadDetails, isOpen, onClose, xLeads }) => {
  const [timelineData, setTimelineData] = useState({});
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const STATUS_CONFIG = {
    followup: {
      gradient: "linear-gradient(135deg, #60A5FA, #3B82F6)",
      shadow: "rgba(59,130,246,0.35)",
      Icon: Clock,
    },
    done: {
      gradient: "linear-gradient(135deg, #34D399, #10B981)",
      shadow: "rgba(16,185,129,0.35)",
      Icon: CheckCircle,
    },
    missed: {
      gradient: "linear-gradient(135deg, #F87171, #EF4444)",
      shadow: "rgba(239,68,68,0.35)",
      Icon: XCircle,
    },
  };
    const { gradient, shadow, Icon } =
    STATUS_CONFIG[status] || STATUS_CONFIG.done;
  useEffect(() => {
    if (isOpen) fetchTimeline();
  }, [isOpen]);

  const fetchTimeline = async () => {
    try {
      const response = await xFetch({
        path: "/services/invite/getCandidateTimeLine",
        payload: { invitationId: leadDetails.invitationId, time: Date.now() },
      });
      setTimelineData(response);
    } catch (err) {
      console.error("Timeline error", err);
    }
  };

  const getUpdatedByName = (id) => {
    if (id === -1) return "Admin";
    if (id === -3) return "System";
    const user = Object.entries(Owners).find(([key]) => Number(key) === Number(id));
    return user ? user[1] : "Unknown";
  };

  const renderTimeline = () => {
    const size = Object.keys(timelineData).length;
    let i = 0;

    return Object.entries(timelineData).map(([dateTime, value], index) => {
      i++;
      const updatedBy = getUpdatedByName(value.updated_by);
      const isEven = i % 2 === 0;

      return (
        <li
          key={index}
          style={{
            listStyle: "none",
            marginBottom: "20px",
            display: "flex",
            flexDirection: isEven ? "row-reverse" : "row",
            gap: "12px",
          }}
        >
          {/* Badge */}
        <div
          className="activity-icon"
          style={{
            background: gradient,
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 14px ${shadow}`,
          }}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>


          {/* Card */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              flex: 1,
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              <MdAccessTime size={18} style={{ color: "#64748B", marginRight: "6px" }} />
              <small style={{ color: "#475569" }}>{dateTime}</small>
            </div>

            <div style={{ fontSize: "14px", color: "#1E293B" }}>
              {value.status && <p><b>Status:</b> {value.status}</p>}
              {value.remarks && <p><b>Remarks:</b> {value.remarks}</p>}
              {value.updated_by != null && (
                <>
                  {i === size && <p><b>Lead Initiated by:</b> {updatedBy}</p>}
                  <p><b>Updated By:</b> {updatedBy}</p>
                </>
              )}
            </div>
          </div>
        </li>
      );
    });
  };

  const header = `${leadDetails.firstName || ""} ${leadDetails.mobile ? `(${leadDetails.mobile})` : ""}`;

  return (
    <>
      {/* TIMELINE POPUP */}
      <Modal
        isOpen={isOpen && !showUpdatePopup}
        onRequestClose={onClose}
        ariaHideApp={false}
        overlayClassName="modal-overlay"
        className="modal-content leadstor-modal"
      >
        {/* HEADER */}
        <div className="timeline-header">
          <div className="timeline-title">{header}</div>
          <button
            onClick={onClose}
            className="timeline-close-btn"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="timeline-body">
          <ul className="timeline-list">{renderTimeline()}</ul>

          <div className="timeline-footer">
            <button
              className="btn-primary-crm"
              onClick={() => setShowUpdatePopup(true)}
            >
              Edit
            </button>
          </div>
        </div>
      </Modal>

      {/* UPDATE POPUP */}
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
        .modal-content {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        }

        /* HEADER – SAME AS UPDATE LEAD */
        .timeline-header {
          background: linear-gradient(135deg, #e8f1fb, #f8fbff);
          color: #0f172a;
          padding: 14px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .timeline-title {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }

        .timeline-close-btn {
          height: 32px;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: #475569;
          cursor: pointer;
          transition: 0.2s;
        }

        .timeline-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* BODY */
        .timeline-body {
          padding: 20px;
          max-height: 70vh;
          overflow-y: auto;
        }

        .timeline-list {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        /* FOOTER */
        .timeline-footer {
          text-align: right;
          margin-top: 16px;
        }

        /* SAME PRIMARY BUTTON AS UPDATE LEAD */
        .btn-primary-crm {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          padding: 9px 22px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(37,99,235,.25);
          transition: all .2s ease;
        }

        .btn-primary-crm:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(37,99,235,.35);
        }
        .leadstor-modal {
          width: 100%;
          max-width: 900px;     /* ⬅ increase this */
          max-height: 120vh;
          margin: auto;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          
        }
        @media (max-width: 1024px) {
          .leadstor-modal {
            max-width: 95%;
          }
        }

      `}</style>
    </>
  );

};

export default Timeline;
