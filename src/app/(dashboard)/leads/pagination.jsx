'use client';

import { fullScreenSwitch, toggleScrollbar } from "@/utility/TableControllers";
import { LeadsPerPage, TotalLeads, LeadsCurrentPage } from "@/utility/TinyDB";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function handelPaging(data) {
    console.log('Updating paging...');
}

export default function LeadsTablePagination() {

    const [limit, setLimit] = useState(LeadsPerPage.value());
    // Handel leads/page change
    const handelLeadsPerPageChange = (e) => {
        if (e.target.tagName !== 'A') return;
        let newLimit = parseInt(e.target.innerText);

        if (!newLimit || typeof newLimit !== 'number') {
            toast.error(`Invalid limit value!`);
            return;
        }

        // Update Limit value
        setLimit(newLimit);
        LeadsPerPage.setValue(newLimit);
        window.tableRefresh();
    }

    const handelPageChange = (event) => {
        let page = event.target.getAttribute('data-value');
        let currentPage = LeadsCurrentPage.value();

        if (page === 'NEXT') {
            console.log('Handle next page call');
            return;
        }

        if (page === 'PREVIOUS') {
            if (currentPage > 1) {
                console.log('Handle previous page call');
            }

            return;
        }

        console.log(page, LeadsCurrentPage.value());
    }

    useEffect(() => {
        // Handel Paging
        window.onTableRefresh = handelPaging;
    }, []);

    return (
        <div className="flex px-4 py-3 poppins text-gray-600 text-[14px] cursor-default">
            <div className='border-r pr-4 flex justify-center items-center'>
                Viewing 1 to 50 of 10348
            </div>
            <div className='pl-4 flex justify-center items-center'>
                <div className="dropdown-container justify-center">
                    <div className="dropdown">
                        <div>
                            Enquiries per page <span className='border px-3 mx-1 rounded-md py-0.5'>{limit}</span>
                            <label className="ml-1 ri-settings-line text-lg relative top-0.5 cursor-pointer" tabIndex="0"></label>
                        </div>
                        <div onClick={handelLeadsPerPageChange} className="dropdown-menu dropdown-menu-top-left bg-white w-16 mb-2">
                            <a className="dropdown-item text-sm">50</a>
                            <a className="dropdown-item text-sm">100</a>
                            <a className="dropdown-item text-sm">200</a>
                            <a className="dropdown-item text-sm">500</a>
                            <a className="dropdown-item text-sm">1000</a>
                        </div>
                    </div>
                </div>
                <div className="flex items-center text-gray-500 pt-1 justify-center cursor-pointer">
                    <span className="tooltip tooltip-top ml-6" data-tooltip="Hide Scrollbars">
                        <button onClick={toggleScrollbar} className="ri-scroll-to-bottom-fill text-xl"></button>
                    </span>
                    <span className="tooltip tooltip-top" data-tooltip="View Fullscreen">
                        <button onClick={fullScreenSwitch} className="ri-fullscreen-line text-lg ml-2"></button>
                    </span>
                </div>
            </div>
            <div className='grow'></div>
            <div className='pagination' onClick={handelPageChange}>
                <div data-value='PREVIOUS' className='arrow-btn rounded-s-md'>
                    <i className="ri-arrow-left-s-line"></i>
                </div>

                <div data-value='1' className='page'>1</div>
                <div data-value='2' className='page active'>2</div>
                <div data-value='3' className='page'>3</div>
                <div data-value='4' className='page'>4</div>
                <div data-value='5' className='page'>5</div>
                <div data-value='6' className='page'>...</div>
                <div data-value='253' className='page'>253</div>

                <div data-value='NEXT' className='arrow-btn rounded-e-md'>
                    <i className="ri-arrow-right-s-line"></i>
                </div>
            </div>
        </div>
    )
}