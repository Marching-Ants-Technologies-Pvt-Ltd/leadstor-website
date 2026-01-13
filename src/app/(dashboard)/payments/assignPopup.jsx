import { useState } from 'react';

export default function AssignPopup({
    open,
    title = "Assign User",
    description = "",
    currentId,
    items = {},
    onAction,
    onClose
}) {
    const [search, setSearch] = useState('');
    if (!open) return null;

    let isListEmpty = (Object.entries(items).length < 1);
    if (isListEmpty) {
        description = `It seems like the list of your ${title.toLocaleLowerCase().split(' ')[1]}s is empty.`;
        title = `Oops! No Record Found`;
    }

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

                <div className="w-full p-2 border border-gray-300 mb-2 rounded-sm relative">
                    <input
                        type="text"
                        value={search}
                        placeholder="Search... or type @ to find assigned one"
                        className='pl-6 w-full outline-none'
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute left-[9px] -top-[2px] text-3xl text-gray-400">⌕</div>
                </div>

                {!isListEmpty && (

                    <div>
                        <div className="max-h-[300px] overflow-y-auto border rounded">
                            {Object.entries(items).filter(([id, name]) => {
                                return search.includes("@")
                                    ? id === currentId
                                    : name?.toLowerCase()?.includes(search.toLowerCase());
                            }).map(([id, name]) => {
                                const isActive = id === currentId;

                                return (
                                    <div
                                        key={id}
                                        className={`flex items-center justify-between px-3 py-2 border-b last:border-b-0 ${isActive ? "bg-blue-50" : "hover:bg-gray-50"}`}
                                    >
                                        <div>
                                            <div className="text-base text-gray-800">
                                                {name}
                                            </div>
                                            <div className="text-xs text-gray-500 hidden">
                                                ID: {id}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                onAction?.(id, isActive ? "unassign" : "assign")
                                            }
                                            className={`px-3 py-1 text-xs font-semibold rounded ${isActive ? "bg-green-600 text-white hover:green-red-700 pointer-events-none" : "border-blue-600 border text-blue-600 hover:text-white hover:bg-blue-600"}`}
                                        >
                                            {isActive ? "✔ Assigned" : "Assign"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {(!['0', '-1'].includes(currentId) && Object.keys(items).includes(currentId)) &&
                            <div className="flex justify-center mt-4 bg-red-100 border rounded-md border-red-700">
                                <button
                                    onClick={() => onAction?.('-1', 'assign')}
                                    className="px-4 py-2 text-sm text-red-600 font-semibold"
                                >
                                    ✘ Unassign {items[currentId]}
                                </button>
                            </div>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}
