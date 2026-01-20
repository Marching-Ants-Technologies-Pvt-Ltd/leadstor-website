// BatchController.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'
import BatchTable from './batchTable'
import * as XLSX from 'xlsx'

import BatchFormModal from '@/components/dashboard/batch/BatchFormModal'
import ViewBatchDetailsModal from '@/components/dashboard/batch/ViewBatchDetailsModal'
import AssignTrainerModal from '@/components/dashboard/batch/AssignTrainerModal'
import AssignCandidatesModal from '@/components/dashboard/batch/AssignCandidatesModal'
import BatchAttendanceReportModal from '@/components/dashboard/batch/BatchAttendanceReportModal'
import CandidateAttendanceReportModal from '@/components/dashboard/batch/CandidateAttendanceReportModal'
import TopicsManagementModal from '@/components/dashboard/batch/TopicsManagementModal'
import CopyTopicsModal from '@/components/dashboard/batch/CopyTopicsModal'

export default function BatchController() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modal states
  const [modalOpen, setModalOpen] = useState(null)
  const [selectedBatch, setSelectedBatch] = useState(null)

  /* ---------------- FETCH ---------------- */
  const reloadBatches = async () => {
    setLoading(true)
    try {
      const data = await xFetch({ path: '/services/attendance/getBatches' })
      setBatches(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadBatches()
  }, [])

  /* ---------------- SEARCH & PAGINATION ---------------- */
  const filtered = useMemo(() => {
    if (!search.trim()) return batches
    const term = search.toLowerCase()
    return batches.filter(b =>
      (b.batchName || '').toLowerCase().includes(term) ||
      (b.labelName || '').toLowerCase().includes(term)
    )
  }, [batches, search])

  const totalRows = filtered.length
  const totalPages = Math.ceil(totalRows / pageSize)

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Delete ${selectedIds.length} batch(es)? This will also remove related data.`)) return

    try {
      for (const id of selectedIds) {
        await xFetch({
          path: `/services/attendance/deletebatch?BatchId=${id}`,
          method: 'GET'
        })
      }
      toast.success('Batch(es) deleted')
      setSelectedIds([])
      reloadBatches()
    } catch {
      toast.error('Delete failed')
    }
  }

  /* ---------------- EXPORT ---------------- */
  const exportExcel = () => {
    if (!filtered.length) {
      toast.warn('No data to export')
      return
    }

    const data = filtered.map(b => ({
      'Batch Name': b.batchName || '',
      'Label Name': b.labelName || '',
      'Start Date': b.batchStartDate || '',
      'End Date': b.batchEndDate || '',
      'From': b.startTime || '',
      'To': b.endTime || '',
      'Max Allowed': b.batchTotalAllowedCount || '',
      Status: b.status || '',
      'Progress %': b.batchProgress || '',
      'Fee Payment %': b.feePayment || ''
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Batches')
    XLSX.writeFile(wb, 'batches_export.xlsx')
  }

  /* ---------------- Modal Handlers ---------------- */
  const openModal = (type, batch) => {
    setSelectedBatch(batch || null)
    setModalOpen(type)
  }

  const closeModal = () => {
    setModalOpen(null)
    setSelectedBatch(null)
  }

  const handleActionSuccess = () => {
    closeModal()
    reloadBatches()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ToastContainer theme="light" transition={Bounce} position="top-right" autoClose={2200} />

      {/* Compact Toolbar */}
      <div className="bg-white border-b px-5 py-2.5 flex items-center justify-between gap-4">
        <input
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Search batches..."
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <i className="ri-add-line text-base"></i>
            <span>Add</span>
          </button>

          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            <i className="ri-download-2-line text-base"></i>
            <span>Export</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={!selectedIds.length}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors shadow-sm ${
              selectedIds.length
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className="ri-delete-bin-line text-base"></i>
            <span>Delete {selectedIds.length ? `(${selectedIds.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Table container + integrated pagination */}
      <div className="flex-1 flex flex-col min-h-0 px-5 pb-4">
        <div className="flex-1 overflow-auto border border-gray-200 rounded-md bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
          ) : (
            <BatchTable
              rows={paginatedRows}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={batch => openModal('edit', batch)}
              onViewDetails={batch => openModal('view', batch)}
              onAssignTrainer={batch => openModal('assign-trainer', batch)}
              onAssignCandidates={batch => openModal('assign-candidates', batch)}
              onBatchAttendance={batch => openModal('batch-attendance', batch)}
              onCandidateAttendance={batch => openModal('candidate-attendance', batch)}
              onTopicsManagement={batch => openModal('topics', batch)}
              onCopyTopics={batch => openModal('copy-topics', batch)}
            />
          )}
        </div>

        {/* Slim pagination - directly under table */}
        {!loading && totalRows > 0 && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing <strong>{(page - 1) * pageSize + 1}</strong>–
              <strong>{Math.min(page * pageSize, totalRows)}</strong> of <strong>{totalRows}</strong>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-sm"
              >
                Prev
              </button>

              <span className="px-3 py-1 font-medium">
                {page} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals ─── */}
      {modalOpen === 'add' && (
        <BatchFormModal
          mode="add"
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}

      {modalOpen === 'edit' && selectedBatch && (
        <BatchFormModal
          mode="edit"
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}

      {modalOpen === 'view' && selectedBatch && (
        <ViewBatchDetailsModal
          batch={selectedBatch}
          onClose={closeModal}
        />
      )}

      {modalOpen === 'assign-trainer' && selectedBatch && (
        <AssignTrainerModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}

      {modalOpen === 'assign-candidates' && selectedBatch && (
        <AssignCandidatesModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}

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
          onSuccess={handleActionSuccess}
        />
      )}

      {modalOpen === 'copy-topics' && selectedBatch && (
        <CopyTopicsModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}

      {modalOpen === 'batch-attendance' && selectedBatch && (
        <BatchAttendanceReportModal
          batch={selectedBatch}
          onClose={closeModal}
        />
      )}

      {modalOpen === 'candidate-attendance' && selectedBatch && (
        <CandidateAttendanceReportModal
          batch={selectedBatch}
          onClose={closeModal}
        />
      )}

      {modalOpen === 'topics' && selectedBatch && (
        <TopicsManagementModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}

      {modalOpen === 'copy-topics' && selectedBatch && (
        <CopyTopicsModal
          batch={selectedBatch}
          onClose={closeModal}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  )
}