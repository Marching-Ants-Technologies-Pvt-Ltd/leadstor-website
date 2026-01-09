import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DayPickerModal({
    open,
    onConfirm,
    onClose,
    currentDate = '',
}) {

    if (!open) return null;

    const changeInDay = (e) => {
        onConfirm?.(e);
        onClose?.();
    }

    function parseDateTime(dateTimeStr) {
        if (!dateTimeStr || !dateTimeStr.trim()) return undefined;
        const isoLike = dateTimeStr.replace(" ", "T");
        return new Date(isoLike);
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
                    selected={parseDateTime(currentDate)}
                    defaultMonth={parseDateTime(currentDate)}
                    onSelect={changeInDay}
                    numberOfMonths={1}
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - 2}
                    toYear={new Date().getFullYear()}
                    className="mx-auto"
                />
            </div>
        </div>
    );
}
