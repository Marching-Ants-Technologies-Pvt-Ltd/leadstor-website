'use client';
import '@/app/style/table-style.css';
import { xFetch } from '@/utility/xFetch';
import { useEffect, useState } from 'react';
import ContextMenu, { ShowContentMenu } from '@/utility/ContextMenu';
import { CheckUncheckAllRows } from '@/utility/TableControllers';

// Page specific variables
let columnOrder;
let setConversionFn;

const contextMenuItems = [
    { icon: "ri-edit-2-fill", title: "Edit" },
    { icon: "ri-whatsapp-line", title: "Whatsapp message" },
    { icon: "ri-mail-send-line", title: "Send Email" },
    { icon: "ri-chat-1-line", title: "Send SMS" },
    { icon: "ri-customer-service-2-line", title: "Counsellor" },
    { icon: "ri-user-3-line", title: "Trainer" },
    { icon: "ri-receipt-line", title: "Installments", badge: "Completed" },
    { icon: "ri-article-line", title: "Certificate", badge: "Course" },
    { icon: "ri-briefcase-line", title: "Placement Ready" },
    { icon: "ri-delete-bin-7-line", title: "Delete" }
];

// Page specific Methods
function xConversions() {

    let payload = {
        "order": "asc",
        "offset": "0",
        "limit": "25"
    }

    xFetch({
        path: '/services/joinees/admissions',
        payload
    })
        .then(data => {
            setConversionFn(data.rows);
        })
        .catch(error => {
            console.error(`An error occurred while fetching leads`, error);
            setConversionFn([]);
        });
}

export default function ConversionTable() {

    const [columns, setColumns] = useState([]);
    const [conversions, setConversions] = useState([]);
    setConversionFn = setConversions;

    // Get table columns
    useEffect(() => {
        xFetch({ path: '/services/joinees/columns' })
            .then(data => {
                setColumns(data);
                columnOrder = Object.keys(data);
                xConversions();
            })
            .catch(error => {
                console.error(`An error occurred while fetching lead-table-columns`, error);
                setColumns([]);
            });
    }, []);

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

    return (
        <div className='grow border-t border-b overflow-auto'>
            <ContextMenu items={contextMenuItems} />
            <table className="leadstor-table">
                <thead className='bg-purple-50'>
                    <tr>
                        <th>
                            <input type="checkbox" onClick={ CheckUncheckAllRows } />
                        </th>
                        {Object.entries(columns).map(([key, value], index) => (
                            <th
                                key={`column-${index}`}
                                data-field={key}
                            >{value}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {conversions.map((row, j) => (
                        <tr key={`conversion-count-${j}`} id={`conversion-${row.id}`} onContextMenu={handelRowContext} onClick={handelRowClick} >
                            <td>
                                <div>
                                    <input type="checkbox" />
                                    <i className="ri-more-2-fill"></i>
                                </div>
                            </td>
                            {columnOrder && columnOrder.map((col, k) => (
                                <td key={`conversion-clm-${k}`}>{row[col] ?? ''}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}