import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Corporate, User, Test, Owners } from "@/utility/TinyDB";
import { xFetch } from "@/utility/xFetch";
import { MdAccessTime, MdClose } from "react-icons/md";
import UpdateLead from "@/components/dashboard/Lead/UpdateLead"; // <-- ensure this import path is correct

const Timeline = ({ leadDetails, isOpen, onClose, xLeads }) => {
  const [timelineData, setTimelineData] = useState({});
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTimeline();
    }
  }, [isOpen]);

  const fetchTimeline = async () => {
    try {
      const response = await xFetch({
        path: "/services/invite/getCandidateTimeLine",
        payload: {
          invitationId: leadDetails.invitationId,
          time: new Date().getTime(),
        },
      });
      setTimelineData(response);
    } catch (error) {
      console.error("Error fetching timeline", error);
    }
  };

  const getUpdatedByName = (updated_by) => {
    let owner = {};
    if (Object.keys(Owners).length > 0) {
      owner = Object.entries(Owners).map(([key, value]) => ({
        key,
        value,
      }));
    }

    if (updated_by === -1) return "Admin";
    if (updated_by === -3) return "System";

    const user = owner.find((u) => Number(u.key) === Number(updated_by));
    return user ? user.value : "Unknown";
  };

  const renderTimeline = () => {
    let i = 0;
    const size = Object.keys(timelineData).length;

    return Object.entries(timelineData).map(([dateTime, value], index) => {
      i++;
      const isInverted = i % 2 === 0;
      const updatedBy = getUpdatedByName(value.updated_by);

      return (
        <li
          key={index}
          className={isInverted ? "timeline-inverted" : ""}
          style={{
            listStyle: "none",
            marginBottom: "20px",
            display: "flex",
            flexDirection: isInverted ? "row-reverse" : "row",
            alignItems: "flex-start",
          }}
        >
          <div
            className="timeline-badge"
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "10px",
              borderRadius: "50%",
              minWidth: "40px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            ⏱
          </div>

          <div
            className="timeline-panel"
            style={{
              border: "1px solid #e5e7eb",
              padding: "16px",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              width: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="timeline-heading"
              style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
            >
              <MdAccessTime style={{ color: "#6b7280", marginRight: "8px" }} />
              <small style={{ color: "#6b7280", fontSize: "14px" }}>{dateTime}</small>
            </div>

            <div className="timeline-body" style={{ color: "#374151", fontSize: "14px" }}>
              {value.status && (
                <p>
                  <strong>Status:</strong> {value.status}
                </p>
              )}
              {value.remarks && (
                <p>
                  <strong>Remarks:</strong> {value.remarks}
                </p>
              )}

              {value.updated_by != null && (
                <>
                  {i === size && (
                    <p>
                      <strong>Lead Initiated by:</strong> {updatedBy}
                    </p>
                  )}
                  <p>
                    <strong>Updated By:</strong> {updatedBy}
                  </p>
                </>
              )}
            </div>
          </div>
        </li>
      );
    });
  };

  const header = `${leadDetails.firstName || ""} ${
    leadDetails.mobile ? `(${leadDetails.mobile})` : ""
  }`;

  return (
    <>
      {/* TIMELINE POPUP */}
      <Modal
        isOpen={isOpen && !showUpdatePopup}
        onRequestClose={onClose}
        contentLabel="Candidate Timeline"
        ariaHideApp={false}
        overlayClassName="modal-overlay"
        className="modal-content"
      >
        <div
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "16px 24px",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>{header}</h2>

          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div style={{ padding: "20px" }}>
          <ul style={{ padding: 0 }}>{renderTimeline()}</ul>

          <div style={{ textAlign: "right", marginTop: "10px" }}>
            <button
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedCandidate(leadDetails);
                setShowUpdatePopup(true);
              }}
            >
              Update
            </button>
          </div>
        </div>
      </Modal>

      {/* UPDATE POPUP – TIMELINE POPUP AUTO CLOSES */}
      {showUpdatePopup && (
        <UpdateLead
          selectedLead={selectedCandidate}
          onCancel={() => {
            setShowUpdatePopup(false);
          }}
          onSuccess={() => {
            setShowUpdatePopup(false);
            onClose(); // close timeline popup
            xLeads && xLeads(); // refresh parent table
          }}
        />
      )}
    </>
  );
};

export default Timeline;
