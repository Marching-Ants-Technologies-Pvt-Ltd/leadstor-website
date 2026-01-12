// src/components/dashboard/Lead/RelatedEnquiries.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';

export default function RelatedEnquiries({
  testId,
  emailId,
  mobile,
  invitationId,
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

  return (
    <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-200 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Enquiries</h3>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="text-left px-4 py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
          No related enquiries found for this lead.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full divide-y divide-gray-200 sub-leads-table table-fixed w-[300px]">
             <colgroup>
                <col style={{ width: '50px' }} />
                <col style={{ width: '50px' }} />
                <col style={{ width: '50px' }} />
                <col style={{ width: '50px' }} />
                <col style={{ width: '50px' }} />
                <col style={{ width: '50px' }} />
                <col style={{ width: '50px' }} />
            </colgroup>
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ">Source</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remarks</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Enquiry Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {enquiries.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">

                    {/* NAME — allow wrap */}
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 break-words whitespace-normal">
                        {item.firstName || '-'}
                    </td>

                    {/* EMAIL — truncate */}
                    <td
                        className="px-3 py-2 text-sm text-gray-600 truncate"
                        title={item.emailId}
                    >
                        {item.emailId || '-'}
                    </td>

                    {/* MOBILE — nowrap OK */}
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                        {item.mobile || '-'}
                    </td>

                    {/* SOURCE — truncate */}
                    <td
                        className="px-3 py-2 text-sm text-gray-600 break-words whitespace-normal"
                        title={item.source}
                    >
                        {item.source || '-'}
                    </td>

                    {/* STATUS — nowrap OK */}
                    <td className="px-3 py-2 break-words whitespace-normal ">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white ${
                        item.status === 'Follow Up' ? 'bg-amber-500' :
                        item.status === 'Invited' ? 'bg-blue-500' :
                        item.status === 'Cold Lead' ? 'bg-gray-500' : 'bg-green-500'
                        }`}>
                        {item.status || 'Unknown'}
                        </span>
                    </td>

                    {/* REMARKS — wrap */}
                    <td className="px-3 py-2 text-sm text-gray-600 break-words whitespace-normal">
                        {item.remarks || '-'}
                    </td>

                    {/* DATE — nowrap OK */}
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
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
        background: #f8fafc; /* lighter than main */
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
        }
        .sub-leads-table td,
        .sub-leads-table th {
            height: 36px;
        }
    `}</style>
    </div>
  );
}