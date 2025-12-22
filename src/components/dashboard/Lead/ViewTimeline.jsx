import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Owners } from "@/utility/TinyDB";
import { xFetch } from "@/utility/xFetch";
import { MdAccessTime, MdClose } from "react-icons/md";
import UpdateLead from "@/components/dashboard/Lead/UpdateLead";

const Timeline = ({ leadDetails, isOpen, onClose, xLeads }) => {
  const [timelineData, setTimelineData] = useState({});
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

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
            style={{
              backgroundColor: "#C084FC",
              color: "white",
              padding: "10px",
              borderRadius: "50%",
              minWidth: "42px",
              height: "42px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              fontSize: "15px",
            }}
          >
            ⏱
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
        <div
          style={{
            backgroundColor: "#F1BBEA",
            color: "#1E293B",
            padding: "16px 24px",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            fontSize: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          {header}
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#1E293B" }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px", maxHeight: "70vh", overflowY: "auto" }}>
          <ul style={{ padding: 0, margin: 0 }}>{renderTimeline()}</ul>

          <div style={{ textAlign: "right", marginTop: "12px" }}>
            <button
              style={{
                backgroundColor: "#F1BBEA",
                color: "white",
                padding: "10px 18px",
                fontWeight: 600,
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 3px 6px rgba(0,0,0,0.12)",
              }}
              onClick={() => setShowUpdatePopup(true)}
              onMouseEnter={(e) => (e.target.style.background = "#E38CD8")}
              onMouseLeave={(e) => (e.target.style.background = "#F1BBEA")}
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
      <style>{`
          .modal-content{
            padding:0px;
          }
      `}
        </style>
    </>
  );
};

export default Timeline;
