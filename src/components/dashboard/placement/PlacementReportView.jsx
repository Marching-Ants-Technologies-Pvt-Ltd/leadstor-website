'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch' // Adjust import path as needed

export default function PlacementReportView({ corporateId, onBack }) {
  const [reportData, setReportData] = useState([])
  const [originalReportData, setOriginalReportData] = useState([])
  const [reportTotal, setReportTotal] = useState(0)
  const [reportPage, setReportPage] = useState(1)
  const [reportLoading, setReportLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const limit = 1000 // Increased for higher pagination size
  
  // Filter report data based on search term
  const filteredReportData = originalReportData.filter(row => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      row.candidateId?.toString().toLowerCase().includes(searchTermLower) ||
      row.name?.toLowerCase().includes(searchTermLower) ||
      row.email?.toLowerCase().includes(searchTermLower) ||
      row.mobile?.toLowerCase().includes(searchTermLower)
    );
  });
  
  const totalPages = Math.ceil(reportTotal / limit);
  const currentReportData = filteredReportData;

  // Load main report data
  const loadReportData = async () => {
    setReportLoading(true)
    try {
      const params = {
        offset: String((reportPage - 1) * limit),
        limit: String(limit),
      }

      const response = await xFetch({
        path: '/services/job/getPlacementReadyReport',
        payload: {
          corporateId: String(corporateId),
          offset: String((reportPage - 1) * limit),
          limit: String(limit),
          search: '',
          order: 'asc',
          time: Date.now()
        },
      })

      const rows = response?.rows || response?.data || response || []
      setOriginalReportData(rows) // Store original data for filtering
      setReportData(rows) // Also update reportData for backward compatibility if needed
      setReportTotal(response?.total || rows.length || 0)
    } catch (err) {
      console.error('Report load error:', err)
      toast.error('Failed to load placement report')
    } finally {
      setReportLoading(false)
    }
  }

  // Toggle expand/collapse + load details
  const toggleRow = async (candidateId) => {
    if (expandedRows.has(candidateId)) {
      setExpandedRows(prev => {
        const next = new Set(prev)
        next.delete(candidateId)
        return next
      })
      return
    }

    try {
      const data = await xFetch({
        path: '/services/job/getPlacementReportByCandidateId',
        method: 'POST',
        payload: { candidateId },
      })

      setReportData(prev =>
        prev.map(r =>
          r.candidateId === candidateId ? { ...r, notifications: data?.notification || [] } : r
        )
      )

      setExpandedRows(prev => new Set([...prev, candidateId]))
    } catch (err) {
      toast.error('Failed to load notifications')
    }
  }

  // Export full report
  const exportReport = async () => {
    try {
      const blob = await xFetch({
        path: '/services/job/exportPlacementReport',
        payload: {},
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `placement-report-${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Report exported')
    } catch (err) {
      toast.error('Export failed')
    }
  }

  useEffect(() => {
    loadReportData()
  }, [reportPage, corporateId])

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Compact Toolbar - no main menu items */}
      <div className="bg-white border-b px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded text-gray-700 text-[13px]"
        >
          <i className="ri-arrow-left-line"></i>
          Back
        </button>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by candidate ID, name, email, or mobile..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setReportPage(1); // Reset to first page when searching
              }}
              className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          </div>
        </div>

        <button
          onClick={exportReport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-[13px] shadow-sm"
        >
          <i className="ri-download-2-line"></i>
          Export
        </button>
      </div>

      {/* Table Area - compact styling */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        {reportLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : reportData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-[13px]">
            No data available
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto border border-gray-200 rounded bg-white shadow-sm">
              <table className="min-w-full text-[13px] divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase w-8"></th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Candidate ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 uppercase">Mobile</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600 uppercase">
                      Shared Notifications
                    </th>
                    <th className="px-3 py-2 text-center font-medium text-gray-600 uppercase">
                      Interested Jobs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentReportData.map(row => (
                    <React.Fragment key={row.candidateId}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => toggleRow(row.candidateId)}
                            className="text-blue-600 hover:text-blue-800 text-base"
                          >
                            {expandedRows.has(row.candidateId) ? '−' : '+'}
                          </button>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.candidateId}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.name || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.email || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.mobile || '-'}</td>
                        <td className="px-3 py-2 text-center font-medium">{row.job_notification_count || 0}</td>
                        <td className="px-3 py-2 text-center font-medium">{row.interested_job_count || 0}</td>
                      </tr>

                      {expandedRows.has(row.candidateId) && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-gray-50">
                            <div className="p-4">
                              {row.notifications?.length > 0 ? (
                                <div className="overflow-x-auto rounded border border-gray-200">
                                  <table className="min-w-full divide-y divide-gray-200 text-[13px]">
                                    <thead className="bg-teal-600 text-white">
                                      <tr>
                                        <th className="px-4 py-2 text-left">Job Id</th>
                                        <th className="px-4 py-2 text-left">Job Title</th>
                                        <th className="px-4 py-2 text-left">Company</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Remarks</th>
                                        <th className="px-4 py-2 text-left">Updated</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {row.notifications.map((n, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 whitespace-nowrap">{n.job_id || '-'}</td>
                                          <td className="px-4 py-2">{n.job_title || '-'}</td>
                                          <td className="px-4 py-2">{n.company || '-'}</td>
                                          <td className="px-4 py-2">{n.status || '-'}</td>
                                          <td className="px-4 py-2">{n.remarks || '-'}</td>
                                          <td className="px-4 py-2 whitespace-nowrap">{n.updatedDate || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-red-600">
                                  No Job Notification has been sent to this candidate yet.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Compact Pagination */}
            <div className="px-4 py-3 border-t bg-white flex flex-col sm:flex-row justify-between items-center gap-3 text-[13px] text-gray-600">
              <div>
                Showing <strong>{(reportPage - 1) * limit + 1}</strong>–
                <strong>{Math.min(reportPage * limit, filteredReportData.length)}</strong> of{' '}
                <strong>{filteredReportData.length.toLocaleString()}</strong> {searchTerm && `(filtered from ${reportTotal})`}
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  disabled={reportPage === 1}
                  onClick={() => setReportPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const num = reportPage - 3 + i
                  if (num < 1 || num > totalPages) return null
                  return (
                    <button
                      key={num}
                      onClick={() => setReportPage(num)}
                      className={`px-3 py-1 border rounded min-w-[32px] ${
                        num === reportPage ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      {num}
                    </button>
                  )
                })}

                <button
                  disabled={reportPage >= totalPages}
                  onClick={() => setReportPage(p => p + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
