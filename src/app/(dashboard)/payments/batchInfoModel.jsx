import { useState, useEffect } from "react";
import { xFetch } from '@/utility/xFetch';
import { MonthNameByIndex } from './paymentUtils';

export default function BatchInfoModel({ open, onClose }) {

    const [info, setInfo] = useState(null);

    const getDateStatus = (dateStr, type) => {
        // handle empty / invalid input
        if (!dateStr || typeof dateStr !== 'string') {
            return `${type} date is not defined`;
        }

        // expected format: "04 Jan 2024"
        const [day, monthName, year] = dateStr.split(' ');

        const monthIndex = MonthNameByIndex.indexOf(monthName);

        if (monthIndex === -1) {
            return `${type} date is not defined`;
        }

        const givenDate = new Date(
            Number(year),
            monthIndex,
            Number(day)
        );

        // normalize today (ignore time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isPast = givenDate < today;

        if (type === 'start') {
            return isPast ? ' was started on' : 'will start on';
        }

        if (type === 'end') {
            return isPast ? 'was ended on' : 'will end on';
        }

        return '';
    }


    useEffect(() => {
        setInfo(null);
        if (open && open !== '0') {
            xFetch({
                path: '/services/attendance/getBatches',
                payload: { id: open }
            })
                .then(data => {
                    setInfo((data && data.length > 0) ? data[0] : {});
                })
                .catch(error => {
                    console.error(`An error occurred while fetching leads`, error);
                    toast.error('Server error occurred, Try again');
                });
        }
    }, [open]);

    if (!open) return;
    if (open === '0') return;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-[420px] p-5">
                {!info ? (
                    <h3 className="text-base font-semibold text-gray-800">
                        Loading Batch Info...
                    </h3>
                ) : !info?.batchId ? (
                    <h3 className="text-base font-semibold text-gray-800">
                        Batch Info Not Found
                    </h3>
                ) : (
                    <div className="">
                        <h3 className="text-base font-semibold text-gray-800">
                            {info?.labelName ?? 'Untitled Batch Label'}
                        </h3>
                        <p className="text-sm text-gray-600">{info?.batchName ?? 'Unnamed Batch Name'}</p>
                        <div className="flex gap-2 mt-3 border-t border-gray-300 pt-4">
                            <div className="bg-blue-600 text-white text-xs rounded-sm py-1 px-3 font-medium">Progress {info?.batchProgress ?? '0'}%</div>
                            <div className="border border-gray-400 text-xs font-medium text-gray-600 rounded-sm py-1 px-3">{info?.status ?? 'Unknown Status'}</div>
                        </div>
                        <p className="mt-3 text-base text-gray-700"><span className="font-medium">{info?.batchName ?? 'Unnamed Batch Name'}</span> batch {getDateStatus(info?.batchStartDate ?? '', 'start')} {info?.batchStartDate ?? ''}, with a capacity of {info?.batchTotalAllowedCount ?? 0} candidates. It {getDateStatus(info?.batchEndDate ?? '', 'end')} {info?.batchEndDate ?? ''}. This batch {getDateStatus(info?.batchEndDate ?? '', 'end').includes('was') ? 'was' : 'is'} scheduled between {info?.startTime ?? ''} and {info?.endTime ?? ''}.</p>
                    </div>
                )}

            </div>
        </div>
    )
}