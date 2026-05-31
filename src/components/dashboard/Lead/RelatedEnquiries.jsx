'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';

export default function RelatedEnquiries({
  testId,
  emailId,
  mobile,
  invitationId,
  onOpenTimeline,
}) {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await xFetch({
          method: 'POST',
          path: '/services/invite/getRelatedEnquiries',
          payload: {
            testId,
            email: emailId,
            mobile,
            invitationId,
          },
        });

        setEnquiries(response || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load related enquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [testId, emailId, mobile, invitationId]);

  const statusBadgeClass = (status = '') => {
    if (status === 'Follow Up') return 'bg-amber-500';
    if (status === 'Invited') return 'bg-blue-500';
    if (status === 'Cold Lead') return 'bg-gray-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-200 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">Related Inquiries</h3>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-left px-4 py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
          No related enquiries found for this lead.
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-y-auto max-h-[340px]">
          <table className="w-full divide-y divide-gray-200 sub-leads-table table-fixed">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>

            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Source</th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                <th className="px-2 py-2 text-left text-[11px] font-semibold text-gray-700 uppercase tracking-wider">Enquiry Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {enquiries.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-2 py-1.5 text-xs font-medium text-gray-900 break-words whitespace-normal">
                    {item.firstName || '-'}
                  </td>

                  <td className="px-2 py-1.5 text-xs text-gray-600 truncate" title={item.emailId}>
                    {item.emailId || '-'}
                  </td>

                  <td className="px-2 py-1.5 whitespace-normal break-words text-xs text-gray-600">
                    {item.mobile || '-'}
                  </td>

                  <td className="px-2 py-1.5 text-xs text-gray-600 break-words whitespace-normal" title={item.source}>
                    {item.source || '-'}
                  </td>

                  <td className="px-2 py-1.5 break-words whitespace-normal">
                    <div className="inline-flex items-center gap-1.5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white ${statusBadgeClass(item.status)}`}>
                        {item.status || 'Unknown'}
                      </span>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="View Timeline"
                        onClick={() => onOpenTimeline?.(item)}
                        disabled={!item?.invitationId}
                      >
                        <i className="ri-history-line text-base" />
                      </button>
                    </div>
                  </td>

                  <td className="px-2 py-1.5 text-xs text-gray-600 break-words whitespace-normal">
                    {item.remarks || '-'}
                  </td>

                  <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-600">
                    {item.createdDate || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .sub-leads-table {
          background: #f8fafc;
          border-radius: 6px;
        }

        .sub-leads-table thead th {
          background: #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #cbd5e1;
        }

        .sub-leads-table tbody tr {
          background: #f8fafc;
        }

        .sub-leads-table tbody tr:hover {
          background: #eef2f7;
        }

        .sub-leads-table td {
          padding: 8px 10px;
          color: #334155;
          vertical-align: top;
        }

        .sub-leads-table td,
        .sub-leads-table th {
          min-height: 36px;
        }
      `}</style>
    </div>
  );
}
