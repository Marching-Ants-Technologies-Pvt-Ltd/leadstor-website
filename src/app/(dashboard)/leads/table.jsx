'use client';
import './table-style.css';
import LeadContextMenu, { ShowContentMenu } from './contextMenu';
import { useEffect, useState } from 'react';
import AppliedFilters, { showAppliedFilter } from './appliedFilters';

const token = JSON.parse(localStorage.getItem('session_user'))['cn_token'];
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", `Bearer ${token}`);

const requestOptions = { method: "GET", headers: myHeaders, redirect: "follow" };

let setLeadsFn;
let columnOrder;

function xLeads() {

    let query = 'testId=2101&testType=S&owner=-1&isTelecaller=0&time=1735208746990&search=&order=asc&offset=0&limit=25';
    fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/invite/enquiries?${query}`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log('FOUNDs', result);
            setLeadsFn(result.rows);
        })
        .catch((error) => {
            console.log('FUSSs', error);
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

        fetch(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/profile/columns`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                setColumns(result);
                columnOrder = result.map((item) => { return item.dataField });
                columnOrder = columnOrder.filter(item => item !== 'action');
                xLeads();
            })
            .catch((error) => {
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

    const handelSelectAll = (event) => {
        document.querySelectorAll('table.leadstor-table tbody input[type=checkbox]').forEach(box => box.checked = event.target.checked);
    }

    return (
        <div className='grow border-t border-b bg-gray-50 overflow-auto'>
            <LeadContextMenu />
            <AppliedFilters />
            <table className="leadstor-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" onChange={handelSelectAll} />
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