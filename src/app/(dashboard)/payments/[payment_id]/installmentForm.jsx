import { useState, useEffect } from "react";
import { STATUS, MonthNameAsKey, MonthNameByIndex } from '../paymentUtils';
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function JoineeInstallmentForm({
    data,
    onConfirm,
    onAlert,
    onClose
}) {

    const [record, setRecord] = useState(null);
    const [status, setStatus] = useState('0');
    const [datePickerType, setDatePickerType] = useState('installment');
    const [month, setMonth] = useState();
    const [receiptDate, setReceiptDate] = useState(new Date());

    useEffect(() => {
        if (data) {
            setRecord({ ...data });
            setDatePickerType('installment');
            setStatus(data?.status ?? '0');

            if (data?.date) {
                const parsed = parseDate(data.date);
                setMonth(parsed);
            }
            console.log(data);
        }
    }, [data]);


    if (!data) return null;

    const handleConfirm = async () => {

        let payload = {... record};
        if (!payload?.status) payload['status'] = '0';
        
        console.log({record, status, payload});
        // Installment status is changed and it is not 0
        if (payload.status !== '0' && payload.status !== status){
            if (!record?.receipt_date){
                console.log(`Installment Status Is Changed But Receipt Date Is not Specified`);
                onAlert?.(`Please update Payment Receipt Date to update this installment.`);
                return;
            }
        }

        // Check installment amount must not be blank or 0
        if (payload.amount === '' || parseInt(payload.amount) < 1) {
            onAlert?.(`Please provide a valid amount for this installment.`);
            return;
        }

        await onConfirm?.(payload);
        onClose?.();
    };

    const onRecChange = (key, value) => {
        setRecord((prev) => ({
            ...prev,
            [key]: value
        }));

        if (key === 'status' && value !== '0') {
            setDatePickerType('receipt');
        }
    }

    function parseDate(dateStr) {
        if (!dateStr || typeof dateStr !== "string") return undefined;

        const [day, monthStr, year] = dateStr.split("-");
        if (!day || !monthStr || !year) return undefined;

        const month = MonthNameAsKey[monthStr];
        if (month === undefined) return undefined;

        const date = new Date(
            Number(year),
            month,
            Number(day)
        );

        return date;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-[700px] p-5">
                {/* Top-right actions */}
                <div className="absolute -top-10 right-0 flex gap-2">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex text-xs font-semibold items-center justify-center text-white border-white rounded-full bg-transparent border-2 shadow hover:bg-red-500 hover:border-red-500"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-800">
                    Installment | {record?.type ?? '?'}
                </h3>

                <p className="text-sm text-gray-600 mt-0 border-b border-gray-200 pb-4">
                    Please make sure the details you provide are correct, also you are free to edit this anytime
                </p>

                <div className="flex gap-8 mt-4 flex-row-reverse">
                    <div className="w-[260px] relative">
                        {/* Amount */}
                        <div className="flex flex-col gap-1 mb-3 -mt-1 relative">
                            <label className="text-sm font-medium text-gray-700">
                                Installment Amount
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={record?.amount ?? 0}
                                onChange={(e) => onRecChange("amount", e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="absolute text-base font-semibold top-7 mt-0.5 left-3 text-gray-600">{record?.currencyIcon ?? '?'}</span>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1 mb-3 relative">
                            <label className="text-sm font-medium text-gray-700">
                                Payment Status
                            </label>
                            <select
                                value={record?.status ?? "0"}
                                onChange={(e) => onRecChange("status", e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                {Object.entries(STATUS).map(([key, value]) => (
                                    <option key={key} value={key}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <div className='w-5 h-5 bg-white absolute bottom-2 right-1 flex justify-start items-center align-middle pointer-events-none'>
                                <svg className='mt-0.5' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="#000" fill="none" stroke="#141B34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9" />
                                </svg>
                            </div>
                        </div>

                        {/* Reference No */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Reference Number
                            </label>
                            <input
                                type="text"
                                name="refNo"
                                placeholder="e.g. RCT202601XXXXXX"
                                value={record?.refNo ?? ""}
                                onChange={(e) => onRecChange("refNo", e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="absolute bottom-0 left-0 w-full px-4">
                            <button
                                onClick={handleConfirm}
                                className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>

                    </div>

                    <div className="flex-1">
                        {/* Installment Date */}
                        <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-gray-700 border border-gray-300 p-2 rounded-md flex items-center gap-2">
                                <div
                                    className={`flex-1 cursor-pointer ${datePickerType !== 'installment' ? 'grayscale' : ''}`}
                                    onClick={() => setDatePickerType('installment')}
                                >📅 Installment Date</div>
                                <div
                                    className={`flex-1 border-l border-gray-300 pl-4 cursor-pointer ${datePickerType !== 'receipt' ? 'grayscale' : ''}`}
                                    onClick={() => setDatePickerType('receipt')}
                                >📅 Receipt Date</div>
                            </div>

                            {datePickerType === 'installment' ? (
                                <DayPicker
                                    mode="single"
                                    selected={parseDate(record?.date)}
                                    onMonthChange={setMonth}
                                    month={month}
                                    onSelect={(date) => {
                                        if(!date) return;
                                        let receiptDateTxt = `${date.getDate()}-${MonthNameByIndex[date.getMonth()]}-${date.getFullYear()}`
                                        onRecChange("date", receiptDateTxt);
                                    }}
                                    numberOfMonths={1}
                                    captionLayout="dropdown"
                                    fromYear={new Date().getFullYear() - 2}
                                    toYear={new Date().getFullYear()}
                                    className="mx-auto"
                                />
                            ) : (
                                <DayPicker
                                    mode="single"
                                    selected={receiptDate}
                                    month={receiptDate}
                                    onSelect={(date) => {
                                        if(!date) return;
                                        setReceiptDate(date);
                                        let receiptDateTxt = `${date.getDate()}-${MonthNameByIndex[date.getMonth()]}-${date.getFullYear()}`
                                        onRecChange("receipt_date", receiptDateTxt);
                                    }}
                                    numberOfMonths={1}
                                    captionLayout="dropdown"
                                    fromYear={new Date().getFullYear() - 2}
                                    toYear={new Date().getFullYear()}
                                    className="mx-auto"
                                />
                            )}

                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}