'use client';

import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Select an option',
  className = '',
  optionClassName = '',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (option) => {
    setSelectedValue(option);
    setIsOpen(false);
    if (onChange) {
      onChange(option);
    }
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
    }
  };

  const handleOptionKeyDown = (event, option) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSelect(option);
        break;
    }
  };

  const getDisplayValue = () => {
    if (!selectedValue) return placeholder;
    
    // Handle object options with label/value structure
    if (typeof selectedValue === 'object' && selectedValue !== null) {
      return selectedValue.label || selectedValue.name || selectedValue.value || selectedValue.toString();
    }
    
    return selectedValue.toString();
  };

  const isSelected = (option) => {
    if (typeof option === 'object' && typeof selectedValue === 'object' && 
        option !== null && selectedValue !== null) {
      // Compare by value property if both are objects
      if ('value' in option && 'value' in selectedValue) {
        return option.value === selectedValue.value;
      }
      // Compare by string representation if no value property
      return JSON.stringify(option) === JSON.stringify(selectedValue);
    }
    return option === selectedValue;
  };

  const getOptionDisplay = (option) => {
    if (typeof option === 'object' && option !== null) {
      return option.label || option.name || option.value || option.toString();
    }
    return option.toString();
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <div
        ref={triggerRef}
        className={`w-full h-9 px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-700 flex items-center justify-between cursor-pointer select-none focus:outline-none focus:border-gray-400 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span 
          className={`${selectedValue ? 'text-gray-700' : 'text-gray-500'} truncate`}
        >
          {getDisplayValue()}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } text-gray-500 flex-shrink-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && !disabled && (
        <div
          className="absolute left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg max-h-48 overflow-y-auto z-50 custom-select-scrollbar"
          style={{
            top: '100%',
            marginTop: '-1px',
            borderTop: 'none',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
          role="listbox"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <div
                key={index}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-700 font-medium text-sm flex items-center min-h-[2.25rem] ${
                  isSelected(option) ? 'bg-blue-50 text-blue-700' : ''
                } ${optionClassName}`}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                tabIndex={0}
                role="option"
                aria-selected={isSelected(option)}
              >
                {getOptionDisplay(option)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

// Add custom scrollbar styles
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Check if styles are already added
  if (!document.querySelector('#custom-select-styles')) {
    const style = document.createElement('style');
    style.id = 'custom-select-styles';
    style.innerHTML = `
      .custom-select-scrollbar::-webkit-scrollbar {
        width: 6px;
        background: transparent;
      }
      .custom-select-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 4px;
      }
      .custom-select-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }
      .custom-select-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #e5e7eb transparent;
      }
    `;
    document.head.appendChild(style);
  }
}