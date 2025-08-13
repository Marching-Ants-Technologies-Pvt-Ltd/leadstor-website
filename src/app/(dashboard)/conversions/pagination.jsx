'use client';
import { useState, useEffect } from 'react';

export default function ConversionPagination() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 1000);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex px-4 py-3 poppins text-gray-600 text-[14px] cursor-default items-center justify-between">
            {/* Desktop: show all controls */}
            {!isMobile && (
                <>
                    <div className='border-r pr-4 flex justify-center items-center'>
                        Viewing 1 to 50 of 10348
                    </div>
                    <div className='pl-4 flex justify-center items-center'>
                        <div className="dropdown-container justify-center">
                            <div className="dropdown">
                                <div>
                                    Enquiries limit per page <span className='border px-3 mx-1 rounded-md py-0.5'>50</span>
                                    <label className="ml-1 ri-settings-line text-base relative top-[1px] cursor-pointer" tabIndex="0"></label>
                                </div>
                                <div className="dropdown-menu dropdown-menu-top-left bg-white w-16 mb-2">
                                    <a className="dropdown-item text-sm">50</a>
                                    <a className="dropdown-item text-sm">100</a>
                                    <a className="dropdown-item text-sm">200</a>
                                    <a className="dropdown-item text-sm">500</a>
                                    <a className="dropdown-item text-sm">1000</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='grow'></div>
                    <div className='flex font-medium cursor-pointer'>
                        <div className='w-8 h-8 border flex justify-center items-center rounded-s-md'>
                            <i className="ri-arrow-left-s-line text-xl"></i>
                        </div>
                        <div className='w-10 h-8 bg-purple-500 border-purple-500 text-white border border-l-0 flex justify-center items-center'>1</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>2</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>3</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>4</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>5</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>...</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>253</div>
                        <div className='w-8 h-8 border border-l-0 flex justify-center items-center rounded-e-md'>
                            <i className="ri-arrow-right-s-line text-xl"></i>
                        </div>
                    </div>
                </>
            )}
            {/* Mobile: only per-page selector and pagination controls */}
            {isMobile && (
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-2">Enquiries per page</span>
                        <span className='group border px-3 rounded-md py-0.5 cursor-pointer bg-white hover:bg-gray-50 transition-colors mx-1'>50</span>
                    </div>
                    <div className='flex font-medium cursor-pointer ml-4'>
                        <div className='w-8 h-8 border flex justify-center items-center rounded-s-md'>
                            <i className="ri-arrow-left-s-line text-xl"></i>
                        </div>
                        <div className='w-10 h-8 bg-purple-500 border-purple-500 text-white border border-l-0 flex justify-center items-center'>1</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>2</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>3</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>4</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>5</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>...</div>
                        <div className='w-10 h-8 border border-l-0 flex justify-center items-center'>253</div>
                        <div className='w-8 h-8 border border-l-0 flex justify-center items-center rounded-e-md'>
                            <i className="ri-arrow-right-s-line text-xl"></i>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}