'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Send, Bell,Users,Clock } from 'lucide-react';

export default function JobPostingsTable({
    rows = [],
    ownerMap = {},
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

  // Handle expand/collapse for job descriptions
  const handleDescriptionToggle = (e) => {
    if (e.target.classList.contains('view-more-desc')) {
      const action = e.target.getAttribute('data-action');
      const blockDiv = e.target.closest('[data-desc-id]');
      const shortDesc = blockDiv?.querySelector('.short-description');
      const fullDesc = blockDiv?.querySelector('.full-description');

      if (!shortDesc || !fullDesc) return;

      if (action === 'expand') {
        shortDesc.classList.add('hidden');
        fullDesc.classList.remove('hidden');
      } else if (action === 'collapse') {
        shortDesc.classList.remove('hidden');
        fullDesc.classList.add('hidden');
      }
    }
  };

  const getOwnerDisplayName = (ownerValue) => {
    if (ownerValue === null || ownerValue === undefined || ownerValue === '') return '-';
    return ownerMap[String(ownerValue)] || ownerValue;
  };

  return (
    <table className="text-[13px] border-collapse bg-white w-full" onClick={handleDescriptionToggle}>
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
          <th className="p-3 text-left min-w-[22rem]">Job Description</th>
          <th className="p-3 text-left min-w-30">Company</th>
          <th className="p-3 text-left min-w-30">Location(s)</th>
          <th className="p-3 text-center min-w-16 whitespace-nowrap">Min Sal<br/>(LPA)</th>
          <th className="p-3 text-center min-w-16 whitespace-nowrap">Max Sal<br/>(LPA)</th>
          <th className="p-3 text-center min-w-16 whitespace-nowrap">Min Exp</th>
          <th className="p-3 text-center min-w-16 whitespace-nowrap">Max Exp</th>
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

      <tbody className="divide-y divide-slate-200 align-top">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={18} className="text-center py-12 text-slate-500 align-top">
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
                <td className="p-3 text-center align-top">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(job.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                <td className="p-3 align-top">{job.id || '-'}
                    <button
                        onClick={() => onEdit?.(job)}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                        title="Edit job"
                    >
                    <i className="ri-pencil-line"></i>
                  </button>
                </td>
                <td className="p-3 font-medium align-top">{job.title || '-'}</td>
                <td className="p-3 font-medium align-top">
                  {(() => {
                    const desc = job.description || '-';
                    if (desc === '-') return desc;
                    
                    // Get plain text version for truncation
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = desc;
                    const plainText = tempDiv.textContent || tempDiv.innerText || '';
                    
                    const truncated = plainText.length > 120;
                    const shortText = truncated ? plainText.substring(0, 120) : plainText;
                    const blockId = `desc-${job.id || Math.random().toString(36).slice(2, 10)}`;
                    
                    const html = truncated ? `
                      <div data-desc-id="${blockId}">
                        <div class="short-description">
                          ${shortText} <span class="text-blue-600 cursor-pointer hover:underline view-more-desc" data-action="expand"> (view more)</span>
                        </div>
                        <div class="full-description hidden mt-1">
                          ${desc}
                          <span class="text-red-600 cursor-pointer hover:underline ml-2 view-more-desc" data-action="collapse"> (hide)</span>
                        </div>
                      </div>
                    ` : desc;
                    
                    return <div dangerouslySetInnerHTML={{ __html: html }} />;
                  })()}
                </td>
                <td className="p-3 align-top">{job.companyName || '-'}</td>
                <td className="p-3 align-top">{Array.isArray(job.locations) ? job.locations.join(', ') : job.locations || '-'}</td>
                <td className="p-3 text-center align-top">{job.minSal || '-'}</td>
                <td className="p-3 text-center align-top">{job.maxSal || '-'}</td>
                <td className="p-3 text-center align-top">{job.minExp || '-'}</td>
                <td className="p-3 text-center align-top">{job.maxExp || '-'}</td>
                <td className="p-3 align-top">{job.positionType || '-'}</td>
                <td className="p-3 align-top">{job.contact_name || '-'}</td>
                <td className="p-3 align-top">{job.contact_email || '-'}</td>
                <td className="p-3 align-top">{job.contact_phone || '-'}</td>
                <td className="p-3 align-top">{getOwnerDisplayName(job.owner)}</td>
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
                <td className="p-3 flex justify-center gap-2 text-base">
                  <button
                    onClick={() => onDelete?.(job.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete job"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>

                  <button
                    onClick={() => onSendToPlacement(job)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Send details to candidates"
                    >
                    <Send size={16} />
                    </button>

                    <button
                        onClick={() => onManageCandidates?.(job)}
                        className="p-1 text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                        title="Manage candidates for this job"
                        >
                        <Users size={16} /> {/* lucide-react Users icon */}
                    </button>

                    <button
                    onClick={() => onCheckScheduledStatus?.(job)}
                    className="p-1 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                    title="Check scheduled email status"
                    >
                    <Clock size={16} />
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
