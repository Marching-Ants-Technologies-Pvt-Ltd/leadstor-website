const DateInputPickerStyles = () => (
  <style>{`
  .flatpickr-calendar {
    border-radius: 12px !important;
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12) !important;
    font-family: "Inter", system-ui, sans-serif !important;
    padding: 6px !important;
  }

  .flatpickr-months {
    padding: 8px 0 !important;
  }

  .flatpickr-monthDropdown-months,
  .flatpickr-yearDropdown-years {
    border-radius: 8px !important;
    padding: 6px !important;
    font-size: 14px !important;
  }

  .flatpickr-day {
    border-radius: 8px !important;
    margin: 2px !important;
  }

  .flatpickr-day.selected {
    background: #1a73e8 !important; /* HubSpot blue */
    color: #fff !important;
  }

  .flatpickr-time input {
    border-radius: 8px !important;
    border: 1px solid #dfe3eb !important;
    padding: 6px !important;
  }

  .flatpickr-time {
    border-top: 1px solid #eee !important;
    padding: 8px !important;
  }

  .flatpickr-confirm, .flatpickr-cancel {
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 8px 0 !important;
  }

  .flatpickr-confirm {
    background: #1a73e8 !important;
    color: white !important;
  }

  .flatpickr-cancel {
    background: #f1f3f4 !important;
    color: #333 !important;
  }

  `}</style>
);

export default DateInputPickerStyles;
