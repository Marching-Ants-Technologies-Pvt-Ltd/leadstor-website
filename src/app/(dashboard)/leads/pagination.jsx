'use client';

import { fullScreenSwitch, toggleScrollbar, getPageNumbers } from "@/utility/TableControllers";
import { LeadsPerPage, TotalLeads, LeadsCurrentPage, LeadsLastPage, User } from "@/utility/TinyDB";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ColumnReorderPopup from "./ColumnReorderPopup";

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

export default function LeadsTablePagination({ columns, setColumns, columnOrder, setColumnOrder, fetchAndSetColumns, showPerPageDropdown, setShowPerPageDropdown, downloadNotification, toggleDownloadCard, onDownloadCancel }) {

    const [limit, setLimit] = useState(LeadsPerPage.value());
    const [paging, setPaging] = useState([]);
    const [summary, setSummary] = useState('Fetching leads...');
    const [showColumnReorderPopup, setShowColumnReorderPopup] = useState(false);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

    // Handler for reordering columns (for ColumnReorderPopup)
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

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1000;

    return (
        <div className="flex px-4 py-3 poppins text-gray-600 text-[14px] cursor-default pagination-responsive items-center justify-between">
            {/* Desktop: Show summary, per-page selector, settings on the left; pagination controls on the right */}
            {!isMobile && (
                <>
                    <div className="flex items-center gap-6">
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
                                        className="flex items-center select-none"
                                        tabIndex={0}
                                    >
                                        Enquiries per page
                                        <div className="relative ml-2">
                                            <span
                                                className='group border px-3 rounded-md py-0.5 cursor-pointer bg-white hover:bg-gray-50 transition-colors'
                                                onClick={() => setShowPerPageDropdown(open => !open)}
                                                tabIndex={0}
                                                style={{ display: 'inline-block' }}
                                            >
                                                {limit}
                                                {/* Tooltip on hover - only on number box */}
                                                <div
                                                    className="absolute left-1/2 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none"
                                                    style={{ transform: 'translateX(-60%)' }}
                                                >
                                                    <div className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                                        Change enquiry per page
                                                    </div>
                                                    <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                                </div>
                                            </span>
                                            {showPerPageDropdown && (
                                                <div
                                                    className="dropdown-menu bg-white w-16"
                                                    style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        bottom: '100%',
                                                        marginBottom: '8px',
                                                        zIndex: 100,
                                                    }}
                                                >
                                                    {[50, 100, 200, 500, 1000].map(val => (
                                                        <a
                                                            key={val}
                                                            className="dropdown-item text-sm hover:bg-gray-100"
                                                            onClick={e => {
                                                                handelLeadsPerPageChange(e);
                                                                setShowPerPageDropdown(false);
                                                            }}
                                                        >
                                                            {val}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {/* Settings icon restored */}
                                        {User?._id === -1 && (
                                            <label
                                                className="group ml-2 ri-settings-line text-lg relative top-0.5 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                                                tabIndex="0"
                                                onClick={e => { e.stopPropagation(); setShowColumnReorderPopup(true); }}
                                                title="Reorder or Rename Columns"
                                            >
                                                {/* Tooltip for settings icon - matches number box tooltip */}
                                                <div
                                                    className="absolute left-1/2 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none"
                                                    style={{ transform: 'translateX(-50%)' }}
                                                >
                                                    <div
                                                        className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg font-normal poppins"
                                                    >
                                                        Reorder or Rename Columns
                                                    </div>
                                                    <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                                </div>
                                            </label>
                                        )}
                                        <ColumnReorderPopup
                                            isOpen={showColumnReorderPopup}
                                            setIsOpen={setShowColumnReorderPopup}
                                            columns={columns}
                                            setColumns={setColumns}
                                            setColumnOrder={setColumnOrder}
                                            fetchAndSetColumns={fetchAndSetColumns}
                                            refreshTable={window.tableRefresh}
                                            onReorder={onReorder}
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Scrollbars and fullscreen buttons only on desktop */}
                            <div className="flex items-center text-gray-500 pt-1 justify-center cursor-pointer">
                                <span className="tooltip tooltip-top ml-6" data-tooltip="Hide Scrollbars">
                                    <button onClick={toggleScrollbar} className="ri-scroll-to-bottom-fill text-xl"></button>
                                </span>
                                <span className="tooltip tooltip-top" data-tooltip="View Fullscreen">
                                    <button onClick={fullScreenSwitch} className="ri-fullscreen-line text-lg ml-2"></button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='pagination ml-6 flex items-center gap-x-2' onClick={handelPageChange}>
                        {downloadNotification?.hasActiveDownload && (
                            <button
                                onClick={e => { 
                                    e.stopPropagation(); 
                                    onDownloadCancel?.();
                                }}
                                className="group bg-blue-600 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 flex items-center gap-2"
                                title="Cancel download"
                                style={{ marginRight: 8 }}
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center">
                                    {/* Download icon - hidden on hover */}
                                    <i className="ri-download-line text-lg group-hover:opacity-0 transition-opacity duration-200 z-10"></i>
                                    {/* Cancel icon - visible on hover */}
                                    <i className="ri-close-line text-lg absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"></i>
                                    {/* Progress ring - perfectly centered */}
                                    <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" width="36" height="36" viewBox="0 0 36 36">
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray={`${2 * Math.PI * 15}`}
                                            strokeDashoffset={`${2 * Math.PI * 15 * (1 - downloadNotification.progress / 100)}`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 18 18)"
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">{downloadNotification.progress}%</span>
                            </button>
                        )}
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
                </>
            )}
            {/* Mobile: Only per-page selector and pagination controls */}
            {isMobile && (
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-2">Enquiries per page</span>
                        <span
                            className='group border px-3 rounded-md py-0.5 cursor-pointer bg-white hover:bg-gray-50 transition-colors'
                            onClick={() => setShowPerPageDropdown(open => !open)}
                            tabIndex={0}
                            style={{ display: 'inline-block' }}
                        >
                            {limit}
                        </span>
                        {showPerPageDropdown && (
                            <div
                                className="dropdown-menu bg-white w-16"
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    bottom: '100%',
                                    marginBottom: '8px',
                                    zIndex: 100,
                                }}
                            >
                                {[50, 100, 200, 500, 1000].map(val => (
                                    <a
                                        key={val}
                                        className="dropdown-item text-sm hover:bg-gray-100"
                                        onClick={e => {
                                            handelLeadsPerPageChange(e);
                                            setShowPerPageDropdown(false);
                                        }}
                                    >
                                        {val}
                                    </a>
                                ))}
                            </div>
                        )}
                        {/* Settings icon always visible on mobile */}
                        {User?._id === -1 && (
                            <label
                                className="group ml-2 ri-settings-line text-lg relative top-0.5 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                                tabIndex="0"
                                onClick={e => { e.stopPropagation(); setShowColumnReorderPopup(true); }}
                                title="Reorder or Rename Columns"
                            >
                                {/* Tooltip for settings icon - matches number box tooltip */}
                                <div
                                    className="absolute left-1/2 bottom-full mb-2 hidden group-hover:block z-50 pointer-events-none"
                                    style={{ transform: 'translateX(-50%)' }}
                                >
                                    <div
                                        className="bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg font-normal poppins"
                                    >
                                        Reorder or Rename Columns
                                    </div>
                                    <div className="w-2 h-2 bg-black rotate-45 mx-auto -mt-1"></div>
                                </div>
                            </label>
                        )}
                        <ColumnReorderPopup
                            isOpen={showColumnReorderPopup}
                            setIsOpen={setShowColumnReorderPopup}
                            columns={columns}
                            setColumns={setColumns}
                            setColumnOrder={setColumnOrder}
                            fetchAndSetColumns={fetchAndSetColumns}
                            refreshTable={window.tableRefresh}
                            onReorder={onReorder}
                        />
                    </div>
                    <div className='pagination ml-4' onClick={handelPageChange}>
                        {downloadNotification?.hasActiveDownload && (
                            <button
                                onClick={e => { 
                                    e.stopPropagation(); 
                                    onDownloadCancel?.();
                                }}
                                className="group bg-blue-600 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 flex items-center gap-2"
                                title="Cancel download"
                                style={{ marginRight: 8 }}
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center">
                                    {/* Download icon - hidden on hover */}
                                    <i className="ri-download-line text-lg group-hover:opacity-0 transition-opacity duration-200 z-10"></i>
                                    {/* Cancel icon - visible on hover */}
                                    <i className="ri-close-line text-lg absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"></i>
                                    {/* Progress ring - perfectly centered */}
                                    <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" width="36" height="36" viewBox="0 0 36 36">
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.3)"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray={`${2 * Math.PI * 15}`}
                                            strokeDashoffset={`${2 * Math.PI * 15 * (1 - downloadNotification.progress / 100)}`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 18 18)"
                                            className="transition-all duration-300"
                                        />
                                    </svg>
                                </div>
                                {/* Show percentage only on desktop */}
                                {!isMobile && <span className="text-sm font-medium">{downloadNotification.progress}%</span>}
                            </button>
                        )}
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
                </div>
            )}
        </div>
    );
}