"use client";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

export default function DateTimePicker({ value, onChange }) {
  return (
    <Flatpickr
      value={value ?? null}
      onChange={(dates) => {
        // DO NOT update parent on each click
      }}
      onClose={(dates) => {
        // ✅ update parent ONLY when picker closes
        onChange(dates[0] ?? null);
      }}
      options={{
        enableTime: true,
        altInput: true,
        altFormat: "d M Y • h:i K",
        dateFormat: "Y-m-d H:i",
        minuteIncrement: 5,
        closeOnSelect: false,
        allowInput: true,
      }}
      className="input-crm"
    />
  );
}
