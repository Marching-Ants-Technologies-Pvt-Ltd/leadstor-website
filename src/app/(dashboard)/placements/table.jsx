'use client';

import { useMemo } from 'react';
import { xFetch } from '@/utility/xFetch';
import { ToastContainer, toast, Bounce } from 'react-toastify'

export default function PlacementReadyTable({
  rows = [],
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onStatusChange,
  onDelete,
  onViewDetails,
}) {
  const allIds = useMemo(() => rows.map(r => r.id), [rows]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isAllSelected = allIds.length > 0 && allIds.every(id => selectedSet.has(id));

  const handleSelectAll = () => {
    onSelectionChange(isAllSelected ? [] : [...allIds]);
  };

  const handleToggle = (id) => {
    const newSelection = selectedSet.has(id)
      ? selectedIds.filter(x => x !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

    const downloadResume = async (candidateId, fileName) => {
        try {
            const blob = await xFetch({
                path: '/services/job/downloadCandidateResume',
                payload: { id: candidateId },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            let downloadName = fileName?.trim() || `resume_${candidateId}`;

            if (!downloadName.includes('.')) {
                const contentType = blob.type;
                if (contentType.includes('pdf')) downloadName += '.pdf';
                else if (contentType.includes('msword') || contentType.includes('wordprocessingml')) downloadName += '.docx';
                else downloadName += '.pdf';
            }

            link.download = downloadName;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully');
        } catch (error) {
            console.error('Resume download failed:', error);
            toast.error('Failed to download resume. Please try again.');
        }
    };

  return (
    <table className="text-[13px] border-collapse bg-white w-full" id="placementCandidatesTable">
      <thead className="bg-slate-100">
        <tr className="border-b border-slate-200">
          <th className="p-2 w-10">
            <input
              className="h-[14px] w-[14px] mt-1 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 hover:border-blue-500"
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => handleSelectAll()}
            />
          </th>
          <th className="p-2 text-left min-w-40">Name</th>
          <th className="p-2 text-left min-w-52">Email</th>
          <th className="p-2 text-left min-w-36">Mobile</th>
          <th className="p-2 text-left min-w-32">Qualification</th>
          <th className="p-2 text-left min-w-28">YOP</th>
          <th className="p-2 text-left min-w-32">Current City</th>
          <th className="p-2 text-left min-w-44">Job Profiles</th>
          <th className="p-2 text-left min-w-44">Placement Status</th>
          <th className="p-2 text-left min-w-52">Resume</th>
          <th className="p-2 text-left min-w-32">Course</th>
          <th className="p-2 text-left min-w-36">Course Start</th>
          <th className="p-2 text-left min-w-36">Course End</th>
          <th className="p-2 text-left min-w-28">Job Status</th>
          <th className="p-2 text-center min-w-28">Total Exp</th>
          <th className="p-2 text-center min-w-28">Relevant Exp</th>
          <th className="p-2 text-left min-w-44">Last Org</th>
          <th className="p-2 text-left min-w-40">Exp Job Type</th>
          <th className="p-2 text-left min-w-44">Exp Location</th>
          <th className="p-2 text-left min-w-40">Last Desig</th>
          <th className="p-2 text-left min-w-40">Exp Desig</th>
          <th className="p-2 text-center min-w-28">Last CTC</th>
          <th className="p-2 text-center min-w-28">Exp CTC</th>
          <th className="p-2 text-left min-w-52">Remarks</th>
          <th className="p-2 text-left min-w-44">Receive Job Opp</th>
          <th className="p-2 text-left min-w-44">Updated</th>
          <th className="p-2 text-center w-24">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={28} className="text-center py-12 text-slate-500">
              No placement-ready candidates found
            </td>
          </tr>
        ) : (
          rows.map((item) => {
            const isSelected = selectedSet.has(item.id);
            const hasMobile = item.mobile && item.mobile.length > 3;

            return (
              <tr
                key={item.id}
                className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <td className="p-2 text-center">
                  <input
                    className="h-[14px] w-[14px] mt-1 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 hover:border-blue-500"
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(item.id)}
                  />
                </td>

                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => onEdit?.(item)}
                      title="Edit candidate"
                    >
                      ✏️
                    </span>
                    {item.name || '-'}
                  </div>
                </td>

                <td className="p-2">{item.email || '-'}</td>

                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {item.mobile || '-'}
                    {hasMobile && (
                      <a
                        href={`https://wa.me/${item.mobile.replace(/\D/g, '')}?text=Hello`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5"
                        title="Send WhatsApp message"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          color="#4CAF50"
                          fill="none"
                          stroke="#4CAF50"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.3789 2.27907 14.6926 2.78382 15.8877C3.06278 16.5481 3.20226 16.8784 3.21953 17.128C3.2368 17.3776 3.16334 17.6521 3.01642 18.2012L2 22L5.79877 20.9836C6.34788 20.8367 6.62244 20.7632 6.87202 20.7805C7.12161 20.7977 7.45185 20.9372 8.11235 21.2162C9.30745 21.7209 10.6211 22 12 22Z" />
                          <path d="M8.58815 12.3773L9.45909 11.2956C9.82616 10.8397 10.2799 10.4153 10.3155 9.80826C10.3244 9.65494 10.2166 8.96657 10.0008 7.58986C9.91601 7.04881 9.41086 7 8.97332 7C8.40314 7 8.11805 7 7.83495 7.12931C7.47714 7.29275 7.10979 7.75231 7.02917 8.13733C6.96539 8.44196 7.01279 8.65187 7.10759 9.07169C7.51023 10.8548 8.45481 12.6158 9.91948 14.0805C11.3842 15.5452 13.1452 16.4898 14.9283 16.8924C15.3481 16.9872 15.558 17.0346 15.8627 16.9708C16.2477 16.8902 16.7072 16.5229 16.8707 16.165C17 15.8819 17 15.5969 17 15.0267C17 14.5891 16.9512 14.084 16.4101 13.9992C15.0334 13.7834 14.3451 13.6756 14.1917 13.6845C13.5847 13.7201 13.1603 14.1738 12.7044 14.5409L11.6227 15.4118" />
                        </svg>
                      </a>
                    )}
                  </div>
                </td>

                <td className="p-2">{item.qualification || '-'}</td>
                <td className="p-2">{item.yearOfPassing || '-'}</td>
                <td className="p-2">{item.currentCity || '-'}</td>

                <td className="p-2">
                  {item.jobTags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {item.jobTags.map((tag, i) => (
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

                <td className="p-2">
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => onStatusChange?.(item.id, item.placementStatus || '')}
                    title="Change placement status"
                  >
                    {item.placementStatus || 'Placement Ready'}
                  </span>
                </td>

                <td className="p-2">
                    {item.resumeName ? (
                        <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault(); // Prevent page jump from href="#"
                            downloadResume(item.candidateId, item.resumeName);
                        }}
                        title="Download Resume"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                        <i className="ri-download-2-line text-lg"></i>
                        {item.resumeName}
                        </a>
                    ) : (
                        '-'
                    )}
                </td>

                <td className="p-2">{item.course || '-'}</td>
                <td className="p-2">{item.courseStartDate || '-'}</td>
                <td className="p-2">{item.courseEndDate || '-'}</td>
                <td className="p-2">{item.jobStatus || '-'}</td>
                <td className="p-2 text-center">{item.totalExperience || '-'}</td>
                <td className="p-2 text-center">{item.relevantExperience || '-'}</td>
                <td className="p-2">{item.lastOrganizationName || '-'}</td>
                <td className="p-2">{item.expectedJobType || '-'}</td>
                <td className="p-2">
                  {Array.isArray(item.expectedLocationPreference)
                    ? item.expectedLocationPreference.join(', ')
                    : item.expectedLocationPreference || '-'}
                </td>
                <td className="p-2">{item.lastDesignation || '-'}</td>
                <td className="p-2">{item.expectedDesignation || '-'}</td>
                <td className="p-2 text-center">{item.lastCTC || '-'}</td>
                <td className="p-2 text-center">{item.expectedCTC || '-'}</td>
                <td className="p-2">{item.remarks || '-'}</td>
                <td className="p-2">{item.receiveJobOpportunities || '-'}</td>
                <td className="p-2">{item.updatedDate || '-'}</td>

                {/* Actions column */}
                <td className="p-2 flex justify-center items-center gap-3 text-lg">
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => onEdit?.(item)}
                    title="Edit candidate details"
                  >
                    ✏️
                  </span>

                  <span
                    className="cursor-pointer hover:text-indigo-600"
                    onClick={() => onStatusChange?.(item.id, item.placementStatus || '')}
                    title="Update Placement Status"
                  >
                    💼
                  </span>

                  <span
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => onDelete?.(item.id)}
                    title="Delete candidate"
                  >
                    ❌
                  </span>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}