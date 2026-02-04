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
  const itemsPerPage = 20;

  const filteredLogs = logs.filter(
    (log) =>
      log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.mobile?.includes(searchTerm)
  );

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  useEffect(() => {
    loadEmailLogs();
  }, [jobId]);

  const loadEmailLogs = async () => {
    console.log(startDate);
    setLoading(true);
    try {
      const params = {
        jobId: String(jobId),
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await xFetch({
        path: '/services/job/getJobNotificationsEmailLogs',
        payload: params,
      });

      const list = Array.isArray(data) ? data : data?.rows || [];
      setLogs(list);
    } catch (err) {
      console.error('Failed to load email logs:', err);
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
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-gray-500">
                  No scheduled emails found
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, index) => {
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
      {!loading && filteredLogs.length > 0 && (
        <div className="bg-white border-t px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}