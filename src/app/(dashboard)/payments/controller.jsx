'use client'

import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { xFetch, jsonToQueryParams } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import PaymentsTable from './table';
import ReportDropdown from './reportMenu';
import DatePickerModal from '@/components/elements/DatePickerModal';
import TextareaModal from '@/components/elements/TextareaModal';
import FilterPopup from './filterPopup';

export default function PaymentsSectionController() {

    const corporateId = Corporate?._id;
    const router = useRouter();
    let totalPages = 0;
    let currentPage = 0;

    const [leads, setLeads] = useState(null);
    const [counsellor, setCounsellor] = useState([]);
    const [trainer, setTrainer] = useState([]);
    const [filterParams, setFilterParams] = useState({});
    const [filterPopup, setFilterPopup] = useState(false);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [sendBulkSMS, setSendBulkSMS] = useState(false);
    const [sendBulkEmail, setSendBulkEmail] = useState(false);
    const searchTimeoutRef = useRef(null);
    const [downloadReport, setDownloadReport] = useState(false);
    const [query, setQuery] = useState({
        corporateId: Corporate._id,
        search: '',
        order: 'asc',
        offset: 0,
        limit: 50
    });

    const [appliedFilters, setAppliedFilters] = useState({
        selected: {},
        range: {
            from: null,
            to: null
        }
    });

    // Helper Functions
    const pad = (n) => String(n).padStart(2, "0");

    const refresh = () => {
        setQuery((prev) => ({
            ...prev,
            offset: 0
        }));
    }

    const handleKeyUp = (event) => {
        clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(() => {
            setQuery((prev) => ({
                ...prev,
                offset: 0,
                search: event.target.value
            }));
        }, 300);
    };

    const getPages = () => {
        totalPages = Math.ceil(leads?.total || 0 / query.limit);
        currentPage = Math.floor(query.offset / query.limit);

        const pages = [];
        const delta = 1; // how many pages around current

        const rangeStart = Math.max(0, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        if (rangeStart > 0) {
            pages.push(0);
            if (rangeStart > 1) pages.push("...");
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (rangeEnd < totalPages - 1) {
            if (rangeEnd < totalPages - 2) pages.push("...");
            pages.push(totalPages - 1);
        }

        return pages.filter(
            (item, index) => pages.indexOf(item) === index
        );
    }

    const changePage = (pageIndex) => {
        if (pageIndex < 0 || pageIndex >= totalPages) return;

        setQuery((prev) => ({
            ...prev,
            offset: pageIndex * prev.limit
        }));
    };

    const changeLimit = (e) => {
        const newLimit = Number(e.target.value);

        setQuery((prev) => ({
            ...prev,
            limit: newLimit,
            offset: 0 // reset to first page
        }));
    };

    const filterPendingPayments = (e) => {
        let status = (e.target.getAttribute('data-status') === '0');
        e.target.setAttribute('data-status', ((status) ? '1' : '0'));
        let span = e.target.querySelector('span');
        if (span) span.style.display = (status) ? '' : 'none';

        console.log(`Status: ${status}`, span);

        if (status) {
            setQuery((prev) => ({
                ...prev,
                pending: true,
                offset: 0 // reset to first page
            }));

            return;
        }

        // remove `pending` when status is false
        setQuery(prev => {
            const { pending, ...rest } = prev;
            return {
                ...rest,
                offset: 0
            };
        });

    }

    const cbChangePlacementReadyStatus = (id) => {
        xFetch({
            method: 'POST',
            path: '/services/joinees/changePlacementReadystatus',
            payload: { trackingId: id, corporateId: Corporate._id }
        })
            .then(data => {
                console.log('ChangePlacementReadyStatus', data);
                toast('Placement Ready Status Updated');
                refresh();
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                toast.error('Server error occurred, Try again');
            });
    }

    const cbDeleteRecord = (id) => {
        xFetch({
            method: 'POST',
            path: '/services/joinees/deleteMyJoineeRecord',
            payload: { trackingId: id }
        })
            .then(data => {
                console.log('ChangePlacementReadyStatus', id);
                toast('Joinee Record Deleted');
                refresh();
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                toast.error('Unable to delete, Try again');
            });
    }

    const cbChangeCounsellorOrTrainer = (who, payload) => {
        console.log('Change CouNer', { who, payload });
        xFetch({
            method: 'POST',
            path: `/services/joinees/${(who === 'Counsellor') ? 'updateAssignTo' : 'assignTrainer'}`,
            payload: payload
        })
            .then(data => {
                toast(`${who} Updated For Joinee`);
                refresh();
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                toast.error(`Unable to update ${who.toLowerCase()}, Try again`);
            });
    }

    const exportReport = (data) => {
        data['corporateId'] = Corporate._id;
        let target = (data?.type ?? '' === 'Collection') ? 'paymentReportExcelGenerator' : 'joineeReportExcelGenerator';
        let link = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/${target}.php?${jsonToQueryParams(data)}`;

        console.log('Export-' + target, data, link);
        window.open(link, '_blank', 'noopener,noreferrer');

    }

    const downloadJoineesReport = (type) => {
        if (!type) return;
        if (type === 'Joinee@Detailed_Download') {
            let link = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/joinees/getJoineesDetailedReport?corporateId=${Corporate._id}`;
            console.log('Report:', link);
            window.open(link, '_blank', 'noopener,noreferrer');
            return;
        }

        let link = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/joinees/exportAllJoinees?corporateId=${Corporate._id}`;
        console.log('Report:', link);
        window.open(link, '_blank', 'noopener,noreferrer');
    }

    const base64Encode = (str) => {
        const bytes = new TextEncoder().encode(str);
        return btoa(
            Array.from(bytes, b => String.fromCharCode(b)).join('')
        );
    }

    const sendBulkPaymentAlert = (content, type) => {
        let rows = [...document.querySelectorAll('table#paymentsReportTable tbody td input[type=checkbox]:checked')].map(i => i.id);
        let payload = { content, type, rows };
        checkUncheckRows();
        console.log('SEND BULK', payload);
    }

    const openTextArea = (type) => {
        let rows = [...document.querySelectorAll('table#paymentsReportTable tbody td input[type=checkbox]:checked')].map(i => i.id);
        if (rows.length < 1) {
            toast.warning(`Select Joinees to Send ${type}`);
            return;
        }

        if (type === 'SMS') {
            setSendBulkSMS(true);
            return;
        }

        setSendBulkEmail(true);
    }

    const checkUncheckRows = (state = false) => {
        [...document.querySelectorAll('table#paymentsReportTable tbody td input[type=checkbox]')].map(i => i.checked = state);
    }

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            xFetch({
                path: '/services/profile/getUsers',
                payload: { userRole: 'Counsellor', list: 1 }
            }),
            xFetch({
                path: '/services/profile/getUsers',
                payload: { userRole: 'Trainer', list: 1 }
            }),
            xFetch({
                path: '/services/joinees/getFilterParameters',
                payload: { corporateId: Corporate._id }
            })
        ])
            .then(([counsellors, trainers, filterParams]) => {
                if (!isMounted) return;

                setCounsellor(counsellors);
                setTrainer(trainers);
                setFilterParams(filterParams);
            })
            .catch(error => {
                console.error('Error loading initial data', error);
                toast.error('Server error occurred, Try again');
            });

        return () => {
            isMounted = false;
        };
    }, [corporateId]);

    useEffect(() => {
        xFetch({
            path: '/services/joinees/admissions',
            payload: query
        })
            .then(data => {
                console.log(data);
                setLeads(data);
            })
            .catch(error => {
                console.error(`An error occurred while fetching leads`, error);
                toast.error('Server error occurred, Try again');
            });
    }, [query, setLeads])

    return (
        <div>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            <DatePickerModal
                open={openDatePicker}
                onConfirm={(date) => {
                    let value = `${date.startDate.getFullYear()}-${pad(date.startDate.getMonth() + 1)}-${pad(date.startDate.getDate())},${date.endDate.getFullYear()}-${pad(date.endDate.getMonth() + 1)}-${pad(date.endDate.getDate())}`;
                    let [type, interval] = openDatePicker?.split('@')
                    let payload = {
                        type,
                        fileName: `ConceptNinjas_${type}_${interval}`,
                        monthInterval: value,
                        qutype: 2
                    }

                    exportReport(payload);
                }}
                onClose={() => setOpenDatePicker(false)}
            />

            <TextareaModal
                open={sendBulkSMS}
                title="SMS 📲"
                description="Text message (sms) will be sent to selected joinees"
                primaryText="Send SMS"
                placeholder="Enter SMS & signature. Limited to 160 characters."
                onConfirm={(text) => {
                    sendBulkPaymentAlert(text, 'SMS');
                }}
                onClose={() => setSendBulkSMS(false)}
            />

            <TextareaModal
                open={sendBulkEmail}
                title="Email 📤"
                description="Email will be sent to selected joinees"
                primaryText="Send Email"
                placeholder="Enter email content & signature."
                onConfirm={(text) => {
                    sendBulkPaymentAlert(text, 'Email');
                }}
                onClose={() => setSendBulkEmail(false)}
            />

            <FilterPopup
                open={filterPopup}
                onApply={(data) => {
                    let isItClearFilterEvent = !(Object.keys(data?.selected ?? {}).length > 0 || data?.range?.from);
                    console.log('Filter', data, { isItClearFilterEvent });
                    // Preserve the applied ones
                    setAppliedFilters(data);

                    // Applying Filter to Query<state>
                    let doj = '';
                    let dojend = '';
                    if (data?.range?.from && data?.range?.to) {
                        doj = `${data.range.from.getFullYear()}-${pad(data.range.from.getMonth() + 1)}-${pad(data.range.from.getDate())}`;
                        dojend = `${data.range.to.getFullYear()}-${pad(data.range.to.getMonth() + 1)}-${pad(data.range.to.getDate())}`;
                    }

                    setQuery(prev => ({
                        ...prev,
                        offset: 0,
                        search: '',
                        ['label']       : base64Encode((data?.selected?.course_label ?? []).join(',')),
                        ['source']      : (data?.selected?.source ?? []).join(','),
                        ['counsellor']  : (data?.selected?.counsellor ?? []).join(','),
                        ['trainer']     : (data?.selected?.trainer ?? []).join(','),
                        ['batchid']     : (data?.selected?.batch_name ?? []).join(','),
                        ['status']      : (data?.selected?.status ?? []).join(','),
                        ['doj']         : doj,
                        ['dojend']      : dojend
                    }));

                }}
                onClose={() => setFilterPopup(false)}
            />

            <div className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center">
                <div className="flex gap-7 text-xs text-slate-500">
                    <div>
                        <div>Total Outstanding</div>
                        <div className="text-base font-semibold text-slate-900">₹ 12,48,350</div>
                    </div>
                    <div>
                        <div>Overdue</div>
                        <div className="text-base font-semibold text-red-600">₹ 3,10,001</div>
                    </div>
                    <div>
                        <div>Due Today</div>
                        <div className="text-base font-semibold text-amber-600">₹ 85,000</div>
                    </div>
                    <div>
                        <div>Collected Today</div>
                        <div className="text-base font-semibold text-green-600">₹ 1,25,000</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm border border-slate-300 rounded bg-slate-50">📩 Send Payment Link</button>
                    <button className="px-4 py-2 text-sm border border-slate-300 rounded bg-slate-50">📝 Add Note</button>
                    <button className="px-4 py-2 text-sm rounded bg-blue-600 text-white">💳 Mark as Collected</button>
                </div>
            </div>

            <div>
                {/* Controllers */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200">
                    <button className="border px-2 py-1 rounded" onClick={(e) => router.push('/payments/create')}>➕</button>
                    <button className="border px-2 py-1 rounded" onClick={() => openTextArea('SMS')}>📱</button>
                    <button className="border px-2 py-1 rounded" onClick={() => openTextArea('Email')}>📤</button>
                    <button
                        className="border px-2 py-1 rounded relative"
                        onClick={() => setFilterPopup({ counsellor, trainer, filterParams, applied: appliedFilters })}
                    >
                        <span>🔬</span>
                        {(Object.keys(appliedFilters?.selected ?? {}).length > 0 || appliedFilters?.range?.from) &&
                            <div className='pointer-events-none'>
                                <div className='h-3 w-3 bg-blue-600 absolute -top-1.5 -right-1 rounded-full'></div>
                                <div className='h-3 w-3 bg-blue-600 absolute -top-1.5 -right-1 rounded-full animate-ping'></div>
                            </div>
                        }

                    </button>

                    {/* Backdrop: Report Download */}
                    {downloadReport && <div onClick={() => setDownloadReport(false)} className="absolute inset-0 bg-transparent z-10" />}
                    <div className="relative w-44 text-sm">
                        <button
                            onClick={() => setDownloadReport({ filtered: (Object.keys(appliedFilters?.selected ?? {}).length > 0 || appliedFilters?.range?.from) })}
                            className="w-full border rounded px-3 py-2 text-left bg-white flex justify-between items-center">
                            <span>Download Report</span>
                            <span className="text-gray-400">⏷</span>
                        </button>
                        <ReportDropdown
                            onChange={(value, label) => {

                                if (value.includes('Custom')) {
                                    setOpenDatePicker(value);
                                    return;
                                }

                                if (value.includes('Download')) {
                                    downloadJoineesReport(value);
                                    return;
                                }

                                let [type, interval] = value.split('@')
                                let payload = {
                                    type,
                                    fileName: `ConceptNinjas_${type}_${label}`,
                                    monthInterval: interval,
                                    qutype: 1
                                }

                                exportReport(payload);
                                setDownloadReport(false);
                            }}

                            open={downloadReport}
                        />
                    </div>

                    <button className="border px-2 py-1 rounded" data-status="0" onClick={filterPendingPayments}>📢<span className='text-rose-500 pointer-events-none' style={{ display: "none" }}>&bull; Reset ✘</span></button>

                    <div className="flex-1"></div>

                    <input className="border px-2 py-1 rounded" placeholder="Search" onKeyUp={handleKeyUp} />
                    <button className="border px-2 py-1 rounded" onClick={refresh}>⭮</button>
                    <button className="border px-2 py-1 rounded">⚙︎</button>
                </div>

                {/* Table View */}
                <div className="h-[calc(100vh-120px)] overflow-scroll show-scrollbar" >
                    <PaymentsTable
                        rows={leads?.rows || []}
                        router={router}
                        changePlacementReadyStatus={cbChangePlacementReadyStatus}
                        deleteRecord={cbDeleteRecord}
                        counsellors={counsellor}
                        trainers={trainer}
                        changeCounsellorOrTrainer={cbChangeCounsellorOrTrainer}
                        checkUncheckRows={checkUncheckRows}
                    />
                </div>

                {/* Pagination Controller */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 flex justify-between items-center px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                        Showing 1 to {leads?.rows?.length || 0} of {leads?.total || 0} rows
                        <select
                            className="border rounded px-1"
                            value={query.limit}
                            onChange={changeLimit}
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        rows per page
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Previous */}
                        <button
                            className="border w-8 h-8 rounded"
                            onClick={() => changePage(currentPage - 1)}
                        >
                            ‹
                        </button>

                        {/* Page numbers */}
                        {getPages().map((page, index) =>
                            page === "..." ? (
                                <span key={index} className="px-1 text-slate-400">
                                    …
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => changePage(page)}
                                    className={`w-8 h-8 rounded ${page === currentPage
                                        ? "bg-blue-600 text-white"
                                        : "border"
                                        }`}
                                >
                                    {page + 1}
                                </button>
                            )
                        )}

                        {/* Next */}
                        <button
                            className="border w-8 h-8 rounded"
                            onClick={() => changePage(currentPage + 1)}
                        >
                            ›
                        </button>
                    </div>

                </div>

            </div>
        </div>
    )
}