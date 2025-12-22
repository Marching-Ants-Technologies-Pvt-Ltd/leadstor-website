const DateInputPickerStyles = () => (
  <style>{`
    /* Reduce overall calendar width */
    .flatpickr-calendar {
      width: 260px !important;
      border-radius: 10px !important;
      font-family: 'Inter', sans-serif;
    }

    /* Header background color */
    .flatpickr-months {
      background-color: #f1bbea !important;
      border-radius: 10px 10px 0 0 !important;
      padding-top: 6px !important;
      padding-bottom: 6px !important;
    }

    /* Month title text */
    .flatpickr-current-month {
      color: #ffffff !important;
      font-weight: 600 !important;
      font-size: 15px !important;
    }

    /* Arrows inside header */
    .flatpickr-months .flatpickr-prev-month svg,
    .flatpickr-months .flatpickr-next-month svg {
      fill: #ffffff !important;
    }

    /* Weekday bar */
    .flatpickr-weekdays {
      background-color: #f8d7f5 !important;
    }
    .flatpickr-weekday {
      color: #555 !important;
      font-weight: 600 !important;
    }

    /* Selected Date */
    .flatpickr-day.selected,
    .flatpickr-day.startRange,
    .flatpickr-day.endRange {
      background: #f1bbea !important;
      border-color: #f1bbea !important;
      color: white !important;
    }

    /* Hover effect */
    .flatpickr-day:hover {
      background: #fbe6f9 !important;
    }
  `}</style>
);

export default DateInputPickerStyles;
