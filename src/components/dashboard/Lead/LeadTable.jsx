'use client';
import '@/app/style/table-style.css';
import { showFullRemarks, HorizontalScroll, CheckUncheckAllRows } from '@/utility/TableControllers';
import ContextMenu, { ShowContentMenu } from '@/utility/ContextMenu';
import { useEffect, useState, useRef } from 'react';
import AppliedFilters, { showAppliedFilter } from '@/components/dashboard/Lead/AppliedFilters';
import { xFetch } from '@/utility/xFetch';
import { getLeadOwnerById, getCurrentUserNameIfAdmin, Test, User, LeadsPerPage, TotalLeads, LeadsCurrentPage, LeadFilters } from '@/utility/TinyDB';
import UpdateLead from '@/components/dashboard/Lead/UpdateLead';
import CallerDeskIVR from '@/components/dashboard/Lead/CallerDeskIVR';
import { MdTimeline } from 'react-icons/md';
import Timeline from '@/components/dashboard/Lead/ViewTimeline';

const contextMenuItems = [
    { icon: "ri-edit-2-fill", title: "Edit" },
    { icon: "ri-star-line", title: "Bookmark" },
    { icon: "ri-whatsapp-line", title: "Whatsapp message" },
    { icon: "ri-mail-send-line", title: "Send Email" },
    { icon: "ri-chat-1-line", title: "Send SMS" },
    { icon: "ri-user-voice-line", title: "Invite Again" },
    { icon: "ri-customer-service-2-line", title: "Make a call", badge: "IVR" },
    { icon: "ri-chat-history-line", title: "View timeline" },
    { icon: "ri-group-line", title: "View related inquiry" }
];

let setLeadsFn;

const dataFormatters = {
    assignedUserId: (row) => {
        let _id = parseInt(row['assignedUserId'] ?? "0");
        if (_id === -1) {
            return getCurrentUserNameIfAdmin();
        }
        return getLeadOwnerById(_id);
    },
    leadProbability: (row) => {
        let _id = parseInt(row['leadProbability']);
        if (!_id || typeof _id !== 'number') return '';
        if (_id < 20) return '';
        if (_id == 20) return `<i class="warning">Low</i>`;
        if (_id == 55) return `<i class="primary">Medium</i>`;
        return '<i class="success">High</i>';
    },
    remarks: (row) => {
        let content = row['remarks'];
        if (content.includes('<audio')) {
            let audioLink = content.match(/src="([^"]+)"/);
            audioLink = (audioLink.length > 1) ? audioLink[1] : '';
            return `<u class="ri-mic-ai-line" data-audio="${audioLink}"></u> ${content.split('<audio')[0]}`;
        }

        // Sanitize content to avoid XSS attack
        const div = document.createElement('div');
        div.innerText = content;
        content = div.innerHTML;

        // Final content
        return content;
    },
    status: (row,handleShowTimeline) => {
        const content = row['status'];
        return (
            <div className="flex items-center space-x-2">
                <span>{content}</span>
                <button onClick={ () => handleShowTimeline(row)} className="text-blue-500 hover:text-blue-700 focus:outline-none" title="View Timeline">
                    <i className="ri-history-line"></i>
                </button>
            </div>
        );
    }

}

