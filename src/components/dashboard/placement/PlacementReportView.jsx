'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch' // Adjust import path as needed
import { createPortal } from 'react-dom'
import { useRef } from 'react'

export default function PlacementReportView({ corporateId, onBack }) {
  const [reportData, setReportData] = useState([])
  const [reportTotal, setReportTotal] = useState(0)
  const [reportPage, setReportPage] = useState(1)
  const [reportLoading, setReportLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [limit, setLimit] = useState(20)

  const limitOptions = [20, 50, 100, 200, 500]

  const [tooltipPos, setTooltipPos] = useState(null) // { top, left, openAbove }

  const TOOLTIP_WIDTH = 288 // matches w-72

  const closeTimerRef = useRef(null)

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = setTimeout(() => {
      setHoveredCandidateId(null)
      setTooltipPos(null)
    }, 200)
  }

  const handleInterestedJobsHover = (candidateId, e) => {
    const rect = e.currentTarget.getBoundingClientRect()

    // Clamp horizontally so it never spills off-screen
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
    const margin = 8
    left = Math.max(margin, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - margin))

    // Flip above if not enough room below
    const spaceBelow = window.innerHeight - rect.bottom
    const openAbove = spaceBelow < 220 // rough tooltip height

    setTooltipPos({
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      left,
      openAbove,
      anchorCenter: rect.left + rect.width / 2, // for the arrow
    })

    setHoveredCandidateId(candidateId)
    fetchInterestedJobs(candidateId)
  }

  const closeTooltip = () => {
    setHoveredCandidateId(null)
    setTooltipPos(null)
  }
  const totalPages = Math.ceil(reportTotal / limit);
  const currentReportData = reportData;

  const renderPageButtons = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1)
    }

    const pages = [1]
    const windowStart = Math.max(2, reportPage - 1)
    const windowEnd = Math.min(totalPages - 1, reportPage + 1)

    if (windowStart > 2) {
      pages.push('start-ellipsis')
    }

    for (let p = windowStart; p <= windowEnd; p += 1) {
      pages.push(p)
    }

    if (windowEnd < totalPages - 1) {
      pages.push('end-ellipsis')
    }

    pages.push(totalPages)
    return pages
  }

  // Load main report data
  const loadReportData = async () => {
    setReportLoading(true)
    try {
      const payload = {
        corporateId: String(corporateId),
        offset: String((reportPage - 1) * limit),
        limit: String(limit),
        order: 'asc',
        time: Date.now()
      }

      if (searchTerm.trim()) {
        payload.search = searchTerm.trim()
      }

      const response = await xFetch({
        path: '/services/job/getPlacementReadyReport',
        payload,
      })

      const rows = response?.rows || response?.data || response || []
      setReportData(rows)
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

  // New state, alongside your existing useState declarations
  const [interestedJobsCache, setInterestedJobsCache] = useState({}) // { [candidateId]: jobs[] }
  const [hoveredCandidateId, setHoveredCandidateId] = useState(null)
  const [tooltipLoading, setTooltipLoading] = useState(false)

  // Fetch + filter on hover (only if not already cached)
  const fetchInterestedJobs = async (candidateId) => {
    if (interestedJobsCache[candidateId]) return

    setTooltipLoading(true)
    try {
      const data = await xFetch({
        path: '/services/job/getPlacementReportByCandidateId',
        method: 'POST',
        payload: { candidateId },
      })

      const interested = (data?.notification || []).filter(n => n.status !== 'Notified')

      setInterestedJobsCache(prev => ({
        ...prev,
        [candidateId]: interested,
      }))
    } catch (err) {
      console.error('Failed to load interested jobs:', err)
    } finally {
      setTooltipLoading(false)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [reportPage, corporateId, limit, searchTerm])

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
                        <td className="px-3 py-2 text-center font-medium relative">
                          <span
                            onMouseEnter={(e) => { cancelClose(); handleInterestedJobsHover(row.candidateId, e) }}
                            onMouseLeave={scheduleClose}
                            className="cursor-default inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full transition-colors hover:bg-teal-50"
                          >
                            {row.interested_job_count || 0}
                          </span>
                        </td>
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div>
                Showing{' '}
                <strong>{(reportPage - 1) * limit + 1}</strong>
                –
                <strong>
                  {Math.min((reportPage - 1) * limit + currentReportData.length, reportTotal)}
                </strong>
                {' '}of{' '}
                <strong>{reportTotal.toLocaleString()}</strong>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <span className="text-gray-700">Rows per page</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value))
                      setReportPage(1)
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {limitOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

              <div className="flex items-center gap-1 flex-wrap">
                <button
                  disabled={reportPage === 1}
                  onClick={() => setReportPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>

                {renderPageButtons().map((pageKey) => {
                  if (pageKey === 'start-ellipsis' || pageKey === 'end-ellipsis') {
                    return (
                      <span key={pageKey} className="px-2 text-gray-500">
                        ...
                      </span>
                    )
                  }

                  return (
                    <button
                      key={pageKey}
                      onClick={() => setReportPage(pageKey)}
                      className={`px-3 py-1 border rounded min-w-[32px] ${
                        pageKey === reportPage ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageKey}
                    </button>
                  )
                })}

                <button
                  disabled={reportPage >= totalPages}
                  onClick={() => setReportPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {hoveredCandidateId && tooltipPos && (() => {
        const row = reportData.find(r => r.candidateId === hoveredCandidateId)
        if (!row || !row.interested_job_count) return null

        return createPortal(
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              position: 'fixed',
              top: tooltipPos.openAbove ? undefined : tooltipPos.top,
              bottom: tooltipPos.openAbove ? window.innerHeight - tooltipPos.top : undefined,
              left: tooltipPos.left,
              width: TOOLTIP_WIDTH,
            }}
            className="z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Arrow */}
            <div
              style={{ left: tooltipPos.anchorCenter - tooltipPos.left - 6 }}
              className={`absolute w-3 h-3 bg-white border-gray-200 rotate-45 ${
                tooltipPos.openAbove
                  ? 'bottom-[-6px] border-r border-b'
                  : 'top-[-6px] border-l border-t'
              }`}
            ></div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
              <div className="bg-teal-600 px-3 py-2 flex items-center justify-between gap-2">
                <span className="text-white text-xs font-semibold tracking-wide">Interested Jobs</span>
                <div className="flex items-center gap-1.5">
                  <span className="bg-white/20 text-white text-[11px] font-medium px-1.5 py-0.5 rounded-full">
                    {row.interested_job_count}
                  </span>
                  <button
                    onClick={() => {
                      const jobs = interestedJobsCache[hoveredCandidateId] || []
                      const text = jobs
                        .map(job => `${job.job_title}${job.company ? ' - ' + job.company : ''} (#${job.job_id})`)
                        .join('\n')
                      navigator.clipboard.writeText(text)
                      toast.success('Copied all jobs')
                    }}
                    disabled={tooltipLoading && !interestedJobsCache[hoveredCandidateId]}
                    className="text-white/80 hover:text-white p-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Copy all"
                  >
                    <i className="ri-file-copy-2-line text-xs"></i>
                  </button>
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto">
                {tooltipLoading && !interestedJobsCache[hoveredCandidateId] ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500 py-4 text-xs">
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-teal-400 border-t-transparent rounded-full"></div>
                    Loading...
                  </div>
                ) : interestedJobsCache[hoveredCandidateId]?.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {interestedJobsCache[hoveredCandidateId].map((job, i) => (
                      <li key={i} className="px-3 py-2 hover:bg-gray-50 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 text-xs truncate">{job.job_title}</div>
                            {job.company && (
                              <div className="text-gray-500 text-[11px] mt-0.5 truncate">{job.company}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              #{job.job_id}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${job.job_title}${job.company ? ' - ' + job.company : ''}`)
                                toast.success('Copied')
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-teal-600 p-0.5"
                              title="Copy"
                            >
                              <i className="ri-file-copy-line text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 py-4 text-center text-xs">
                    Candidate has not shown interest to any jobs.
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      })()}
    </div>
  )
}
