'use client'

import { useState } from 'react';
import ConfirmDelete from '@/components/elements/ConfirmDelete';
import AssignPopup from './assignPopup';
import BatchInfoModel from './batchInfoModel';
import CompletedInstallments from './completedInstallmentsModel';
import PendingInstallments from './pendingInstallmentsModel';

export default function PaymentsTable({
    rows = [],
    router = null,
    changePlacementReadyStatus = null,
    deleteRecord = null,
    counsellors = {},
    trainers = {},
    filterParams = {},
    changeCounsellorOrTrainer = null,
    checkUncheckRows = null,
    downloadReceipt = null,
}) {

    const [toDelete, setToDelete] = useState(0);
    const [assignedTrainer, setAssignedTrainer] = useState(null);
    const [assignedCounsellor, setAssignedCounsellor] = useState(null);
    const [batchId, setBatchId] = useState(null);
    const [completedInstallment, setCompletedInstallment] = useState(null);
    const [pendingInstallment, setPendingInstallment] = useState(null);
    const hasSubServices = filterParams?.subServices 
        && typeof filterParams.subServices === 'object' 
        && Object.keys(filterParams.subServices).length > 0;

    const formatAmountColumnData = (currency, amount, canBeZero = true) => {
        if (!amount) return (canBeZero) ? '0' : '-';
        if (!canBeZero && amount === '0') return '-';

        return (
            <div>
                <span className='font-semibold'>{currency ?? ''}</span>&nbsp;{amount}
            </div>
        );
    }

    const getStatusFormatted = (value = "") => {
        const normalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

        const statusMap = {
            Active: "text-green-600",
            Defaulter: "text-red-600",
            Paused: "text-yellow-600"
        };

        return (
            <div className="font-semibold">
                <span className={statusMap[normalized] || "text-gray-500"}>
                    {normalized}
                </span>
            </div>
        );
    };

    const getAssignedUserById = (id, type, defaultValue = '') => {
        if (id === null || id === undefined) return defaultValue;

        const parsedId =
            typeof id === 'number'
                ? id
                : typeof id === 'string'
                    ? Number(id.trim())
                    : NaN;

        // Must be a finite integer (allows +ve / -ve)
        if (!Number.isFinite(parsedId) || !Number.isInteger(parsedId)) {
            return defaultValue;
        }

        if (type === 'trainer') return trainers[parsedId] ?? defaultValue;
        if (type === 'counsellor') return counsellors[parsedId] ?? defaultValue;
        return defaultValue;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDateOlderThanToday = (dateStr, amount) => {
        if (!dateStr || typeof dateStr !== "string") return false;
        if (!amount || typeof amount !== "string" || amount === '' || amount === '0') return false;

        const datePart = dateStr.trim().split(" ")[0];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;

        const inputDate = new Date(datePart);
        if (isNaN(inputDate.getTime())) return false;

        return inputDate < today;
    }


    return (
        <>
            <ConfirmDelete
                open={toDelete}
                title="Delete Joinee Record?"
                description="Joinee record will be deleted and wont be visible anymore. Are you sure you want to proceed?"
                onConfirm={() => {
                    deleteRecord(toDelete);
                    setToDelete(0);
                }}
                onClose={() => setToDelete(0)}
            />

            <AssignPopup
                open={assignedTrainer}
                title="Change Trainer"
                description="Choose another trainer for this joinee"
                currentId={assignedTrainer?.trainer || 0}
                items={trainers}
                onAction={(id, action) => {
                    let data = { id: assignedTrainer.id, trainer: id };
                    changeCounsellorOrTrainer('Trainer', data);
                    setAssignedTrainer(null);
                }}
                onClose={() => setAssignedTrainer(null)}
            />

            <AssignPopup
                open={assignedCounsellor}
                title="Change Counsellor"
                description="Choose another counsellor for this joinee"
                currentId={assignedCounsellor?.counsellor || '-1'}
                items={counsellors}
                onAction={(id, action) => {
                    let data = { id: assignedCounsellor.id, amType: '', assignedTo: id };
                    changeCounsellorOrTrainer('Counsellor', data);
                    setAssignedCounsellor(null);
                }}
                onClose={() => setAssignedCounsellor(null)}
            />

            <BatchInfoModel
                open={batchId}
                onClose={() => setBatchId(null)}
            />

            <CompletedInstallments
                open={completedInstallment}
                onLinkClick={(trackingId, installmentNumber) => {
                    downloadReceipt({ trackingId, installmentNumber });
                }}
                onClose={() => setCompletedInstallment(null)}
            />

            <PendingInstallments
                open={pendingInstallment}
                onClose={() => setPendingInstallment(null)}
            />

            <table className="text-[13px] border-collapse bg-white" id='paymentsReportTable'>
                <thead className="bg-slate-100">
                    <tr className="border-b border-slate-200">
                        <th className="p-2">
                            <input
                                className='h-[14px] w-[14px] mt-1 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 hover:border-blue-500'
                                type="checkbox"
                                onChange={(e) => checkUncheckRows(e.target.checked)}
                            />
                        </th>
                        <th className="p-2 text-left min-w-36">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Mobile</th>
                        <th className="p-2 text-left min-w-32">Course</th>
                        {hasSubServices && (
                            <th className="p-2 text-left min-w-32">Sub Services</th>
                        )}
                        <th className="p-2 text-left min-w-32">Batch</th>
                        <th className="p-2 text-left min-w-32">Date of Joining</th>
                        <th className="p-2 text-center">Agreed Payment</th>
                        <th className="p-2 text-center">Completed Installments</th>
                        <th className="p-2 text-center">Pending Installments</th>
                        <th className="p-2 text-center min-w-24">Total Balance</th>
                        <th className="p-2 text-center">Discount</th>
                        <th className="p-2 text-left min-w-32">Remarks</th>
                        <th className="p-2 text-left min-w-32">Source</th>
                        <th className="p-2 text-left min-w-32">Counsellor</th>
                        <th className="p-2 text-left min-w-32">Trainer</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left min-w-32">Lead Category Type</th>
                        <th className="p-2 text-left min-w-32">Associated Centers</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y">
                    {rows.map(item => (
                        <tr className={`${(isDateOlderThanToday(item?.renewalDate, item?.pendingAmount)) ? 'bg-rose-50 hover:bg-rose-200' : 'hover:bg-slate-50'}`} key={item?.id}>
                            <td className="p-2">
                                <input
                                    className='h-[14px] w-[14px] mt-1 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                    id={item?.id}
                                    type="checkbox"
                                />
                            </td>
                            <td className="p-2 cursor-default" title={item?.id}><span className='cursor-pointer' onClick={(e) => router.push(`/payments/${item.id}`)}>✏️</span> {item?.name || '-'}</td>
                            <td className="p-2">{item?.email || '-'}</td>
                            <td className="p-2">
                                <div className='flex justify-left align-middle gap-2'>
                                    {item?.mobile || '-'}
                                    {(item?.mobile || '').length > 3 &&
                                        <a className='mt-0.5' target='_blank' href={'https://wa.me/' + item.mobile + '?text=hello'}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#4CAF50" fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeLinejoin="round">
                                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.3789 2.27907 14.6926 2.78382 15.8877C3.06278 16.5481 3.20226 16.8784 3.21953 17.128C3.2368 17.3776 3.16334 17.6521 3.01642 18.2012L2 22L5.79877 20.9836C6.34788 20.8367 6.62244 20.7632 6.87202 20.7805C7.12161 20.7977 7.45185 20.9372 8.11235 21.2162C9.30745 21.7209 10.6211 22 12 22Z" />
                                                <path d="M8.58815 12.3773L9.45909 11.2956C9.82616 10.8397 10.2799 10.4153 10.3155 9.80826C10.3244 9.65494 10.2166 8.96657 10.0008 7.58986C9.91601 7.04881 9.41086 7 8.97332 7C8.40314 7 8.11805 7 7.83495 7.12931C7.47714 7.29275 7.10979 7.75231 7.02917 8.13733C6.96539 8.44196 7.01279 8.65187 7.10759 9.07169C7.51023 10.8548 8.45481 12.6158 9.91948 14.0805C11.3842 15.5452 13.1452 16.4898 14.9283 16.8924C15.3481 16.9872 15.558 17.0346 15.8627 16.9708C16.2477 16.8902 16.7072 16.5229 16.8707 16.165C17 15.8819 17 15.5969 17 15.0267C17 14.5891 16.9512 14.084 16.4101 13.9992C15.0334 13.7834 14.3451 13.6756 14.1917 13.6845C13.5847 13.7201 13.1603 14.1738 12.7044 14.5409L11.6227 15.4118" />
                                            </svg>
                                        </a>
                                    }
                                </div>
                            </td>
                            <td className="p-2">{item?.label || '-'}</td>
                            {hasSubServices && (
                                <td className="p-2">{item?.sub_services || '-'}</td>
                            )}
                            <td
                                onClick={() => setBatchId(item?.batchId ?? '0')}
                                className={`p-2 ${(item?.batchName ?? '').length > 0 ? 'cursor-pointer hover:text-blue-500' : ''}`}
                                title={(item?.batchName ?? '').length > 1 ? 'View Batch Details' : ''}
                            >
                                {item?.batchName || '-'}
                            </td>
                            <td className="p-2">{item?.doj || '-'}</td>

                            <td className="p-2 flex flex-row gap-1.5 justify-end items-center cursor-pointer group/item">
                                {(item?.upcomingPaymentDate && (item?.upcomingPaymentAmount ?? '0') !== '0') &&
                                    <div className='font-normal rounded-full bg-amber-500 w-2 h-2 relative top-[1px]'>
                                        <div className='h-2 w-2 bg-amber-400 absolute rounded-full animate-ping'></div>
                                        <div className='absolute top-5 -left-1.5 text-center bg-amber-50 border-2 border-amber-300 min-w-[180px] py-3 px-4 rounded-md shadow-lg transition-all opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible'>
                                            <div className='h-3 w-3 bg-amber-300 absolute -top-2 left-1 rotate-[45deg]'></div>
                                            <div className='font-bold text-black text-3xl'>{formatAmountColumnData(item?.currency, item?.upcomingPaymentAmount)}</div>
                                            <p className='text-xs font-normal text-black border-t-2 border-amber-300 pt-2 mt-2'>Upcoming Payment</p>
                                            <p className='text-sm font-medium text-black'>{item?.upcomingPaymentDate}</p>
                                        </div>
                                    </div>
                                }
                                <div className='font-semibold text-right'>{formatAmountColumnData(item?.currency, item?.agreedPayment)}</div>
                            </td>

                            <td onClick={() => setCompletedInstallment({ amount: item?.completedPayment || '0', id: item?.id })}
                                className="p-2 cell-right amount-received cursor-pointer">
                                {formatAmountColumnData(item?.currency, item?.completedPayment)}
                            </td>
                            <td onClick={() => setPendingInstallment({ amount: item?.pendingAmount || '0', id: item?.id })}
                                className="p-2 flex flex-row justify-end items-center gap-1 amount-pending cursor-pointer">
                                <div className={`font-semibold ${((item?.pendingAmount ?? '0') !== "0") ? 'text-red-500' : ''}`}>
                                    {formatAmountColumnData(item?.currency, item?.pendingAmount)}
                                </div>
                                {(isDateOlderThanToday(item?.renewalDate, item?.pendingAmount)) &&
                                    <div className='text-xs px-1.5 rounded-full text-white bg-rose-600 w-fit relative right-0 pb-0.5'>Overdue</div>
                                }
                            </td>
                            <td className="p-2 text-right">
                                {formatAmountColumnData(item?.currency, item?.balance)}
                            </td>
                            <td className="p-2 text-blue-500 font-medium">
                                {formatAmountColumnData(item?.currency, item?.discount, false)}
                            </td>
                            <td className="p-2">{item?.remarks || '-'}</td>
                            <td className="p-2">{item?.source || '-'}</td>
                            <td className="p-2 cursor-pointer" onClick={(e) => setAssignedCounsellor({ id: item?.id, counsellor: item?.assignedUserId || '-1' })}>👨‍💼 {getAssignedUserById(item?.assignedUserId || 0, 'counsellor', 'Not assigned')}</td>
                            <td className="p-2 cursor-pointer" onClick={(e) => setAssignedTrainer({ id: item?.id, trainer: item?.assignedTrainerId || '0' })}>🧑‍💻 {getAssignedUserById(item?.assignedTrainerId || 0, 'trainer', 'Not assigned')}</td>
                            <td className="p-2">{getStatusFormatted(item?.status || '-')}</td>
                            <td className="p-2">{item?.leadCategoryType || '-'}</td>
                            <td className="p-2">{item?.associatedCenters || '-'}</td>
                            <td className="p-2 flex justify-between items-center gap-2">
                                <a target='_blank' href={process.env.NEXT_PUBLIC_LEADSTOR_REST + '/generateCourseCertificatePDF.php?download=1&trackingId=' + item.id} className='cursor-pointer text-[20px] relative top-0.5' title='Generate Course Certificate'>🎓</a>
                                <span onClick={(e) => changePlacementReadyStatus(item.id)} className='cursor-pointer text-[16px]' title='Update Placement Ready Status'>💼</span>
                                <span onClick={(e) => setToDelete(item.id)} className='cursor-pointer relative top-0.5' title='Delete Joinee Record'>❌</span>
                            </td>
                        </tr>
                    ))}

                </tbody>
            </table>
        </>
    )
}