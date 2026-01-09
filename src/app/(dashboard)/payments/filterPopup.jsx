import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const SECTIONS = [
    { key: "course_label", label: "Course", options: [] },
    { key: "source", label: "Source", options: [] },
    { key: "counsellor", label: "Counsellor", options: [] },
    { key: "trainer", label: "Trainer", options: [] },
    { key: "batch_name", label: "Batch", options: [] },
    { key: "status", label: "Status", options: [] },
    { key: "date", label: "Date Range" }
];

export default function FilterPopup({ open, onApply, onClose }) {

    const [active, setActive] = useState('');
    const [selected, setSelected] = useState({});
    const [range, setRange] = useState({ from: null, to: null });

    useEffect(() => {
        if (open) {
            setActive(SECTIONS[0].key);
            setSelected({});
            setRange({ from: null, to: null });
        }
    }, [open]);

    if (!open) return null;

    // Set data in section
    SECTIONS[0].options = Object.entries(open?.filterParams?.labels || {}).map(
        ([key, value]) => ({
            id: value,
            value: value
        })
    );

    SECTIONS[1].options = Object.entries(open?.filterParams?.source || {}).map(
        ([key, value]) => ({
            id: value,
            value: value
        })
    );

    SECTIONS[2].options = Object.entries(open?.counsellor || {}).map(
        ([key, value]) => ({
            id: key,
            value: value
        })
    );

    SECTIONS[3].options = Object.entries(open?.trainer || {}).map(
        ([key, value]) => ({
            id: key,
            value: value
        })
    );

    SECTIONS[4].options = Object.entries(open?.filterParams?.batchNames || {}).map(
        ([key, value]) => ({
            id: key,
            value: value
        })
    );

    SECTIONS[5].options = Object.entries(open?.filterParams?.statuses || {}).map(
        ([key, value]) => ({
            id: key,
            value: value
        })
    );

    const toggleOption = (section, id) => {
        setSelected(prev => {
            const list = prev[section] || [];
            return {
                ...prev,
                [section]: list.includes(id)
                    ? list.filter(v => v !== id)
                    : [...list, id]
            };
        });
    };


    const getCount = (key) =>
        key === "date"
            ? range.from && range.to ? 1 : 0
            : selected[key]?.length || 0;

    const hasFilters =
        Object.values(selected).some(v => v?.length) ||
        (range.from && range.to);

    const handleClear = () => {
        setSelected({});
        setRange({ from: null, to: null });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-[572px] h-[480px] flex">

                {/* Top-right actions */}
                <div className="absolute -top-10 right-0 flex gap-2">
                    {hasFilters && (
                        <button
                            onClick={handleClear}
                            className="px-3 py-1 pr-4 text-xs bg-transparent border-2 border-white text-white font-semibold rounded-full shadow hover:bg-gray-100 hover:text-gray-900"
                        >
                            🧹 Clear Filter
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white border shadow hover:bg-gray-100"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* LEFT MENU */}
                <div className="w-56 border-r p-4 space-y-1 relative">
                    <h3 className="text-sm font-semibold mb-1">
                        Filters
                    </h3>
                    <p className="text-xs text-gray-500">
                        Select filters to apply
                    </p>
                    <div className="h-1"></div>

                    {SECTIONS.map(s => {
                        const count = getCount(s.key);
                        return (
                            <button
                                key={s.key}
                                onClick={() => setActive(s.key)}
                                className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between ${active === s.key ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"}`}>
                                <span>{s.label}</span>
                                {count > 0 && (
                                    <span className="text-xs bg-blue-600 text-white px-2 pt-[1px] rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-white">
                        <button
                            onClick={() => {
                                onApply?.({ selected, range });
                                onClose?.();
                            }}
                            className="w-full px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex-1 p-5">

                    {/* Checkbox sections */}
                    {(SECTIONS.length > 1) && SECTIONS.slice(0, 6).map(s => (
                        active === s.key && (
                            <div key={s.key}>
                                <h4 className="text-sm font-semibold mb-5">
                                    {s.label}
                                </h4>

                                <div className="space-y-2 h-[400px] overflow-y-auto">
                                    {s?.options?.map(opt => (
                                        <label
                                            key={opt.id}
                                            className="flex items-center gap-2 text-sm cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected[s.key]?.includes(opt.id) || false}
                                                onChange={() => toggleOption(s.key, opt.id)}
                                            />
                                            {opt.value}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}

                    {/* Date Range */}
                    {active === "date" && (
                        <div>
                            <div className="mb-3 flex justify-between">
                                <h4 className="text-sm font-semibold">
                                    Date Range
                                </h4>
                                <button onClick={() => setRange({ from: null, to: null })}>⟳ Reset</button>
                            </div>

                            <DayPicker
                                mode="range"
                                selected={range}
                                onSelect={setRange}
                                captionLayout="dropdown"
                                fromYear={new Date().getFullYear() - 5}
                                toYear={new Date().getFullYear()}
                            />


                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}