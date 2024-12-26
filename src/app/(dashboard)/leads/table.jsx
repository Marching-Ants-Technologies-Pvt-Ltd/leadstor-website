'use client';
import './table-style.css';
import LeadContextMenu, { ShowContentMenu } from './contextMenu';

export default function LeadsTable({ search = '' }) {

    const contextMenuCallback = (response) => {
        console.log(`User clicked`, response);
    }

    const handelRowClick = (event) => {
        if(event.target.tagName !== 'I') return;
        ShowContentMenu({event, onClick: contextMenuCallback });
    }

    const handelRowContext = (event) => {
        event.preventDefault();
        event.stopPropagation();
        ShowContentMenu({event, onClick: contextMenuCallback });
    }

    return (
        <div className='grow border-t border-b bg-gray-50 overflow-auto'>
            <LeadContextMenu />
            <table className="leadstor-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" defaultChecked />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Remarks</th>
                        <th>Remarks</th>
                        <th>Remarks</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    <tr onContextMenu={handelRowContext} onClick={handelRowClick}  id='lead-123456'>
                        <td>
                            <div>
                                <input type="checkbox" />
                                <i class="ri-more-2-fill"></i>
                            </div>
                        </td>
                        <td>Tanish</td>
                        <td>Tanish</td>
                        <td>Tanish</td>
                        <td>Hi this is the test data from server, Hi this is the test data from server Hi this is the test data from server</td>
                        <td>Tanish</td>
                        <td>Tanish</td>
                        <td>Tanish</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}