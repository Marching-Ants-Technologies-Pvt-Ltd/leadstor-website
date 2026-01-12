import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DayPickerModal({
    open,
    onConfirm,
    onClose,
}) {

    const [month, setMonth] = useState();

    useEffect(() => {
        if (open?.date) {
            const parsed = parseDate(open.date);
            setMonth(parsed);
            console.log({ parsed, open });
        }
    }, [open]);

    if (!open) return null;
    const selectedDate = open?.date ? parseDate(open.date) : undefined;

    const changeInDay = (e) => {
        onConfirm?.(e);
        onClose?.();
    }

    function parseDate(dateStr) {
        return new Date(dateStr.replace(" ", "T"));
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl px-5 py-4">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onMonthChange={setMonth}
                    month={month}
                    onSelect={changeInDay}
                    numberOfMonths={1}
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - 4}
                    toYear={new Date().getFullYear()}
                    className="mx-auto"
                />
            </div>
        </div>
    );
}
