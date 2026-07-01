'use client'

import { useState, useRef, useEffect } from 'react'

export default function FilterModal({
  isOpen,
  onClose,
  options,
  onApply,
  currentFilters = {},
  onReset,
}) {
  const [localFilters, setLocalFilters] = useState(currentFilters)
  const [openDropdown, setOpenDropdown] = useState(null) // which field is open
  const [searchTerms, setSearchTerms] = useState({})

  const dropdownRefs = useRef({})

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown && !dropdownRefs.current[openDropdown]?.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const toggleDropdown = (field) => {
    setOpenDropdown(prev => prev === field ? null : field)
  }

  const handleSelect = (field, value) => {
    setLocalFilters(prev => {
      const current = prev[field] || []
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) }
      }
      return { ...prev, [field]: [...current, value] }
    })
  }

  const handleRemove = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(v => v !== value),
    }))
  }

  const handleSearch = (field, term) => {
    setSearchTerms(prev => ({ ...prev, [field]: term }))
  }

  const getFilteredOptions = (field, opts) => {
    const term = (searchTerms[field] || '').toLowerCase().trim()
    if (!term) return opts
    return Object.fromEntries(
      Object.entries(opts).filter(([_, label]) => 
        String(label).toLowerCase().includes(term)
      )
    )
  }

  const renderMultiSelect = (label, field, opts) => {
    const selected = localFilters[field] || []
    const filtered = getFilteredOptions(field, opts)
    const isOpen = openDropdown === field

    return (
      <div className="relative space-y-1.5" ref={el => (dropdownRefs.current[field] = el)}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>

        {/* Selected chips + toggle button */}
        <div
          onClick={() => toggleDropdown(field)}
          className={`
            w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg 
            bg-white shadow-sm cursor-pointer flex flex-wrap gap-2 items-center
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}
          `}
        >
          {selected.length === 0 ? (
            <span className="text-gray-400 text-sm">Select options...</span>
          ) : (
            selected.map(val => (
              <span
                key={val}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {val}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleRemove(field, val)
                  }}
                  className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                >
                  ×
                </button>
              </span>
            ))
          )}
          <span className="ml-auto text-gray-400">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerms[field] || ''}
                onChange={e => handleSearch(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Options list */}
            <div className="max-h-52 overflow-y-auto">
              {Object.keys(filtered).length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No matches found
                </div>
              ) : (
                Object.entries(filtered).map(([key, val]) => {
                  const isSelected = selected.includes(val)
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelect(field, val)}
                      className={`
                        px-4 py-2.5 cursor-pointer text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors
                        ${isSelected ? 'bg-blue-50 font-medium' : ''}
                      `}
                    >
                      <span className={`w-5 h-5 flex items-center justify-center rounded border ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                      }`}>
                        {isSelected && '✓'}
                      </span>
                      {val}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({})
    setSearchTerms({})
    if (onReset) onReset()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Filter Placement Ready Candidates</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl leading-none focus:outline-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderMultiSelect('Status', 'status', options.statuses)}
          {renderMultiSelect('Current City', 'currentCity', options.locations)}
          {renderMultiSelect('Course', 'course', options.courses)}
          {renderMultiSelect('Job Profiles', 'jobProfile', options.job_profiles)}
          {renderMultiSelect('Last Designation', 'lastDesignation', options.lastDesignations)}
          {renderMultiSelect('Expected Designation', 'expectedDesignation', options.expectedDesignations)}
          {renderMultiSelect('Total Experience', 'totalExperience', options.totalExperiences)}
          {renderMultiSelect('Functional Experience', 'relevantExperience', options.relevantExperiences)}
          {renderMultiSelect('Expected CTC', 'expectedCTC', options.expectedCTCs)}
          {renderMultiSelect('Educational Qualification', 'educationalQualification', options.educationalQualifications)}
          {renderMultiSelect('Associated Center', 'associatedCenters', options.associatedCenters)}
          {/* Year of Passing */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Year Of Passing</label>
            <input
              type="text"
              placeholder="e.g. 2020"
              value={localFilters.yearOfPassing || ''}
              onChange={e => setLocalFilters(prev => ({ ...prev, yearOfPassing: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-5 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium transition-colors"
          >
            Reset Filter
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}