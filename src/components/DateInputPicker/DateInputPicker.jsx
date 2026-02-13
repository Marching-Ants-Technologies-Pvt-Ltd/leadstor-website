"use client";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import { useRef } from "react";

export default function DateInputPicker({ value, onChange, placeholder = "Select date & time" }) {
  const fpRef = useRef(null);

  // Helper to add OK + Cancel buttons only once
  const addButtons = (selectedDates, dateStr, instance) => {
    if (instance.calendarContainer.querySelector(".custom-buttons")) return;

    const container = document.createElement("div");
    container.className = "custom-buttons";
    container.style.cssText = `
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    `;

    const okBtn = document.createElement("button");
    okBtn.textContent = "OK";
    okBtn.style.cssText = `
      flex: 1;
      padding: 8px 16px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      flex: 1;
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    `;

    // OK
    okBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (instance.selectedDates.length > 0) {
        onChange(instance.selectedDates[0]);
      }
      instance.close();
    });

    // Cancel – the important change
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();       // ← stops the click from bubbling to modal
      e.preventDefault();        // ← helps in some cases
      instance.close();
    });

    container.appendChild(okBtn);
    container.appendChild(cancelBtn);
    instance.calendarContainer.appendChild(container);
  };

  return (
    <>
    <Flatpickr
      ref={fpRef}
      value={value ?? null}
      onChange={() => {
        // intentionally empty → do NOT propagate changes immediately
      }}
      onClose={(selectedDates) => {
        // Optional: you can also confirm here if user closes by clicking outside
        // But with OK/Cancel buttons most users will use those
        // if (selectedDates.length > 0) {
        //   onChange(selectedDates[0]);
        // }
        console.log("Calendar closed. Selected date:", selectedDates[0]);
      }}
      options={{
        enableTime: true,
        time_24hr: false,              // ← shows AM/PM
        altInput: true,
        altFormat: "d M Y • h:i K",    // nice display format
        dateFormat: "Y-m-d H:i",
        minuteIncrement: 5,
        closeOnSelect: false,          // ← very important: don't auto-close
        allowInput: false,             // prevents strange close-on-type behavior
        static: true,                  // better positioning in modals
        onReady: addButtons,           // add buttons when calendar is created
        onOpen: addButtons,            // also add if reopened
        yearSelectorType: "dropdown", // ensures month dropdown too
        minDate: "today"
      }}
      className="input-crm w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      placeholder={placeholder}
    />
    
    <style jsx global>{`
        .flatpickr-current-month .cur-year {
          color: #000 !important;
        }
        .flatpickr-current-month .numInputWrapper {
          background: #fff !important;
          border: 1px solid #cbd5e1 !important;
        }
        .flatpickr-calendar select.cur-year {
          background: white !important;
          color: #111 !important;
          border: 1px solid #9ca3af !important;
          z-index: 9999 !important;
        }
        /* Hour/minute arrows blue */
        .flatpickr-time .numInputWrapper .arrowUp,
        .flatpickr-time .numInputWrapper .arrowDown {
          border-color: #2563eb transparent transparent transparent !important;
        }
      `}</style>
    </>
  );
}