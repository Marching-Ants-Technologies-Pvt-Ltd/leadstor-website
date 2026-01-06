'use client';
import '@/app/style/table-style.css';
import { showFullRemarks, HorizontalScroll } from '@/utility/TableControllers';
import { useEffect, useState, useRef } from 'react';
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
    LeadFilters
} from '@/utility/TinyDB';
import UpdateLead from '@/components/dashboard/Lead/UpdateLead';
import CallerDeskIVR from '@/components/dashboard/Lead/CallerDeskIVR';
import Timeline from '@/components/dashboard/Lead/ViewTimeline';
import { tableHeader } from "@/components/common/customStyle";

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
    setSelectedLeadIds
}) {
    setLeadsFn = setLeads;

    const selectAllRef = useRef();

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const [showTimeline, setShowTimeline] = useState(false);
    const [selectedLead, setSelectedLead] = useState({});

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
        let currentPage = LeadsCurrentPage.value();
        let limit = LeadsPerPage.value();
        let offset = (currentPage - 1) * limit;
        let filters = LeadFilters.value();

        let payload = {
            testId: Test._id,
            testType: Test.type,
            owner: User._id,
            isTelecaller: User.telecaller ? 1 : 0,
            order: "asc",
            offset,
            limit,
            search: document.querySelector('div#table-search-bar input')?.value ?? ''
        };

        if (filters.length > 0) {
            filters.forEach(item => payload[item.query] = item.value);
            showAppliedFilter(filters, () => {
                LeadFilters.reset();
                xLeads();
            });
        }

        xFetch({ path: '/services/invite/enquiries', payload })
            .then(data => {
                setLeadsFn(data?.rows || []);
                TotalLeads.setValue(parseInt(data?.total || 0));
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
        const phone = row.mobile;

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

    const handleShowTimeline = (selectedLead) => {
        setShowTimeline(true);
        setSelectedLead(selectedLead);
    };

    const renderStatusTimelineCell = (row, handleShowTimeline) => {
        const status = row.status || "-";

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
            "PostMeeting FollowUp": "bg-cyan-500"
        };

        const pillColor = STATUS_MAP[status] || "bg-slate-400";

        return (
            <div className="flex items-center gap-2">
            {/* STATUS PILL */}
            <span
                className={`px-3 py-[3px] rounded-full text-xs font-medium text-white
                ${pillColor} whitespace-nowrap`}
            >
                {status}
            </span>

            {/* TIMELINE ICON */}
            <i
                className="ri-history-line text-blue-500 cursor-pointer text-[14px]"
                title="View Timeline"
                onClick={() => handleShowTimeline(row)}
            />
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

    useEffect(() => {
        xFetch({ path: '/services/profile/columns' })
            .then(data => {
                setColumns(data);
                setColumnOrder(
                    data.map(i => i.dataField).filter(i => i !== 'action')
                );
                xLeads();
            });

        window.tableRefresh = () => xLeads();
        HorizontalScroll();
    }, []);

    return (
        <>
            <AppliedFilters />
            {/* TABLE */}
            <div className="bg-white rounded-xl border overflow-auto" style={{height: 'calc(100vh - Xpx)'}}>
                    <table className="w-full border-collapse text-sm leadstor-table-modern">

                    {/* HEADER */}
                    <thead className={`sticky top-0 z-10 ${tableHeader}`}>
                    <tr>
                        <th className="p-2 border-b w-[40px]">
                        <input
                            ref={selectAllRef}
                            type="checkbox"
                            checked={
                            leads.length > 0 &&
                            leads.every(l => selectedLeadIds.includes(l.invitationId))
                            }
                            onChange={e =>
                            setSelectedLeadIds(
                                e.target.checked ? leads.map(l => l.invitationId) : []
                            )
                            }
                        />
                        </th>

                        {columns
                        .filter(c => c.dataField !== 'action')
                        .map((c, i) => (
                            <th
                            key={i}
                            className="p-2 text-left font-semibold border-b whitespace-nowrap"
                            >
                            {c.displayName || c.fieldName}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                    {leads.map(row => (
                        <tr
                        key={row.invitationId}
                        className="border-b hover:bg-slate-50 transition h-[44px]"
                        >
                        <td className="p-2">
                            <input
                            type="checkbox"
                            checked={selectedLeadIds.includes(row.invitationId)}
                            onChange={e =>
                                setSelectedLeadIds(
                                e.target.checked
                                    ? [...selectedLeadIds, row.invitationId]
                                    : selectedLeadIds.filter(id => id !== row.invitationId)
                                )
                            }
                            />
                        </td>

                        {columnOrder.map(col => (
                            <td
                            key={col}
                            className="p-2 whitespace-nowrap overflow-hidden text-ellipsis align-top"
                            data-column={col}
                            data-tooltip={row[col]}
                            >
                            {col === 'firstName' && renderNameCell(row)}
                            {col === 'mobile' && renderMobileCell(row)}
                            {col === 'remarks' && renderRemarkCell(row)}
                            {col === 'status' &&
                                renderStatusTimelineCell(row, handleShowTimeline)}
                            {col === 'leadProbability' && renderProbability(row)}

                            {dataFormatters[col] &&
                                !['firstName', 'mobile', 'status','leadProbability '].includes(col) &&
                                dataFormatters[col](row)}

                            {!dataFormatters[col] &&
                                !['firstName', 'mobile', 'status','leadProbability'].includes(col) &&
                                row[col]}
                            </td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* KEEP ALL MODALS AS-IS */}
            {showUpdatePopup && (
            <UpdateLead
                selectedLead={selectedCandidate}
                onCancel={() => setShowUpdatePopup(false)}
                onSuccess={() => {
                setShowUpdatePopup(false)
                xLeads()
                }}
            />
            )}

            {showCallerDeskIVR && (
            <CallerDeskIVR
                candidate={callerCandidate}
                onClose={() => setShowCallerDeskIVR(false)}
            />
            )}

            {showTimeline && (
            <Timeline
                leadDetails={selectedLead}
                isOpen
                onClose={() => setShowTimeline(false)}
            />
            )}

            {/* STYLES */}
            <style jsx>{`
            /* ===== MODERN CRM TABLE ===== */

            .leadstor-table-modern {
                table-layout: fixed;
                min-width: 2700px; 
            }
            
            .leadstor-table-modern td {
                position: relative;
                max-width: 350px;
                white-space: normal;          /* allow line break */
                word-break: break-word;       /* break long words */
                overflow-wrap: anywhere;      /* handles long emails/urls */
                line-height: 1.4;
                padding-top: 8px;
                padding-bottom: 8px;
            }

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

            .leadstor-table-modern tbody td {
                font-size: 13px;
                color: #111827;
                border-right: 1px solid #f1f5f9;
            }

            .leadstor-table-modern tbody tr:last-child td {
                border-bottom: none;
            }

            /* Sticky header shadow */
            thead.sticky {
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
            }

            /* Checkbox alignment */
            input[type="checkbox"] {
                width: 14px;
                height: 14px;
                cursor: pointer;
            }
            `}</style>
            
        </>
    )

}
