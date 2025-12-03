"use client";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // base theme
import { useEffect, useState } from "react";
import "./DateInputPickerStyles.jsx";

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
}) {
  const [dateValue, setDateValue] = useState(value ? new Date(value) : null);

  return (
    <Flatpickr
      value={dateValue}
      onChange={(date) => {
        setDateValue(date);
        onChange(date[0] ? date[0].toISOString() : "");
      }}
      options={{
        enableTime: true,
        dateFormat: "d-M-Y H:i",
        time_24hr: false,
        minuteIncrement: 5,
        allowInput: false,
        altInput: true,
        altFormat: "d M Y • h:i K",
        nextArrow: "→",
        prevArrow: "←",
      }}
      className="w-full px-3 py-2 border rounded-lg text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
    />
  );
}
