'use client'

import { useEffect, useState, useMemo } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { xFetch } from '@/utility/xFetch'
import * as XLSX from 'xlsx'
import { Corporate } from '@/utility/TinyDB'
import ExpenseFormFieldTable from './table'

export default function ExpenseFormFieldController({}) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState([])


  const [page, setPage] = useState(1)
  const pageSize = 10
  const corporateId = Corporate?._id
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [formExpenseHead, setFormExpenseHead] = useState('')
  const [formExpenseType, setFormExpenseType] = useState('')
  const [formFrequency, setFormFrequency] = useState('')
  const [editingId, setEditingId] = useState(null)

  // ─── Load Data ───────────────────────────────────────────
  useEffect(() => {
    const loadFields = async () => {
      setLoading(true)
      try {
        const data = await xFetch({
          path: '/services/expense/getExpenseHeadsType',
          payload: { corporateId },
        })
        setFields(Array.isArray(data) ? data : [])
      } catch (err) {
        toast.error('Failed to load expense form fields')
      } finally {
        setLoading(false)
      }
    }
    loadFields()
  }, [corporateId])

  // ─── Filtering & Pagination ──────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return fields
    const term = search.toLowerCase()
    return fields.filter(row =>
      (row.expenseHead || '').toLowerCase().includes(term) ||
      (row.expenseType || '').toLowerCase().includes(term) ||
      (row.frequency || '').toLowerCase().includes(term)
    )
  }, [fields, search])

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [search])

  // ─── CRUD Actions ────────────────────────────────────────
  const openAddModal = () => {
    setModalMode('add')
    setFormExpenseHead('')
    setFormExpenseType('')
    setFormFrequency('')
    setEditingId(null)
    setShowModal(true)
  }

  const openEditModal = (row) => {
    setModalMode('edit')
    setFormExpenseHead(row.expenseHead || '')
    setFormExpenseType(row.expenseType || '')
    setFormFrequency(row.frequency || '')
    setEditingId(row.expenseHeadId)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formExpenseHead.trim()) return toast.error('Expense Head is required')
    if (!formExpenseType.trim()) return toast.error('Expense Type is required')
    if (!formFrequency.trim()) return toast.error('Frequency is required')

    try {
      const payload = {
        expenseHead: formExpenseHead.trim(),
        expenseType: formExpenseType.trim(),
        frequency: formFrequency.trim(),
        corporateId,
      }

      if (modalMode === 'edit') {
        payload.id = editingId
      }

      await xFetch({
        method: 'POST',
        path: '/services/expense/addExpenseFormField',
        payload,
      })

      toast.success(modalMode === 'add' ? 'Field created' : 'Field updated')

      // Refresh list
      const freshData = await xFetch({
        path: '/services/expense/getExpenseHeadsType',
        payload: { corporateId },
      })
      if (Array.isArray(freshData)) setFields(freshData)

      setShowModal(false)
    } catch (err) {
      toast.error('Save failed – please try again')
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return
    if (!confirm(`Delete ${selectedIds.length} field(s)?`)) return

    try {
      // Note: adjust endpoint if your backend has a different delete path
      for (const id of selectedIds) {
        await xFetch({
          path: `/services/expense/deleteExpenseFormField`,
          method: 'POST',
          payload: { id },
        })
      }

      toast.success('Selected fields deleted')

      const freshData = await xFetch({
        path: '/services/expense/getExpenseHeadsType',
        payload: { corporateId },
      })
      if (Array.isArray(freshData)) setFields(freshData)

      setSelectedIds([])
    } catch {
      toast.error('Delete failed')
    }
  }

  const exportExcel = () => {
    if (!filtered.length) return toast.warn('No data to export')

    const data = filtered.map(row => ({
      'Expense Head': row.expenseHead || '',
      'Expense Type': row.expenseType || '',
      'Frequency': row.frequency || '',
      'Head ID': row.expenseHeadId || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expense Fields')
    XLSX.writeFile(wb, 'expense-form-fields.xlsx')
    toast.success('Exported successfully')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ToastContainer theme="light" transition={Bounce} position="top-right" autoClose={2200} />

      {/* Toolbar */}
      <div className="bg-white border-b px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <input
          placeholder="Search expense fields..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded shadow-sm"
          >
            <i className="ri-download-2-line"></i> Export
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded shadow-sm"
          >
            <i className="ri-add-line"></i> Add Field
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded shadow-sm ${
              selectedIds.length
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className="ri-delete-bin-line"></i>
            Delete {selectedIds.length ? `(${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="flex-1 flex flex-col min-h-0 px-5 pb-5">
        <div className="flex-1 overflow-auto border rounded bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading...
            </div>
          ) : (
            <ExpenseFormFieldTable
              rows={paginatedRows}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={openEditModal}
            />
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <strong>{(page - 1) * pageSize + 1}</strong>–
              <strong>{Math.min(page * pageSize, filtered.length)}</strong> of{' '}
              <strong>{filtered.length}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="px-3 font-medium">
                {page} / {Math.ceil(filtered.length / pageSize)}
              </span>

              <button
                disabled={page >= Math.ceil(filtered.length / pageSize)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add / Edit Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg text-lg font-semibold">
              {modalMode === 'add' ? 'Add New Expense Field' : 'Edit Expense Field'}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expense Head <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formExpenseHead}
                  onChange={e => setFormExpenseHead(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Travel Allowance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expense Type <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formExpenseType}
                  onChange={e => setFormExpenseType(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Reimbursement, Advance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency <span className="text-red-600">*</span>
                </label>
                <select
                  value={formFrequency}
                  onChange={e => setFormFrequency(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select frequency...</option>
                  <option value="One Time">One Time</option>
                  <option value="Recurring">Recurring</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {modalMode === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}