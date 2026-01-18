'use client'

import { useState } from 'react';
import ConfirmDelete from '@/components/elements/ConfirmDelete';

export default function BatchTable({
    rows = [],
    checkUncheckRows = null
}) {
    const [toDelete, setToDelete] = useState(0);

    return (
        <>
            <ConfirmDelete
                open={toDelete}
                title="Delete Joinee Record?"
                description="Joinee record will be deleted and wont be visible anymore. Are you sure you want to proceed?"
                onConfirm={() => {
                    deleteRecord(toDelete);
                    setToDelete(0);
                }}
                onClose={() => setToDelete(0)}
            />

            <table className="w-full text-[13px] border-collapse" id="batchesTable" >
                <thead className="bg-slate-100 text-gray-600">
                    <tr className="border-b">
                    <th className="px-4 p-2 w-10">
                        <input
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        type="checkbox"
                        onChange={(e) => checkUncheckRows(e.target.checked)}
                        />
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Label Name
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Batch Description
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        From
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        To
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Start Date
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        End Date
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Max Allowed
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Status
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Progress %
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Fee Payment %
                    </th>
                    <th className="px-4 p-2 text-left font-medium">
                        Action
                    </th>
                    </tr>
                </thead>

                <tbody className="divide-y">
                    {rows.map(item => (
                    <tr
                        key={item.batchId}
                        className="hover:bg-slate-50 transition"
                    >
                        <td className="px-4 py-3">
                        <input
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            type="checkbox"
                            id={item.batchId}
                        />
                        </td>

                        <td className="px-4 p-2 font-medium text-gray-800">
                        {item.labelName || '—'}
                        </td>

                        <td className="px-4 p-2 font-medium text-gray-800">
                        {item.batchName || '—'}
                        <span
                            className="ml-2 text-blue-600 cursor-pointer hover:underline"
                            title="Edit batch"
                        >
                            ✏️
                        </span>
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.batchStartDate || '—'}
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.batchEndDate || '—'}
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.startTime || '—'}
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.endTime || '—'}
                        </td>
                        
                        <td className="px-4 p-2 text-gray-600">
                        {item.batchTotalAllowedCount || '—'}
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.status || '—'}
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.active || '—'}
                        </td>

                        <td className="px-4 p-2 text-gray-600">
                        {item.feePayment || '—'}
                        </td>

                        {/* ─── Action Column ─── */}
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-gray-600">
                                {/* 1. View Details */}
                                <button
                                type="button"
                                title="View Batch Details"
                                className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                                onClick={() => {
                                    // open modal or navigate
                                    console.log("Open view modal for batch:", item.batchId);
                                }}
                                >
                                <i className="ri-eye-line text-sm"></i>
                                </button>

                                {/* 2. Assign Trainer */}
                                <button
                                type="button"
                                title="Assign Trainer"
                                className="hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                                onClick={() => console.log("Assign trainer → batch:", item.batchId)}
                                >
                                <i className="ri-user-add-line text-sm"></i>
                                </button>

                                {/* 3. Assign Candidates / Students */}
                                <button
                                type="button"
                                title="Assign Candidates"
                                className="hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
                                onClick={() => console.log("Assign candidates → batch:", item.batchId)}
                                >
                                <i className="ri-group-line text-sm"></i>
                                </button>

                                {/* 4. Batch Attendance Report */}
                                <button
                                type="button"
                                title="Batch Attendance Report"
                                className="hover:text-purple-600 transition-colors p-1 rounded hover:bg-purple-50"
                                onClick={() => console.log("Batch attendance report:", item.batchId)}
                                >
                                <i className="ri-bar-chart-line text-sm"></i>
                                </button>

                                {/* 5. Candidate / Individual Attendance Report */}
                                <button
                                type="button"
                                title="Candidate Attendance Report"
                                className="hover:text-cyan-600 transition-colors p-1 rounded hover:bg-cyan-50"
                                onClick={() => console.log("Candidate attendance report:", item.batchId)}
                                >
                                <i className="ri-line-chart-line text-sm"></i>
                                </button>

                                {/* 6. Topics / Syllabus Management */}
                                <button
                                type="button"
                                title="Topics Management"
                                className="hover:text-amber-600 transition-colors p-1 rounded hover:bg-amber-50"
                                onClick={() => console.log("Manage topics for:", item.batchId)}
                                >
                                <i className="ri-list-check-2 text-sm"></i>
                                </button>

                                {/* 7. Copy Topics from another batch */}
                                <button
                                type="button"
                                title="Copy Topics From Existing Batch"
                                className="hover:text-teal-600 transition-colors p-1 rounded hover:bg-teal-50"
                                onClick={() => console.log("Copy topics → batch:", item.batchId)}
                                >
                                <i className="ri-file-copy-line text-sm"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}