'use client';

import { useState, useEffect } from 'react';
import { Calendar, X, RefreshCw, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { xFetch } from '@/utility/xFetch';
import { toast } from 'react-toastify';

export default function ScheduledEmailStatus({ jobId, title, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const getVisiblePages = () => {
    const pages = [];

    let start = Math.max(1, currentPage - 3);
    let end = Math.min(totalPages, start + 7);

    if (end - start < 7) {
      start = Math.max(1, end - 7);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  useEffect(() => {
    loadEmailLogs();
  }, [jobId, currentPage, itemsPerPage]);

  const loadEmailLogs = async () => {
    setLoading(true);

    try {
      const offset = (currentPage - 1) * itemsPerPage;

      const params = {
        jobId: String(jobId),
        offset,
        limit: itemsPerPage,
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm) params.search = searchTerm;

      const data = await xFetch({
        path: '/services/job/getJobNotificationsEmailLogs',
        payload: params,
      });

      setLogs(data?.rows || []);
      setTotalRecords(Number(data?.total || 0));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load scheduled email status');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setShowFilter(false);
    setCurrentPage(1);
    loadEmailLogs();
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    loadEmailLogs();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600">Job ID: {jobId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(startDate || endDate) && (
            <div className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
              <Calendar size={15} />
              <span>
                {startDate || '—'} → {endDate || '—'}
              </span>
              <button onClick={clearFilter} className="hover:text-amber-900">
                <X size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFilter(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Calendar size={16} />
            Filter Date
          </button>

          <button
            onClick={loadEmailLogs}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* Date Filter Modal */}
      {showFilter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-5">Filter Scheduled Emails</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowFilter(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilter}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-center font-medium text-gray-700">SlNo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Mobile</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Scheduled Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Notification Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  <div className="flex justify-center items-center gap-3">
                    <Loader2 size={20} className="animate-spin text-indigo-600" />
                    Loading scheduled emails...
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-500">
                  No scheduled emails found
                </td>
              </tr>
            ) : (
              logs.map((log, index) => {
                const slNo = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">{slNo}</td>
                    <td className="px-4 py-3">{log.name || '-'}</td>
                    <td className="px-4 py-3">{log.email || '-'}</td>
                    <td className="px-4 py-3">{log.mobile || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          log.status === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {log.status === 0 ? 'Queued' : 'Sent'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.created_datetime || '-'}</td>
                    <td className="px-4 py-3">{log.processed_time || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
        {!loading && totalRecords > 0 && (
          <div className="bg-white border-t px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">

            {/* Left */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                Showing{" "}
                <span className="font-semibold text-blue-600">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                -
                <span className="font-semibold text-blue-600">
                  {Math.min(currentPage * itemsPerPage, totalRecords)}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {totalRecords}
                </span>
              </span>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setCurrentPage(1);
                  setItemsPerPage(Number(e.target.value));
                }}
                className="border rounded-full px-3 py-1 bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
              </select>

              <span>per page</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition
                  ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }
                `}
              >
                Previous
              </button>

              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-full border font-medium transition
                    ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition
                  ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }
                `}
              >
                Next
              </button>

            </div>
          </div>
        )}
    </div>
  );
}
