import { useEffect, useState } from 'react';
import { xFetch } from '@/utility/xFetch';
import { toast } from 'react-toastify';

export default function PaymentAnalyticsOfTheDay({
    onDueTodayClick = null,
    dueTodayActive = false,
}) {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        xFetch({
            path: '/services/joinees/getPaymentAnalyticsOfTheDay'
        })
            .then(data => {
                setAnalytics(data);
            })
            .catch(error => {
                console.error(`An error occurred while fetching todays payment analytics`, error);
                toast.error('Server error occurred, Try again');
            });
    }, []);

    return (
        <div className="flex gap-7 text-xs text-slate-500">
            <div>
                <div>Today&apos;s Outstanding</div>
                <div className="text-base font-semibold text-slate-900">Rs. {analytics?.outstanding ?? '0'}</div>
            </div>
            <div>
                <div>Collected Today</div>
                <div className="text-base font-semibold text-green-600">Rs. {analytics?.received ?? '0'}</div>
            </div>
            <button
                type="button"
                onClick={() => onDueTodayClick?.()}
                className={`text-left rounded-md px-2 py-1 transition ${
                    dueTodayActive
                        ? 'bg-amber-50 ring-1 ring-amber-300'
                        : 'hover:bg-amber-50'
                }`}
                title="Show students whose pending payment is due today"
            >
                <div>Due Today</div>
                <div className="text-base font-semibold text-amber-600">Rs. {analytics?.pending ?? '0'}</div>
            </button>
            <div>
                <div>Overdue (<span className='font-semibold italic'>Till Today</span>)</div>
                <div className="text-base font-semibold text-red-600">Rs. {analytics?.overdue ?? '0'}</div>
            </div>
        </div>
    );
}
