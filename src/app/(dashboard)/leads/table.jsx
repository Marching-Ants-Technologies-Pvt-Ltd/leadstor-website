'use client';
import '@/app/style/table-style.css';
import { showFullRemarks, HorizontalScroll } from '@/utility/TableControllers';
import ContextMenu, { ShowContentMenu } from '@/utility/ContextMenu';
import { useEffect, useState } from 'react';
import AppliedFilters, { showAppliedFilter } from './appliedFilters';
import { xFetch } from '@/utility/xFetch';
import { getLeadOwnerById, Test, User, LeadsPerPage, TotalLeads } from '@/utility/TinyDB';
import { CheckUncheckAllRows } from '@/utility/TableControllers';

const contextMenuItems = [
    { icon: "ri-edit-2-fill", title: "Edit" },
    { icon: "ri-star-line", title: "Bookmark" },
    { icon: "ri-whatsapp-line", title: "Whatsapp message" },
    { icon: "ri-mail-send-line", title: "Send Email" },
    { icon: "ri-chat-1-line", title: "Send SMS" },
    { icon: "ri-user-voice-line", title: "Invite Again" },
    { icon: "ri-customer-service-2-line", title: "Make a call", badge: "IVR" },
    { icon: "ri-history-line", title: "View timeline" },
    { icon: "ri-group-line", title: "View related inquiry" }
];

let setLeadsFn;

const dataFormatters = {
    assignedUserId: (row) => {
        let _id = parseInt(row['assignedUserId'] ?? "0");
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

    }

}

function xLeads() {

    let payload = {
        "testId": Test._id,
        "testType": Test.type,
        "owner": User._id,
        "isTelecaller": (User.telecaller) ? 1 : 0,
        "order": "asc",
        "offset": "0",
        "limit": LeadsPerPage.value(),
        "search": document.querySelector('div#table-search-bar input')?.value ?? ''
    }

    xFetch({
        path: '/services/invite/enquiries',
        payload
    })
        .then(data => {
            setLeadsFn(data.rows);
            TotalLeads.setValue(parseInt(data.total));
        })
        .catch(error => {
            console.error(`An error occurred while fetching leads`, error);
            setLeadsFn([]);
        });
}

export default function LeadsTable() {

    const [columns, setColumns] = useState([]);
    const [columnOrder, setColumnOrder] = useState([]);
    const [leads, setLeads] = useState([]);
    setLeadsFn = setLeads;

    const contextMenuCallback = (response) => {
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

    const handelRowContext = (event) => {
        event.preventDefault();
        event.stopPropagation();
        ShowContentMenu({ event, onClick: contextMenuCallback });
    }

    // Handle horizontal scroll
    let hScrollStatus = false;
    const handelAltKeyPress = (event) => {
        // hScrollStatus = state;
        console.log(`Alt pressed`, event);
    }

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

    }, []);

    return (
        <div className='table-container'>
            <ContextMenu items={contextMenuItems} />
            <AppliedFilters />
            <table className="leadstor-table">
                <thead className='bg-blue-50'>
                    <tr>
                        <th>
                            <input type="checkbox" onChange={CheckUncheckAllRows} />
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
                        <tr key={`lead-count-${j}`} onContextMenu={handelRowContext} onClick={handelRowClick} id={`lead-${row.invitationId}`}>
                            <td>
                                <div>
                                    <input type="checkbox" />
                                    <i className="ri-more-2-fill"></i>
                                </div>
                            </td>
                            {columnOrder.map((col, k) => (
                                <td key={`lead-clm-${k}`} data-column={col}>
                                    {dataFormatters[col]
                                        ? ((['leadProbability', 'remarks'].includes(col))
                                            ? (
                                                <span
                                                    dangerouslySetInnerHTML={{ __html: dataFormatters[col](row) }}
                                                />
                                            ) : (
                                                dataFormatters[col](row)
                                            )
                                        )
                                        : (row[col] ?? '')
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}