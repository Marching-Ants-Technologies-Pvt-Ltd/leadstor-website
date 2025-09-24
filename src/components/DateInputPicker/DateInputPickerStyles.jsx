const DateInputPickerStyles = () => (
  <style>{`
    .minimal-datepicker-popper {
      z-index: 1002;
    }
    .minimal-datepicker-wrapper input:hover {
      border-color: #bbb !important;
    }
    .minimal-datepicker-wrapper input:focus {
      border-color: #007bff !important;
    }
    .react-datepicker__header {
      background: #f8f9fa !important;
      border-bottom: 1px solid #e9ecef !important;
      border-radius: 12px 12px 0 0 !important;
      padding: 16px 20px 8px 20px !important;
      position: relative !important;
      min-height: 60px !important;
    }
    .react-datepicker__current-month {
      display: none !important;
    }
    .react-datepicker__month-year-container {
      display: flex !important;
      flex-direction: row !important;
      align-items: flex-start !important;
      justify-content: flex-start !important;
      gap: 4px !important;
      margin-bottom: 0 !important;
      margin-top: 0 !important;
      position: absolute !important;
      top: 16px !important;
      left: 20px !important;
      z-index: 2;
    }
    .react-datepicker__day--outside-month {
      visibility: hidden !important;
    }
    .react-datepicker__navigation--previous,
    .react-datepicker__navigation--next {
      display: none !important;
    }
    .react-datepicker__month-select,
    .react-datepicker__year-select {
      min-width: 90px !important;
      max-width: 90px !important;
      width: 90px !important;
    }
  `}</style>
);

export default DateInputPickerStyles;
