'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'

export default function CopyTopicsModal({ batch, onClose, onSuccess }) {
  const [batches, setBatches] = useState([])
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [copyToStartDate, setCopyToStartDate] = useState('')
  const [copyToEndDate, setCopyToEndDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const data = await xFetch({ path: '/services/attendance/getBatches' })
        if (Array.isArray(data)) {
          // Exclude current batch
          const filtered = data.filter(b => b.batchId !== batch.batchId)
          setBatches(filtered)
        }
      } catch {
        toast.error('Failed to load batches for copy')
      } finally {
        setLoading(false)
      }
    }
    fetchBatches()
  }, [batch.batchId])

  const handleCopy = async () => {
    if (!selectedBatchId) return toast.error('Please select a batch to copy from')
    if (!copyToStartDate || !copyToEndDate) return toast.error('Please select both copy start and end dates')

    setLoading(true)

    try {
      await xFetch({
        path: '/services/attendance/copyTopics',
        method: 'POST',
        payload: {
          copyFromBatchId: selectedBatchId,
          copyToBatchId: batch.batchId,
          copyToStartDate: copyToStartDate,
          copyToEndDate: copyToEndDate
        }
      })
        .then(() => {
            toast.success(`Topics copied successfully`)
        })
        .catch(() => {
            toast.error('Failed to copy topics')
        })
        .finally(() => {
            setLoading(false)
        })

      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Failed to copy topics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Copy Topics - {batch?.batchName || 'Current Batch'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">×</button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 flex-1 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select batch to copy topics from
            </label>
            {loading ? (
              <p>Loading batches...</p>
            ) : batches.length ? (
              <select
                value={selectedBatchId || ''}
                onChange={e => setSelectedBatchId(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">-- Select Batch --</option>
                {batches.map(b => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchName} ({b.labelName || '—'})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-500">No other batches available</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copy to Start Date
              </label>
              <input
                type="date"
                value={copyToStartDate}
                onChange={e => setCopyToStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copy to End Date
              </label>
              <input
                type="date"
                value={copyToEndDate}
                onChange={e => setCopyToEndDate(e.target.value)}
                min={copyToStartDate}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={loading || !selectedBatchId || !copyToStartDate || !copyToEndDate}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md disabled:opacity-50 transition"
          >
            Copy Topics
          </button>
        </div>
      </div>
    </div>
  )
}