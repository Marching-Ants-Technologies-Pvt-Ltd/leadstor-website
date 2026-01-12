import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DateRangeModal({
    open,
    onConfirm,
    onClose
}) {
    const [range, setRange] = useState({ from: null, to: null });

    useEffect(() => {
        if (open) {
            setRange({ from: null, to: null });
        }
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        if (!range.from || !range.to) return;
        onConfirm?.({
            startDate: range.from,
            endDate: range.to
        });
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl p-5">

                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    numberOfMonths={1}
                    captionLayout="dropdown"
                    fromYear={(new Date().getFullYear() - 2)}
                    toYear={new Date().getFullYear()}
                    className="mx-auto"
                />

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={(e) => setRange({ from: null, to: null })}
                        className="px-4 py-2 text-sm rounded border hover:bg-gray-100"
                    >
                    🧹 Reset
                    </button>

                    <button
                        disabled={!range.from || !range.to}
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm rounded text-white ${range.from && range.to ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"}`}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}
