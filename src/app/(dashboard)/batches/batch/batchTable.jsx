// BatchTable.tsx
'use client'

import { useState } from 'react'

export default function BatchTable({
  rows = [],
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onViewDetails,
  onAssignTrainer,
  onAssignCandidates,
  onBatchAttendance,
  onCandidateAttendance,
  onTopicsManagement,
  onCopyTopics
}) {
  const toggleRow = (id) => {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id]
    )
  }

  const toggleAll = (checked) => {
    onSelectionChange(checked ? rows.map(r => r.batchId) : [])
  }

  const allSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.batchId))

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full text-[13px] border-collapse" id="labelTable">
        <thead className="bg-slate-100 text-gray-700">
            <tr className="border-b">
            <th className="px-3 py-2.5 w-10 text-center">
                <input
                type="checkbox"
                checked={allSelected}
                onChange={e => toggleAll(e.target.checked)}
                />
            </th>
            <th className="px-3 py-2.5 text-left font-medium">Course Name</th>
            <th className="px-3 py-2.5 text-left font-medium">Batch Name</th>
            <th className="px-3 py-2.5 text-left font-medium">From</th>
            <th className="px-3 py-2.5 text-left font-medium">To</th>
            <th className="px-3 py-2.5 text-left font-medium">Start Date</th>
            <th className="px-3 py-2.5 text-left font-medium">End Date</th>
            <th className="px-3 py-2.5 text-left font-medium">Max Size</th>
            <th className="px-3 py-2.5 text-left font-medium">Status</th>
            <th className="px-3 py-2.5 text-left font-medium">Progress %</th>
            <th className="px-3 py-2.5 text-left font-medium">Fee Payment %</th>
            <th className="px-3 py-2.5 text-left font-medium">Actions</th>
            </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
            {rows.map(item => (
            <tr key={item.batchId} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2.5 text-center">
                <input
                    type="checkbox"
                    checked={selectedIds.includes(item.batchId)}
                    onChange={() => toggleRow(item.batchId)}
                />
                </td>

                <td className="px-3 py-2.5 font-medium text-gray-800">
                {item.labelName || '—'}
                </td>

                <td className="px-3 py-2.5 font-medium text-gray-800">
                <div className="flex items-center gap-2">
                    {item.batchName || '—'}
                    <button
                    onClick={() => onEdit(item)}
                    title="Edit batch"
                    className="text-blue-600 hover:text-blue-800"
                    >
                    ✏️
                    </button>
                </div>
                </td>

                <td className="px-3 py-2.5 text-gray-600">{item.startTime || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.endTime || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.batchStartDate || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.batchEndDate || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.batchTotalAllowedCount || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.status || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.batchProgress || '—'}</td>
                <td className="px-3 py-2.5 text-gray-600">{item.feePayment || '—'}</td>

                <td className="px-4 py-3">
                <div className="flex items-center gap-3 text-gray-600">
                    <button
                    title="View Details"
                    className="hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition"
                    onClick={() => onViewDetails(item)}
                    >
                    <i className="ri-eye-line"></i>
                    </button>

                    <button
                    title="Assign Trainer"
                    className="hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition"
                    onClick={() => onAssignTrainer(item)}
                    >
                    <i className="ri-user-add-line"></i>
                    </button>

                    <button
                    title="Assign Candidates"
                    className="hover:text-green-600 p-1 rounded hover:bg-green-50 transition"
                    onClick={() => onAssignCandidates(item)}
                    >
                    <i className="ri-group-line"></i>
                    </button>

                    <button
                    title="Batch Attendance Report"
                    className="hover:text-purple-600 p-1 rounded hover:bg-purple-50 transition"
                    onClick={() => onBatchAttendance(item)}
                    >
                    <i className="ri-bar-chart-line"></i>
                    </button>

                    <button
                    title="Candidate Attendance Report"
                    className="hover:text-cyan-600 p-1 rounded hover:bg-cyan-50 transition"
                    onClick={() => onCandidateAttendance(item)}
                    >
                    <i className="ri-line-chart-line"></i>
                    </button>

                    <button
                    title="Topics Management"
                    className="hover:text-amber-600 p-1 rounded hover:bg-amber-50 transition"
                    onClick={() => onTopicsManagement(item)}
                    >
                    <i className="ri-list-check-2"></i>
                    </button>

                    <button
                    title="Copy Topics from Existing Batch"
                    className="hover:text-teal-600 p-1 rounded hover:bg-teal-50 transition"
                    onClick={() => onCopyTopics(item)}
                    >
                    <i className="ri-file-copy-line"></i>
                    </button>
                </div>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  )
}