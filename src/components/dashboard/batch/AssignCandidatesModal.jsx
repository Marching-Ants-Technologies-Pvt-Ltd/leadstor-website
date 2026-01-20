'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'

export default function AssignCandidatesModal({ batch, onClose, onSuccess }) {
  const [candidates, setCandidates] = useState([])
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {

        const data = await xFetch({
          path: `/services/attendance/getAttendanceCandidate?batchId=${batch.batchId}`
        })
        setCandidates(Array.isArray(data) ? data : [])
      } catch {
        toast.error('Failed to load candidates')
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [batch.batchId])

  const toggleCandidate = (candidateId) => {
    setSelectedCandidateIds(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  const handleAssign = async () => {
    if (!selectedCandidateIds.length) return toast.warn('Select at least one candidate')

    try {
        
      // Bulk update/reset first
      await xFetch({
        path: '/services/attendance/updateAllCandiatestoBatch',
        method: 'POST',
        payload: { batchId: batch.batchId, labelId: batch?.labelId }
      })

      // Assign each selected candidate
      for (const candidateId of selectedCandidateIds) {
        await xFetch({
          path: '/services/attendance/assignCandidatetoBatch',
          method: 'POST',
          payload: {
            batchId: batch.batchId,
            labelId: batch?.labelId,
            candidateId: candidateId
          }
        })
      }

      toast.success('Candidate(s) assigned successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Failed to assign candidates')
      console.error(err)
    }
  }

  const filteredCandidates = candidates.filter(c =>
    c.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
    c.candidateEmail?.toLowerCase().includes(search.toLowerCase()) ||
    c.candidatePhone?.includes(search)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Assign Candidate(s) - {batch.batchName}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-xl">
            &times;
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex justify-between items-center">
          <button
            onClick={handleAssign}
            disabled={!selectedCandidateIds.length}
            className={`px-4 py-2 rounded text-white font-medium ${
              selectedCandidateIds.length
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            ✓ Assign
          </button>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => setSearch('')}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <i className="ri-refresh-line"></i>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-10">Loading candidates...</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedCandidateIds.length === candidates.length}
                      onChange={() => {
                        if (selectedCandidateIds.length === candidates.length) {
                          setSelectedCandidateIds([])
                        } else {
                          setSelectedCandidateIds(candidates.map(c => c.instituteCandidateId))
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Phone</th>
                  <th className="px-4 py-2 text-left font-medium">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCandidates.map(c => (
                  <tr key={c.instituteCandidateId} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedCandidateIds.includes(c.instituteCandidateId)}
                        onChange={() => toggleCandidate(c.instituteCandidateId)}
                      />
                    </td>
                    <td className="px-4 py-2">{c.candidateName}</td>
                    <td className="px-4 py-2">{c.candidateEmail}</td>
                    <td className="px-4 py-2">{c.candidatePhone}</td>
                    <td className="px-4 py-2">{c.candidateCourse || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-right border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            × Close
          </button>
        </div>
      </div>
    </div>
  )
}