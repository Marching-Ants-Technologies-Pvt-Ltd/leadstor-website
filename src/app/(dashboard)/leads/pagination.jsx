'use client';

import { fullScreenSwitch, toggleScrollbar, getPageNumbers } from "@/utility/TableControllers";
import { LeadsPerPage, TotalLeads, LeadsCurrentPage, LeadsLastPage } from "@/utility/TinyDB";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RenameColumnModal from "./RenameColumnModal";
import ReorderColumnModal from "./ReorderColumnModal";

let setPagingX;
let setSummaryX;

async function handelPaging() {
    let currentPage = LeadsCurrentPage.value();
    let maxLeads = TotalLeads.value();
    let limit = LeadsPerPage.value();

    const totalPages = Math.ceil(maxLeads / limit);
    const pages = await getPageNumbers(currentPage, totalPages);

    // Update paging section
    setPagingX(pages);
    LeadsLastPage.setValue(totalPages);

    // Compose summary
    let offset = (currentPage - 1) * limit;
    if (offset < 1) offset = 1;

    let leads = offset + limit - 1;
    if (leads > maxLeads) leads = maxLeads;

    if(maxLeads < 1){
        setSummaryX(`No leads found!`);
        return;
    }

    setSummaryX(`Viewing ${offset} to ${leads} of ${maxLeads}`);
}

export default function LeadsTablePagination({ columns, setColumns, columnOrder, setColumnOrder, fetchAndSetColumns }) {

    const [limit, setLimit] = useState(LeadsPerPage.value());
    const [paging, setPaging] = useState([]);
    const [summary, setSummary] = useState('Fetching leads...');
    const [showRename, setShowRename] = useState(false);
    const [showReorder, setShowReorder] = useState(false);
    const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

    // Handler for renaming a column
    const onRename = (dataField, newName) => {
        setColumns(prev => prev.map(col => col.dataField === dataField ? { ...col, fieldName: newName } : col));
        if (typeof fetchAndSetColumns === 'function') {
            fetchAndSetColumns();
        }
    };

    // Handler for reordering columns
    const onReorder = (newOrder) => {
        setColumnOrder(newOrder);
        if (typeof fetchAndSetColumns === 'function') {
            fetchAndSetColumns();
        }
    };

    setPagingX = setPaging;
    setSummaryX = setSummary;

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
        LeadsCurrentPage.value(1);
        LeadsPerPage.setValue(newLimit);
        setSummary('Fetching leads...');
        window.tableRefresh();
    }

    const handelPageChange = (event) => {
        // Ignore if active page clicked
        if (event.target.classList.value.includes('active')) return;

        // Get page number
        let page = event.target.getAttribute('data-value');
        let newPage = LeadsCurrentPage.value();

        if (page === 'NEXT') {
            if (newPage < LeadsLastPage.value()) newPage++;
        } else if (page === 'PREVIOUS') {
            if (newPage > 1) newPage--;
        } else {
            newPage = parseInt(page);
        }

        // Check change
        if (newPage == LeadsCurrentPage.value()) {
            console.log('No page change');
            return;
        }

        // Load page
        LeadsCurrentPage.setValue(newPage);
        setSummary('Fetching leads...');
        window.tableRefresh();
    }

    useEffect(() => {
        // Handel Paging
        window.onTableRefresh = handelPaging;
        window.tableState = setSummaryX;
    }, []);

    return (
        <div className="flex px-4 py-3 poppins text-gray-600 text-[14px] cursor-default">
            <div className='border-r pr-4 flex justify-center items-center'>
                <div
                    style={{
                        display: (!summary.startsWith('View')) ? 'block' : 'none'
                    }}
                    className="spinner-simple w-5 h-5 mr-2 border-[2px]">
                </div>
                {summary}
            </div>
            <div className='pl-4 flex justify-center items-center'>
                <div className="dropdown-container justify-center">
                    <div className="dropdown">
                        <div
                            className="flex items-center cursor-pointer select-none"
                            onClick={() => setShowPerPageDropdown(v => !v)}
                            tabIndex={0}
                        >
                            Enquiries per page <span className='border px-3 mx-1 rounded-md py-0.5'>{limit}</span>
                            <label
                                className="ml-1 ri-settings-line text-lg relative top-0.5 cursor-pointer"
                                tabIndex="0"
                                onClick={e => { e.stopPropagation(); setShowSettingsDropdown(v => !v); }}
                            ></label>
                        </div>
                        {showPerPageDropdown && (
                            <div onClick={handelLeadsPerPageChange} className="dropdown-menu dropdown-menu-top-left bg-white w-16 mb-2">
                                <a className="dropdown-item text-sm">50</a>
                                <a className="dropdown-item text-sm">100</a>
                                <a className="dropdown-item text-sm">200</a>
                                <a className="dropdown-item text-sm">500</a>
                                <a className="dropdown-item text-sm">1000</a>
                            </div>
                        )}
                        {showSettingsDropdown && (
                            <div className="dropdown-menu  dropdown-menu-right-top right-0 bg-white w-48 rounded border border-gray-200 shadow-sm p-0"
                                 style={{ position: 'absolute', bottom: '100%', right: 0, zIndex: 100 }}>
                                <button 
                                    className="dropdown-item text-xs flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer w-full" 
                                    tabIndex={-1} 
                                    onClick={() => { setShowRename(true); setShowSettingsDropdown(false); }}
                                >
                                    <i className="ri-edit-2-line text-base flex-shrink-0" style={{marginRight: '1px'}}></i>
                                    <span>Rename</span>
                                </button>
                                <button 
                                    className="dropdown-item text-xs flex items-center py-2 px-2 hover:bg-gray-50 rounded cursor-pointer w-full" 
                                    tabIndex={-1} 
                                    onClick={() => { setShowReorder(true); setShowSettingsDropdown(false); }}
                                >
                                    <i className="ri-drag-move-2-line text-base flex-shrink-0" style={{marginRight: '1px'}}></i>
                                    <span>Reorder</span>
                                </button>
                            </div>
                        )}
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
                {paging.map((item, index) => (
                    <div key={index} data-value={item.pageNum} className={item.style}>{item.name}</div>
                ))}
                <div data-value='NEXT' className='arrow-btn rounded-e-md'>
                    <i className="ri-arrow-right-s-line"></i>
                </div>
            </div>
            <RenameColumnModal
                isOpen={showRename}
                onClose={() => setShowRename(false)}
                onRename={onRename}
                columns={columns}
            />
            <ReorderColumnModal
                isOpen={showReorder}
                onClose={() => setShowReorder(false)}
                onReorder={onReorder}
                columns={columns}
                columnOrder={columnOrder}
            />
        </div>
    );
}