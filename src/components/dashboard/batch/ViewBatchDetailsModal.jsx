// src/components/dashboard/batch/ViewBatchDetailsModal.jsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'
import * as XLSX from 'xlsx'

export default function ViewBatchDetailsModal({ batch, onClose }) {
  const [loading, setLoading] = useState(true)
  const [batchSummary, setBatchSummary] = useState(null)
  const [trainers, setTrainers] = useState([])
  const [candidates, setCandidates] = useState([])
  const [paymentDetails, setPaymentDetails] = useState([])

  useEffect(() => {
    const fetchAllBatchData = async () => {
      if (!batch?.batchId) return

      setLoading(true)

      try {
        // Step 1: Fetch the first three independent datasets in parallel
        const [batchDetailsRes, trainersRes, candidatesRes] = await Promise.all([
          // 1. Batch basic details
          xFetch({
            path: `/services/attendance/getBatchDetails?BatchId=${batch.batchId}`
          }),

          // 2. Assigned trainers
          xFetch({
            path: `/services/attendance/getTrainers?batchId=${batch.batchId}`
            // corporateId is not sent — backend handles via token/session
          }),

          // 3. Candidates mapped to this batch
          xFetch({
            path: `/services/attendance/getCandidatesToBatch?labelId=${batch.labelId}&batchId=${batch.batchId}`
          })
        ])

        // Step 2: Now fetch payment status using the candidates result (dependent call)
        const paymentRes = await xFetch({
          path: '/services/attendance/getCandidatePaymentStatus',
          method: 'POST',
          payload: {
            candidateDetails: candidatesRes,      // pass the full candidates array
            labelId: batch.labelId
            // corporateId not sent — backend uses token/session
          }
        })

        // Update state
        setBatchSummary(batchDetailsRes)
        setTrainers(trainersRes || [])
        setCandidates(candidatesRes || [])
        setPaymentDetails(paymentRes || [])

      } catch (err) {
        toast.error('Failed to load complete batch details')
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllBatchData()
  }, [batch?.batchId, batch?.labelId])

  // Download Excel (same as before, now using fetched data)
  const handleDownload = () => {
    if (!batchSummary) return toast.warn('No data available to download')

    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Summary
      const summaryData = [
        [`Batch: ${batch.batchName || 'Unnamed Batch'}`],
        [],
        ['Batch Details'],
        ['Status', 'Standard Fee', 'Total Candidates', 'Assigned Trainers', 'Progress %', 'Fee Payment %'],
        [
          batchSummary.status || '—',
          batchSummary.standardFee || '—',
          paymentDetails.length || candidates.length || 0,
          trainers.filter(t => t.selected || t.mapid).length || 0,
          batchSummary.batchProgress || '0%',
          batchSummary.feePayment || '0%'
        ]
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)

      // Sheet 2: Trainers
      const trainersData = [
        ['Trainers'],
        ['Trainer Name', 'Email']
      ]
      trainers.forEach(t => {
        if (t.selected || t.mapid) {
          trainersData.push([t.trainerName || t.name || '—', t.trainerEmail || t.email || '—'])
        }
      })
      const wsTrainers = XLSX.utils.aoa_to_sheet(trainersData)

      // Sheet 3: Candidates with Payment
      const candidatesData = [
        ['Candidates'],
        ['#', 'Name', 'Email', 'Phone', 'Agreed Payment', 'Paid', 'Fee Payment']
      ]
      paymentDetails.forEach((c, i) => {
        const agreed = c.agreed_payment || 0
        const paid = c.paid_amount || 0
        const feePct = agreed > 0 ? ((paid / agreed) * 100).toFixed(2) : 0

        candidatesData.push([
          i + 1,
          c.candidate_name || '—',
          c.candidate_email || '—',
          c.candidate_phone || '—',
          agreed,
          paid,
          `${feePct}%`
        ])
      })
      const wsCandidates = XLSX.utils.aoa_to_sheet(candidatesData)

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
      XLSX.utils.book_append_sheet(wb, wsTrainers, 'Trainers')
      XLSX.utils.book_append_sheet(wb, wsCandidates, 'Candidates')

      const fileName = `${batch.batchName?.replace(/\s+/g, '_') || 'Batch'}_Details.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success('Download started!')
    } catch (err) {
      toast.error('Failed to generate Excel')
      console.error(err)
    }
  }

  // Delete candidate (refreshes data after success)
  const handleDeleteCandidate = async (candidate) => {
    const name = candidate.candidate_name || candidate.candidateName || 'this candidate'
    if (!window.confirm(`Remove ${name} from batch?`)) return

    try {
      await xFetch({
        path: '/services/attendance/deleteCandidateFromBatch',
        method: 'POST',
        body: {
          batchId: batch.batchId,
          instituteCandidateId: candidate.institute_candidate_id || candidate.instituteCandidateId
        }
      })

      toast.success('Candidate removed')

      // Re-fetch all data (parallel again)
      const [batchDetailsRes, trainersRes, candidatesRes] = await Promise.all([
        xFetch({ path: `/services/attendance/getBatchDetails?BatchId=${batch.batchId}` }),
        xFetch({ path: `/services/attendance/getTrainers?batchId=${batch.batchId}` }),
        xFetch({ path: `/services/attendance/getCandidatesToBatch?labelId=${batch.labelId}&batchId=${batch.batchId}` })
      ])

      const paymentRes = await xFetch({
        path: '/services/attendance/getCandidatePaymentStatus',
        method: 'POST',
        payload: { candidateDetails: candidatesRes, labelId: batch.labelId }
      })

      setBatchSummary(batchDetailsRes)
      setTrainers(trainersRes || [])
      setCandidates(candidatesRes || [])
      setPaymentDetails(paymentRes || [])
    } catch (err) {
      toast.error('Failed to remove candidate')
      console.error(err)
    }
  }

  // Calculate fee payment % (like your PHP)
  const totalCandidates = paymentDetails.length || candidates.length || 0
  const totalAgreed = paymentDetails.reduce((sum, c) => sum + (Number(c.agreed_payment) || 0), 0)
  const totalPaid = paymentDetails.reduce((sum, c) => sum + (Number(c.paid_amount) || 0), 0)
  const feePaymentPercentage = totalAgreed > 0 ? ((totalPaid / totalAgreed) * 100).toFixed(2) : 0

  const assignedTrainersCount = trainers.filter(t => t.selected || t.mapid).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="lead-header px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            View Details - {batch?.batchName || 'Batch'}
          </h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading batch details...</div>
          ) : batchSummary ? (
            <>
              {/* Batch Details Section – Heading & Download Button on same line */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-blue-700">Batch Details</h3>
                  <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium disabled:opacity-50 transition shadow-sm"
                  >
                    <i className="ri-download-line text-base"></i>
                    Download Details
                  </button>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 text-sm">
                    <div>
                      <span className="font-medium block text-gray-600">Status</span>
                      <p className="font-semibold mt-1">{batchSummary.status || '—'}</p>
                    </div>
                    <div>
                      <span className="font-medium block text-gray-600">Standard Fee</span>
                      <p className="font-semibold mt-1">{batchSummary.standardFee || '—'}</p>
                    </div>
                    <div>
                      <span className="font-medium block text-gray-600">Candidates</span>
                      <p className="font-semibold mt-1">{totalCandidates}</p>
                    </div>
                    <div>
                      <span className="font-medium block text-gray-600">Trainers</span>
                      <p className="font-semibold mt-1">{assignedTrainersCount}</p>
                    </div>
                    <div>
                      <span className="font-medium block text-gray-600">Progress %</span>
                      <p className="font-semibold mt-1">{batchSummary.batchProgress || '0%'}</p>
                    </div>
                    <div>
                      <span className="font-medium block text-gray-600">Fee Payment %</span>
                      <p className="font-semibold mt-1">{feePaymentPercentage}%</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Trainers */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Trainers</h3>
                <div className="overflow-x-auto rounded border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">Trainer Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trainers.length ? (
                        trainers
                          .filter(t => t.selected || t.mapid)
                          .map((t, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{t.trainerName || t.name || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{t.trainerEmail || t.email || '—'}</td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                            No trainers assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Candidates */}
              <section>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Candidates</h3>
                <div className="overflow-x-auto rounded border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">#</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Phone</th>
                        <th className="px-4 py-3 text-left">Agreed Payment</th>
                        <th className="px-4 py-3 text-left">Paid</th>
                        <th className="px-4 py-3 text-left">Fee Payment</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentDetails.length ? (
                        paymentDetails.map((c, i) => {
                          const agreed = Number(c.agreed_payment || 0)
                          const paid = Number(c.paid_amount || 0)
                          const feePct = agreed > 0 ? ((paid / agreed) * 100).toFixed(2) : 0

                          return (
                            <tr key={c.institute_candidate_id || i} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{i + 1}</td>
                              <td className="px-4 py-3">{c.candidate_name || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{c.candidate_email || '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{c.candidate_phone || '—'}</td>
                              <td className="px-4 py-3">{agreed}</td>
                              <td className="px-4 py-3">{paid}</td>
                              <td className="px-4 py-3 font-medium">{feePct}%</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteCandidate(c)}
                                  className="text-red-600 hover:text-red-800 transition"
                                  title="Remove from batch"
                                >
                                  <i className="ri-delete-bin-line text-lg"></i>
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                            No candidates assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No details available for this batch
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
          >
            × Close
          </button>
        </div>
      </div>
    </div>
  )
}