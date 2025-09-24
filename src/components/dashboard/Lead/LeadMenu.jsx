'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { LeadFilters, LeadsCurrentPage, User, Corporate, TotalLeads } from '@/utility/TinyDB';
import SearchBox from '@/components/elements/SearchBox';
import ImportEnquiryDropBox from '@/components/dashboard/Lead/ImportEnquiry.jsx';
import ManualCandidate from '@/components/dashboard/Lead/ManualCandidate.jsx';
import ColumnReorderPopup from '@/components/dashboard/Lead/ColumnReorderPopup.jsx';
//import SendSmsModal from './SendSmsModal.jsx';
import SendEmailModal from '@/components/dashboard/Lead/SendEmailModal.jsx';
import BulkUpdateDrawer from '@/components/dashboard/Lead/BulkUpdateDrawer';
import DailyReportModal from '@/components/dashboard/Lead/DailyReportModal.jsx';
import ExportEnquiriesModal from '@/components/dashboard/Lead/ExportEnquiriesModal.jsx';
import LeadsTable from '@/components/dashboard/Lead/LeadTable.jsx';

export default function LeadsMenu({ onOpenAdvanceFilter, leads = [], selectedLeadIds = [], setSelectedLeadIds, onDownloadStart, onDownloadProgress, onDownloadEnd, onDownloadCancel, setCancelExportFunction}) {

    const [showImport, setShowImport] = React.useState(false);
    const [showManual, setShowManual] = React.useState(false);
    const [showColumnReorderPopup, setShowColumnReorderPopup] = React.useState(false);
    const [showPerPageDropdown, setShowPerPageDropdown] = React.useState(false);
    const [showSendSms, setShowSendSms] = React.useState(false);
    const [showSendEmail, setShowSendEmail] = React.useState(false);
    const [burgerOpen, setBurgerOpen] = React.useState(false);
    const burgerRef = useRef();
    const [showBurgerActions, setShowBurgerActions] = React.useState(false);
    const [showBurgerLead, setShowBurgerLead] = React.useState(false);
    const [showBurgerReport, setShowBurgerReport] = React.useState(false);
    const [showBurgerFilter, setShowBurgerFilter] = React.useState(false);
    const [showBulkUpdateDrawer, setShowBulkUpdateDrawer] = React.useState(false);
    const [showExportModal, setShowExportModal] = React.useState(false);
    const [sourceOptions, setSourceOptions] = React.useState([]);
    const [ownerOptions, setOwnerOptions] = React.useState([]);
    const [courseOptions, setCourseOptions] = React.useState([]);
    const [statusOptions, setStatusOptions] = React.useState([]);
    const [dailyReport, setDailyReport] = React.useState(false);
    const router = useRouter();

    // Fetch source options from backend (like manualCandidate.jsx)
    React.useEffect(() => {
        const corporateId = Corporate?._id;
        if (corporateId) {
            (async () => {
                try {
                    const response = await (await import('@/utility/xFetch')).xFetch({
                        method: 'GET',
                        path: `/services/profile/getSources?corporateId=${corporateId}`
                    });
                    if (Array.isArray(response)) {
                        setSourceOptions(response.map(src => src.source));
                    } else {
                        setSourceOptions([]);
                    }
                } catch (error) {
                    setSourceOptions([]);
                }
            })();
        }
    }, [Corporate?._id]);

    // Fetch owner options
    React.useEffect(() => {
        const corporateId = Corporate?._id;
        if (corporateId) {
            (async () => {
                try {
                    const response = await (await import('@/utility/xFetch')).xFetch({
                        method: 'GET',
                        path: `/services/profile/getUsers?corporateId=${corporateId}`
                    });
                    if (Array.isArray(response)) {
                        setOwnerOptions(response.map(owner => ({ label: owner.name, value: owner.id })));
                    } else if (typeof response === 'object') {
                        setOwnerOptions(Object.entries(response).map(([id, name]) => ({ label: name, value: id })));
                    } else {
                        setOwnerOptions([]);
                    }
                } catch (error) {
                    setOwnerOptions([]);
                }
            })();
        }
    }, [Corporate?._id]);
    // Fetch course options
    React.useEffect(() => {
        const corporateId = Corporate?._id;
        if (corporateId) {
            (async () => {
                try {
                    const response = await (await import('@/utility/xFetch')).xFetch({
                        method: 'GET',
                        path: `/services/profile/getCourseAndFee?corporateId=${corporateId}`
                    });
                    if (Array.isArray(response)) {
                        setCourseOptions(response.map(course => ({ label: course.course, value: course.course })));
                    } else {
                        setCourseOptions([]);
                    }
                } catch (error) {
                    setCourseOptions([]);
                }
            })();
        }
    }, [Corporate?._id]);
    // Fetch status options
    React.useEffect(() => {
        const corporateId = Corporate?._id;
        if (corporateId) {
            (async () => {
                try {
                    const response = await (await import('@/utility/xFetch')).xFetch({
                        method: 'GET',
                        path: `/services/profile/getStatuses?corporateId=${corporateId}`
                    });
                    if (Array.isArray(response)) {
                        setStatusOptions(response.map(status => ({ label: status.status || status, value: status.status || status })));
                    } else {
                        setStatusOptions([]);
                    }
                } catch (error) {
                    setStatusOptions([]);
                }
            })();
        }
    }, [Corporate?._id]);

    // Add ref for actions dropdown and esc/click-away close
    const actionsBtnRef = useRef();
    const actionsDropdownRef = useRef();
    useEffect(() => {
        if (!showBurgerActions) return;
        function handleClick(e) {
            if (
                actionsDropdownRef.current &&
                !actionsDropdownRef.current.contains(e.target) &&
                actionsBtnRef.current &&
                !actionsBtnRef.current.contains(e.target)
            ) {
                setShowBurgerActions(false);
            }
        }
        function handleEsc(e) {
            if (e.key === 'Escape') setShowBurgerActions(false);
        }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [showBurgerActions]);

    useEffect(() => {
        if (!burgerOpen) return;
        const handleClick = (e) => {
            if (burgerRef.current && !burgerRef.current.contains(e.target)) {
                setBurgerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [burgerOpen]);

    // Get selected emails from leads
    const selectedLeadEmails = leads
        .filter(lead => selectedLeadIds.includes(lead.invitationId))
        .map(lead => lead.emailId)
        .filter(Boolean);

    // Get selected mobiles from leads
    const selectedLeadMobiles = leads
        .filter(lead => selectedLeadIds.includes(lead.invitationId))
        .map(lead => lead.mobile)
        .filter(Boolean);

    const handelFollowUpFilters = () => {
        let today = new Date().toString().split(' ');
        if (today.length < 9) return; // Something went wrong

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

    const openImport = () => {
        setShowImport(true);
        setShowManual(false);
        setShowColumnReorderPopup(false);
        setShowPerPageDropdown(false);
    };
    const openManual = () => {
        setShowManual(true);
        setShowImport(false);
        setShowColumnReorderPopup(false);
        setShowPerPageDropdown(false);
    };
    const openReorder = () => {
        setShowColumnReorderPopup(true);
        setShowImport(false);
        setShowManual(false);
        setShowPerPageDropdown(false);
    };

    // Add a helper to get current values for a lead by invitationId
    function getLeadById(invitationId) {
        return leads.find(lead => String(lead.invitationId) === String(invitationId)) || {};
    }
    
    // Utility to ensure current value is in options
    const ensureOption = (options, value) => {
        if (!value) return options;
        if (options.includes(value)) return options;
        return [value, ...options];
    };

    return (
        <>
            <div className="flex px-2 pb-2 items-center">
                <div id='onTableSiteLogo' className='hidden' >
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
                {/* Desktop button group */}
                <div className="grow flex justify-end align-middle poppins gap-1 text-gray-600 menu-btn-group responsive-hide-1000">

                    <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                        <i className="ri-user-add-line text-xl"></i>
                        <div className='mr-1'>Lead</div>
                        <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={openManual}>
                                <i className="ri-text-block text-lg mt-1"></i>
                                <span className='text-sm'>Add Manually</span>
                            </a>
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={openImport}>
                                <i className="ri-upload-cloud-2-line text-lg mt-1"></i>
                                <span className='text-sm'>Import enquiries</span>
                            </a>
                        </div>
                    </div>

                    <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer'>
                        <i className="ri-file-excel-2-fill text-xl"></i>
                        <div className='mr-1'>Report</div>
                        <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5"
                                onClick={() => setDailyReport(true) } >
                                <i className="ri-calendar-event-line text-lg mt-1"></i>
                                <span className='text-sm'>Daily report</span>
                            </a>
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowExportModal(true)}>
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
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={onOpenAdvanceFilter}>
                                <i className="ri-equalizer-3-line text-lg mt-1"></i>
                                <span className='text-sm'>Advance</span>
                            </a>
                        </div>
                    </div>

                    <div className='flex py-1 dropdown dropdown-hover border rounded-md gap-2 px-2 justify-center items-center cursor-pointer ml-0'>
                        <i className="ri-shapes-line text-xl"></i>
                        <div className='mr-1'>Actions</div>
                        <div className="dropdown-menu dropdown-menu-bottom-center bg-white top-10 w-44">
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowSendSms(true)}>
                                <i className="ri-chat-1-line text-lg mt-1"></i>
                                <span className='text-sm'>Send SMS</span>
                            </a>
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5" onClick={() => setShowSendEmail(true)}>
                                <i className="ri-mail-ai-line text-lg mt-1"></i>
                                <span className='text-sm'>Send Email</span>
                            </a>
                            <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5">
                                <i className="ri-user-voice-line text-lg"></i>
                                <span className='text-sm'>Invite Again</span>
                            </a>
                            {/* Bulk Update with submenu */}
                            <div className="dropdown dropdown-hover relative group">
                                <a className="dropdown-item flex-row gap-2 justify-start items-center py-0.5 group" onClick={() => {
                                    if (selectedLeadIds.length === 0) {
                                        toast.error('Please select at least one record to bulk update.');
                                    } else {
                                        setShowBulkUpdateDrawer(true);
                                    }
                                }}>
                                    <i className="ri-database-2-line text-lg"></i>
                                    <span className='text-sm'>Bulk Update</span>
                                    <i className="ri-arrow-right-s-line text-xs ml-auto"></i>
                                </a>
                            </div>
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

                    <button className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10' onClick={() => router.push('/leads/settings')} >
                        <i className="ri-settings-line text-xl"></i>
                    </button>
                    
                    <button
                        onClick={() => window.tableRefresh()}
                        className='flex border rounded-md gap-2 px-2 justify-center items-center cursor-pointer w-10'
                    >
                        <i className="ri-refresh-line text-xl"></i>
                    </button>
                </div>
                {/* Burger menu for tablet/mobile */}
                <div className="relative burger-menu-1000 ml-2" ref={burgerRef}>
                    <button
                        className="flex items-center justify-center w-10 h-10 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 focus:outline-none"
                        onClick={() => setBurgerOpen((open) => !open)}
                        aria-label="Open menu"
                    >
                        <i className="ri-menu-3-line text-2xl"></i>
                    </button>
                    {burgerOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-xl shadow-xl z-50 p-2 flex flex-col gap-0.5 poppins">
                            {showBurgerLead ? (
                                <>
                                    <div className='flex items-center mb-2 cursor-pointer text-gray-500 hover:text-blue-600' onClick={() => setShowBurgerLead(false)}>
                                        <i className="ri-arrow-left-s-line text-lg mr-2"></i>
                                        <span className='text-base font-medium'>Back</span>
                                    </div>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={openManual} tabIndex={0} role="menuitem">
                                        <i className="ri-text-block text-lg"></i>
                                        <span className='text-sm'>Add Manually</span>
                                    </button>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={openImport} tabIndex={0} role="menuitem">
                                        <i className="ri-upload-cloud-2-line text-lg"></i>
                                        <span className='text-sm'>Import enquiries</span>
                                    </button>
                                </>
                            ) : showBurgerReport ? (
                                <>
                                    <div className='flex items-center mb-2 cursor-pointer text-gray-500 hover:text-blue-600' onClick={() => setShowBurgerReport(false)}>
                                        <i className="ri-arrow-left-s-line text-lg mr-2"></i>
                                        <span className='text-base font-medium'>Back</span>
                                    </div>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                        <i className="ri-calendar-event-line text-lg"></i>
                                        <span className='text-sm'>Daily report</span>
                                    </button>
                                    <button onClick={() => setShowExportModal(true)} className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                        <i className="ri-download-cloud-2-line text-lg"></i>
                                        <span className='text-sm'>Export enquiries</span>
                                    </button>
                                </>
                            ) : showBurgerFilter ? (
                                <>
                                    <div className='flex items-center mb-2 cursor-pointer text-gray-500 hover:text-blue-600' onClick={() => setShowBurgerFilter(false)}>
                                        <i className="ri-arrow-left-s-line text-lg mr-2"></i>
                                        <span className='text-base font-medium'>Back</span>
                                    </div>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={handelFollowUpFilters} tabIndex={0} role="menuitem">
                                        <i className="ri-user-follow-line text-lg"></i>
                                        <span className='text-sm'>Followups</span>
                                    </button>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={handelBookmarks} tabIndex={0} role="menuitem">
                                        <i className="ri-bookmark-line text-lg"></i>
                                        <span className='text-sm'>Bookmarks</span>
                                    </button>
                                    <div className="dropdown-divider my-1" role="separator"></div>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={onOpenAdvanceFilter} tabIndex={0} role="menuitem">
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
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => { setShowSendSms(true); setShowBurgerActions(false); }} tabIndex={0} role="menuitem">
                                        <i className="ri-chat-1-line text-lg"></i>
                                        <span className='text-sm'>Send SMS</span>
                                    </button>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => { setShowSendEmail(true); setShowBurgerActions(false); }} tabIndex={0} role="menuitem">
                                        <i className="ri-mail-ai-line text-lg"></i>
                                        <span className='text-sm'>Send Email</span>
                                    </button>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                        <i className="ri-user-voice-line text-lg"></i>
                                        <span className='text-sm'>Invite Again</span>
                                    </button>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left group' tabIndex={0} role="menuitem">
                                        <i className="ri-database-2-line text-lg"></i>
                                        <span className='text-sm'>Bulk Update</span>
                                    </button>
                                    <div className="dropdown-divider my-1" role="separator"></div>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-rose-500 hover:bg-rose-50 focus:bg-rose-100 transition w-full text-left' tabIndex={0} role="menuitem">
                                        <i className="ri-delete-bin-7-line text-lg"></i>
                                        <span className='text-sm'>Delete Invite</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 bg-white hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => setShowBurgerLead(true)} tabIndex={0} role="menuitem">
                                        <i className="ri-user-add-line text-xl"></i>
                                        <span className='text-base font-medium'>Lead</span>
                                        <i className="ri-arrow-right-s-line text-xs ml-auto transition-transform"></i>
                                    </button>
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
                                        <i className="ri-pie-chart-line text-xl"></i>
                                        <span className='text-base font-medium'>Analytics</span>
                                    </button>
                                    <button className='flex items-center py-1.5 px-2 rounded-md cursor-pointer gap-2 text-gray-500 bg-white hover:bg-blue-50 focus:bg-blue-100 transition w-full text-left' onClick={() => window.tableRefresh()} tabIndex={0} role="menuitem">
                                        <i className="ri-refresh-line text-xl"></i>
                                        <span className='text-base font-medium'>Refresh</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {showImport && (
                <ImportEnquiryDropBox
                    onCancel={() => setShowImport(false)}
                    onSwitchToManual={() => { setShowImport(false); setShowManual(true); }}
                />
            )}
            {showManual && (
                <ManualCandidate
                    onCancel={() => setShowManual(false)}
                    onSwitchToImport={() => { setShowManual(false); setShowImport(true); }}
                />
            )}
            {showColumnReorderPopup && (
                <ColumnReorderPopup
                    isOpen={showColumnReorderPopup}
                    setIsOpen={setShowColumnReorderPopup}
                // ...other props
                />
            )}
            {/* {showSendSms && (
                <SendSmsModal
                    isOpen={showSendSms}
                    onClose={() => setShowSendSms(false)}
                    mobiles={selectedLeadMobiles}
                />
            )} */}
            {showSendEmail && (
                <SendEmailModal
                    isOpen={showSendEmail}
                    onClose={() => setShowSendEmail(false)}
                    ids={selectedLeadIds}
                    emails={selectedLeadEmails}
                    corporateId={User?.corporateId}
                />
            )}
            {showBulkUpdateDrawer && (
                <BulkUpdateDrawer
                    open={showBulkUpdateDrawer}
                    onClose={() => setShowBulkUpdateDrawer(false)}
                    sourceOptions={sourceOptions}
                    ownerOptions={ownerOptions}
                    courseOptions={courseOptions}
                    statusOptions={statusOptions}
                    selectedIds={selectedLeadIds}
                    onUpdate={async (fields, selectedIds) => {
                        if (!fields || !selectedIds || selectedIds.length === 0) {
                            return { success: false, message: 'No fields or leads selected' };
                        }
                        
                        let successCount = 0;
                        let failCount = 0;
                        
                        for (const invitationId of selectedIds) {
                            try {
                                const lead = getLeadById(invitationId);
                                // Create payload with essential existing data to preserve fields
                                const payload = { 
                                    invitationId, 
                                    updatedBy: User?.userId || User?._id || undefined,
                                    // Preserve essential existing lead data (only the most critical fields)
                                    name: lead.firstName || lead.name || '',
                                    email: lead.emailId || lead.email || '',
                                    mobile: lead.mobile || '',
                                    altMobile: lead.altMobile || '',
                                    remarks: lead.remarks || '',
                                    location: lead.location || '',
                                    testId: lead.testId || lead.test_id || ''
                                };
                                
                                // Override with bulk update fields if provided
                                if (fields.source) payload.source = fields.source;
                                if (fields.owner) payload.assignedTo = typeof fields.owner === 'object' ? fields.owner.value : fields.owner;
                                if (fields.course) payload.course = typeof fields.course === 'object' ? fields.course.value : fields.course;
                                if (fields.status) payload.status = typeof fields.status === 'object' ? fields.status.value : fields.status;
                                
                                // Ensure required fields have fallback values
                                if (!payload.assignedTo) payload.assignedTo = lead.assignedTo || lead.owner || lead.assignedUserId || User?._id || undefined;
                                if (!payload.course) payload.course = lead.course || lead.courseName || lead.course_id || undefined;
                                if (!payload.status) payload.status = lead.status || undefined;
                                if (!payload.source) payload.source = lead.source || lead.sourceName || lead.source_id || undefined;
                                
                                await (await import('@/utility/xFetch')).xFetch({
                                    method: 'POST',
                                    path: '/services/invite/updateInviteDetails',
                                    payload
                                });
                                successCount++;
                            } catch (e) {
                                console.error('Bulk update error for invitation:', invitationId, e);
                                failCount++;
                            }
                        }
                        
                        // Show feedback messages
                        if (successCount > 0) {
                            toast.success(`Updated ${successCount} lead(s)`);
                        }
                        if (failCount > 0) {
                            toast.error(`Failed to update ${failCount} lead(s)`);
                        }
                        
                        // Refresh table if any updates were successful
                        if (successCount > 0) {
                            setTimeout(() => {
                                if (typeof window !== 'undefined' && window.tableRefresh) {
                                    window.tableRefresh();
                                }
                            }, 500);
                        }
                        
                        return { 
                            success: successCount > 0, 
                            successCount, 
                            failCount,
                            message: successCount > 0 ? `Updated ${successCount} lead(s)` : 'No leads were updated'
                        };
                    }}
                />
            )}
            {dailyReport && (
                <DailyReportModal
                    isOpen={dailyReport}
                    onClose={() => setDailyReport(false)}
                />
            )}

        {/* Export Modal */}
        <ExportEnquiriesModal 
            isOpen={showExportModal} 
            onClose={() => setShowExportModal(false)} 
            totalLeads={TotalLeads.value()}
            onDownloadStart={onDownloadStart}
            onDownloadProgress={onDownloadProgress}
            onDownloadEnd={onDownloadEnd}
            onDownloadCancel={onDownloadCancel}
            setCancelExportFunction={setCancelExportFunction}
        />
        </>
    );
}