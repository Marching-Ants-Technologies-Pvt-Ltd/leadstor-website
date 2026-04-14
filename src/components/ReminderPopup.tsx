'use client';

import { useEffect, useState, useRef } from "react";
import { useSSE } from "@/utility/useSSE";

export default function ReminderPopup() {
  const [reminders, setReminders] = useState<any[]>([]);
  const processedIds = useRef<Set<number>>(new Set());   // ← Track shown IDs

  useSSE((newReminders) => {
    if (!Array.isArray(newReminders) || newReminders.length === 0) return;

    setReminders((prev) => {
      const updated = [...prev];

      newReminders.forEach((item) => {
        const id = item.invitation_id;

        if (id && !processedIds.current.has(id)) {
          processedIds.current.add(id);
          updated.push(item);
        }
      });

      return updated;
    });
  });

  if (reminders.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] space-y-3 max-h-[70vh] overflow-auto pr-2">
      {reminders.map((item, i) => (
        <div
          key={item.invitation_id || i}
          className="bg-white shadow-xl border-l-4 border-blue-500 p-5 rounded-2xl w-80 relative animate-in slide-in-from-right"
        >
          <button
            onClick={() => {
              setReminders((prev) => prev.filter((_, idx) => idx !== i));
              if (item.invitation_id) processedIds.current.delete(item.invitation_id);
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl leading-none"
          >
            ×
          </button>

          <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
            🔔 {item.title}
          </div>

          <div className="text-sm text-gray-600 mt-2">
            {item.message}
          </div>

        </div>
      ))}
    </div>
  );
}