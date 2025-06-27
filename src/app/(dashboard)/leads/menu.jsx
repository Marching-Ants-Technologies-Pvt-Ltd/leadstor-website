import SearchBox from '@/components/elements/SearchBox';
import Image from 'next/image';
import { useState } from 'react';
import ManualCandidate from './ManualCandidate';
import ImportEnquiryDropBox from './ImportEnquiryDropBox';
import { showAppliedFilter } from './appliedFilters';

export default function LeadsMenu() {
    const [showManualCandidate, setShowManualCandidate] = useState(false);
    const [showImportDropBox, setShowImportDropBox] = useState(false);

    const closeImportBox = () => {
        setShowImportDropBox(false);
        if(typeof window.tableRefresh === 'function') window.tableRefresh();
    }

    return (
        <div className="flex p-1.5">
            <div id='onTableSiteLogo' style={{ display: 'none' }}>
                <Image
                    className='mt-0.5 mr-1.5'
                    placeholder='empty'
                    src="/icons/leadstor.png"
                    width={32}
                    height={32}
                    alt="Leadstor Icon"
                    priority={false}
                />
            </div>
            <div className="grow">
                <SearchBox />
            </div>
            <div className="grow flex justify-end align-middle poppins gap-1 text-gray-600">

                <div className='flex py-0.5 dropdown dropdown-hover border rounded-md gap-1.5 px-1.5 justify-center items-center cursor-pointer'>
                    <i className="ri-user-add-line text-lg"></i>
                    <div className='mr-0.5'>Lead</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-9 w-44">
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5 cursor-pointer" onClick={() => setShowManualCandidate(true)}>
                            <i className="ri-text-block text-base mt-1"></i>
                            <span className='text-sm'>Add Manually</span>
                        </a>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5 cursor-pointer" onClick={() => setShowImportDropBox(true)}>
                            <i className="ri-upload-cloud-2-line text-base mt-1"></i>
                            <span className='text-sm'>Import enquiries</span>
                        </a>
                    </div>
                </div>

                <div className='flex py-0.5 dropdown dropdown-hover border rounded-md gap-1.5 px-1.5 justify-center items-center cursor-pointer'>
                    <i className="ri-file-excel-2-fill text-lg"></i>
                    <div className='mr-0.5'>Report</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-9 w-44">
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-calendar-event-line text-base mt-1"></i>
                            <span className='text-sm'>Daily report</span>
                        </a>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-download-cloud-2-line text-base mt-1"></i>
                            <span className='text-sm'>Export enquiries</span>
                        </a>
                    </div>
                </div>

                <div className='flex py-0.5 dropdown dropdown-hover border rounded-md gap-1.5 px-1.5 justify-center items-center cursor-pointer ml-4'>
                    <i className="ri-filter-2-line text-lg"></i>
                    <div className='mr-0.5'>Filter</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-9 w-44">
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-user-follow-line text-base mt-1"></i>
                            <span className='text-sm'>Followups</span>
                        </a>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-bookmark-line text-base mt-1"></i>
                            <span className='text-sm'>Bookmarks</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-equalizer-3-line text-base mt-1"></i>
                            <span className='text-sm'>Advance</span>
                        </a>
                    </div>
                </div>

                <div className='flex py-0.5 dropdown dropdown-hover border rounded-md gap-1.5 px-1.5 justify-center items-center cursor-pointer ml-0'>
                    <i className="ri-shapes-line text-lg"></i>
                    <div className='mr-0.5'>Actions</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-9 w-44">
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-chat-1-line text-base mt-1"></i>
                            <span className='text-sm'>Send SMS</span>
                        </a>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-mail-ai-line text-base mt-1"></i>
                            <span className='text-sm'>Send Email</span>
                        </a>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5">
                            <i className="ri-user-voice-line text-base"></i>
                            <span className='text-sm'>Invite Again</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item flex-row gap-1.5 justify-start items-center py-0.5 hover:bg-rose-100 text-rose-500">
                            <i className="ri-delete-bin-7-line text-base"></i>
                            <span className='text-sm'>Delete Invite</span>
                        </a>
                    </div>
                </div>

                <button className='flex border rounded-md gap-1.5 px-1.5 justify-center items-center cursor-pointer w-9 ml-4'>
                    <i className="ri-pie-chart-line text-lg"></i>
                </button>
                <button
                    onClick={() => window.tableRefresh()}
                    className='flex border rounded-md gap-1.5 px-1.5 justify-center items-center cursor-pointer w-9'
                >
                    <i className="ri-refresh-line text-lg"></i>
                </button>
            </div>
            {showManualCandidate && (
                <div className="fixed inset-0 z-50 flex py-2 items-center justify-center bg-black bg-opacity-30">
                    <ManualCandidate onCancel={() => setShowManualCandidate(false)} />
                </div>
            )}
            {showImportDropBox && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <ImportEnquiryDropBox onCancel={closeImportBox} />
                </div>
            )}
        </div>
    );
}