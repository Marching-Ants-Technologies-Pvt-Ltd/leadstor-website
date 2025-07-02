'use client';

import { LeadFilters, LeadsCurrentPage } from '@/utility/TinyDB';
import SearchBox from '@/components/elements/SearchBox';
import Image from 'next/image';
import ImportEnquiryDropBox from './ImportEnquiry.jsx';
import ManualCandidate from './manualCandidate.jsx';
import React from 'react';

export default function LeadsMenu() {

    const [showImport, setShowImport] = React.useState(false);
    const [showManual, setShowManual] = React.useState(false);

    const handelFollowUpFilters = () => {
        let today = new Date().toString().split(' ');
        if(today.length < 9) return; // Something went wrong

        today = `${today[2]}-${today[1]}-${today[3]}`;
        LeadFilters.reset();
        LeadFilters.setValue([{
            title: 'FollowUps',
            value: today,
            query: 'followupDate'
        }]);

        LeadsCurrentPage.setValue(1);
        window.tableState('Applying Filer...');
        window.tableRefresh();
    }

    const handelBookmarks = () => {
        LeadFilters.reset();
        LeadFilters.setValue([{
            title: 'Bookmarks',
            value: 1,
            query: 'bookmarkLeads'
        }]);

        LeadsCurrentPage.setValue(1);
        window.tableState('Applying Filer...');
        window.tableRefresh();

    }

    return (
        <>
        <div className="flex p-2">
            <div id='onTableSiteLogo' style={{ display: 'none' }}>
                <Image
                    className='mt-0.5 mr-2'
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

                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                    <i className="ri-user-add-line text-xl"></i>
                    <div className='mr-1'>Lead</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowManual(true)}>
                            <i className="ri-text-block text-lg mt-1"></i>
                            <span className='text-sm'>Add Manually</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowImport(true)}>
                            <i className="ri-upload-cloud-2-line text-lg mt-1"></i>
                            <span className='text-sm'>Import enquiries</span>
                        </a>
                    </div>
                </div>

                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                    <i className="ri-file-excel-2-fill text-xl"></i>
                    <div className='mr-1'>Report</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-calendar-event-line text-lg mt-1"></i>
                            <span className='text-sm'>Daily report</span>
                        </a>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-download-cloud-2-line text-lg mt-1"></i>
                            <span className='text-sm'>Export enquiries</span>
                        </a>
                    </div>
                </div>

                <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-5'>
                    <i className="ri-filter-2-line text-xl"></i>
                    <div className='mr-1'>Filter</div>
                    <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                        <a onClick={handelFollowUpFilters} className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-user-follow-line text-lg mt-1"></i>
                            <span className='text-sm'>Followups</span>
                        </a>
                        <a onClick={handelBookmarks} className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-bookmark-line text-lg mt-1"></i>
                            <span className='text-sm'>Bookmarks</span>
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
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                            <i className="ri-user-voice-line text-lg"></i>
                            <span className='text-sm'>Invite Again</span>
                        </a>
                        <div className="dropdown-divider my-1" role="separator"></div>
                        <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 hover:bg-rose-100 text-rose-500">
                            <i className="ri-delete-bin-7-line text-lg"></i>
                            <span className='text-sm'>Delete Invite</span>
                        </a>
                    </div>
                </div>

                <button className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10 ml-5'>
                    <i className="ri-pie-chart-line text-xl"></i>
                </button>
                <button
                    onClick={() => window.tableRefresh()}
                    className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10'
                >
                    <i className="ri-refresh-line text-xl"></i>
                </button>
            </div>
        </div>
        {showImport && (
            <ImportEnquiryDropBox onCancel={() => setShowImport(false)} />
        )}
        {showManual && (
            <ManualCandidate onCancel={() => setShowManual(false)} />
        )}
        </>
    );
}