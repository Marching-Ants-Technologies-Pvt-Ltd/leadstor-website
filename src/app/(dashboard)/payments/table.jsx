'use client'

import { useState } from 'react';
import ConfirmDelete from '@/components/elements/ConfirmDelete';
import AssignPopup from './assignPopup';

export default function PaymentsTable({
    rows = [],
    router = null,
    changePlacementReadyStatus = null,
    deleteRecord = null,
    counsellors = {},
    trainers = {},
    changeCounsellorOrTrainer = null,
    checkUncheckRows = null,
}) {

    const [toDelete, setToDelete] = useState(0);
    const [assignedTrainer, setAssignedTrainer] = useState(null);
    const [assignedCounsellor, setAssignedCounsellor] = useState(null);

    const getStatusFormatted = (value) => {
        const statusMap = {
            Active: "text-green-600",
            Defaulter: "text-red-600",
            Paused: "text-yellow-600"
        };

        return (
            <div className="font-semibold">
                <span className={statusMap[value] || "text-gray-500"}>
                    {value}
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
                    let data = {id: assignedTrainer.id, trainer: id};
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
                    let data = {id: assignedCounsellor.id, amType: '', assignedTo: id};
                    changeCounsellorOrTrainer('Counsellor', data);
                    setAssignedCounsellor(null);
                }}
                onClose={() => setAssignedCounsellor(null)}
            />

            <table className="text-[13px] border-collapse bg-white" id='paymentsReportTable'>
                <thead className="bg-slate-100">
                    <tr className="border-b border-slate-200">
                        <th className="p-2"><input type="checkbox" onChange={(e) => checkUncheckRows(e.target.checked)} /></th>
                        <th className="p-2 text-left min-w-36">Name</th>
                        <th className="p-2 text-left">Email</th>
                        <th className="p-2 text-left">Mobile</th>
                        <th className="p-2 text-left min-w-24">Course Label</th>
                        <th className="p-2 text-left min-w-32">Date of Joining</th>
                        <th className="p-2 text-center">Agreed Payment</th>
                        <th className="p-2 text-center">Completed Installments</th>
                        <th className="p-2 text-center">Pending Installments</th>
                        <th className="p-2 text-center min-w-24">Total Balance</th>
                        <th className="p-2 text-left min-w-32">Remarks</th>
                        <th className="p-2 text-left min-w-32">Source</th>
                        <th className="p-2 text-left min-w-32">Counsellor</th>
                        <th className="p-2 text-left min-w-32">Trainer</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y">
                    {rows.map(item => (
                        <tr className="hover:bg-slate-50" key={item?.id}>
                            <td className="p-2">
                                <input id={item?.id} type="checkbox" />
                            </td>
                            <td className="p-2">{item?.name || '-'} <span className='cursor-pointer' onClick={(e) => router.push(`/payments/${item.id}`)}>✏️</span></td>
                            <td className="p-2">{item?.email || '-'}</td>
                            <td className="p-2">
                                <div className='flex justify-left align-middle gap-2'>
                                    {item?.mobile || '-'}
                                    {(item?.mobile || '').length > 3 &&
                                        <a className='mt-0.5' target='_blank' href={'https://wa.me/' + item.mobile + '?text=hello'}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#4CAF50" fill="none" stroke="#4CAF50" strokeWidth="1.5" stroke-linejoin="round">
                                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.3789 2.27907 14.6926 2.78382 15.8877C3.06278 16.5481 3.20226 16.8784 3.21953 17.128C3.2368 17.3776 3.16334 17.6521 3.01642 18.2012L2 22L5.79877 20.9836C6.34788 20.8367 6.62244 20.7632 6.87202 20.7805C7.12161 20.7977 7.45185 20.9372 8.11235 21.2162C9.30745 21.7209 10.6211 22 12 22Z" />
                                                <path d="M8.58815 12.3773L9.45909 11.2956C9.82616 10.8397 10.2799 10.4153 10.3155 9.80826C10.3244 9.65494 10.2166 8.96657 10.0008 7.58986C9.91601 7.04881 9.41086 7 8.97332 7C8.40314 7 8.11805 7 7.83495 7.12931C7.47714 7.29275 7.10979 7.75231 7.02917 8.13733C6.96539 8.44196 7.01279 8.65187 7.10759 9.07169C7.51023 10.8548 8.45481 12.6158 9.91948 14.0805C11.3842 15.5452 13.1452 16.4898 14.9283 16.8924C15.3481 16.9872 15.558 17.0346 15.8627 16.9708C16.2477 16.8902 16.7072 16.5229 16.8707 16.165C17 15.8819 17 15.5969 17 15.0267C17 14.5891 16.9512 14.084 16.4101 13.9992C15.0334 13.7834 14.3451 13.6756 14.1917 13.6845C13.5847 13.7201 13.1603 14.1738 12.7044 14.5409L11.6227 15.4118" />
                                            </svg>
                                        </a>
                                    }
                                </div>
                            </td>
                            <td className="p-2">{item?.label || '-'}</td>
                            <td className="p-2">📅 {item?.doj || '-'}</td>
                            <td className="p-2 text-right">{item?.agreedPayment || '0'}</td>
                            <td className="p-2 cell-right amount-received">{item?.completedPayment || '0'}</td>
                            <td className="p-2 cell-right amount-pending">{item?.pendingAmount || '0'}</td>
                            <td className="p-2 text-right">
                                {(item?.pendingAmount || '0') !== "0" && (
                                    <span title='Payment Over Due' className='text-lg cursor-pointer'>⚠️</span>
                                )}
                                <span className={((item?.pendingAmount || '0') !== "0") ? 'text-rose-500' : ''}>{item?.balance || '0'}</span>
                            </td>
                            <td className="p-2">{item?.remarks || '-'}</td>
                            <td className="p-2">{item?.source || '-'}</td>
                            <td className="p-2 cursor-pointer" onClick={(e) => setAssignedCounsellor({ id: item?.id, counsellor: item?.assignedUserId || '-1'})}>👨‍💼 {getAssignedUserById(item?.assignedUserId || 0, 'counsellor', 'Not assigned')}</td>
                            <td className="p-2 cursor-pointer" onClick={(e) => setAssignedTrainer({ id: item?.id, trainer: item?.assignedTrainerId || '0'})}>🧑‍💻 {getAssignedUserById(item?.assignedTrainerId || 0, 'trainer', 'Not assigned')}</td>
                            <td className="p-2">{getStatusFormatted(item?.status || '-')}</td>
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