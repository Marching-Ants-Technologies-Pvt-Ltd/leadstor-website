
import { useEffect, useState } from 'react';
import { xFetch } from '@/utility/xFetch';

export default function PaymentAnalyticsOfTheDay() {
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
    },[]);

    return (
        <div className="flex gap-7 text-xs text-slate-500">
            <div>
                <div>Today&apos;s Outstanding</div>
                <div className="text-base font-semibold text-slate-900">₹ {analytics?.outstanding ?? '0'}</div>
            </div>
            <div>
                <div>Collected Today</div>
                <div className="text-base font-semibold text-green-600">₹ {analytics?.received ?? '0'}</div>
            </div>
            <div>
                <div>Due Today</div>
                <div className="text-base font-semibold text-amber-600">₹ {analytics?.pending ?? '0'}</div>
            </div>
            <div>
                <div>Overdue (<span className='font-semibold italic'>Till Today</span>)</div>
                <div className="text-base font-semibold text-red-600">₹ {analytics?.overdue ?? '0'}</div>
            </div>
        </div>
    )
}