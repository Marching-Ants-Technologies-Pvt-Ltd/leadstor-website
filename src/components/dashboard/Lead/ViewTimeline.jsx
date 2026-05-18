'use client'
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { MdClose } from "react-icons/md";
import {
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarCheck,
  History,
  Rocket,
} from "lucide-react";
import { xFetch } from "@/utility/xFetch";
import UpdateLead from "@/components/dashboard/Lead/UpdateLead";

const Timeline = ({ leadDetails, isOpen, onClose, xLeads }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [owner, setOwner] = useState([]);

   const fetchOwners = () => {
      xFetch({
            path: '/services/profile/getUsers',
            payload: { basic: 1 }
        })
        .then(data => {
          setOwner(data);
        })
        .catch(error => {
            console.error(`An error occurred while fetching leads`, error);
        });
    }

    useEffect(() => {
      if (isOpen) {
        fetchOwners();
      }
    }, [isOpen]);

    const STATUS_CONFIG = {
      "Invited": {
        type: "info",
        Icon: Rocket,
        color: "#3b82f6",
        ring: "ring-blue-400",
        pill: "bg-blue-50 text-blue-800",
      },
      "Follow Up": {
        type: "warning",
        Icon: CalendarCheck,
        color: "#f59e0b",
        ring: "ring-amber-400",
        pill: "bg-amber-50 text-amber-800",
      },
      "Hot Lead": {
        type: "danger",
        Icon: AlertCircle,
        color: "#ef4444",
        ring: "ring-red-400",
        pill: "bg-red-50 text-red-800",
      },
      "Registered": {
        type: "success",
        Icon: CheckCircle2,
        color: "#10b981",
        ring: "ring-emerald-400",
        pill: "bg-emerald-50 text-emerald-800",
      },
      default: {
        type: "gray",
        Icon: History,
        color: "#6b7280",
        ring: "ring-gray-300",
        pill: "bg-gray-100 text-gray-700",
      },
    };

    const getFollowUpStatus = (datetimeStr, currentStatus) => {
      if (currentStatus !== "Follow Up") return null;

      try {
        // Parse your weird format: "5th-January-2026 18:08:26 PM #1"
        const clean = datetimeStr.replace(/#\d+$/, "").trim();
        const [dayPart, timePart] = clean.split(" ");
        const [dayNum, month, year] = dayPart.replace("th", "").replace("st", "").replace("nd", "").replace("rd", "").split("-");
        const dateStr = `${month} ${dayNum}, ${year} ${timePart}`;
        const followUpDate = new Date(dateStr);

        if (isNaN(followUpDate)) return null;

        const now = new Date();
        const diffMs = followUpDate - now;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMs > 0) {
          // Future
          if (diffDays > 1) return `Follow-up expected in ${diffDays} days`;
          if (diffHours > 0) return `Follow-up expected in ${diffHours} hours`;
          return `Follow-up expected in ${diffMins} minutes`;
        } else {
          // Overdue
          const overdueMins = Math.abs(diffMins);
          const overdueHours = Math.abs(diffHours);
          const overdueDays = Math.abs(diffDays);

          if (overdueDays > 1) return `Follow-up overdue by ${overdueDays} days – please contact`;
          if (overdueHours > 0) return `Follow-up overdue by ${overdueHours} hours – please contact`;
          return `Follow-up overdue by ${overdueMins} minutes – please contact`;
        }
      } catch (e) {
        return null;
      }
    };

    const parseDisplayDate = (key) => {
      // "5th-January-2026 18:08:26 PM #1" → "5 Jan 2026, 18:08"
      try {
        const clean = key.replace(/#\d+$/, "").trim();
        const [dayPart, timePart] = clean.split(" ");
        const [dayNum, month, year] = dayPart.replace(/[a-z]{2}/, "").split("-");
        const shortMonth = month.slice(0, 3);
        const time = timePart.slice(0, 5); // remove seconds
        return `${dayNum} ${shortMonth} ${year}, ${time}`;
      } catch {
        return key;
      }
    };

  // Helper to render remarks with audio player support
  const renderRemarks = (remarks) => {
    if (!remarks) return null;

    // Extract audio source from <source src="">
    const audioMatch = remarks.match(
      /<source[^>]*src="([^"]*)"[^>]*>/i
    );

    if (audioMatch && audioMatch[1]) {

      const audioSrc = audioMatch[1];

      // Remove audio html from text
      const textContent = remarks
        .replace(/<audio[\s\S]*?<\/audio>/gi, "")
        .trim();

      return (
        <div className="space-y-2">
          {textContent && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {textContent}
            </p>
          )}

          <audio controls className="w-full mt-2">
            <source src={audioSrc} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    return (
      <span className="font-medium text-gray-700">
        {remarks}
      </span>
    );
  };

  const handleEditClick = () => {
    setShowUpdatePopup(true);
  };
  useEffect(() => {
    if (isOpen) fetchTimeline();
  }, [isOpen]);

  const fetchTimeline = async () => {
    try {
      const res = await xFetch({
        path: "/services/invite/getCandidateTimeLine",
        payload: { invitationId: leadDetails.invitationId, time: Date.now() },
      });

      if (res && Object.keys(res).length > 0) {
        const entries = Object.entries(res)
          .map(([key, data]) => ({
            datetimeKey: key,
            displayDate: parseDisplayDate(key),
            ...data,
          }))
          .sort((a, b) => {
            // Sort by real date (newest first)
            const dateA = new Date(a.displayDate.replace(",", ""));
            const dateB = new Date(b.displayDate.replace(",", ""));
            return dateB - dateA;
          });

        setTimelineData(entries);
      }
    } catch (e) {
      console.error("Timeline fetch failed", e);
    }
  };
  
  const getUpdatedBy = (value) => {
    if (!value?.updated_by) return "Unknown";

    const updatedById = String(value.updated_by).trim(); 
    if (updatedById === "-1" || updatedById === -1) return "Admin";
    if (updatedById === "-3" || updatedById === -3) return "System";

    if (owner && typeof owner === "object" && !Array.isArray(owner)) {
      const name = owner[updatedById];
      if (name && typeof name === "string" && name.trim()) {
        return name.trim();
      }
    }

    // Fallback
    return "Unknown";
  };

  const headerName = `${leadDetails?.firstName || "Unknown Lead"} ${
    leadDetails?.mobile ? `(${leadDetails.mobile})` : ""
  }`;

  return (
    <>
      <Modal
        isOpen={isOpen && !showUpdatePopup}
        onRequestClose={onClose}
        ariaHideApp={false}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
      >
        <div className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-lg font-semibold text-gray-900">{headerName}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* AI Next Action (if exists) */}
          {leadDetails?.aINextStep && (
            <div className="relative mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
              <div className="absolute -top-2 left-6 rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                AI Next Action
              </div>
              <p className="mt-1 font-medium">{leadDetails.aINextStep}</p>
            </div>
          )}

          {/* Timeline - tighter spacing */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {timelineData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No timeline yet</div>
            ) : (
              timelineData.map((item, index) => {
                const status = item.status || "Action";
                const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
                const { Icon, color, ring, pill } = config;

                const isLast = index === timelineData.length - 1;
                const followUpInfo = getFollowUpStatus(item.datetimeKey, status);
                const updatedBy = getUpdatedBy(item);
                
                return (
                  <div key={item.datetime} className="flex gap-4 relative">
                    {/* Smaller icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full bg-white ring-2 ring-offset-1 ${ring}`}
                      >
                        <Icon size={16} color={color} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Compact card */}
                    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        {/* Date + Status Pill */}
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <span className="text-xs font-medium text-gray-600">
                            {item.displayDate}
                          </span>

                          {item.status && (
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${pill}`}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>

                          {/* Remarks Section */}
                          {item.status && (
                            <div className="mb-1">
                              <p className="text-sm text-gray-500">
                                Status:{" "}
                                <span className="font-medium text-gray-700">
                                  {item.status}
                                </span>
                              </p>
                            </div>
                          )}

                      {/* Remarks Section */}
                      {item.remarks && (
                        <div className="mb-1">
                          <p className="text-sm text-gray-500">
                            Remarks:{" "}
                            {renderRemarks(item.remarks)}
                          </p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="mb-1">
                        <p className="text-sm text-gray-500">
                          Updated by{" "}
                          <span className="font-medium text-gray-700">
                            {updatedBy}
                          </span>
                        </p>
                      </div>

                      {/* Follow-up warning (only relevant for Follow Up) */}
                      {followUpInfo && (
                        <div className="mt-2">
                          <p
                            className={`text-sm font-medium ${
                              followUpInfo.includes("Overdue")
                                ? "text-red-600"
                                : "text-amber-700"
                            }`}
                          >
                            {followUpInfo}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-end">
            <button
              onClick={handleEditClick}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              Edit Lead
            </button>
          </div>
        </div>
      </Modal>

      {showUpdatePopup && (
        <UpdateLead
          selectedLead={leadDetails}
          onCancel={() => {
            setShowUpdatePopup(false);
            onClose();
          }}
          onSuccess={() => {
            setShowUpdatePopup(false);
            onClose();
            xLeads?.();
          }}
        />
      )}
    </>
  );
};

export default Timeline;
