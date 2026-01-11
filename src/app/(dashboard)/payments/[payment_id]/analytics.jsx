import { useEffect, useState } from 'react';

export default function JoineePaymentAnalytics({
    agreedPayment = 0,
    installments = {},
    currency = '?',
    onChat = () => { },
    gotoNotes = () => { },
    onSave = () => { }
}) {
    const [report, setReport] = useState({
        agreed: 0,
        refunded: 0,
        paid: 0,
        pending: 0,
        overdue: 0
    });

    useEffect(() => {
        let paidAmount = 0;
        let refundedAmount = 0;
        let overdueAmount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize

        Object.values(installments).forEach(item => {
            const amount = Math.abs(Number(item.amount) || 0);
            const status = Number(item.status) || 0;

            // Parse date like "11-Jan-2026"
            const installmentDate = new Date(item.date);

            if (status > 0 && status < 9) {
                paidAmount += amount;
            } else if (status > 9) {
                refundedAmount += amount;
            } else if (
                status === 0 &&
                installmentDate instanceof Date &&
                !isNaN(installmentDate) &&
                installmentDate < today
            ) {
                overdueAmount += amount;
            }
        });

        const safeAgreedPayment = Number(agreedPayment) || 0;
        const effectivePaid = Math.max(paidAmount - refundedAmount, 0);
        const pendingAmount = Math.max(
            safeAgreedPayment - effectivePaid,
            0
        );

        setReport({
            agreed: safeAgreedPayment,
            paid: paidAmount,
            refunded: refundedAmount,
            pending: pendingAmount,
            overdue: overdueAmount,
        });
    }, [installments, agreedPayment]);

    return (
        <div className="bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center">
            <div className="flex gap-7 text-xs text-slate-500">
                <div>
                    <div>Total Agreed</div>
                    <div className="text-base font-semibold text-slate-900">{currency} {agreedPayment}</div>
                </div>
                <div>
                    <div>Total Paid</div>
                    <div className="text-base font-semibold text-green-600">{currency} {report.paid}</div>
                </div>
                <div>
                    <div>Pending</div>
                    <div className="text-base font-semibold text-amber-600">{currency} {report.pending}</div>
                </div>
                <div>
                    <div>Refunded</div>
                    <div className="text-base font-semibold text-blue-600">{currency} {report.refunded}</div>
                </div>
                <div>
                    <div>Overdue</div>
                    <div className="text-base font-semibold text-red-600">{currency} {report.overdue}</div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-slate-300 rounded bg-slate-50" onClick={gotoNotes}>📝 Add Note</button>
                <button className="px-4 py-2 text-sm rounded bg-green-500 text-white" onClick={onChat}>Chat On WhatsApp</button>
                <button className="px-4 py-2 text-sm border border-blue-500 bg-blue-500 rounded text-white" onClick={onSave}>Save Changes</button>
            </div>
        </div>

    );

}