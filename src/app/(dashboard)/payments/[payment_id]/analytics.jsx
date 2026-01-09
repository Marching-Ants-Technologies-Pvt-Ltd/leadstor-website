
export default function JoineePaymentAnalytics({ 
    agreed = '0',
    paid = '0',
    pending = '0',
    upcoming = '0',
    overdue = '0',
    currency = '?',
    onChat = () => {},
    gotoNotes = () => {}
}) {
    return (
        <div className="bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center">
            <div className="flex gap-7 text-xs text-slate-500">
                <div>
                    <div>Total Agreed</div>
                    <div className="text-base font-semibold text-slate-900">{currency} {agreed}</div>
                </div>
                <div>
                    <div>Total Paid</div>
                    <div className="text-base font-semibold text-green-600">{currency} {paid}</div>
                </div>
                <div>
                    <div>Pending</div>
                    <div className="text-base font-semibold text-amber-600">{currency} {pending}</div>
                </div>
                <div>
                    <div>Upcoming</div>
                    <div className="text-base font-semibold text-blue-600">{currency} {upcoming}</div>
                </div>
                <div>
                    <div>Overdue</div>
                    <div className="text-base font-semibold text-red-600">{currency} {overdue}</div>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="px-4 py-2 text-sm border border-slate-300 rounded bg-slate-50" onClick={gotoNotes}>📝 Add Note</button>
                <button className="px-4 py-2 text-sm rounded bg-green-500 text-white" onClick={onChat}>Chat On WhatsApp</button>
                <button className="px-4 py-2 text-sm border border-blue-500 bg-blue-500 rounded text-white">Save Changes</button>
            </div>
        </div>

    );

}