'use client';
import { showFullRemarks, HorizontalScroll } from '@/utility/TableControllers';
import { useEffect, useState, useRef, useMemo  } from 'react';
import AppliedFilters, { showAppliedFilter } from '@/components/dashboard/Lead/AppliedFilters';
import { xFetch } from '@/utility/xFetch';
import {
    getLeadOwnerById,
    getCurrentUserNameIfAdmin,
    Test,
    User,
    LeadsPerPage,
    TotalLeads,
    LeadsCurrentPage,
    LeadFilters,
    LeadSearch 
} from '@/utility/TinyDB';
import UpdateLead from '@/components/dashboard/Lead/UpdateLead';
import CallerDeskIVR from '@/components/dashboard/Lead/CallerDeskIVR';
import Timeline from '@/components/dashboard/Lead/ViewTimeline';
import { tableHeader } from "@/components/common/customStyle";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import RelatedEnquiries from '@/components/dashboard/Lead/RelatedEnquiries';

let setLeadsFn;

const dataFormatters = {
    assignedUserId: (row) => {
        let _id = parseInt(row['assignedUserId'] ?? "0");
        if (_id === -1) return getCurrentUserNameIfAdmin();
        return getLeadOwnerById(_id);
    },
};

export default function LeadsTable({
    columns,
    setColumns,
    columnOrder,
    setColumnOrder,
    leads,
    setLeads,
    selectedLeadIds,
    setSelectedLeadIds,
    onOpenAdvanceFilter
}) {
    setLeadsFn = setLeads;

    const selectAllRef = useRef();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const [showTimeline, setShowTimeline] = useState(false);
    const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState(null);
    const [selectedLead, setSelectedLead] = useState({});
    const [expandedRows, setExpandedRows] = useState({});
    const [showCallerDeskIVR, setShowCallerDeskIVR] = useState(false);
    const [callerCandidate, setCallerCandidate] = useState(null);

    const isIndeterminate =
        leads.some(l => selectedLeadIds.includes(l.invitationId)) &&
        !leads.every(l => selectedLeadIds.includes(l.invitationId));

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    async function xLeads() {
        let limit = LeadsPerPage.value();
        let total = TotalLeads.value() || 0;

        let maxPage = Math.max(1, Math.ceil(total / limit));
        let currentPage = LeadsCurrentPage.value();

        if (currentPage < 1) currentPage = 1;
        if (currentPage > maxPage) currentPage = maxPage;

        LeadsCurrentPage.setValue(currentPage);

        let offset = (currentPage - 1) * limit;

        let filters = LeadFilters.value();
        offset = Math.max(0, offset);
        let payload = {
            testId: Test._id,
            testType: Test.type,
            owner: User._id,
            isTelecaller: User.telecaller ? 1 : 0,
            order: "asc",
            offset,
            limit,
            search: LeadSearch.value()
        };

        if (filters.length > 0) {
            // Show the applied filters bar with proper clear handler
            showAppliedFilter(filters, () => {
                // This is called when user clicks × in AppliedFilters
                LeadFilters.reset();
                LeadsCurrentPage.setValue(1);
                xLeads(); // refresh immediately
            });

            // Apply filters to payload
            filters.forEach(item => {
                payload[item.query] = item.value;
            });
        } else {
            // Optional: hide filters bar if no filters
            if (typeof window !== 'undefined') {
                window.__setAppliedFilters?.(null);
            }
        }

        xFetch({ path: '/services/invite/enquiries', payload })
            .then(data => {
                const rows = data?.rows || [];
                const total = parseInt(data?.total || 0);

                if (rows.length === 0 &&
                    total > 0 &&
                    LeadsCurrentPage.value() > 1 &&
                    !LeadSearch.value()
                    ) {
                    LeadsCurrentPage.setValue(1);
                    xLeads();
                    return;
                }
                setLeadsFn(rows);
                TotalLeads.setValue(total);
            })
            .finally(() => {
                if (typeof window.onTableRefresh === 'function') window.onTableRefresh();
            });
    }

    /* =======================
       NAME + BOOKMARK
    ======================= */
    const renderNameCell = (row) => {
        const isBookmarked = row.isBookmarked === 1;

        const toggleBookmark = async (e) => {
            e.stopPropagation();

            await xFetch({
            path: "/services/leads/bookmark",
            payload: {
                invitationId: row.invitationId,
                bookmark: isBookmarked ? 0 : 1
            }
            });

            setLeads(prev =>
            prev.map(l =>
                l.invitationId === row.invitationId
                ? { ...l, isBookmarked: isBookmarked ? 0 : 1 }
                : l
            )
            );
        };

        return (
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{row.firstName} 
                    {/* Bookmark */}
                    {/* <i
                        className={`ri-bookmark-${
                        isBookmarked ? "fill text-yellow-500" : "line text-gray-400"
                        } cursor-pointer text-[15px]`}
                        onClick={toggleBookmark}
                        title="Bookmark"
                    /> */}

                    {/* Edit */}
                    <i
                        className="ri-pencil-fill ml-1.5 text-amber-500 cursor-pointer text-[14px]"
                        title="Edit Lead"
                        onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(row);
                        setShowUpdatePopup(true);
                        }}
                    />
                </span>
            </div>
        );
    };

    /* =======================
       MOBILE + WHATSAPP + IVR
    ======================= */
    const renderMobileCell = (row) => {
        const phone = row.altMobile ? row.mobile + ', ' + row.altMobile : row.mobile;
        return (
            <div className="flex items-center gap-2">
                <span>{phone}</span>

                <i
                    className="ri-whatsapp-line text-green-600 cursor-pointer"
                    title="WhatsApp"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/91${phone}`, "_blank");
                    }}
                />

                <i
                    className="ri-customer-service-2-line text-blue-600 cursor-pointer"
                    title="Call via IVR"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCallerCandidate(row);
                        setShowCallerDeskIVR(true);
                    }}
                />
            </div>
        );
    };

    const handleShowTimeline = (lead) => {
        setSelectedLeadForTimeline(lead);
        setShowTimeline(true);
    };

    const refreshLeads = () => {
        xLeads();
    };
    
    const renderStatusTimelineCell = (row) => {
        const status = row.status || "-";

        // Status pill color mapping (same as before)
        const STATUS_MAP = {
            "Phone Not Picked": "bg-sky-500",
            "May Visit": "bg-indigo-500",
            "Visited": "bg-blue-500",
            "Hot Lead": "bg-red-500",
            "Warm Lead": "bg-amber-500",
            "Send Reminder": "bg-purple-500",
            "Joined": "bg-green-500",
            "Follow Up": "bg-orange-500",
            "Not Interested": "bg-gray-400",
            "PostMeeting FollowUp": "bg-cyan-500",
        };

        const pillColor = STATUS_MAP[status] || "bg-slate-400";

        // Followup Date logic (red link if missing)
        let followupDisplay = "";
        const followupDate = row.followupDate;

        if(followupDate && followupDate.trim() !== '' && row.isFollowupType === "1"){
            followupDisplay = (
            <span className="text-gray-600 text-xs ml-1.5">[{followupDate}]</span>
            );
        }
        
        if ( (!followupDate || followupDate.trim() === "" ) && row.isFollowupType === "1") {
            followupDisplay = (
                <span className="text-gray-600 text-xs ml-1.5">
                    <span
                        className="text-red-600 text-xs font-medium cursor-pointer hover:underline"
                        onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(row);
                        setShowUpdatePopup(true);
                        }}
                    > [Specify Followup Date]
                    </span>
                </span>
            );
        }

        // Trainer name (if exists)
        const trainerName = row.trainerName ? (
            <span className="text-gray-500 text-xs ml-2">Trainer: {row.trainerName}</span>
        ) : null;

        // Icons section
        const timelineIcon = (
            <button
            type="button"
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="View Timeline"
            onClick={() => handleShowTimeline(row)}
            >
            <i className="ri-history-line text-xl" />
            </button>
        );

        let extraIcons = null;
        if (status.toLowerCase().includes("meeting")) {
            extraIcons = (
            <div className="flex items-center gap-3">
                {timelineIcon}
                <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                title="View Meeting Details"
                onClick={() => showCandidateMeetingDetails(row.invitationId)} // ← your PHP function
                >
                <i className="ri-video-chat-line text-xl" />
                </button>
            </div>
            );
        }

        return (
            <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pill */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${pillColor} whitespace-nowrap`}> {status} </span>

            {/* Followup Date */}
            {followupDisplay}

            {/* Trainer Name */}
            {trainerName}

            {/* Icons (timeline always, + video if Meeting) */}
            {extraIcons || timelineIcon}

            {/* Trainer name as fallback if no extra icons */}
            {!extraIcons && trainerName}
            </div>
        );
    };

    const renderProbability = (row) => {
        const value = Number(row.leadProbability || 0);
        if(value == 0) 
            return '-';

        let icon = "";
        let border = "";
        let bg = "";

        if (value >= 70) {
            icon = "🔥";
            border = "border-green-500";
            bg = "bg-green-100";
        } else if (value >= 40) {
            icon = "⏳";
            border = "border-amber-500";
            bg = "bg-amber-100";
        } else if (value > 0) {
            icon = "🧊";
            border = "border-slate-400";
            bg = "bg-slate-100";
        }

        return (
            <div
                className={`w-7 h-7 rounded-full flex items-center justify-center
                border ${border} ${bg} text-[13px]`}
                title={`${value}%`}
            >
                {icon}
            </div>
        );
    };

    const renderRemarkCell = (row) => {
        let content = row.remarks || "";
        let audioLink = "";

        if (content.includes("<audio")) {
            const match = content.match(/src="([^"]+)"/);
            audioLink = match?.[1] || "";
            content = content.split("<audio")[0];
        }

        const div = document.createElement("div");
        div.innerText = content;
        let safeText = div.innerHTML;

        if (row.latestRemarksDate) {
            safeText = `${row.latestRemarksDate}: ${safeText}`;
        }

        let finalText = "";

        if (safeText.length > 120) {
            const shortText = safeText.substring(0, 120);

            finalText = `
                <div style="min-width:155px;">
                    <div>
                        ${shortText}
                        <span style="cursor:pointer;color:#1976d2;" 
                            onclick="this.parentElement.parentElement.querySelector('.full-text').style.display='block';
                                    this.parentElement.style.display='none';">
                            ...(view)
                        </span>
                    </div>

                    <div class="full-text" style="display:none;">
                        ${safeText}
                        <span style="cursor:pointer;color:red;margin-left:6px;"
                            onclick="this.parentElement.style.display='none';
                                    this.parentElement.parentElement.querySelector('div').style.display='block';">
                            (hide)
                        </span>
                    </div>
                </div>
            `;
        } else {
            finalText = safeText;
        }

        if (row.additionalInfo?.length > 0) {
            finalText += `
                <br/>
                <span style="color:green;">
                    <i class="ri-user-fill"></i> ${row.additionalInfo}
                </span>
            `;
        }

        if (!finalText || finalText === "null") {
            return "-";
        }

        const textStyles = {
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "break-word",
            maxWidth: "480px",
            lineHeight: "20px",
        };

        if (audioLink) {
            return (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <audio controls style={{ width: "140px" }}>
                        <source src={audioLink} />
                    </audio>

                    <span
                        style={textStyles}
                        dangerouslySetInnerHTML={{ __html: finalText }}
                    />
                </div>
            );
        }

        return (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span
                    style={textStyles}
                    dangerouslySetInnerHTML={{ __html: finalText }}
                />
            </div>
        );
    };

    const renderAINextStepCell = (row) => {
        let content = row.aINextStep || "";

        const div = document.createElement("div");
        div.innerText = content;
        let safeText = div.innerHTML;

        let finalText = "";

        if (safeText.length > 120) {
            const shortText = safeText.substring(0, 120);

            finalText = `
                <div style="min-width:155px;">
                    <div>
                        ${shortText}
                        <span style="cursor:pointer;color:#1976d2;" 
                            onclick="this.parentElement.parentElement.querySelector('.full-text').style.display='block';
                                    this.parentElement.style.display='none';">
                            ...(view)
                        </span>
                    </div>

                    <div class="full-text" style="display:none;">
                        ${safeText}
                        <span style="cursor:pointer;color:red;margin-left:6px;"
                            onclick="this.parentElement.style.display='none';
                                    this.parentElement.parentElement.querySelector('div').style.display='block';">
                            (hide)
                        </span>
                    </div>
                </div>
            `;
        } else {
            finalText = safeText;
        }

        if (!finalText || finalText === "null") {
            return "-";
        }

        const textStyles = {
            whiteSpace: "normal",
            wordBreak: "normal",
            overflowWrap: "break-word",
            maxWidth: "480px",
            lineHeight: "20px",
        };

        return (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span
                    style={textStyles}
                    dangerouslySetInnerHTML={{ __html: finalText }}
                />
            </div>
        );
    };

    useEffect(() => {
        LeadsCurrentPage.setValue(1); 
        xLeads();
        window.tableRefresh = () => xLeads();
        HorizontalScroll();
        return () => {
            delete window.tableRefresh;
        };
    }, []);

    /* =======================
     TANSTACK COLUMN DEFINITIONS
     ======================= */

    const tableColumns = useMemo(() => {
        const cols = [];

        // Checkbox + Expand column
        cols.push({
        id: 'select',
        size: 60,
        header: () => (
            <input
            ref={selectAllRef}
            type="checkbox"
            checked={
                leads.length > 0 &&
                leads.every(l => selectedLeadIds.includes(l.invitationId))
            }
            onChange={(e) =>
                setSelectedLeadIds(
                e.target.checked ? leads.map(l => l.invitationId) : []
                )
            }
            />
        ),
        cell: ({ row }) => {
            const isExpanded = row.getIsExpanded();
  
            return (
            <div className="flex items-center gap-2">
                {/* Checkbox */}
                <input
                type="checkbox"
                checked={selectedLeadIds.includes(row.original.invitationId)}
                onChange={(e) =>
                    setSelectedLeadIds(
                    e.target.checked
                        ? [...selectedLeadIds, row.original.invitationId]
                        : selectedLeadIds.filter(id => id !== row.original.invitationId)
                    )
                }
                />
                {/* Expand Icon */}
                <button
                type="button"
                onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                    }}
                className="text-lg text-gray-500 hover:text-emerald-600 transition"
                title={isExpanded ? "Collapse" : "Related Enquiries"}
                >
                {row.getIsExpanded() ? (
                        <i className="ri-subtract-line" />
                    ) : (
                        <i className="ri-add-line" />
                    )}
                </button>
            </div>
            );
        },
        });
        
        columnOrder.forEach(col => {
        cols.push({
            accessorKey: col,
            header: columns?.find(c => c.dataField === col)?.displayName
                    || columns?.find(c => c.dataField === col)?.fieldName,

            cell: ({ row }) => {
            const r = row.original;

            if (col === 'firstName') return renderNameCell(r);
            if (col === 'mobile') return renderMobileCell(r);
            if (col === 'remarks') return renderRemarkCell(r);
            if (col === 'status') return renderStatusTimelineCell(r);
            if (col === 'leadProbability') return renderProbability(r);
            if (col === 'aINextStep') return renderAINextStepCell(r);

            if (dataFormatters[col]) return dataFormatters[col](r);

            return r[col] ?? '-';
            }
        });
        
        });

        return cols;
    }, [columns, columnOrder, leads, selectedLeadIds]);

    const table = useReactTable({
        data: leads,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowCanExpand: () => true,
        state: {
            expanded: expandedRows,
        },
        onExpandedChange: setExpandedRows,
        getRowId: (row) => row.invitationId,
    });

    return (
        <>
        <AppliedFilters onOpenAdvanceFilter={onOpenAdvanceFilter} />

        <div className="bg-white rounded-xl border flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse text-sm leadstor-table-modern">
            <thead className={`sticky top-0 z-10 ${tableHeader}`}>
                {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                    <th
                        key={header.id}
                        className="p-2 text-left font-semibold border-b whitespace-nowrap"
                    >
                        {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                        )}
                    </th>
                    ))}
                </tr>
                ))}
            </thead>

            <tbody>
            {table.getRowModel().rows.length === 0 ? (
                <tr>
                <td
                    colSpan={table.getAllColumns().length}
                    className="w-32 text-center py-10 text-slate-500"
                >
                    <div className="flex flex-col items-center gap-2">
                    <i className="ri-search-line text-2xl text-slate-400" />
                    <div className="font-medium">
                        No results found
                    </div>
                    {LeadSearch.value() && (
                        <div className="text-xs">
                        Try adjusting your search or filters
                        </div>
                    )}
                    </div>
                </td>
                </tr>
            ) : (
                table.getRowModel().rows.map(row => (
                    <>
                        {/* Main row */}
                        <tr
                            key={row.id}
                            className="border-b hover:bg-slate-50 transition h-[44px] align-top"
                        >
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="w-32 p-2 align-top">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </td>
                            ))}
                        </tr>

                        {/* Expanded content row — only shown when expanded */}
                        {row.getIsExpanded() && (
                            <tr key={`${row.id}-expanded`}>
                                <td colSpan={table.getAllColumns().length} className="p-0 bg-gray-50">
                                    <div className="p-4">
                                        <RelatedEnquiries
                                            testId={row.original.testId}
                                            emailId={row.original.emailId}
                                            mobile={row.original.mobile}
                                            invitationId={row.original.invitationId}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </>
                ))
                
            )}
            </tbody>

            </table>
        </div>

        {/* MODALS */}
        {showUpdatePopup && (
            <UpdateLead
            selectedLead={selectedCandidate}
            onCancel={() => setShowUpdatePopup(false)}
            onSuccess={() => {
                setShowUpdatePopup(false);
                xLeads();
            }}
            />
        )}

        {showCallerDeskIVR && (
            <CallerDeskIVR
            candidate={callerCandidate}
            onClose={() => setShowCallerDeskIVR(false)}
            />
        )}

        {showTimeline && selectedLeadForTimeline && (
            <Timeline
            leadDetails={selectedLeadForTimeline}
            isOpen={showTimeline}
            onClose={() => setShowTimeline(false)}
            xLeads={refreshLeads}           // ← most important fix!
            />
        )}
        {/* STYLES */}
        <style jsx>{`
            /* ===== MODERN CRM TABLE ===== */
            
            .leadstor-table-modern th {
                height: 44px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: top;
            }

            .leadstor-table-modern thead th {
                background: #d4e0ec;
                font-size: 13px;
                font-weight: 600;
                background: #d4e0ec;
                color: #111827;
                height: 44px;
            }
                
        `}</style>
        </>
    );
}
