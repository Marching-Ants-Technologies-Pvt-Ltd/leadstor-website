'use client';

import { useEffect, useState } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import BatchTable from './batchTable';

export default function LabelController() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalRows = labels.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = labels.slice(startIndex, endIndex);

  const checkUncheckRows = (state = false) => {
      [...document.querySelectorAll('table#batchesTable tbody td input[type=checkbox]')].map(i => i.checked = state);
  }
  useEffect(() => {
    setLoading(true);
    xFetch({ path: '/services/attendance/getBatches' })
      .then(data => setLabels(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load batches'))
      .finally(() => setLoading(false));
  }, []);

   return (
    <div className="h-full flex flex-col">
      <ToastContainer theme="light" transition={Bounce} />

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-6 text-gray-500">Loading batches…</div>
          ) : (
            <BatchTable 
                rows={paginatedRows} 
                checkUncheckRows={checkUncheckRows}
            />
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="border-t bg-white px-6 py-3 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left */}
          <div className="flex items-center gap-3 text-gray-600">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, totalRows)} of {totalRows} rows
            </span>

            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span>rows per page</span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-40"
            >
              ‹
            </button>

            {[1, 2].map(page =>
              page <= totalPages && (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {totalPages > 3 && <span className="px-2">…</span>}

            {totalPages > 2 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-3 py-1 border rounded ${
                  currentPage === totalPages
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'hover:bg-slate-100'
                }`}
              >
                {totalPages}
              </button>
            )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded hover:bg-slate-100 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
