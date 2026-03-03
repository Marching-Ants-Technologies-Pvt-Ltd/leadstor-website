'use client';
import { showFullRemarks, HorizontalScroll } from '@/utility/TableControllers';
import { useEffect, useState, useRef, useMemo  } from 'react';
import AppliedFilters, { showAppliedFilter } from '@/components/dashboard/Lead/AppliedFilters';
import { xFetch } from '@/utility/xFetch';
import {
    Corporate,
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
import RouteData from '@/components/dashboard/Lead/RouteData';
import ExtendedFormModal from '@/components/dashboard/Lead/ExtendedFormModal';

export default function LeadsTable({
    columns,
    setColumns,
    columnOrder,
    setColumnOrder,
    leads,
    owners,
    setLeads,
    selectedLeadIds,
    setSelectedLeadIds,
    onOpenAdvanceFilter,
    branchId,
    testInfo
}) {
    let setLeadsFn;
    setLeadsFn = setLeads;

    const selectAllRef = useRef();
    const setSelectedLeadIdsRef = useRef(setSelectedLeadIds);
    const selectedLeadIdsRef = useRef(selectedLeadIds);

    // Keep refs updated with latest values
    useEffect(() => {
        setSelectedLeadIdsRef.current = setSelectedLeadIds;
        selectedLeadIdsRef.current = selectedLeadIds;
    }, [setSelectedLeadIds, selectedLeadIds]);

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const [showTimeline, setShowTimeline] = useState(false);
    const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState(null);
    const [selectedLead, setSelectedLead] = useState({});
    const [expandedRows, setExpandedRows] = useState({});
    const [showCallerDeskIVR, setShowCallerDeskIVR] = useState(false);
    const [callerCandidate, setCallerCandidate] = useState(null);
    const [showRouteData, setShowRouteData] = useState(false);
    const [selectedLeadForRouteData, setSelectedLeadForRouteData] = useState(null);
    const isIndeterminate =
        leads.some(l => selectedLeadIds.includes(l.invitationId)) &&
        !leads.every(l => selectedLeadIds.includes(l.invitationId));

    const [showExtendedFormModal, setShowExtendedFormModal] = useState(false);
    const [extendedFormInvitationId, setExtendedFormInvitationId] = useState(null);

    const dataFormatters = {
        assignedUserId: (row) => {
            const id = Number(row?.assignedUserId);

            // -1 = current admin
            if (id === -1) return '-';

            // lookup from owners map
            return owners?.[id] || '-';
        }
    };

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    // Clear selected leads when leads data changes (on refresh)
    useEffect(() => {
        if (selectedLeadIds.length > 0 && leads.length > 0) {
            // Check if any selected IDs are still in the current data
            const currentIds = new Set(leads.map(l => l.invitationId));
            const stillSelected = selectedLeadIds.filter(id => currentIds.has(id));
            
            // If none of the selected IDs are in current data, clear selection
            if (stillSelected.length === 0) {
                setSelectedLeadIds([]);
            } else if (stillSelected.length !== selectedLeadIds.length) {
                // Some selections are gone, update to only keep valid ones
                setSelectedLeadIds(stillSelected);
            }
        }
    }, [leads]);

    // Expose refresh function with callback support
    useEffect(() => {
        window.tableRefresh = (callback) => xLeads(callback);
        return () => {
            delete window.tableRefresh;
        };
    }, []);

    async function xLeads(callback) {
        // Clear selected leads when table refreshes (use ref to avoid stale closure)
        if (selectedLeadIdsRef.current.length > 0) {
            setSelectedLeadIdsRef.current([]);
        }

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
            testId: testInfo?.testId || Test._id,
            testType: testInfo?.testType || Test.type,
            owner: User._id,
            isTelecaller: User.telecaller ? 1 : 0,
            order: "asc",
            offset,
            limit,
            search: LeadSearch.value()
        };

        // Add branchId (corporateId) to payload if provided
        if (branchId) {
            payload.corporateId = branchId;
        }

        if (filters.length > 0) {
            // Show the applied filters bar with proper clear handler
            showAppliedFilter(filters, () => {
                // This is called when user clicks × in AppliedFilters
                LeadFilters.reset();
                LeadsCurrentPage.setValue(1);
                xLeads(callback); // refresh immediately - pass callback
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
                    xLeads(callback); // recursive call - pass callback
                    return;
                }
                // Update state
                setLeadsFn(rows);
                TotalLeads.setValue(total);
                
                // Call onTableRefresh FIRST to update pagination and stop its spinner
                if (typeof window.onTableRefresh === 'function') window.onTableRefresh();
                
                // Then call callback to stop any other spinners (e.g., LeadMenu search spinner)
                if (callback) callback();
            })
            .catch(err => {
                console.error('Error loading leads:', err);
                // Call onTableRefresh FIRST to stop pagination spinner
                if (typeof window.onTableRefresh === 'function') window.onTableRefresh();
                // Then call callback to stop other spinners
                if (callback) callback();
            });
    }

    const handleShowExtendedForm = (invitationId) => {
        // Optional: check google drive linked here (you can move isGoogleDriveLinked logic)
        setExtendedFormInvitationId(invitationId);
        setShowExtendedFormModal(true);
    };

    /* =======================
       NAME + BOOKMARK
    ======================= */
    const renderNameCell = (row) => {
        
        return (
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{row.firstName} 
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
                        window.open(`https://wa.me/${phone}?text=hello`, "_blank");
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

    const getSiblingForRouteData = (lead) => {
        setSelectedLeadForRouteData(lead);
        setShowRouteData(true);
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
        let remarksText = row.remarks || "";
        let audioSrc = "";

        // Extract audio src safely
        const audioMatch = remarksText.match(/<audio[^>]*src=["']([^"']+)["'][^>]*>/i);
        if (audioMatch) {
            audioSrc = audioMatch[1];
            remarksText = remarksText.replace(/<audio[^>]*>.*?<\/audio>/gi, "").trim();
        }

        // Clean text (strip HTML if you don't want rendering, or keep safe HTML)
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = remarksText;
        let safeText = tempDiv.textContent || tempDiv.innerText || "";

        // Add latest remarks date prefix
        if (row.latestRemarksDate) {
            safeText = `${row.latestRemarksDate}: ${safeText}`;
        }

        const truncated = safeText.length > 120;
        const short = truncated ? safeText.substring(0, 120) : safeText;

        // We give each expandable block a unique-ish id
        const blockId = `remarks-${row.id || Math.random().toString(36).slice(2, 10)}`;

        // Truncate + expand logic (same as before, but cleaner HTML)
        const html = truncated ? `
            <div data-remarks-id="${blockId}">
                <span>${short} <span class="text-blue-600 cursor-pointer hover:underline view-more" 
                    data-action="expand"> (view more)</span></span>
                <div class="full-remarks hidden mt-1">
                    ${safeText}
                    <span class="text-red-600 cursor-pointer hover:underline ml-2 view-more" 
                        data-action="collapse"> (hide)</span>
                </div>
            </div>
        ` : safeText;

        if ((!html || html.trim() === "") && !audioSrc) {
            return <div className="text-gray-400">-</div>;
        }

        return (
            <div className="min-w-[220px] max-w-[520px] space-y-3">
            {/* Audio player on left, fixed width */}
            {audioSrc && (
                <div className="h-8 w-[220px] min-w-[180px]">
                <audio
                    controls
                    className="h-8 w-[160px] min-w-[140px]"
                    style={{ margin: 0, padding: 0 }}
                >
                    <source src={audioSrc} type="audio/mpeg" />
                    Your browser does not support audio.
                </audio>
                </div>
            )}

            {/* Remarks text */}
            <div
                className="text-sm text-gray-800 whitespace-pre-line break-words leading-relaxed"
                style={{
                    lineHeight: "1.45",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: html }}
            />
            </div>
        );
    };

    // const renderAINextStepCell = (row) => {
    //     let content = row.aINextStep || "";

    //     const div = document.createElement("div");
    //     div.innerText = content;
    //     let safeText = div.innerHTML;

    //     let finalText = "";

    //     if (safeText.length > 120) {
    //         const shortText = safeText.substring(0, 120);

    //         finalText = `
    //             <div style="min-width:155px;">
    //                 <div>
    //                     ${shortText}
    //                     <span style="cursor:pointer;color:#1976d2;" 
    //                         onclick="this.parentElement.parentElement.querySelector('.full-text').style.display='block';
    //                                 this.parentElement.style.display='none';">
    //                         ...(view)
    //                     </span>
    //                 </div>

    //                 <div class="full-text" style="display:none;">
    //                     ${safeText}
    //                     <span style="cursor:pointer;color:red;margin-left:6px;"
    //                         onclick="this.parentElement.style.display='none';
    //                                 this.parentElement.parentElement.querySelector('div').style.display='block';">
    //                         (hide)
    //                     </span>
    //                 </div>
    //             </div>
    //         `;
    //     } else {
    //         finalText = safeText;
    //     }

    //     if (!finalText || finalText === "null") {
    //         return "-";
    //     }

    //     const textStyles = {
    //         whiteSpace: "normal",
    //         wordBreak: "normal",
    //         overflowWrap: "break-word",
    //         maxWidth: "480px",
    //         lineHeight: "20px",
    //     };

    //     return (
    //         <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
    //             <span
    //                 style={textStyles}
    //                 dangerouslySetInnerHTML={{ __html: finalText }}
    //             />
    //         </div>
    //     );
    // };

    const renderActionCell = (row) => {
        return (
            <div className="action-column flex items-center">
            {/* Route Data */}
            <button
                title="Route Data"
                onClick={() =>
                    getSiblingForRouteData(row)
                }
                className="p-1 rounded hover:bg-gray-100 transition"
            >
                <i className="ri-share-forward-line text-lg text-blue-600" />
            </button>

            {/* Bookmark */}

            <button
                title={row.bookmark === "1" ? 'Remove Bookmark' : 'Bookmark'}
                onClick={() => toggleBookmark(row)}
                className="p-1 rounded hover:bg-gray-100 transition"
            >
                <i
                className={`text-lg ${
                    row.bookmark === "1"
                    ? 'ri-bookmark-fill text-yellow-500'
                    : 'ri-bookmark-line text-gray-400'
                }`}
            />
            </button>

            {/* Extended Form */}
            {[800, 100].includes(Corporate?.type) && (
                <button
                title="View Application Form Data"
                onClick={() => handleShowExtendedForm(row.invitationId)}
                className="p-1 rounded hover:bg-gray-100 transition"
                >
                <i className="ri-file-list-3-line text-lg text-emerald-600" />
                </button>
            )}

            {/* Corporate Type 800 */}
            {Corporate?.type === 800 && (
                <>
                {/* University List */}
                <button
                    title="University List"
                    onClick={() => universityList(row.invitationId)}
                    className="p-1 rounded hover:bg-gray-100 transition"
                >
                    <i className="ri-school-line text-lg text-indigo-600" />
                </button>

                {/* Documents */}
                <button
                    title="Documents"
                    onClick={() => uploadLeadDocs(row.invitationId)}
                    className="p-1 rounded hover:bg-gray-100 transition"
                >
                    <i className="ri-folder-3-line text-lg text-sky-600" />
                </button>
                </>
            )}
            </div>
        );
    };

    const toggleBookmark = (row) => {
        xFetch({
            path: "/services/invite/bookmark",
            method: "POST",
            payload: {
            invitationId: row.invitationId
            }
        })
        .then((data) => {
        if (data.status === "success") {
            setLeads((prev) =>
            prev.map((l) =>
                l.invitationId === row.invitationId
                ? { ...l, bookmark: data.isBookmarked }
                : l
            )
            );
        }
        })
        .catch((error) => {
            console.error("Bookmark toggle failed", error);
        });
    };

    useEffect(() => {
        LeadsCurrentPage.setValue(1);
        xLeads();
        window.tableRefresh = () => xLeads();
        HorizontalScroll();
        return () => {
            delete window.tableRefresh;
        };
    }, [testInfo]);

    useEffect(() => {
        const handleClick = (e) => {
            const target = e.target.closest('.view-more');
            if (!target) return;

            const container = target.closest('[data-remarks-id]');
            if (!container) return;

            const full = container.querySelector('.full-remarks');
            const shortSpan = container.querySelector('span:not(.full-remarks span)');

            if (target.dataset.action === 'expand') {
                full.style.display = 'block';
                shortSpan.style.display = 'none';
            } else if (target.dataset.action === 'collapse') {
                full.style.display = 'none';
                shortSpan.style.display = 'inline';
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
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
        
        if (col === 'aINextStep' && Corporate?.is_ai_nextstep_enabled !== "1") {
            return; // skip this column entirely
        }
        cols.push({
            accessorKey: col,
            size: col === 'remarks' ? 200 : undefined,
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
                if (col === 'action') return renderActionCell(r);

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

    const renderAINextStepCell = ( row ) => {
        const lead = row;
        const invitationId = lead.invitationId;
        const phone = (lead.mobile || '').replace(/\D/g, ''); // clean for wa.me

        const [suggestion, setSuggestion] = useState(null);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [showDetails, setShowDetails] = useState(false);

        // Initial display uses whatever came from backend table data
        const initialSummary = lead.aiNextStep || lead.aINextStep || 'No AI suggestion yet';

        const fetchSuggestion = async (forceRefresh = false) => {
            setLoading(true);
            setError(null);
            try {
                const payload = { invitationId };
                if (forceRefresh) payload.refresh = true; // optional flag if your API supports it

                const res = await xFetch({
                    path: '/services/invite/getAINextStepSuggestion',          // ← your actual route
                    method: 'POST',                     // or GET if preferred
                    payload,
                });

                if (res.status !== true && !res.status?.includes('success')) {
                    throw new Error(res.error || 'Failed to get AI suggestion');
                }

                setSuggestion(res);
            } catch (err) {
                setError(err.message || 'Could not load AI plan');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        // Lazy load on first interaction (better than auto-fetching all rows)
        const handleAction = (type) => {
            if (!suggestion) {
                fetchSuggestion().then(() => performAction(type));
            } else {
                performAction(type);
            }
        };

        const performAction = (type) => {
            if (!suggestion?.full) return;

            const data = suggestion.full;
            const name = lead.firstName || 'there';

            if (type === 'whatsapp') {
                if (data.action_type !== 'whatsapp' && !data.content) {
                    alert('AI recommends a different action right now.');
                    return;
                }
                const message = (data.content || '')
                    .replace('{{firstName}}', name)
                    .replace('{{course}}', lead.course || 'program');
                const encoded = encodeURIComponent(message);
                window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
            }

            else if (type === 'call') {
                const script = data.content || data.next_conversation_tips || 'No script available';
                // Simple alert → replace with nice modal later
                alert(`Call Script for ${name}:\n\n${script}\n\n(Confidence: ${data.confidence}%)`);
                // Bonus: copy to clipboard
                navigator.clipboard.writeText(script).catch(() => {});
            }

            else if (type === 'mistakes') {
                const mistakes = data.past_mistakes || 'No mistakes identified';
                // Replace alert with popup/modal as needed
                alert(`Past Mistakes for ${name}:\n\n${mistakes}`);
                navigator.clipboard.writeText(mistakes).catch(() => {});
            }

            else if (type === 'nextStepDetails') {
                setShowDetails(!showDetails);
            }
        };

        // UI: Show summary + action icons
        return (
            <div className="min-w-[240px] max-w-[520px] space-y-2 text-sm">
                {loading ? (
                    <div className="text-blue-600 animate-pulse">Generating AI response...</div>
                ) : error ? (
                    <div className="text-red-600">{error} <button onClick={() => fetchSuggestion()} className="underline">Retry</button></div>
                ) : (
                    <>
                        {/* Main summary line */}
                        <div className="font-medium text-gray-800">
                            {suggestion?.summary || initialSummary}
                            {suggestion?.full?.confidence && (
                                <span className="text-xs text-gray-500 ml-2">
                                    (conf: {suggestion.full.confidence}%)
                                </span>
                            )}
                        </div>

                        {/* Quick status indicators */}
                        {suggestion?.full?.reason && (
                            <div className="text-gray-600 italic text-xs">
                                {suggestion.full.reason.substring(0, 90)}
                                {suggestion.full.reason.length > 90 ? '...' : ''}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-4 mt-2">

                            <button
                                title="Show next step for conversion"
                                onClick={() => handleAction('nextStepDetails')}
                                disabled={loading}
                                className="text-purple-600 hover:text-purple-800 transition"
                            >
                                <i className={`ri-information-${showDetails ? 'fill' : 'line'} text-2xl`} />
                            </button>

                            <button
                                title="Send WhatsApp message"
                                onClick={() => handleAction('whatsapp')}
                                disabled={loading}
                                className="text-green-600 hover:text-green-800 transition"
                            >
                                <i className="ri-whatsapp-line text-2xl" />
                            </button>

                            <button
                                title="View / Copy call script"
                                onClick={() => handleAction('call')}
                                disabled={loading}
                                className="text-blue-600 hover:text-blue-800 transition"
                            >
                                <i className="ri-phone-fill text-2xl" />
                            </button>

                            <button
                                title="What have I done wrong so far?"
                                onClick={() => handleAction('mistakes')}
                                disabled={loading}
                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                                <i className="ri-error-warning-line text-xl" />
                                <span className="text-xs font-medium">Mistakes</span>
                            </button>

                            {/* Refresh if you want manual control */}
                            <button
                                title="Refresh AI suggestion"
                                onClick={() => fetchSuggestion(true)}
                                disabled={loading}
                                className="text-gray-500 hover:text-gray-700 text-xs ml-auto"
                            >
                                <i className="ri-refresh-line" /> Refresh
                            </button>
                        </div>

                        {/* Expanded details panel */}
                        {showDetails && suggestion?.full && (
                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-gray-800 text-xs leading-relaxed">
                                <div className="font-semibold mb-1">AI Reasoning:</div>
                                <p>{suggestion.full.reason || 'No reason provided'}</p>

                                {suggestion.full.next_conversation_tips && (
                                    <>
                                        <div className="font-semibold mt-2 mb-1">Next Conversation Tips:</div>
                                        <p className="whitespace-pre-line">{suggestion.full.next_conversation_tips}</p>
                                    </>
                                )}

                                {suggestion.full.conversion_probability && (
                                    <div className="mt-2 text-green-700 font-medium">
                                        Estimated conversion chance: {suggestion.full.conversion_probability}%
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

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
                        style={{ 
                            width: header.column.columnDef.size 
                                ? `${header.column.columnDef.size}px` 
                                : undefined,
                            minWidth: header.column.columnDef.size 
                                ? `${header.column.columnDef.size}px` 
                                : undefined
                        }}
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
                                <td 
                                    key={cell.id} 
                                    className="p-2 align-top"
                                    style={{ 
                                        width: cell.column.columnDef.size 
                                            ? `${cell.column.columnDef.size}px` 
                                            : undefined,
                                        minWidth: cell.column.columnDef.size 
                                            ? `${cell.column.columnDef.size}px` 
                                            : undefined
                                    }}
                                >
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
            xLeads={refreshLeads}
            />
        )}

        {showRouteData && selectedLeadForRouteData && (
            <RouteData
            lead={selectedLeadForRouteData}
            isOpen={showRouteData}
            onClose={() => setShowRouteData(false)}
            onSuccess={refreshLeads}
            />
        )}

        {showExtendedFormModal && extendedFormInvitationId && (
            <ExtendedFormModal
                invitationId={extendedFormInvitationId}
                isOpen={showExtendedFormModal}
                onClose={() => {
                setShowExtendedFormModal(false);
                setExtendedFormInvitationId(null);
                }}
                onRefresh={refreshLeads}   // optional
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
            
            .leadstor-table-modern td {
                vertical-align: top !important;
                padding: 8px 12px !important;
            }

            .leadstor-table-modern td .flex.items-start {
                align-items: flex-start !important;
            }

            .audio-in-remarks {
                margin: 0 !important;
                padding: 0 !important;
            }
                
        `}</style>
        </>
    );
}
