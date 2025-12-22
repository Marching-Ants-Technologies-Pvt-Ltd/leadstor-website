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
    leadProbability: (row) => {
        let _id = parseInt(row['leadProbability']);
        if (!_id || typeof _id !== 'number') return '';
        if (_id < 20) return '';
        if (_id === 20) return `<i class="warning">Low</i>`;
        if (_id === 55) return `<i class="primary">Medium</i>`;
        return '<i class="success">High</i>';
    }
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
                <i
                    className={`cursor-pointer text-[15px] ${
                        isBookmarked
                            ? "ri-bookmark-fill text-yellow-500"
                            : "ri-bookmark-line text-gray-400 hover:text-gray-600"
                    }`}
                    onClick={toggleBookmark}
                    title="Bookmark"
                />

                <i
                    className="ri-pencil-fill cursor-pointer hover:text-pink-600 text-[14px] default-clr"
                    title="Edit Lead"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(row);
                        setShowUpdatePopup(true);
                    }}
                />

                <span className="font-medium">{row.firstName}</span>
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

    const renderStatusTimelineCell = (row) => (
        <div className="flex gap-1">
            <span>{row.status || '-'}</span>
            <i
                className="ri-history-line text-blue-600 cursor-pointer"
                title="View Timeline"
                onClick={() => {
                    setSelectedLead(row);
                    setShowTimeline(true);
                }}
            />
        </div>
    );

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

            <div className="table-container">
                <table className="leadstor-table">
                    <thead className={tableHeader}>
                        <tr>
                            <th>
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

                            {columns.filter(c => c.dataField !== 'action').map((c, i) => (
                                <th key={i}>{c.displayName || c.fieldName}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {leads.map(row => (
                            <tr key={row.invitationId}>
                                <td>
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
                                    <td key={col}>
                                        {col === 'firstName' && renderNameCell(row)}
                                        {col === 'mobile' && renderMobileCell(row)}
                                        {col === 'status' && renderStatusTimelineCell(row)}
                                        {dataFormatters[col] &&
                                            !['firstName', 'mobile', 'status'].includes(col) &&
                                            dataFormatters[col](row)}
                                        {!dataFormatters[col] &&
                                            !['firstName', 'mobile', 'status'].includes(col) &&
                                            row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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

            {showTimeline && (
                <Timeline
                    leadDetails={selectedLead}
                    isOpen
                    onClose={() => setShowTimeline(false)}
                />
            )}
        </>
    );
}
