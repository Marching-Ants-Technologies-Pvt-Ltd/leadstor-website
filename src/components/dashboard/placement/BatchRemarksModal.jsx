'use client'

import { useState } from 'react'
import { xFetch } from '@/utility/xFetch'
import { toast } from 'react-toastify'

/**
 * Batch-update the Remarks field for multiple candidates at once.
 *
 * Reuses the exact same partial-update pattern as CandidateFormModal's
 * edit mode: build a FormData with just `candidateId` + the field being
 * changed, and POST to the existing /services/job/addCandidate endpoint.
 * Since that endpoint only touches fields present in the request, sending
 * just candidateId + remarks leaves every other field on the candidate
 * untouched — no new backend endpoint required.
 */
// How many requests to fire concurrently per batch. Keeps large
// selections (50-100+ candidates) fast without slamming the server
// with hundreds of simultaneous requests. Tune based on backend load.
const CHUNK_SIZE = 5

const chunkArray = (arr, size) => {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

export default function BatchRemarksModal({
  isOpen,
  onClose,
  onSuccess,
  // [{ candidateId, name, mobile, email }, ...]
  // name/mobile/email are required here because the backend's
  // addCandidate endpoint rejects requests missing them (406,
  // "candidateName parameter missing") even when only remarks
  // is actually changing — it is not a true partial-field update.
  selectedCandidates = [],
}) {
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState(0) // count completed so far

  if (!isOpen) return null

  const updateOneCandidate = async (candidate) => {
    const payload = new FormData()
    payload.append('candidateId', String(candidate.candidateId))
    payload.append('candidateName', candidate.name || '')
    payload.append('candidateMobile', candidate.mobile || '')
    payload.append('candidateEmail', candidate.email || '')
    payload.append('remarks', remarks)

    await xFetch({
      path: '/services/job/addCandidate',
      method: 'POST',
      payload,
      isFormData: true,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!remarks.trim()) {
      toast.error('Enter a remark before saving')
      return
    }

    if (selectedCandidates.length === 0) {
      toast.error('No candidates selected')
      return
    }

    setSubmitting(true)
    setProgress(0)

    let successCount = 0
    const failedNames = []

    // Process in concurrent chunks: within a chunk, requests fire in
    // parallel; chunks themselves run one after another. This caps
    // how many simultaneous requests hit the backend at once while
    // still being much faster than a fully sequential loop.
    const chunks = chunkArray(selectedCandidates, CHUNK_SIZE)

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map((candidate) => updateOneCandidate(candidate))
      )

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          successCount++
        } else {
          console.error(
            `Failed to update remarks for ${chunk[i].name}:`,
            result.reason
          )
          failedNames.push(chunk[i].name)
        }
      })

      setProgress((prev) => prev + chunk.length)
    }

    setSubmitting(false)

    if (failedNames.length === 0) {
      toast.success(
        `Remarks updated for ${successCount} candidate${successCount !== 1 ? 's' : ''}`
      )
    } else {
      toast.error(
        `Updated ${successCount}, failed for: ${failedNames.join(', ')}`
      )
    }

    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col">
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-lg font-semibold">Update Remarks</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-white hover:text-gray-200 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              This remark will be applied to {selectedCandidates.length} selected
              candidate{selectedCandidates.length !== 1 ? 's' : ''}:
            </p>
            <div className="max-h-24 overflow-y-auto text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-md p-2">
              {selectedCandidates.map((c) => c.name).join(', ')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="This will overwrite the existing remark for all selected candidates"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {submitting
                ? `Saving... (${progress}/${selectedCandidates.length})`
                : `Save for ${selectedCandidates.length}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
