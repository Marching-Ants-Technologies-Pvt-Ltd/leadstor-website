// src/components/dashboard/batch/BatchFormModal.jsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'

// Decode HTML entities in label names (e.g. &amp; → &)
function decodeHtml(html) {
  if (!html) return ''
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

export default function BatchFormModal({ mode = 'add', batch = null, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [labels, setLabels] = useState([])

  const initialForm = {
    label: '',
    batchName: '',
    batchStartDate: '',
    batchEndDate: '',
    start: '08:00',
    end: '08:30',
    status: 'upcoming',
    maxBatchSize: '',
    batchProgress: '0',
    batchId: ''
  }

  const [form, setForm] = useState(initialForm)

  // Pre-fill form in edit mode – with robust date/time normalization
  useEffect(() => {
    if (mode === 'edit' && batch) {
      // Normalize status: replace spaces with underscore, lowercase
      const normalizedStatus = (batch.status || 'upcoming')
        .toLowerCase()
        .replace(/\s+/g, '_')

      // Normalize dates: convert dd/mm/yyyy → yyyy-mm-dd
      const normalizeDate = (dateStr) => {
        if (!dateStr) return ''
        let cleaned = dateStr.split(' ')[0] // remove time if present
        if (cleaned.includes('/')) {
          const [dd, mm, yyyy] = cleaned.split('/')
          return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
        }
        if (cleaned.includes('-')) {
          // already yyyy-mm-dd or similar
          const parts = cleaned.split('-')
          if (parts[0].length === 4) return cleaned // yyyy-mm-dd
          if (parts[2].length === 4) {
            // dd-mm-yyyy
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
          }
        }
        return ''
      }

      // Normalize time: "8:00 AM" → "08:00" (24h)
      const normalizeTime = (timeStr) => {
        if (!timeStr) return '08:00'
        let cleaned = timeStr.trim().toUpperCase()
        if (cleaned.includes('AM') || cleaned.includes('PM')) {
          let [time, period] = cleaned.split(' ')
          let [h, m] = time.split(':').map(Number)
          if (period === 'PM' && h !== 12) h += 12
          if (period === 'AM' && h === 12) h = 0
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        }
        // already HH:mm
        return cleaned
      }

      setForm({
        label: batch.labelId || '',
        batchName: batch.batchName || '',
        batchStartDate: normalizeDate(batch.batchStartDate),
        batchEndDate: normalizeDate(batch.batchEndDate),
        start: normalizeTime(batch.startTime),
        end: normalizeTime(batch.endTime),
        status: normalizedStatus,
        maxBatchSize: batch.batchTotalAllowedCount || batch.maxBatchSize || '',
        batchProgress: batch.batchProgress || '0',
        batchId: batch.batchId || ''
      })
    }
  }, [mode, batch])

  // Load labels + decode entities
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const data = await xFetch({ path: '/services/attendance/getBatches' })
        if (Array.isArray(data)) {
          const decoded = data.map(item => ({
            ...item,
            labelName: decodeHtml(item.labelName)
          }))
          setLabels(decoded)
        }
      } catch {
        toast.error('Failed to load labels')
      }
    }
    fetchLabels()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const newForm = { ...prev, [name]: value }

      if (name === 'batchStartDate' && newForm.batchEndDate && value > newForm.batchEndDate) {
        newForm.batchEndDate = ''
      }
      if (name === 'batchEndDate' && newForm.batchStartDate && value < newForm.batchStartDate) {
        toast.warn('End date cannot be before start date')
        newForm.batchEndDate = ''
      }

      return newForm
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!form.label) return toast.error('Please select a label')
    if (!form.batchName.trim()) return toast.error('Batch name is required')
    if (!form.batchStartDate || !form.batchEndDate) return toast.error('Both dates are required')
    if (!form.start || !form.end) return toast.error('Both times are required')
    if (mode === 'edit' && !form.batchId) return toast.error('batchId is missing in edit mode')

    const maxSize = Number(form.maxBatchSize)
    if (isNaN(maxSize) || maxSize < 0 || maxSize > 500) {
      return toast.error('Max batch size must be between 0 and 500')
    }

    const progress = Number(form.batchProgress)
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return toast.error('Progress must be between 0 and 100')
    }

    setLoading(true)

    try {
      const payload = {
        batchId: form.batchId,
        label: form.label,
        batchName: form.batchName.trim(),
        batchStartDate: form.batchStartDate,
        batchEndDate: form.batchEndDate,
        start: form.start,
        end: form.end,
        status: form.status,
        batchProgress: form.batchProgress,
        maxBatchSize: form.maxBatchSize
      }

      const endpoint = mode === 'add'
        ? '/services/attendance/addBatch'
        : '/services/attendance/editBatch'

      await xFetch({
        path: endpoint,
        method: 'POST',
        payload: payload
      })

      toast.success(mode === 'add' ? 'Batch created successfully' : 'Batch updated successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.message || `Failed to ${mode === 'add' ? 'create' : 'update'} batch`)
      console.error('Submit error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isEdit = mode === 'edit'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-5 py-3.5">
          <h2 className="text-base font-semibold">
            {isEdit ? 'Edit Batch' : 'Add New Batch'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Hidden fields */}
          {isEdit && <input type="hidden" name="batchId" value={form.batchId} />}

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <span className="text-red-500">*</span> Label
            </label>
            <select
              name="label"
              value={form.label}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select Label --</option>
              {labels.map(l => (
                <option key={l.labelId} value={l.labelId}>
                  {l.labelName}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <span className="text-red-500">*</span> Batch Name
            </label>
            <input
              type="text"
              name="batchName"
              value={form.batchName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter batch name"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <span className="text-red-500">*</span> Start Date
              </label>
              <input
                type="date"
                name="batchStartDate"
                value={form.batchStartDate}
                onChange={handleDateChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <span className="text-red-500">*</span> End Date
              </label>
              <input
                type="date"
                name="batchEndDate"
                value={form.batchEndDate}
                onChange={handleDateChange}
                min={form.batchStartDate || undefined}
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <span className="text-red-500">*</span> From
              </label>
              <input
                type="time"
                name="start"
                value={form.start}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <span className="text-red-500">*</span> To
              </label>
              <input
                type="time"
                name="end"
                value={form.end}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Status – value stays with underscore, display with space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <span className="text-red-500">*</span> Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 normal-case"
            >
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <span className="text-red-500">*</span> Progress (%)
            </label>
            <input
              type="number"
              name="batchProgress"
              value={form.batchProgress}
              onChange={handleChange}
              min={0}
              max={100}
              step={1}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0–100"
            />
          </div>

          {/* Max Batch Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <span className="text-red-500">*</span> Max Batch Size
            </label>
            <input
              type="number"
              name="maxBatchSize"
              value={form.maxBatchSize}
              onChange={handleChange}
              min={0}
              max={500}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. 30"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Batch' : '+ Add Batch'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}