'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Send, Bell,Users,Clock } from 'lucide-react';

export default function JobPostingsTable({
    rows = [],
    selectedIds = [],
    onSelectionChange,
    onEdit,
    onDelete,
    onSendToPlacement,
    onManageCandidates,
    onCheckScheduledStatus
}) {
  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isAllSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));

  const handleSelectAll = () => {
    onSelectionChange(isAllSelected ? [] : [...allIds]);
  };

  const handleToggle = (id) => {
    const newSelection = selectedSet.has(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  return (
    <table className="text-[13px] border-collapse bg-white w-full">
      <thead className="bg-slate-100 sticky top-0 z-10">
        <tr className="border-b border-slate-200">
          <th className="p-3 w-10">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </th>
          <th className="p-3 text-left min-w-20">Job ID</th>
          <th className="p-3 text-left min-w-30">Job Title</th>
          <th className="p-3 text-left min-w-30">Job Description</th>
          <th className="p-3 text-left min-w-30">Company</th>
          <th className="p-3 text-left min-w-30">Location(s)</th>
          <th className="p-3 text-center min-w-20">Min Sal (LPA)</th>
          <th className="p-3 text-center min-w-20">Max Sal (LPA)</th>
          <th className="p-3 text-center min-w-20">Min Exp</th>
          <th className="p-3 text-center min-w-20">Max Exp</th>
          <th className="p-3 text-left min-w-20">Position Type</th>
          <th className="p-3 text-left min-w-30">Contact Person</th>
          <th className="p-3 text-left min-w-20">Email</th>
          <th className="p-3 text-left min-w-30">Phone</th>
          <th className="p-3 text-left min-w-30">Owner</th>
          <th className="p-3 text-left min-w-30">Status</th>
          <th className="p-3 text-center w-28">Actions</th>
          <th className="p-3 text-left min-w-40">Tags</th>
          <th className="p-3 text-left min-w-44">Last Updated</th>
          
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={18} className="text-center py-12 text-slate-500">
              No job postings found
            </td>
          </tr>
        ) : (
          rows.map((job) => {
            const isSelected = selectedSet.has(job.id);

            return (
              <tr
                key={job.id}
                className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(job.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                <td className="p-3">{job.id || '-'}
                    <button
                        onClick={() => onEdit?.(job)}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                        title="Edit job"
                    >
                    <i className="ri-pencil-line"></i>
                  </button>
                </td>
                <td className="p-3 font-medium">{job.title || '-'}</td>
                <td className="p-3 font-medium" dangerouslySetInnerHTML={{
                    __html: job.description || '-',
                }}/>
                <td className="p-3">{job.companyName || '-'}</td>
                <td className="p-3">{Array.isArray(job.locations) ? job.locations.join(', ') : job.locations || '-'}</td>
                <td className="p-3 text-center">{job.minSal || '-'}</td>
                <td className="p-3 text-center">{job.maxSal || '-'}</td>
                <td className="p-3 text-center">{job.minExp || '-'}</td>
                <td className="p-3 text-center">{job.maxExp || '-'}</td>
                <td className="p-3">{job.positionType || '-'}</td>
                <td className="p-3">{job.contact_name || '-'}</td>
                <td className="p-3">{job.contact_email || '-'}</td>
                <td className="p-3">{job.contact_phone || '-'}</td>
                <td className="p-3">{job.owner || '-'}</td>
                <td className="p-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      job.status === 'Open'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'Closed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {job.status || 'Open'}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-4 text-lg">
                  <button
                    onClick={() => onDelete?.(job.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete job"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>

                  <button
                    onClick={() => onSendToPlacement(job)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Send details to candidates"
                    >
                    <Send size={18} />
                    </button>

                    <button
                        onClick={() => onManageCandidates?.(job)}
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                        title="Manage candidates for this job"
                        >
                        <Users size={18} /> {/* lucide-react Users icon */}
                    </button>

                    <button
                    onClick={() => onCheckScheduledStatus?.(job)}
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                    title="Check scheduled email status"
                    >
                    <Clock size={18} />
                    </button>
                </td>
                <td className="p-3">
                  {job.jobTags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {job.jobTags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-3">{job.updateTime ? format(new Date(job.updateTime), 'dd-MMM-yy HH:mm') : '-'}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}