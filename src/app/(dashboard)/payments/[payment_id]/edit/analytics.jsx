
export default function JoineePaymentAnalytics({ payment_id }) {
    return (
        <div class="bg-white border-b border-gray-200 px-6 py-4">
            <div class="max-w-[1400px] mx-auto grid grid-cols-5 gap-4">

                <div class="bg-slate-50 rounded-lg p-3">
                    <span class="block text-xs text-gray-500 mb-1">
                        Total Agreed
                    </span>
                    <strong class="text-base font-semibold">
                        ₹27,000
                    </strong>
                </div>

                <div class="bg-slate-50 rounded-lg p-3">
                    <span class="block text-xs text-gray-500 mb-1">
                        Total Scheduled
                    </span>
                    <strong class="text-base font-semibold">
                        ₹20,000
                    </strong>
                </div>

                <div class="bg-slate-50 rounded-lg p-3">
                    <span class="block text-xs text-gray-500 mb-1">
                        Total Paid
                    </span>
                    <strong class="text-base font-semibold text-green-600">
                        ₹10,000
                    </strong>
                </div>

                <div class="bg-slate-50 rounded-lg p-3">
                    <span class="block text-xs text-gray-500 mb-1">
                        Pending
                    </span>
                    <strong class="text-base font-semibold text-orange-600">
                        ₹10,000
                    </strong>
                </div>

                <div class="bg-slate-50 rounded-lg p-3">
                    <span class="block text-xs text-gray-500 mb-1">
                        Overdue
                    </span>
                    <strong class="text-base font-semibold text-red-600">
                        ₹5,000
                    </strong>
                </div>

            </div>
        </div>

    );

}