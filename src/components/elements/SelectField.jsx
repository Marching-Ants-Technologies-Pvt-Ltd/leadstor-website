import { useEffect, useRef, useState } from "react";

// With Search
export function SelectFieldTypeArray({
    label,
    fieldName,
    required = false,
    options = [],
    selected = "",
    cbOnChange = () => { }
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef(null);

    const filteredOptions = options.filter(o =>
        o?.toLowerCase()?.includes(search?.toLowerCase())
    );

    // close on outside click
    useEffect(() => {
        const handler = e => {
            if (!wrapperRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && (
                    <span className="text-red-500 font-semibold text-lg absolute ml-1 -mt-1">*</span>
                )}
            </label>

            {/* Input */}
            <div
                onClick={() => setOpen(true)}
                className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center"
            >
                <input
                    type="text"
                    value={open ? search : selected}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Select..."
                    className="w-full outline-none bg-transparent"
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-48 overflow-auto shadow">
                    {filteredOptions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">
                            No results
                        </div>
                    )}

                    {filteredOptions.map(opt => (
                        <div
                            key={opt}
                            onClick={() => {
                                cbOnChange(fieldName, opt);
                                setSearch("");
                                setOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${opt === selected ? "bg-gray-100 font-medium" : ""
                                }`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function SelectFieldTypeArrayOfObject({
    label,
    fieldName,
    required = false,
    options = [],
    selected = null, // selected ID
    cbOnChange = () => { }
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef(null);

    const selectedOption = options.find(o => o.id === selected);

    const filteredOptions = options.filter(o =>
        o.value.toLowerCase().includes(search.toLowerCase())
    );

    // close on outside click
    useEffect(() => {
        const handler = e => {
            if (!wrapperRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && (
                    <span className="text-red-500 font-semibold text-lg absolute ml-1 -mt-1">*</span>
                )}
            </label>

            {/* Input */}
            <div
                onClick={() => setOpen(true)}
                className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center"
            >
                <input
                    type="text"
                    value={open ? search : selectedOption?.value || ""}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Select..."
                    className="w-full outline-none bg-transparent"
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-48 overflow-auto shadow">
                    {filteredOptions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">
                            No results
                        </div>
                    )}

                    {filteredOptions.map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => {
                                cbOnChange(fieldName, opt.id, opt);
                                setSearch("");
                                setOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${opt.id === selected
                                    ? "bg-gray-100 font-medium"
                                    : ""
                                }`}
                        >
                            {opt.value}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Search + Multi Select
export function MultiSelectField({
    label,
    fieldName,
    required = false,
    options = [],
    selected = [], // ['id', 'id']
    cbOnChange = () => { }
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef(null);

    const selectedSet = new Set(selected);

    const filteredOptions = options.filter(o =>
        o.value.toLowerCase().includes(search.toLowerCase())
    );

    console.log('SELECTED', selected);

    // close on outside click
    useEffect(() => {
        const handler = e => {
            if (!wrapperRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggleOption = (id) => {
        let updated;
        if (selectedSet.has(id)) {
            updated = selected.filter(x => x !== id);
        } else {
            updated = [...selected, id];
        }
        cbOnChange(fieldName, updated);
    };

    const selectedOptions = options.filter(o => selectedSet.has(o.id));

    const selectedLabels =
        selectedOptions.length === 0
            ? ""
            : selectedOptions.length === 1
                ? selectedOptions[0].value
                : `${selectedOptions[0].value} + ${selectedOptions.length - 1}`;

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && (
                    <span className="text-red-500 font-semibold text-lg absolute ml-1 -mt-1">*</span>
                )}
            </label>

            {/* Input */}
            <div
                onClick={() => setOpen(true)}
                className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center"
            >
                <input
                    type="text"
                    value={open ? search : selectedLabels}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Select..."
                    className="w-full outline-none bg-transparent"
                />

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-52 overflow-auto shadow">
                    {filteredOptions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">
                            No results
                        </div>
                    )}

                    {filteredOptions.map(opt => (
                        <label
                            key={opt.id}
                            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        >
                            <input
                                type="checkbox"
                                checked={selectedSet.has(opt.id)}
                                onChange={() => toggleOption(opt.id)}
                                className="cursor-pointer"
                            />
                            <span className="truncate">{opt.value}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

// Normal Select
export function SelectFieldDefault({
    label,
    fieldName,
    required = false,
    options = [],
    selected = null, // selected ID
    cbOnChange = () => { }
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedOption = options.find(o => o.id === selected);

    // close on outside click
    useEffect(() => {
        const handler = e => {
            if (!wrapperRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs text-gray-500 mb-1">
                {label}
                {required && (
                    <span className="text-red-500 font-semibold text-lg absolute ml-1 -mt-1">*</span>
                )}
            </label>

            {/* Display */}
            <div
                onClick={() => setOpen(prev => !prev)}
                className="w-full px-[10px] py-2 text-[13px] border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center"
            >
                <span className="truncate">
                    {selectedOption?.value || "Select..."}
                </span>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-48 overflow-auto shadow">
                    {options.map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => {
                                cbOnChange(fieldName, opt.id, opt);
                                setOpen(false);
                            }}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${opt.id === selected
                                    ? "bg-gray-100 font-medium"
                                    : ""
                                }`}
                        >
                            {opt.value}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
