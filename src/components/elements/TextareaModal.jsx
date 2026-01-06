import { useState, useEffect } from "react";

export default function TextareaModal({
    open,
    title = "Enter Text",
    description = "",
    primaryText = "Confirm",
    placeholder = "Type here...",
    onConfirm,
    onClose
}) {
    const [text, setText] = useState("");

    // reset when opened
    useEffect(() => {
        if (open) setText("");
    }, [open]);

    if (!open) return null;

    const handleConfirm = () => {
        if (!text.trim()) return;
        onConfirm?.(text);
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
            <div className="relative bg-white rounded-lg shadow-xl w-[420px] p-5">
                <h3 className="text-lg font-semibold text-gray-800">
                    {title}
                </h3>

                {description && (
                    <p className="text-sm text-gray-600 mb-4">
                        {description}
                    </p>
                )}

                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full border rounded px-3 py-2 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder}
                />

                <div className="flex justify-end gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded border hover:bg-gray-100"
                    >
                        Close
                    </button>

                    <button
                        disabled={!text.trim()}
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm rounded text-white ${text.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                    >
                        {primaryText}
                    </button>
                </div>
            </div>
        </div>
    );
}
