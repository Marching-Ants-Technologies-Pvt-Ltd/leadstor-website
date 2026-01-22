'use client'

import { useEffect, useState } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify'
import { xFetch } from '@/utility/xFetch'
import { Corporate } from '@/utility/TinyDB'
import * as XLSX from 'xlsx'
import PlacementReadyTable from './table'
import CandidateFormModal from '@/components/dashboard/placement/CandidateFormModal'
import FilterModal from '@/components/dashboard/placement/FilterModal'

export default function PlacementReadyController() {
    const corporateId = Corporate?._id

    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)          // ← total from server

    const [search, setSearch] = useState('')
    const [selectedIds, setSelectedIds] = useState([])

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)         // ← now changeable

    const [sortField, setSortField] = useState(null)
    const [sortDirection, setSortDirection] = useState('ASC')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState('add')
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const totalPages = Math.ceil(total / limit)

    // Filter states
    const [filters, setFilters] = useState({})
    const [filterSummary, setFilterSummary] = useState('')
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [filterOptions, setFilterOptions] = useState({
        statuses: [],
        locations: [],
        courses: [],
        job_profiles: [],
        lastDesignations: [],
        expectedDesignations: [],
        totalExperiences: [],
        relevantExperiences: [],
        expectedCTCs: [],
        educationalQualifications: [],
    })

    // Fetch filter options once
    useEffect(() => {
        const fetchFilterOptions = async () => {
        try {
            const data = await xFetch({
            path: '/services/job/getFilterParameters',
            payload: { corporateId }
            })
            setFilterOptions(data || {})
        } catch (err) {
            toast.error('Failed to load filter options')
        }
        }
        fetchFilterOptions()
    }, [corporateId])

    useEffect(() => {
        setPage(1)
    }, [limit, search, filters])

    // Export current page (client-side)
    const handleClientExport = () => {
        if (!candidates.length) {
        toast.warn('No data to export')
        return
        }

        const data = candidates.map(c => ({
        Name: c.name || '',
        Email: c.email || '',
        Mobile: c.mobile || '',
        Qualification: c.qualification || '',
        'Year of Passing': c.yearOfPassing || '',
        'Current City': c.currentCity || '',
        'Job Profiles': (c.jobTags || []).join(', ') || '',
        'Placement Status': c.placementStatus || '',
        Resume: c.resumeName || '',
        Course: c.course || '',
        'Course Start': c.courseStartDate || '',
        'Course End': c.courseEndDate || '',
        'Job Status': c.jobStatus || '',
        'Total Exp': c.totalExperience || '',
        'Relevant Exp': c.relevantExperience || '',
        'Last Org': c.lastOrganizationName || '',
        'Exp Job Type': c.expectedJobType || '',
        'Exp Location': (c.expectedLocationPreference || []).join(', ') || '',
        'Last Desig': c.lastDesignation || '',
        'Exp Desig': c.expectedDesignation || '',
        'Last CTC': c.lastCTC || '',
        'Exp CTC': c.expectedCTC || '',
        Remarks: c.remarks || '',
        'Receive Job Opp': c.receiveJobOpportunities || '',
        Updated: c.updatedDate || ''
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Placement Ready')
        XLSX.writeFile(wb, `placement-ready-page-${page}-${new Date().toISOString().slice(0,10)}.xlsx`)
        toast.success('Current page exported')
    }

    // Server-side full export
    const handleServerExport = async () => {
        try {
        const params = { corporateId: String(corporateId), ...filters }
        if (search.trim()) params.search = search.trim()

        const blob = await xFetch({
            path: '/services/job/exportPlacementReport',
            payload: params,
            responseType: 'blob'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `placement-ready-full-${new Date().toISOString().slice(0,10)}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.success('Full report exported')
        } catch (err) {
        toast.error('Export failed')
        }
    }

    // Filter modal logic
    const applyFilters = (newFilters) => {
        setFilters(newFilters)
        setPage(1)

        const parts = []

        if (newFilters.status?.length) {
            parts.push(`Status: ${newFilters.status.join(', ')}`)
        }
        if (newFilters.course?.length) {
            parts.push(`Course: ${newFilters.course.join(', ')}`)
        }
        if (newFilters.location?.length) {
            parts.push(`City: ${newFilters.location.join(', ')}`)
        }
        if (newFilters.jobProfile?.length) {
            parts.push(`Job Profile: ${newFilters.jobProfile.join(', ')}`)
        }
        if (newFilters.lastDesignation?.length) {
            parts.push(`Last Desig: ${newFilters.lastDesignation.join(', ')}`)
        }
        if (newFilters.expectedDesignation?.length) {
            parts.push(`Exp Desig: ${newFilters.expectedDesignation.join(', ')}`)
        }
        if (newFilters.totalExperience?.length) {
            parts.push(`Total Exp: ${newFilters.totalExperience.join(', ')}`)
        }
        if (newFilters.relevantExperience?.length) {
            parts.push(`Relevant Exp: ${newFilters.relevantExperience.join(', ')}`)
        }
        if (newFilters.expectedCTC?.length) {
            parts.push(`Exp CTC: ${newFilters.expectedCTC.join(', ')}`)
        }
        if (newFilters.educationalQualification?.length) {
            parts.push(`Qual: ${newFilters.educationalQualification.join(', ')}`)
        }
        if (newFilters.yearOfPassing) {
            parts.push(`YOP: ${newFilters.yearOfPassing}`)
        }

        setFilterSummary(parts.length > 0 ? parts.join(' | ') : '')
    }

    const clearFilters = () => {
        setFilters({})
        setFilterSummary('')
        setPage(1)
    }

    const reloadCandidates = async () => {
        setLoading(true)
        try {
        const offset = (page - 1) * limit

        const params = {
            corporateId: String(corporateId),
            offset: String(offset),
            limit: String(limit),
            ...filters,
        }

        if (search.trim()) {
            params.search = search.trim()
        }

        if (sortField) {
            params.order = `${sortField} ${sortDirection}`
        }

        const data = await xFetch({
            path: '/services/job/getCandidates',
            payload: params,  
        })

        const list = Array.isArray(data) ? data : (data?.rows || data?.data || [])
        setCandidates(list)
        setTotal(data?.total || 0)

        } catch (err) {
            console.error(err)
            toast.error('Failed to load placement ready candidates')
        } finally {
            setLoading(false)
        }
    }

    // Re-fetch when any of these change
    useEffect(() => {
        reloadCandidates()
    }, [page, limit, search, sortField, sortDirection, filters, corporateId])

    // ─── Bulk Delete ───────────────────────────────────────
    const handleBulkDelete = async () => {
        if (!selectedIds.length) {
        toast.warn('No candidates selected')
        return
        }

        if (!window.confirm(`Delete ${selectedIds.length} candidate(s)?`)) return

        try {
        for (const id of selectedIds) {
            await xFetch({
            path: '/services/job/deleteCandidate',
            method: 'POST',
            payload: { candidateId: id }
            })
        }
        toast.success(`${selectedIds.length} candidate(s) deleted`)
        setSelectedIds([])
        reloadCandidates()
        } catch (err) {
        toast.error('Delete failed')
        }
    }

    // ─── Client-side Export (using current page data) ──────
    const handleExport = () => {
        if (!candidates.length) {
        toast.warn('No data to export')
        return
        }

        const data = candidates.map(c => ({
        Name: c.name || '',
        Email: c.email || '',
        Mobile: c.mobile || '',
        Qualification: c.qualification || '',
        'Year of Passing': c.yearOfPassing || '',
        'Current City': c.currentCity || '',
        'Job Profiles': formatArrayOrString(c.jobTags),
        'Placement Status': c.placementStatus || '',
        Resume: c.resumeName || '',
        Course: c.course || '',
        'Course Start': c.courseStartDate || '',
        'Course End': c.courseEndDate || '',
        'Job Status': c.jobStatus || '',
        'Total Exp (Years)': c.totalExperience || '',
        'Relevant Exp (Years)': c.relevantExperience || '',
        'Last Organization': c.lastOrganizationName || '',
        'Expected Job Type': c.expectedJobType || '',
        'Expected Location': formatArrayOrString(c.expectedLocationPreference),
        'Last Designation': c.lastDesignation || '',
        'Expected Designation': c.expectedDesignation || '',
        'Last CTC': c.lastCTC || '',
        'Expected CTC': c.expectedCTC || '',
        Remarks: c.remarks || '',
        'Receive Job Opportunities': c.receiveJobOpportunities || '',
        'Updated Time': c.updatedDate || ''
        }))

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Placement Ready')
        XLSX.writeFile(wb, `placement-ready-page-${page}-${new Date().toISOString().slice(0,10)}.xlsx`)
        toast.success('Current page exported')

        toast.success('Full report exported')
    }

    // Add handler functions
    const openAddModal = () => {
        setModalMode('add')
        setSelectedCandidate({})
        setIsModalOpen(true)
    }

    const openEditModal = (row) => {
        setModalMode('edit')
        setSelectedCandidate(row)
        setIsModalOpen(true)
    }

    const formatArrayOrString = (value) => {
        if (Array.isArray(value)) return value.join(', ')
        if (typeof value === 'string') return value
        return '' // null, undefined, number, object, etc.
    }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ToastContainer theme="light" transition={Bounce} position="top-right" autoClose={2200} />

      {/* Toolbar */}
      <div className="bg-white border-b px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded shadow-sm transition-colors"
            onClick={openAddModal}
          >
            Add Candidate
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={!selectedIds.length}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded shadow-sm transition-colors ${
              selectedIds.length
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className="ri-delete-bin-line text-lg"></i>
            Delete {selectedIds.length ? `(${selectedIds.length})` : ''}
          </button>
        
        <button
            onClick={() => setShowFilterModal(true)}
            className={`
                inline-flex items-center gap-2 px-4 py-2 border text-sm rounded shadow-sm transition-all
                ${filterSummary 
                ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md' 
                : 'border-gray-300 hover:bg-gray-100 text-gray-700'}
            `}
            >
            <i className="ri-filter-3-line text-lg"></i>
            Filter
            {filterSummary && (
                <span className="ml-1 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                Active
                </span>
            )}
        </button>
          
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-sm rounded shadow-sm transition-colors">
            <i className="ri-file-list-3-line text-lg"></i>
            Report
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            className="border border-gray-300 rounded-md p-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={reloadCandidates}
            className="p-2.5 border border-gray-300 hover:bg-gray-100 rounded shadow-sm transition-colors"
            title="Refresh"
          >
            <i className="ri-refresh-line text-xl"></i>
          </button>

          <button
            onClick={handleExport}
            className="p-2.5 border border-gray-300 hover:bg-gray-100 rounded shadow-sm transition-colors"
            title="Export to Excel"
          >
            <i className="ri-download-2-line text-xl"></i>
          </button>
        </div>
      </div>

      {/* Filter summary */}
      {filterSummary && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mx-5 mt-3 flex items-center justify-between">
          <div className="text-sm text-blue-800">
            <i className="ri-filter-fill mr-2"></i>
            {filterSummary}
          </div>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Clear Filter ×
          </button>
        </div>
      )}

      {/* Table Area */}
      <div className="flex-1 flex flex-col min-h-0 px-5 pb-5 overflow-hidden">
        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              Loading placement ready candidates...
            </div>
          ) : (
            <PlacementReadyTable
                rows={candidates}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onEdit={openEditModal}
                onStatusChange={(id, status) => {
                    toast.info(`Change status for ID ${id} from ${status}`)
                }}
                onDelete={(id) => {
                    if (window.confirm('Delete this candidate?')) {
                    // single delete logic (similar to bulk)
                    xFetch({
                        path: '/services/job/deleteCandidate',
                        method: 'POST',
                        payload: { candidateId: id }
                    }).then(() => {
                        toast.success('Candidate deleted')
                        reloadCandidates()
                    }).catch(() => toast.error('Delete failed'))
                }
                }}
            />
          )}
        </div>

        {/* Pagination + Rows per page dropdown */}
        {!loading && total > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{(page - 1) * limit + 1}</strong>–
                <strong>{Math.min(page * limit, total)}</strong> of <strong>{total.toLocaleString()}</strong>
              </span>

              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1) // reset to first page
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>

              <span>per page</span>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1.5 border rounded min-w-[36px] transition-colors ${
                      page === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {totalPages > 10 && (
                <>
                  <span className="px-2">...</span>
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`px-3 py-1.5 border rounded min-w-[36px] transition-colors ${
                      page === totalPages
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

        {isModalOpen && (
        <CandidateFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
            reloadCandidates()
            setIsModalOpen(false)
            }}
            mode={modalMode}
            initialData={selectedCandidate}
            corporateId={corporateId}
        />
        )}

        {/* Filter Modal */}
        {showFilterModal && (
            <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            options={filterOptions}
            onApply={applyFilters}
            currentFilters={filters}
            onReset={clearFilters}
        />
        )}
    </div>
  )
}