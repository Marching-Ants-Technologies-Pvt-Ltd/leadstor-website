'use client'

import { ChangeEvent } from 'react'

export default function LabelTable({ rows, selectedIds, onSelectChange, onEdit, checkUncheckRows }) {
  const allSelected = rows.length > 0 && selectedIds.length === rows.length

  const toggleAll = (e) => {
    if (e.target.checked) {
      onSelectChange(rows.map(r => r.labelId))
    } else {
      onSelectChange([])
    }
  }

  const toggleOne = (id, checked) => {
    if (checked) {
      onSelectChange([...selectedIds, id])
    } else {
      onSelectChange(selectedIds.filter(sid => sid !== id))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" id="labelTable">
        <thead className="bg-slate-100 sticky top-0 z-10">
          <tr className="border-b">
            <th className="px-4 py-3 w-12 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-3 text-left font-medium">Label Name</th>
            <th className="px-4 py-3 text-left font-medium">Label Description</th>
            <th className="px-4 py-3 w-24 text-center font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map(row => {
            const isSelected = selectedIds.includes(row.labelId)
            return (
              <tr key={row.labelId} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => toggleOne(row.labelId, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3 font-medium">{row.labelName || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{row.labelDescription || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onEdit(row)}
                    title="Edit Label"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <i className="ri-edit-line text-lg"></i>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}