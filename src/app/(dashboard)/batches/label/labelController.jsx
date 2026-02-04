'use client'

import { useEffect, useState, useMemo } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { xFetch } from '@/utility/xFetch'
import * as XLSX from 'xlsx'
import LabelTable from './labelTable'

export default function LabelController() {
  const [labels, setLabels] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState([])
  const [page, setPage] = useState(1)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('add' | 'edit')
  const [formLabelName, setFormLabelName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const pageSize = 10
  
  // Load labels + courses
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [labelsRes, coursesRes] = await Promise.all([
          xFetch({ path: '/services/attendance/getLabels' }),
          xFetch({ path: '/services/profile/getCourseAndFee' })
        ])

        setLabels(Array.isArray(labelsRes) ? labelsRes : [])
        setCourses(
          Array.isArray(coursesRes) ? coursesRes.map((c) => c.course) : []
        )
      } catch (err) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const checkUncheckRows = (state = false) => {
      [...document.querySelectorAll('table#labelTable tbody td input[type=checkbox]')].map(i => i.checked = state);
  }

  // Filtered labels (client-side search)
  const filtered = useMemo(() => {
    if (!search.trim()) return labels
    const term = search.toLowerCase()
    return labels.filter(
      l =>
        l.labelName.toLowerCase().includes(term) ||
        (l.labelDescription || '').toLowerCase().includes(term)
    )
  }, [labels, search])

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  useEffect(() => {
    setPage(1)
  }, [search, labels])

  // ─── CRUD Handlers ────────────────────────────────────────

  const openAddModal = () => {
    setModalMode('add')
    setFormLabelName('')
    setFormDescription('')
    setEditingId(null)
    setShowModal(true)
  }

  const openEditModal = (label) => {
    setModalMode('edit')
    setFormLabelName(label.labelName)   
    setFormDescription(label.labelDescription || '')
    setEditingId(label.labelId)
    setShowModal(true)
  }

  const handleSave = async () => {

    if (!formLabelName.trim()) {
      toast.error('Course name is required')
      return
    }

    try {
      const payload = {
        labelName: formLabelName.trim(),
        labelDescription: formDescription?.trim() || '',
      };

      if (modalMode === 'edit') {
        payload.labelId = editingId;
      }

      xFetch({
        method: 'POST',
        path: modalMode === 'add'
          ? '/services/attendance/addLabel'
          : '/services/attendance/editLabel',
        payload,
      })
      .then(data => {
          toast.success(modalMode === 'add' ? 'Course created' : 'Course updated')
      })
      .catch(error => {
          console.error(`An error occurred. Please try again!`, error);
          toast.error(`An error occurred. Please try again!`);
      });

      // refresh
      const fresh = await xFetch({ path: '/services/attendance/getLabels' })
      if (Array.isArray(fresh)) setLabels(fresh)

      setShowModal(false)
    } catch (err) {
      toast.error(err.message || 'Save failed')
    }
  }
  
  const handleDeleteSelected = async () => {
    if (selectedLabelIds.length === 0) return

    if (!confirm(`Delete ${selectedLabelIds.length} label(s)? This cannot be undone.`)) {
      return
    }

    try {
      for (const id of selectedLabelIds) {
        await xFetch({
          path: `/services/attendance/deleteLabel?LabelId=${id}`,
          method: 'GET'
        })
      }
      toast.success('Deleted successfully')

      const fresh = await xFetch({ path: '/services/attendance/getLabels' })
      if (Array.isArray(fresh)) setLabels(fresh)

      setSelectedLabelIds([])
    } catch (err) {
      toast.error('Some deletions failed')
    }
  }

  const exportExcel = () => {
    if (filtered.length === 0) return toast.warn('No data to export')

    const data = filtered.map(l => ({
      'Course ID': l.labelId,
      'Course Name': l.labelName,
      Description: l.labelDescription || '',
      Active: l.active === '1' ? 'Yes' : 'No'
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Courses')
    XLSX.writeFile(wb, `labels-export-${new Date().toISOString().slice(0,10)}.xlsx`)

    toast.success('Exported')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Toolbar */}
      <div className="bg-white border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search course..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={exportExcel}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <i className="ri-download-line"></i> Export Excel
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <i className="ri-add-line"></i> Add Course
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={selectedLabelIds.length === 0}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              selectedLabelIds.length > 0
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            <i className="ri-delete-bin-line"></i> Delete ({selectedLabelIds.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 p-4 overflow-hidden">
        {/* Scrollable table */}
        <div className="h-[calc(100vh-260px)] overflow-auto rounded-lg border bg-white">
          <LabelTable
            rows={paginatedRows}
            selectedIds={selectedLabelIds}
            onSelectChange={setSelectedLabelIds}
            onEdit={openEditModal}
            checkUncheckRows={checkUncheckRows}
          />
        </div>

        {/* Pagination (OUTSIDE scroll) */}
        {filtered.length > 0 && (
          <div className="flex justify-between items-center mt-3 px-2 text-sm text-gray-600">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Prev
              </button>

              <span className="px-2 py-1">
                Page {page} of {Math.ceil(filtered.length / pageSize)}
              </span>

              <button
                disabled={page >= Math.ceil(filtered.length / pageSize)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg font-semibold text-lg">
              {modalMode === 'add' ? 'Add New Course' : 'Modify Course'}
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Choose a course <span className="text-red-600">*</span>
                </label>
                <select
                  value={formLabelName} 
                  onChange={e => setFormLabelName(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Course Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description..."
                />
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
                className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                {modalMode === 'add' ? (
                  <>
                    <i className="ri-add-line"></i> Add Course
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i> Modify Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}