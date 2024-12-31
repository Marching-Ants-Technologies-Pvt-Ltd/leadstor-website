'use client';
import '@/app/style/table-style.css';
import ContextMenu, { ShowContentMenu } from '@/utility/ContextMenu';
import { useEffect, useState } from 'react';
import AppliedFilters, { showAppliedFilter } from './appliedFilters';
import { xFetch } from '@/utility/xFetch';
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
let columnOrder;

function xLeads() {

    let payload = {
        "testId": "2101",
        "testType": "S",
        "owner": "-1",
        "isTelecaller": "0",
        "order": "asc",
        "offset": "0",
        "limit": "25"
    }

    xFetch({
        path: '/services/invite/enquiries',
        payload
    })
        .then(data => {
            setLeadsFn(data.rows);
        })
        .catch(error => {
            console.error(`An error occurred while fetching leads`, error);
            setLeadsFn([]);
        });
}

export function searchLead(text) {
    console.log(`Search It!`, text);
}

export function leadFilters(options = {}) {
    // showAppliedFilter({status: "Invited,Cold Lead", name: "tanish"})
}

export default function LeadsTable({ search = '' }) {

    const [columns, setColumns] = useState([]);
    const [leads, setLeads] = useState([]);
    setLeadsFn = setLeads;

    const contextMenuCallback = (response) => {
        console.log(`User clicked`, response);
    }

    const handelRowClick = (event) => {
        if (event.target.tagName !== 'I') return;
        ShowContentMenu({ event, onClick: contextMenuCallback });
    }

    const handelRowContext = (event) => {
        event.preventDefault();
        event.stopPropagation();
        ShowContentMenu({ event, onClick: contextMenuCallback });
    }

    // Get table columns
    useEffect(() => {
        xFetch({ path: '/services/profile/columns' })
            .then(data => {
                setColumns(data);
                columnOrder = data.map((item) => { return item.dataField });
                columnOrder = columnOrder.filter(item => item !== 'action');
                xLeads();
            })
            .catch(error => {
                console.error(`An error occurred while fetching lead-table-columns`, error);
                setColumns([]);
            });
    }, []);

    useEffect(() => {
        if (document.querySelector('table.leadstor-table tbody') && document.querySelector('table.leadstor-table tbody').rows.length > 0) {
            console.log(`Leads table refreshed with some rows`);
            // ToDo Apply any column formatter
            // Always done after post table-data-population
        }
    }, [leads])

    return (
        <div className='grow border-t border-b overflow-auto'>
            <ContextMenu items={contextMenuItems} />
            <AppliedFilters />
            <table className="leadstor-table">
                <thead className='bg-blue-50'>
                    <tr>
                        <th>
                            <input type="checkbox" onChange={ CheckUncheckAllRows } />
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
                                <td key={`lead-clm-${k}`}>{row[col] ?? '0'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}