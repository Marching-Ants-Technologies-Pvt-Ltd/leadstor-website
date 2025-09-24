"use client";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomSelect from "@/components/CustomSelect";
import DateInputPickerStyles from "./DateInputPickerStyles";

const DateInputPicker = ({ value, onChange, placeholder = "Select date", isTimeInterval=false}) => {
  const [show, setShow] = useState(false);
  const ref = useRef();
  const today = new Date();
  const minDate = new Date(2000, 0, 1);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = [];
  for (let y = today.getFullYear(); y >= minDate.getFullYear(); y--) {
    years.push(y);
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) => onChange(date ? date.toISOString() : "")}
        minDate={minDate}
        maxDate={today}
        placeholderText={placeholder}
        dateFormat="dd-MMM-yyyy HH:mm"
        className="minimal-date-input"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        showTimeSelect={isTimeInterval}
        timeFormat="HH:mm"
        timeIntervals={1}
        popperPlacement="bottom-start"
        popperClassName="minimal-datepicker-popper"
        wrapperClassName="minimal-datepicker-wrapper"
        renderCustomHeader={({ date, changeYear, changeMonth }) => (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, marginTop: 4 }}>
            <CustomSelect
              options={months}
              value={months[date.getMonth()]}
              onChange={(month) => changeMonth(months.indexOf(month))}
              placeholder="Month"
              className="w-28"
            />
            <CustomSelect
              options={years}
              value={date.getFullYear()}
              onChange={changeYear}
              placeholder="Year"
              className="w-24"
            />
          </div>
        )}
        customInput={
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              readOnly
              value={
                value
                  ? new Date(value).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
              placeholder={placeholder}
              style={{
                width: "100%",
                padding: "10px 12px",
                paddingRight: "40px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                background: "white",
                color: "#333",
                cursor: "pointer",
                outline: "none",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "#999",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        }
      />

      {/* Styles moved into a separate component */}
      <DateInputPickerStyles />
    </div>
  );
};

export default DateInputPicker;
