export default function ConfirmDelete({
    open,
    title = "Confirm Delete",
    description = "Are you sure you want to delete this item?",
    onConfirm,
    onClose
}) {
    if (!open) return null;

    const handleConfirm = async () => {
        await onConfirm?.();   // execute callback
        onClose?.();           // auto close after confirm
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl min-w-[400px] max-w-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800">
                    {title}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                    {description}
                </p>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded border hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
