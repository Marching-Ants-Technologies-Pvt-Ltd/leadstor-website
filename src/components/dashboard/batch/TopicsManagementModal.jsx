// src/components/dashboard/batch/TopicsManagementModal.jsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'

export default function TopicsManagementModal({ batch, onClose, onSuccess }) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTopicIds, setSelectedTopicIds] = useState([])
  const [search, setSearch] = useState('')

  // Add/Edit Topic Modal state
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentTopicId, setCurrentTopicId] = useState(null)
  const [topicForm, setTopicForm] = useState({
    topicName: '',
    topicStartDate: '',
    topicEndDate: '',
    start: '08:00',
    end: '08:30',
    status: '',
    remarks: ''
  })

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await xFetch({
          path: `/services/attendance/getTopics?batchId=${batch.batchId}`
        })
        setTopics(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Failed to load topics')
      } finally {
        setLoading(false)
      }
    }
    if (batch?.batchId) fetchTopics()
  }, [batch?.batchId])

  const toggleTopic = (topicId) => {
    setSelectedTopicIds(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    )
  }

  const handleDelete = () => {
    if (!selectedTopicIds.length) {
      return toast.warn('Please select at least one topic to delete')
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedTopicIds.length} topic(s)?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)

    Promise.all(
      selectedTopicIds.map(topicId =>
        xFetch({
          path: `/services/attendance/deleteTopic?topicId=${topicId}`,
          method: 'GET'
        }).catch(err => {
          console.error(`Failed to delete topic ${topicId}:`, err)
          return null // continue with others
        })
      )
    )
    .then(() => {
    toast.success(`Deleted ${selectedTopicIds.length} topic(s) successfully`)
    setTopics(prev => prev.filter(t => !selectedTopicIds.includes(t.topicId)))
    setSelectedTopicIds([])
    })
    .catch(() => {
    toast.error('Failed to delete one or more topics')
    })
    .finally(() => {
    setLoading(false)
    })
  }

  // Open Add or Edit modal
  const openTopicModal = (topic = null) => {
    if (topic) {
      // Edit mode
      setIsEditMode(true)
      setCurrentTopicId(topic.topicId)
      setTopicForm({
        topicName: topic.topicName || '',
        topicStartDate: topic.topicStartDate || '',
        topicEndDate: topic.topicEndDate || '',
        start: topic.topicStartTime || '08:00',
        end: topic.topicEndTime || '08:30',
        status: topic.topicStatus || '',
        remarks: topic.remarks || ''
      })
    } else {
      // Add mode
      setIsEditMode(false)
      setCurrentTopicId(null)
      setTopicForm({
        topicName: '',
        topicStartDate: '',
        topicEndDate: '',
        start: '08:00',
        end: '08:30',
        status: '',
        remarks: ''
      })
    }
    setShowTopicModal(true)
  }

  const handleTopicSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!topicForm.topicName.trim()) return toast.error('Topic Name is required')
    if (!topicForm.topicStartDate || !topicForm.topicEndDate) return toast.error('Both start and end dates are required')
    if (topicForm.topicStartDate > topicForm.topicEndDate) return toast.error('Start date cannot be after end date')
    if (!topicForm.status) return toast.error('Please select a status')

    const batchStart = new Date(batch.batchStartDate)
    const batchEnd = new Date(batch.batchEndDate)
    const topicStart = new Date(topicForm.topicStartDate)
    const topicEnd = new Date(topicForm.topicEndDate)

    if (topicStart < batchStart || topicEnd > batchEnd) {
      return toast.error('Topic dates must be within batch start and end dates')
    }

    try {
      const payload = {
        topicId: isEditMode ? currentTopicId : undefined, // only send when editing
        topicName: topicForm.topicName.trim(),
        topicStartDate: topicForm.topicStartDate,
        topicEndDate: topicForm.topicEndDate,
        start: topicForm.start,
        end: topicForm.end,
        status: parseInt(topicForm.status),
        remarks: topicForm.remarks.trim(),
        batch: batch.batchId
      }

      await xFetch({
        path: '/services/attendance/addTopic',
        method: 'POST',
        payload: payload
      })

      toast.success(isEditMode ? 'Topic updated successfully' : 'Topic added successfully')

      // Refresh list
      const updatedTopics = await xFetch({
        path: `/services/attendance/getTopics?batchId=${batch.batchId}`
      })
      setTopics(Array.isArray(updatedTopics) ? updatedTopics : [])

      // Close only the inner modal
      setShowTopicModal(false)
    } catch (err) {
      toast.error(isEditMode ? 'Failed to update topic' : 'Failed to add topic')
      console.error(err)
    }
  }

  const filteredTopics = topics.filter(t =>
    t.topicName?.toLowerCase().includes(search.toLowerCase()) ||
    t.remarks?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Main Modal Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Topics Management - {batch?.batchName || 'Batch'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => openTopicModal()} // open add modal
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 transition"
            >
              <i className="ri-add-line"></i> Add Topic
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !selectedTopicIds.length}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 transition"
            >
              <i className="ri-delete-bin-line"></i> Delete ({selectedTopicIds.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={() => setSearch('')}
              className="p-2 text-gray-600 hover:text-amber-600 transition"
              title="Clear search"
            >
              <i className="ri-refresh-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-10">Loading topics...</div>
          ) : filteredTopics.length ? (
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input type="checkbox" disabled />
                  </th>
                  <th className="px-4 py-3 text-left">Topic Name</th>
                  <th className="px-4 py-3 text-left">From</th>
                  <th className="px-4 py-3 text-left">To</th>
                  <th className="px-4 py-3 text-left">Start Date</th>
                  <th className="px-4 py-3 text-left">End Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Remarks</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTopics.map(t => (
                  <tr key={t.topicId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTopicIds.includes(t.topicId)}
                        onChange={() => toggleTopic(t.topicId)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{t.topicName || '—'}</td>
                    <td className="px-4 py-3">{t.topicStartTime || '—'}</td>
                    <td className="px-4 py-3">{t.topicEndTime || '—'}</td>
                    <td className="px-4 py-3">{t.topicStartDate || '—'}</td>
                    <td className="px-4 py-3">{t.topicEndDate || '—'}</td>
                    <td className="px-4 py-3">
                      {t.topicStatus === '0' ? 'Not Started' :
                       t.topicStatus === '1' ? 'In Progress' : 'Completed'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.remarks || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openTopicModal(t)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit topic"
                      >
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-10">
              {search ? 'No matching topics found' : 'No topics found for this batch'}
            </p>
          )}
        </div>

        {/* Main Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add / Edit Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {isEditMode ? 'Edit Topic' : 'Add New Topic'}
              </h3>
              <button
                onClick={() => setShowTopicModal(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="p-6 space-y-5">
              {/* Topic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={topicForm.topicName}
                  onChange={e => setTopicForm({ ...topicForm, topicName: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Enter topic name"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={topicForm.topicStartDate}
                    onChange={e => setTopicForm({ ...topicForm, topicStartDate: e.target.value })}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={topicForm.topicEndDate}
                    onChange={e => setTopicForm({ ...topicForm, topicEndDate: e.target.value })}
                    min={topicForm.topicStartDate}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={topicForm.start}
                    onChange={e => setTopicForm({ ...topicForm, start: e.target.value })}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={topicForm.end}
                    onChange={e => setTopicForm({ ...topicForm, end: e.target.value })}
                    required
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={topicForm.status}
                  onChange={e => setTopicForm({ ...topicForm, status: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- Select Status --</option>
                  <option value="0">Not Started</option>
                  <option value="1">In Progress</option>
                  <option value="2">Completed</option>
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={topicForm.remarks}
                  onChange={e => setTopicForm({ ...topicForm, remarks: e.target.value })}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="Optional remarks..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 transition flex items-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  ) : (
                    <i className="ri-add-line"></i>
                  )}
                  {isEditMode ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}