'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { xFetch } from '@/utility/xFetch';
import { toast } from 'react-toastify';

export default function AnalyticsChart({ corporateId, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = { corporateId };

      // Helper to format YYYY-MM-DD → dd-MMM-yyyy
      const formatToBackendDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';

        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
      };

      if (dateRange.from) params.startDate = formatToBackendDate(dateRange.from);
      if (dateRange.to)   params.endDate   = formatToBackendDate(dateRange.to);

      console.log('Sending to backend:', params); // ← helpful for debugging

      const res = await xFetch({
        path: '/services/hierarchy/getCollectionsReport',
        payload: params,
      });

      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={loadAnalytics}
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Apply Filter
        </button>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">Loading chart...</div>
      ) : data.length === 0 ? (
        <div className="h-96 flex items-center justify-center text-gray-500">
          No data available for selected period
        </div>
      ) : (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="agreed" name="Expected" fill="#3f51b5" />
              <Bar dataKey="collection" name="Collected" fill="#4caf50" />
              <Bar dataKey="pending" name="Pending" fill="#f44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}