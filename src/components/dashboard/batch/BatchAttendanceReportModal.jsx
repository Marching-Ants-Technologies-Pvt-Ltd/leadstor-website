'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'

export default function BatchAttendanceReportModal({ batch, onClose }) {
  const [loading, setLoading] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [reportData, setReportData] = useState([])

  const handleGenerate = async () => {
    if (!fromDate || !toDate) return toast.error('Please select both From and To dates')

    setLoading(true)

    try {
      const data = await xFetch({
        path: '/services/attendance/batchAttendanceReport',
        method: 'POST',
        payload: {
          batchId: batch.batchId,
          frmDate: fromDate,
          toDate: toDate
        }
      })

      setReportData(Array.isArray(data) ? data : [])
      toast.success('Attendance report generated')
    } catch (err) {
      toast.error('Failed to generate report')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Batch Attendance Report - {batch?.batchName || 'Batch'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
        </div>

        {/* Date Range & Generate */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                min={fromDate}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                ) : (
                  <i className="ri-check-line"></i>
                )}
                Generate Attendance Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="flex-1 overflow-auto p-6">
          {loading && reportData.length === 0 ? (
            <div className="text-center py-10">Loading...</div>
          ) : reportData.length ? (
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Total Count</th>
                  <th className="px-4 py-3 text-left">Present Count</th>
                  <th className="px-4 py-3 text-left">Absent Count</th>
                  <th className="px-4 py-3 text-left">Present (%)</th>
                  <th className="px-4 py-3 text-left">Absent (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reportData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{row.attendanceDate || '—'}</td>
                    <td className="px-4 py-3">{row.totalCount || 0}</td>
                    <td className="px-4 py-3">{row.presentCount || 0}</td>
                    <td className="px-4 py-3">{row.absentCount || 0}</td>
                    <td className="px-4 py-3 font-medium">{row.presentPercentage || '0%'}</td>
                    <td className="px-4 py-3 font-medium">
                      {row.absentPercentage > 50 ? (
                        <span className="text-red-600 font-bold">{row.absentPercentage || '0%'}</span>
                      ) : (
                        <span className="text-green-600 font-bold">{row.absentPercentage || '0%'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-500">
              Select dates and click Generate to view report
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
          >
            × Close
          </button>
        </div>
      </div>
    </div>
  )
}