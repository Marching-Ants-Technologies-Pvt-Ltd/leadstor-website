import { useState } from "react";

function getLastFourMonths() {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 4; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleString("default", { month: "short" }),
            value: i // d.toISOString().split("T")[0] // YYYY-MM-DD
        });
    }
    return months.reverse();
}

export default function ReportDropdown({ onChange }) {
    const [open, setOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("Download Reports");
    const months = getLastFourMonths();

    const handleSelect = (value, label) => {
        setSelectedLabel(label);
        setOpen(false);
        onChange?.(value, label);
    };

    return (
        <div className="relative w-44 text-sm">
            {/* Trigger */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full border rounded px-3 py-2 text-left bg-white flex justify-between items-center"
            >
                <span>{selectedLabel}</span>
                <span className="text-gray-400">▾</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute mt-1 w-full border rounded bg-white shadow-lg z-50" style={{ zoom: .9 }}>
                    {/* Collections */}
                    <Section title="Collections">
                        {months.map(m => (
                            <Item key={m.value} value={'Collection@' + m.value} label={m.label} onSelect={handleSelect} />
                        ))}
                        <Item label="Custom Duration" value="Collection@Custom" onSelect={handleSelect} />
                    </Section>

                    {/* Joinees */}
                    <Section title="Joinees">
                        {months.map(m => (
                            <Item key={m.value} value={'Joinee@' + m.value} label={m.label} onSelect={handleSelect} />
                        ))}
                        <Item label="Custom Duration" value="Joinee@Custom" onSelect={handleSelect} />
                    </Section>

                    {/* Pending Payments */}
                    <Section title="Pending Payments">
                        <Item label="Balance" value="pending@balance" onSelect={handleSelect} />
                        <Item label="Custom Duration" value="pending@Custom" onSelect={handleSelect} />
                    </Section>

                    {/* Reports: Intentionally Keeping It Hidden as we have to fix the dashboard.cn codes first

                    <Section title="Joinees Report">
                        <Item label="Download" value="Joinee@download" onSelect={handleSelect} />
                    </Section>

                    <Section title="Joinees Detailed Report">
                        <Item label="Download" value="Joinee@detailed_download" onSelect={handleSelect} />
                    </Section>

                    */}
                </div>
            )}
        </div>
    );
}

/* ---------- Helpers ---------- */

function Section({ title, children }) {
    return (
        <div className="px-2 py-1">
            <div className="font-semibold text-gray-700 px-2 py-1">
                {title}
            </div>
            {children}
        </div>
    );
}

function Item({ label, value, active, onSelect }) {
    return (
        <div
            onClick={() => onSelect(value, label)}
            data-value={value}
            className={`px-5 py-1 rounded cursor-pointer
        ${active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"}
      `}
        >
            {label}
        </div>
    );
}
