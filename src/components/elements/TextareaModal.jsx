import { useState, useEffect } from "react";

export default function TextareaModal({
    open,
    title = "Enter Text",
    description = "",
    primaryText = "Confirm",
    placeholder = "Type here...",
    rows = 4,
    maxChar = 0,
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
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-[420px] p-5">
                {/* Top-right actions */}
                <div className="absolute -top-10 right-0 flex gap-2">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow hover:bg-gray-100"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

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
                    rows={rows}
                    className="w-full border rounded px-3 py-2 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder}
                />
                {maxChar > 0 &&
                    <div className={`text-right text-xs font-medium ${(text.length > maxChar) ? 'text-rose-600' : 'text-gray-500'}`}>{text.length}/{maxChar} Characters</div>
                }

                <div className="flex justify-end gap-3 mt-5">
                    <button
                        disabled={!text.trim()}
                        onClick={handleConfirm}
                        className={`px-4 py-1.5 text-sm rounded border font-normal ${text.trim() &&
                                (maxChar > 0 ? text.trim().length <= maxChar : true)
                                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                : "bg-gray-100 text-gray-700 border-gray-300 cursor-not-allowed"}`
                        }
                    >
                        {primaryText} to {open} Candidates
                    </button>
                </div>
            </div>
        </div>
    );
}