// Custom audio player for remarks
const AudioPlayer = ({ src, remarkText }) => {
    const audioRef = useRef(null);
    const playerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showBar, setShowBar] = useState(false);

    useEffect(() => {
        if (!audioRef.current) return;
        const audio = audioRef.current;
        const update = () => setProgress(audio.currentTime);
        audio.addEventListener('timeupdate', update);
        audio.addEventListener('ended', () => { setPlaying(false); setShowBar(false); });
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        return () => {
            audio.removeEventListener('timeupdate', update);
        };
    }, []);

    // Handle clicks outside the audio player to reset UI
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (playerRef.current && !playerRef.current.contains(event.target) && showBar) {
                // Stop the audio and reset UI
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                setPlaying(false);
                setShowBar(false);
                setProgress(0);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBar]);

    const togglePlay = (e) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (!showBar) {
            setShowBar(true);
            setTimeout(() => {
                audioRef.current.play();
                setPlaying(true);
            }, 100);
            return;
        }
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.play();
            setPlaying(true);
        }
    };

    const handleSeek = (e) => {
        const rect = e.target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const seekTime = percent * duration;
        audioRef.current.currentTime = seekTime;
        setProgress(seekTime);
    };

    return (
        <div ref={playerRef} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, maxWidth: 320 }}>
            <button
                onClick={togglePlay}
                style={{
                    width: 32, height: 32, borderRadius: '50%', border: 'none', background: playing ? '#e0e7ff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: playing ? '0 0 0 2px #6366f1' : 'none', transition: 'background 0.2s'
                }}
                aria-label={playing ? 'Pause audio' : 'Play audio'}
            >
                <i className={playing ? 'ri-pause-fill text-xl text-blue-600' : 'ri-play-fill text-xl text-blue-600'}></i>
            </button>
            {showBar ? (
                <>
                    <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, position: 'relative', cursor: 'pointer' }} onClick={handleSeek}>
                        <div style={{ width: duration ? `${(progress / duration) * 100}%` : 0, height: 6, background: '#6366f1', borderRadius: 3, position: 'absolute', top: 0, left: 0 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280', minWidth: 38, textAlign: 'right' }}>{formatTime(progress)} / {formatTime(duration)}</span>
                </>
            ) : (
                <span style={{ marginLeft: 8 }} dangerouslySetInnerHTML={{ __html: remarkText }} />
            )}
            <audio ref={audioRef} src={src} style={{ display: 'none' }} />
        </div>
    );
}

