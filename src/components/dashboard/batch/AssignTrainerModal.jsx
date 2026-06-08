// src/components/dashboard/batch/AssignTrainerModal.jsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'

export default function AssignTrainerModal({ batch, onClose, onSuccess }) {
  const [trainers, setTrainers] = useState([])
  const [selectedTrainerIds, setSelectedTrainerIds] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const data = await xFetch({
          path: `/services/attendance/getTrainers?batchId=${batch.batchId}`
        })
        setTrainers(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Failed to load trainers')
      } finally {
        setLoading(false)
      }
    }
    fetchTrainers()
  }, [batch.batchId])

  const getTrainerId = (trainer) => trainer?.userId ?? trainer?.trainerId ?? trainer?.id ?? null

  const toggleTrainer = (trainerId) => {
    if (trainerId === null || trainerId === undefined || String(trainerId).trim() === '') return
    setSelectedTrainerIds(prev =>
      prev.includes(trainerId)
        ? prev.filter(id => id !== trainerId)
        : [...prev, trainerId]
    )
  }

  const handleAssign = async () => {
    const resolvedBatchId = batch?.batchId || batch?.BatchId || batch?.id
    const validTrainerIds = Array.from(
      new Set(
        selectedTrainerIds.filter(
          (id) => id !== null && id !== undefined && String(id).trim() !== ''
        )
      )
    )

    if (!validTrainerIds.length) return toast.warn('Select at least one trainer')
    if (!resolvedBatchId) return toast.error('Batch ID is missing')

    setLoading(true)

    try {
      const details = validTrainerIds.reduce((acc, id) => {
        acc[String(id)] = 1
        return acc
      }, {})

      // 1. Bulk reset/update all trainers
      await xFetch({
        path: '/services/attendance/updateAllTrainertoBatch',
        method: 'POST',
        payload: {
            updateall: true,
            batchId: resolvedBatchId,
            labelId: batch?.labelId,
            details
        }
      })

      // 2. Assign each selected trainer one by one
      for (const trainerId of validTrainerIds) {
        await xFetch({
            path: '/services/attendance/assignTrainertoBatch',
            method: 'POST',
            payload: {
                batchId: resolvedBatchId,
                labelId: batch?.labelId,
                trainerId: trainerId
            }
        })
      }

      toast.success('Trainer(s) assigned successfully')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error('Failed to assign trainers')
      console.error('Assign error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainers = trainers.filter(t =>
    t.trainerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.trainerEmail?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="lead-header px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Assign Trainer(s) - {batch.batchName}
          </h2>
          <button onClick={onClose} className="text-black hover:text-gray-200 text-xl">
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex justify-between items-center">
          <button
            onClick={handleAssign}
            disabled={loading || !selectedTrainerIds.length}
            className={`px-5 py-2 rounded-md text-white font-medium transition ${
              selectedTrainerIds.length && !loading
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            ✓ Assign
          </button>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search trainers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => setSearch('')}
              className="p-2 text-gray-600 hover:text-blue-600 transition"
              title="Clear search"
            >
              <i className="ri-refresh-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading trainers...</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={
                        trainers.length > 0 &&
                        selectedTrainerIds.length ===
                          Array.from(
                            new Set(
                              trainers
                                .map(getTrainerId)
                                .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
                            )
                          ).length
                      }
                      onChange={() => {
                        const allTrainerIds = Array.from(
                          new Set(
                            trainers
                              .map(getTrainerId)
                              .filter((id) => id !== null && id !== undefined && String(id).trim() !== '')
                          )
                        )

                        if (selectedTrainerIds.length === allTrainerIds.length) {
                          setSelectedTrainerIds([])
                        } else {
                          setSelectedTrainerIds(allTrainerIds)
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Trainer Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrainers.length ? (
                  filteredTrainers.map((t, i) => (
                    <tr key={String(getTrainerId(t) ?? t.trainerEmail ?? t.trainerName ?? i)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedTrainerIds.includes(getTrainerId(t))}
                          onChange={() => toggleTrainer(getTrainerId(t))}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{t.trainerName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{t.trainerEmail || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-gray-500">
                      No trainers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-right border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
          >
            × Close
          </button>
        </div>
      </div>
    </div>
  )
}
