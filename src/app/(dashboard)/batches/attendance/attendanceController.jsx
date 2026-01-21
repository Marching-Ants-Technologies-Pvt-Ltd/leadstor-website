'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'
import { User } from '@/utility/TinyDB'
import BatchAttendanceReportModal from '@/components/dashboard/batch/BatchAttendanceReportModal'
import CandidateAttendanceReportModal from '@/components/dashboard/batch/CandidateAttendanceReportModal'
import TopicsManagementModal from '@/components/dashboard/batch/TopicsManagementModal'

export default function AttendanceController() {
  const [batches, setBatches] = useState([])
  const [filteredBatches, setFilteredBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Search
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [modalOpen, setModalOpen] = useState(null)
  const [selectedBatch, setSelectedBatch] = useState(null)

  // Mark Attendance modal
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [markLoading, setMarkLoading] = useState(false)
  const [markCandidatesLoading, setMarkCandidatesLoading] = useState(false)

  const userId = User?._id

  // Fetch batches
  const fetchBatches = async () => {
    if (!userId) return toast.error('User ID not found')

    setLoading(true)
    try {
      const data = await xFetch({
        path: '/services/attendance/getTrainerBatches',
        method: 'POST',
        payload: { userId }
      })
      const list = Array.isArray(data) ? data : []
      setBatches(list)
      setFilteredBatches(list)
      setCurrentPage(1)
    } catch (err) {
      toast.error('Failed to load assigned batches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [userId])

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) {
      setFilteredBatches(batches)
    } else {
      const filtered = batches.filter(b =>
        (b.labelName || '').toLowerCase().includes(term) ||
        (b.batchName || '').toLowerCase().includes(term)
      )
      setFilteredBatches(filtered)
      setCurrentPage(1)
    }
  }, [searchTerm, batches])

  // Pagination slice
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredBatches.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage)

  // Date validation
  const isValidDate = (batch) => {
    const input = new Date(selectedDate)
    const start = new Date(batch.batchStartDate)
    const end = new Date(batch.batchEndDate)
    if (input < start || input > end) {
      toast.error('Selected date is outside batch range')
      return false
    }
    return true
  }

  // Open Mark Attendance modal & fetch candidates
  const openMarkAttendance = async (batch) => {
    if (!isValidDate(batch)) return

    setSelectedBatch(batch)
    setShowMarkModal(true)
    setSelectedCandidates([])
    setMarkLoading(false)
    setMarkCandidatesLoading(true)

    try {
      const data = await xFetch({
        path: '/services/attendance/getAssignedCandidatesToBatch',
        method: 'POST',
        payload: {
          batchId: batch.batchId,
          labelId: batch.labelId,
          adate: selectedDate,
          trainerId: userId
        }
      })
      setCandidates(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load candidates for attendance')
    } finally {
      setMarkCandidatesLoading(false)
    }
  }

  // Bulk mark selected candidates as Present
  const handleMarkPresent = async () => {
    if (!selectedCandidates.length) return toast.warn('Please select at least one candidate')

    if (!window.confirm(`Mark ${selectedCandidates.length} candidate(s) as Present for ${selectedDate}?`)) return

    setMarkLoading(true)

    try {
      // Step 1: Reset all candidates to absent (like updateMarkAttendance)
      await xFetch({
        path: '/services/attendance/updateMarkAttendance',
        method: 'POST',
        payload: {
          batchId: selectedBatch.batchId,
          labelId: selectedBatch.labelId,
          adate: selectedDate,
          trainerId: userId
        }
      })

      // Step 2: Mark each selected candidate as present
      for (const candidateId of selectedCandidates) {
        await xFetch({
          path: '/services/attendance/updateMarkAllAttendance',
          method: 'POST',
          payload: {
            batchId: selectedBatch.batchId,
            labelId: selectedBatch.labelId,
            trainerId: userId,
            allcandidates: candidateId,
            adate: selectedDate
          }
        })
      }

      toast.success(`Marked ${selectedCandidates.length} candidate(s) as Present`)
      setShowMarkModal(false)
      setSelectedCandidates([])
    } catch (err) {
      toast.error('Failed to mark attendance')
      console.error(err)
    } finally {
      setMarkLoading(false)
    }
  }

  // Modal handlers for reports & topics
  const openModal = (type, batch) => {
    setSelectedBatch(batch)
    setModalOpen(type)
  }

  const closeModal = () => {
    setModalOpen(null)
    setSelectedBatch(null)
  }

  return (
    <div className="p-3 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-3">Attendance Management</h1>

        {/* Compact Controls */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col flex-1 sm:flex-none sm:w-48">
            <label className="text-xs font-medium text-gray-600 mb-1">Date</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="ri-calendar-line absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"></i>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Label or batch..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={fetchBatches}
            disabled={loading}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-1.5"
          >
            <i className="ri-refresh-line"></i>
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map(batch => (
                    <tr key={batch.batchId} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">{batch.labelName || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">{batch.batchName || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{batch.startTime || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{batch.endTime || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{batch.batchStartDate || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{batch.batchEndDate || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => openMarkAttendance(batch)}
                            title="Mark Attendance"
                            className="text-green-600 hover:text-green-800 transition"
                          >
                            <i className="ri-checkbox-circle-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => openModal('batch-attendance', batch)}
                            title="Batch Report"
                            className="text-purple-600 hover:text-purple-800 transition"
                          >
                            <i className="ri-bar-chart-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => openModal('candidate-attendance', batch)}
                            title="Candidate Report"
                            className="text-cyan-600 hover:text-cyan-800 transition"
                          >
                            <i className="ri-line-chart-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => openModal('topics', batch)}
                            title="Topics Management"
                            className="text-amber-600 hover:text-amber-800 transition"
                          >
                            <i className="ri-list-check-2 text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching batches' : `No batches on ${selectedDate}`}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Compact Pagination */}
          {!loading && filteredBatches.length > 0 && (
            <div className="px-4 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 border-t text-xs text-gray-600">
              <div>
                Showing {indexOfFirst + 1}–{Math.min(indexOfLast, filteredBatches.length)} of {filteredBatches.length}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 text-xs"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 text-xs"
                >
                  Prev
                </button>
                <span className="px-2.5 py-1 font-medium">
                  {currentPage} / {Math.ceil(filteredBatches.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * itemsPerPage >= filteredBatches.length}
                  className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 text-xs"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(Math.ceil(filteredBatches.length / itemsPerPage))}
                  disabled={currentPage * itemsPerPage >= filteredBatches.length}
                  className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 text-xs"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mark Attendance Modal - Compact */}
        {showMarkModal && selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
              <div className="bg-blue-600 text-white px-5 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  Mark Attendance - {selectedBatch.batchName} ({selectedDate})
                </h2>
                <button
                  onClick={() => setShowMarkModal(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-4 flex-1 overflow-auto">
                {candidates.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-700 uppercase w-10">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.length === candidates.length}
                            onChange={() =>
                              setSelectedCandidates(
                                selectedCandidates.length === candidates.length
                                  ? []
                                  : candidates.map(c => c.instituteCandidateId)
                              )
                            }
                          />
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-700 uppercase">Candidate</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {candidates.map(c => (
                        <tr key={c.instituteCandidateId} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(c.instituteCandidateId)}
                              onChange={() =>
                                setSelectedCandidates(prev =>
                                  prev.includes(c.instituteCandidateId)
                                    ? prev.filter(id => id !== c.instituteCandidateId)
                                    : [...prev, c.instituteCandidateId]
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{c.candidateName || '—'}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-600">{c.candidateEmail || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-16 text-gray-500 text-sm">
                    No candidates assigned for this batch on {selectedDate}
                  </div>
                )}
              </div>

              <div className="border-t px-5 py-3 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkPresent}
                  disabled={markLoading || !selectedCandidates.length}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition flex items-center gap-1.5 shadow-sm"
                >
                  {markLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  ) : (
                    <i className="ri-checkbox-circle-line"></i>
                  )}
                  Mark Present ({selectedCandidates.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report & Topics Modals */}
        {modalOpen === 'batch-attendance' && selectedBatch && (
          <BatchAttendanceReportModal batch={selectedBatch} onClose={closeModal} />
        )}

        {modalOpen === 'candidate-attendance' && selectedBatch && (
          <CandidateAttendanceReportModal batch={selectedBatch} onClose={closeModal} />
        )}

        {modalOpen === 'topics' && selectedBatch && (
          <TopicsManagementModal
            batch={selectedBatch}
            onClose={closeModal}
            onSuccess={() => {
              closeModal()
              fetchBatches()
            }}
          />
        )}
      </div>
    </div>
  )
}