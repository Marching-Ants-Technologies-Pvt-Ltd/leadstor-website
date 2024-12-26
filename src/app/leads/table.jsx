'use client';
import './table-style.css';

export default function LeadsTable({ search = '' }) {

    const handelRowClick = (event) => {
        if(event.target.tagName !== 'I') return;
        console.log(`handel row menu click`, event); //ToDo reposition content menu and show
    }

    const handelRowContext = (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log(`handel row Context`, event); //ToDo reposition content menu and show
    }

    return (
        <div className='grow border-t border-b bg-gray-50 overflow-auto'>
            <div className='absolute w-28 min-h-20 bg-white shadow-lg rounded-md z-30 top-[215px] left-[489px] p-3'>
                I am content menu!
            </div>
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
                    <tr onContextMenu={handelRowContext} onClick={handelRowClick}>
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