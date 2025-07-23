'use client';

import SearchBox from '@/components/elements/SearchBox';
import React, { useState, useRef, useEffect } from 'react';

function getLastFourMonths() {

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();
    const months = [];

    for (let i = 0; i < 4; i++) {
        const monthIndex = (currentDate.getMonth() - i + 12) % 12;
        months.unshift(monthNames[monthIndex]);
    }

    return months;
}

export default function ConversionMenu() {
    const [burgerOpen, setBurgerOpen] = useState(false);
    const [showBurgerReport, setShowBurgerReport] = useState(false);
    const [showBurgerFilter, setShowBurgerFilter] = useState(false);
    const [showBurgerActions, setShowBurgerActions] = useState(false);
    const burgerRef = useRef();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1000;

    useEffect(() => {
        if (!burgerOpen) return;
        const handleClick = (e) => {
            if (burgerRef.current && !burgerRef.current.contains(e.target)) {
                setBurgerOpen(false);
                setShowBurgerReport(false);
                setShowBurgerFilter(false);
                setShowBurgerActions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [burgerOpen]);

    return (
        <>
        <div className="flex p-2 items-center">
            <div className="grow">
                <SearchBox />
            </div>
            {/* Desktop button group */}
            <div className="grow flex justify-end align-middle poppins gap-1 text-gray-600 menu-btn-group responsive-hide-1000">
                <div className='flex py-1 border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                    <i className="ri-user-add-line text-xl"></i>
                    <div className='mr-1'>Conversion</div>
                </div>
                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                    <i className="ri-file-excel-2-fill text-xl"></i>
                    <div className='mr-1'>Report</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <div className='text-sm mb-1 font-medium py-1'>Collections</div>
                        {getLastFourMonths().map((item, i) => (
                            <a key={`collection-${i}`} className="dropdown-item pl-4 text-sm">{item}</a>
                        ))}
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Custom</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <div className='text-sm mb-1 font-medium py-1'>Joinees</div>
                        {getLastFourMonths().map((item, j) => (
                            <a key={`joinees-${j}`} className="dropdown-item pl-4 text-sm">{item}</a>
                        ))}
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Custom</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <div className='text-sm mb-1 font-medium py-1'>Pending Payments</div>
                        <a className="dropdown-item pl-4 text-sm">Balance</a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 pl-4">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Custom</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item text-sm">Full Report</a>
                    </div>
                </div>
                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-5'>
                    <i className="ri-filter-2-line text-xl"></i>
                    <div className='mr-1'>Filter</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-52">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-square-fill text-green-600 text-lg mt-1"></i>
                            <span className='text-sm'>Active</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-square-fill text-yellow-400 text-lg mt-1"></i>
                            <span className='text-sm'>Paused</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-square-fill text-rose-600  text-lg mt-1"></i>
                            <span className='text-sm'>Defaulter</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-bank-card-line text-lg mt-1"></i>
                            <span className='text-sm'>Pending Payment</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-equalizer-3-line text-lg mt-1"></i>
                            <span className='text-sm'>Advance</span>
                        </a>
                    </div>
                </div>
                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-0'>
                    <i className="ri-shapes-line text-xl"></i>
                    <div className='mr-1'>Actions</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-chat-1-line text-lg mt-1"></i>
                            <span className='text-sm'>Send SMS</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-mail-ai-line text-lg mt-1"></i>
                            <span className='text-sm'>Send Email</span>
                        </a>
                    </div>
                </div>
                <div className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10 ml-5'>
                    <i className="ri-refresh-line text-xl"></i>
                </div>
            </div>
            {/* Burger menu for tablet/mobile */}
            <div className="relative burger-menu-1000 ml-2" ref={burgerRef} style={{ display: isMobile ? 'block' : 'none' }}>
                <button
                    className="flex items-center justify-center w-10 h-10 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 focus:outline-none"
                    onClick={() => setBurgerOpen((open) => !open)}
                    aria-label="Open menu"
                >
                    <i className="ri-menu-3-line text-2xl"></i>
                </button>
                {burgerOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-0.5 poppins">
                        {showBurgerReport ? (
                            <>
                                <div className='flex items-center mb-2 cursor-pointer text-gray-500 hover:text-blue-600' onClick={() => setShowBurgerReport(false)}>
                                    <i className="ri-arrow-left-s-line text-lg mr-2"></i>
                                    <span className='text-base font-medium'>Back</span>
                                </div>
                                {/* Example submenu for Report */}
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-calendar-event-line text-lg"></i>
                                    <span className='text-sm'>Collections</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-calendar-event-line text-lg"></i>
                                    <span className='text-sm'>Joinees</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-equalizer-3-line text-lg"></i>
                                    <span className='text-sm'>Custom</span>
                                </button>
                            </>
                        ) : showBurgerFilter ? (
                            <>
                                <div className='flex items-center mb-2 cursor-pointer text-gray-500 hover:text-blue-600' onClick={() => setShowBurgerFilter(false)}>
                                    <i className="ri-arrow-left-s-line text-lg mr-2"></i>
                                    <span className='text-base font-medium'>Back</span>
                                </div>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-square-fill text-green-600 text-lg"></i>
                                    <span className='text-sm'>Active</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-square-fill text-yellow-400 text-lg"></i>
                                    <span className='text-sm'>Paused</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-square-fill text-rose-600 text-lg"></i>
                                    <span className='text-sm'>Defaulter</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-bank-card-line text-lg"></i>
                                    <span className='text-sm'>Pending Payment</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-equalizer-3-line text-lg"></i>
                                    <span className='text-sm'>Advance</span>
                                </button>
                            </>
                        ) : showBurgerActions ? (
                            <>
                                <div className='flex items-center mb-2 cursor-pointer text-gray-500 hover:text-blue-600' onClick={() => setShowBurgerActions(false)}>
                                    <i className="ri-arrow-left-s-line text-lg mr-2"></i>
                                    <span className='text-base font-medium'>Back</span>
                                </div>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-chat-1-line text-lg"></i>
                                    <span className='text-sm'>Send SMS</span>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-mail-ai-line text-lg"></i>
                                    <span className='text-sm'>Send Email</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 bg-white hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => setShowBurgerReport(true)} tabIndex={0} role="menuitem">
                                    <i className="ri-file-excel-2-fill text-xl"></i>
                                    <span className='text-base font-medium'>Report</span>
                                    <i className="ri-arrow-right-s-line text-xs ml-auto transition-transform"></i>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 bg-white hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => setShowBurgerFilter(true)} tabIndex={0} role="menuitem">
                                    <i className="ri-filter-2-line text-xl"></i>
                                    <span className='text-base font-medium'>Filter</span>
                                    <i className="ri-arrow-right-s-line text-xs ml-auto transition-transform"></i>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 bg-white hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => setShowBurgerActions(true)} tabIndex={0} role="menuitem">
                                    <i className="ri-shapes-line text-xl"></i>
                                    <span className='text-base font-medium'>Actions</span>
                                    <i className="ri-arrow-right-s-line text-xs ml-auto transition-transform"></i>
                                </button>
                                <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 bg-white hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                    <i className="ri-refresh-line text-xl"></i>
                                    <span className='text-base font-medium'>Refresh</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
        <style jsx global>{`
          @media (max-width: 1000px) {
            .responsive-hide-1000 {
              display: none !important;
            }
            .burger-menu-1000 {
              display: block !important;
            }
          }
          @media (min-width: 1001px) {
            .burger-menu-1000 {
              display: none !important;
            }
          }
        `}</style>
        </>
    );
}