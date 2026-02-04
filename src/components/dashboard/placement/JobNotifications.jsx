'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import { format } from 'date-fns';

export default function JobNotifications({ corporateId, institutes, onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch all notifications (once per institute change)
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        corporateId: selectedInstitute === 'all' ? corporateId : selectedInstitute,
        actualCorporateId: corporateId,
        time: new Date().getTime(),
      };

      const data = await xFetch({
        path: '/services/job/getJobNotifications',
        payload: params,
      });

      const allData = data.rows || data.data || data || [];
      setNotifications(allData);
      setTotalRecords(allData.length);
      setPage(1); // reset to page 1 when institute changes
    } catch (err) {
      console.error('Failed to load notifications', err);
      toast.error('Could not load job notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [selectedInstitute]);

  // Client-side filtering + pagination
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) =>
      [n.name, n.email, n.mobile, n.jobTitle, n.instituteName || '']
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [notifications, search]);

  const totalPages = Math.ceil(filteredNotifications.length / limit);

  // Paginated data
  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredNotifications.slice(start, end);
  }, [filteredNotifications, page, limit]);

  // Reset page when search or institute changes affect total pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [filteredNotifications.length, totalPages]);

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'notified': return 'bg-blue-100 text-blue-800';
      case 'interested': return 'bg-emerald-100 text-emerald-800';
      case 'interview attended': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusFormatter = (value, row) => {
    if(0 == value)
        return 'Notified';
      else if(1 == value)
        return 'Interested';
      else
        return 'Interview Attended';
	}

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Toolbar */}
      <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-lg px-6 py-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl shadow-sm transition-all duration-200"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            Back to Jobs
          </button>

          <div className="relative w-full sm:w-64">
            <select
              value={selectedInstitute}
              onChange={(e) => setSelectedInstitute(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
            >
              <option value="all">All Institutes</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
              placeholder="Search name, email, job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
          </div>

          <button
            onClick={fetchNotifications}
            className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md shadow-sm transition-all duration-200"
            title="Refresh"
          >
            <i className="ri-refresh-line text-xl text-gray-700 transition-transform hover:rotate-180 duration-500"></i>
          </button>

          <button
            onClick={() => toast.info('Export feature coming soon')}
            className="p-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-md shadow-sm transition-all duration-200"
            title="Export to Excel"
          >
            <i className="ri-download-2-line text-xl text-gray-700"></i>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-200/80 rounded-2xl bg-white shadow-lg">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
            <span className="text-gray-600 font-medium">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <i className="ri-notification-3-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-lg font-medium">No job notifications found</p>
            <p className="text-sm mt-2">Try changing the institute or search term</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 sticky top-0 z-10 shadow-sm">
              <tr>
                {['Institute', 'Name', 'Email', 'Mobile', 'Job', 'Status', 'Interview Date', 'Notification Date'].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-semibold text-gray-700 tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedNotifications.map((n, i) => (
                <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{n.instituteName || '-'}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{n.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 break-all">{n.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{n.mobile || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{n.jobTitle || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(n.status)}`}>
                      {statusFormatter(n.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {n.interviewDate ? format(new Date(n.interviewDate), 'dd-MMM-yyyy hh:mm a') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {n.sentDate ? format(new Date(n.sentDate), 'dd-MMM-yyyy hh:mm a') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fixed Pagination */}
      {!loading && totalRecords > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 px-2 text-sm text-gray-700">
          {/* Showing info + rows per page */}
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <span>
              Showing <strong>{(page - 1) * limit + 1}</strong>–
              <strong>{Math.min(page * limit, filteredNotifications.length)}</strong> of <strong>{filteredNotifications.length.toLocaleString()}</strong>
            </span>

            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-gray-600">per page</span>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-1.5 flex-wrap bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all duration-200 shadow-sm flex items-center gap-1"
            >
              <i className="ri-arrow-left-s-line"></i> Prev
            </button>

            {(() => {
              const pages = [];
              const maxVisible = 7;
              let start = Math.max(1, page - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible - 1);

              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-4 py-2 rounded-lg min-w-[40px] transition-all duration-200 shadow-sm ${
                      page === i
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i}
                  </button>
                );
              }

              return pages;
            })()}

            {totalPages > 7 && page + 3 < totalPages && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className={`px-4 py-2 rounded-lg min-w-[40px] transition-all duration-200 shadow-sm ${
                    page === totalPages
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all duration-200 shadow-sm flex items-center gap-1"
            >
              Next <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}