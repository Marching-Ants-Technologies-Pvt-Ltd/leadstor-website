'use client';

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import Timeline from "@/components/dashboard/Lead/ViewTimeline";
import { Test } from "@/utility/TinyDB";
import { useSSE } from "@/utility/useSSE";
import { xFetch } from "@/utility/xFetch";
import { useFormState } from "react-dom";

export default function ReminderPopup() {
  const [reminders, setReminders] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [openingInvitationId, setOpeningInvitationId] = useState(null);
  const processedIds = useRef(new Set());

  useSSE((newReminders) => {
    if (!Array.isArray(newReminders) || newReminders.length === 0) return;

    setReminders((prev) => {
      const updated = [...prev];

      newReminders.forEach((item) => {
        const id = Number(item?.invitation_id);
        const existingIndex = updated.findIndex((reminder) => Number(reminder.invitation_id) === id);

        if (existingIndex !== -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...item,
          };
          return;
        }

        if (id) {
          processedIds.current.add(id);
        }
        updated.push(item);
      });

      return updated;
    });
  });

  const dismissReminder = (index, invitationId) => {
    setReminders((prev) => prev.filter((_, idx) => idx !== index));

    if (invitationId) {
      processedIds.current.delete(invitationId);
    }
  };

  const markAsShown = async (invitationId) => {
    try {
      await xFetch({
        path: "/services/invite/markShownForNotification",
        method: "POST",
        payload: { invitationId },
      });
    } catch (err) {
      console.error("Failed to mark as shown", err);
    }
  };

  const openTimeline = async (item, index) => {
    const invitationId = Number(item.invitation_id);

    if (!invitationId || openingInvitationId === invitationId) {
      return;
    }

    setOpeningInvitationId(invitationId);

    const fallbackLead = {
      invitationId,
      firstName: item.firstName || item.name || item.title || "Reminder",
      mobile: item.mobile || "",
      aINextStep: item.message || "",
    };

    try {
      let leadDetails = fallbackLead;

      try {
        const response = await xFetch({
          path: "/services/invite/getEnquiry",
          payload: {
            invitationId,
            ...(Test?.type ? { testType: Test.type } : {}),
          },
        });

        if (response && typeof response === "object") {
          leadDetails = {
            ...fallbackLead,
            ...response,
            invitationId: response.invitationId || invitationId,
          };
        }
      } catch (err) {
        console.error("Failed to fetch lead before opening timeline", err);
      }

      setSelectedLead(leadDetails);
      setIsTimelineOpen(true);
      dismissReminder(index, invitationId);
      markAsShown(invitationId);
    } finally {
      setOpeningInvitationId(null);
    }
  };

  return (
    <>
      {reminders.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[9999] space-y-3 max-h-[70vh] overflow-auto pr-2">
          {reminders.map((item, i) => {
            const invitationId = Number(item.invitation_id);
            const isOpening = openingInvitationId === invitationId;

            return (
              <div
                key={item.invitation_id || i}
                role="button"
                tabIndex={0}
                onClick={() => openTimeline(item, i)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTimeline(item, i);
                  }
                }}
                className={`bg-white shadow-xl border-l-4 border-blue-500 p-5 rounded-2xl w-80 relative animate-in slide-in-from-right transition cursor-pointer ${
                  isOpening ? "opacity-70 pointer-events-none" : "hover:shadow-2xl hover:-translate-y-0.5"
                }`}
              >
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    dismissReminder(i, invitationId);

                    if (invitationId) {
                      markAsShown(invitationId);
                    }
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl leading-none"
                  aria-label="Close reminder"
                >
                  x
                </button>

                <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  {item.title}
                </div>

                <div className="text-sm text-gray-600 mt-2">
                  {item.message}
                </div>

                 <div className="mt-4">
                     <button className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-lg shadow-sm transition">
                       {isOpening ? "Opening..." : "Open Lead"}
                    </button>
                  </div>
              </div>
            );
          })}
        </div>
      )}

      {isTimelineOpen && selectedLead && (
        <Timeline
          leadDetails={selectedLead}
          isOpen={isTimelineOpen}
          onClose={() => {
            setIsTimelineOpen(false);
            setSelectedLead(null);
          }}
        />
      )}
    </>
  );
}