export default function LeadsTable({ columns, setColumns, columnOrder, setColumnOrder, leads, setLeads, selectedLeadIds, setSelectedLeadIds }) {
    setLeadsFn = setLeads;

    const selectAllRef = useRef();
    const isIndeterminate = leads.some(lead => selectedLeadIds.includes(lead.invitationId)) && !leads.every(lead => selectedLeadIds.includes(lead.invitationId));

    // Audio playback state
    const [playingAudio, setPlayingAudio] = useState(null);
    const audioRef = useRef(null);

    // State for UpdateCandidate popup
    const [showUpdatePopup, setShowUpdatePopup] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [selectedLead, setSelectedLead] = useState({});

    // State for CallerDeskIVR popup
    const [showCallerDeskIVR, setShowCallerDeskIVR] = useState(false);
    const [callerCandidate, setCallerCandidate] = useState(null);

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const handelFilterClose = () => {
        window.tableState('Removing filters...');
        LeadFilters.reset();
        xLeads();
    }

    async function xLeads() {
        // calculate offset
        let currentPage = LeadsCurrentPage.value();
        let limit = LeadsPerPage.value();
        let offset = (currentPage - 1) * limit;
        let filters = LeadFilters.value();

        // compose payload
        let payload = {
            "testId": Test._id,
            "testType": Test.type,
            "owner": User._id,
            "isTelecaller": (User.telecaller) ? 1 : 0,
            "order": "asc",
            "offset": offset,
            "limit": limit,
            "search": document.querySelector('div#table-search-bar input')?.value ?? ''
        }

        if (filters.length > 0) {
            await filters.map((item) => {
                payload[item.query] = item.value;
            });

            // Show filter section
            showAppliedFilter(filters, handelFilterClose);
        }

        // get leads
        xFetch({
            path: '/services/invite/enquiries',
            payload
        })
        .then(data => {
            // Ensure data is valid
            if (data && typeof data === 'object') {
                setLeadsFn(data.rows || []);
                TotalLeads.setValue(parseInt(data.total || 0));
            } else {
                console.warn('Invalid data received from server:', data);
                setLeadsFn([]);
                TotalLeads.setValue(0);
            }
        })
        .catch(error => {
            console.error(`An error occurred while fetching leads`, error);
            setLeadsFn([]);
            TotalLeads.setValue(0);
        }).finally(() => {
            if (typeof window.onTableRefresh == 'function') window.onTableRefresh();
        })
    }

    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    const renderNameCell = (row) => {
        return (
            <div className="flex items-center gap-2">
                
                {/* 3-dot menu icon */}
                <i
                    className="ri-more-2-fill text-gray-500 cursor-pointer hover:text-gray-700 text-[15px]"
                    onClick={(e) => {
                        e.stopPropagation();
                        ShowContentMenu({ event: e, onClick: contextMenuCallback });
                    }}
                ></i>

                {/* Name text */}
                <span className="text-[14px] font-medium text-gray-800">
                    {row.firstName}
                </span>

                {/* EDIT pen icon */}
                <i
                    className="ri-pencil-fill text-blue-500 cursor-pointer hover:text-blue-600 text-[14px]"
                    title="Edit Lead"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCandidate(row);
                        setShowUpdatePopup(true);
                    }}
                ></i>
            </div>
        );
    };

    // Custom formatter for remarks with audio + expand logic like PHP
    const renderRemarkCell = (row) => {
        let content = row.remarks || "";
        let audioLink = "";

        // ---------------------------
        // Extract audio (same as PHP)
        // ---------------------------
        if (content.includes("<audio")) {
            const match = content.match(/src="([^"]+)"/);
            audioLink = match?.[1] || "";
            content = content.split("<audio")[0];
        }

        // ---------------------------
        // Sanitize text
        // ---------------------------
        const div = document.createElement("div");
        div.innerText = content;
        let safeText = div.innerHTML;

        // ---------------------------
        // Prepend latestRemarksDate
        // ---------------------------
        if (row.latestRemarksDate) {
            safeText = `${row.latestRemarksDate}: ${safeText}`;
        }

        // ---------------------------
        // Expand / Collapse Logic
        // ---------------------------
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

        // ---------------------------
        // Append additionalInfo (PHP logic)
        // ---------------------------
        if (row.additionalInfo?.length > 0) {
            finalText += `
                <br/>
                <span style="color:green;">
                    <i class="ri-user-fill"></i> ${row.additionalInfo}
                </span>
            `;
        }

        // ---------------------------
        // When everything is empty
        // ---------------------------
        if (!finalText || finalText === "null") {
            return "-";
        }

        // ---------------------------
        // Return JSX version (same structure as your original code)
        // ---------------------------
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


    const renderStatusTimelineCell = (row, handleShowTimeline) => {
        const value = row.status || "-";
        const followup = row.followupDate || "Specify Followup Date";
        const trainer = row.trainerName ? ` Trainer: ${row.trainerName}` : "";

        const text =
            row.isFollowupType === "1"
                ? `${value} [${followup}]${trainer}`
                : `${value}${trainer}`;

        return (
            <div className="flex items-end gap-1">
                <span className="whitespace-normal break-words text-left max-w-[100px] ">
                    {text}
                    <button
                        onClick={() => handleShowTimeline(row)}
                        className="inline-flex items-center align-baseline ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                        title="View Timeline"
                        style={{ padding: 0 }}
                    >
                        <i className="ri-history-line text-[15px] leading-none"></i>
                    </button>
                </span>
            </div>
        );
    };


    const contextMenuCallback = (response) => {
        // Remove 'lead-' prefix if present
        let rowId = response.currentRowId;
        if (rowId && rowId.startsWith('lead-')) {
            rowId = rowId.replace('lead-', '');
        }
        
        const candidate = leads.find(lead => String(lead.invitationId) === String(rowId));
        
        if (response.item === 'edit') {
            if (candidate) {
                setSelectedCandidate(candidate);
                setShowUpdatePopup(true);
            }
        } else if (response.item === 'make-a-callivr') {
            if (candidate) {
                setCallerCandidate(candidate);
                setShowCallerDeskIVR(true);
            }
        }
        console.log(`User clicked`, response);
    }

    const handelRowClick = (event) => {
        if (!['I', 'SPAN'].includes(event.target.tagName)) return;

        // Check for context menu click
        if (event.target.tagName == 'I' && event.target.classList.value == 'ri-more-2-fill') {
            ShowContentMenu({ event, onClick: contextMenuCallback });
            return;
        }

        // Check tdName
        let td = event.target.parentElement;
        if (td.tagName !== 'TD') return;
        if (td.getAttribute('data-column') == 'remarks') {
            showFullRemarks(event.target);
            return;
        }
    }

    const handleShowTimeline = (selectedLead) => {
        setShowTimeline(true);
        setSelectedLead(selectedLead);
    };

    // Handler for row checkbox
    const handleRowCheckbox = (invitationId, checked) => {
        if (checked) {
            setSelectedLeadIds([...selectedLeadIds, invitationId]);
        } else {
            setSelectedLeadIds(selectedLeadIds.filter(id => id !== invitationId));
        }
    };

    // Handler for header (select all) checkbox
    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = leads.map(lead => lead.invitationId);
            setSelectedLeadIds(allIds);
        } else {
            setSelectedLeadIds([]);
        }
    };

    // Get table columns
    useEffect(() => {
        xFetch({ path: '/services/profile/columns' })
            .then(data => {
                setColumns(data);
                let _columnOrder = data.map((item) => { return item.dataField });
                _columnOrder = _columnOrder.filter(item => item !== 'action');
                setColumnOrder(_columnOrder);
                xLeads();
            })
            .catch(error => {
                console.error(`An error occurred while fetching lead-table-columns`, error);
                setColumns([]);
            });

        window.tableRefresh = () => {
            xLeads();
        }

        // Horizontal Scroll
        HorizontalScroll();

    }, [setColumns, setColumnOrder]);

    return (
        <>
        <div className="table-container" style={{ width: "100%",overflow: "auto", }} >
            <ContextMenu items={contextMenuItems} />
            <AppliedFilters />
            <table className="leadstor-table">
                <thead className='bg-blue-50'>
                    <tr>
                        <th>
                            <input
                                ref={selectAllRef}
                                type="checkbox"
                                checked={leads.length > 0 && leads.every(lead => selectedLeadIds.includes(lead.invitationId))}
                                onChange={e => handleSelectAll(e.target.checked)}
                            />
                        </th>
                        {columns
                            .filter(item => item.dataField !== 'action')
                            .map((item, index) => (
                                <th
                                    key={`column-${index}`}
                                    data-field={item.dataField}
                                    data-formatter={item.dataFormatter}
                                    data-field-id={item.fieldId}
                                >
                                    {item.fieldName}
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {leads.map((row, j) => (
                        <tr
                        key={`lead-count-${j}`}
                        onClick={handelRowClick}
                        id={`lead-${row.invitationId}`}
                        >
                        <td>
                            <div>
                            <input
                                type="checkbox"
                                checked={selectedLeadIds.includes(row.invitationId)}
                                onChange={e => handleRowCheckbox(row.invitationId, e.target.checked)}
                            />
                            </div>
                        </td>

                        {columnOrder.map((col, k) => (
                            <td key={`lead-clm-${k}`} data-column={col}>
                            {(() => {
                                if (col === "firstName") return renderNameCell(row);
                                if (col === "remarks") return renderRemarkCell(row);

                                // Status → always use React component with handleShowTimeline
                                if (col === "status") return renderStatusTimelineCell(row, handleShowTimeline);

                                // Columns with old HTML formatter (leadProbability)
                                if (col === "leadProbability") {
                                return <span dangerouslySetInnerHTML={{ __html: dataFormatters[col](row) }} />;
                                }

                                // Other React-returning formatters
                                if (dataFormatters[col]) return dataFormatters[col](row);

                                return row[col] ?? "";
                            })()}
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
                        xLeads(); // refresh table after update
                    }}
                />
            )}
            {showCallerDeskIVR && (
                <CallerDeskIVR
                    candidate={callerCandidate}
                    onClose={() => setShowCallerDeskIVR(false)}
                />
            )}

            {/* Render the Timeline modal when needed */}
            {showTimeline && (
                <Timeline
                    leadDetails={selectedLead}
                    isOpen={true}
                    onClose={() => setShowTimeline(false)}
                />
            )}
            <style jsx>{`
                /* Classic Leadstor Table */

                .table-container {
                    width: 100%;
                    max-height: calc(100vh - 145px);
                    overflow: auto;
                    background: #ffffff;
                    text-color: #374151;
                }

                /* Dark header like old UI */
                .leadstor-table thead th {
                    background: #f1bbeaff;
                    padding: 6px 10px !important;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    border-bottom: 1px solid #e2e8f0;
                    white-space: nowrap;
                }

                /* Dense row height */
                .leadstor-table tbody td {
                    padding: 5px 8px !important;
                    font-size: 13px;
                    border-bottom: 1px solid #e2e8f0;
                    border-right: 1px solid #f1f5f9;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    color: #000000 !important;  /* near-black, perfect readability */
                }

                /* Remove row hover highlight */
                .leadstor-table tbody tr:hover {
                    background: #f8fafc;
                }

                /* Compact column widths */
                .leadstor-table td[data-column="email"] {
                    max-width: 180px;
                }
                .leadstor-table td[data-column="remarks"] {
                    max-width: 260px;
                    color: #111827 !important;
                }
                .leadstor-table td[data-column="status"] {
                    width: 150px;
                    color: #111827 !important;
                }
                .leadstor-table td[data-column="mobile"] {
                    width: 100px;
                }

            `}</style>
        </>
    );
}