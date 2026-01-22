'use client'

import { useState } from 'react'

export default function FilterModal({
  isOpen,
  onClose,
  options,
  onApply,
  currentFilters = {},
  onReset
}) {
  const [localFilters, setLocalFilters] = useState(currentFilters)

  const handleMultiChange = (field, values) => {
    setLocalFilters(prev => ({ ...prev, [field]: values }))
  }

  const handleTextChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    setLocalFilters({})          
    if (onReset) onReset()
  }

  const renderMultiSelect = (label, field, opts) => {
    const selected = localFilters[field] || []
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
          multiple
          value={selected}
          onChange={(e) => {
            const vals = Array.from(e.target.selectedOptions).map(o => o.value)
            handleMultiChange(field, vals)
          }}
          className="
            block w-full rounded-md border border-gray-300 
            px-3 py-2 text-sm bg-white shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            h-40 overflow-y-auto
          "
        >
          {Object.entries(opts || {}).map(([key, label]) => (
            <option key={key} value={label}>
              {label}
            </option>
          ))}
        </select>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selected.map(val => {
              const lbl = opts[val] || val
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  {lbl}
                  <button
                    type="button"
                    onClick={() => {
                      const newVals = selected.filter(v => v !== val)
                      handleMultiChange(field, newVals)
                    }}
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        )}

        <p className="text-xs text-gray-500">
          Hold Ctrl (Windows) or Cmd (Mac) to select multiple
        </p>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
          <h2 className="text-xl font-semibold">Filter Placement Ready Candidates</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderMultiSelect('Select Status', 'status', options.statuses)}
          {renderMultiSelect('Select Current City', 'location', options.locations)}
          {renderMultiSelect('Select Course', 'course', options.courses)}
          {renderMultiSelect('Select Job Profiles', 'jobProfile', options.job_profiles)}
          {renderMultiSelect('Select Last Designation', 'lastDesignation', options.lastDesignations)}
          {renderMultiSelect('Select Expected Designation', 'expectedDesignation', options.expectedDesignations)}
          {renderMultiSelect('Select Total Experience', 'totalExperience', options.totalExperiences)}
          {renderMultiSelect('Select Functional Experience', 'relevantExperience', options.relevantExperiences)}
          {renderMultiSelect('Select Expected CTC', 'expectedCTC', options.expectedCTCs)}
          {renderMultiSelect('Select Educational Qualification', 'educationalQualification', options.educationalQualifications)}

          {/* Year of Passing - simple input */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Year Of Passing</label>
            <input
              type="text"
              placeholder="e.g. 2020"
              value={localFilters.yearOfPassing || ''}
              onChange={(e) => handleTextChange('yearOfPassing', e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
            <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md transition-colors"
            >
                Reset Filter
            </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}