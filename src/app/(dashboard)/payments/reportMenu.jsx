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

export default function ReportDropdown({ onChange, open }) {

    if (!open) return;

    const months = getLastFourMonths();

    const handleSelect = (value, label) => {
        onChange?.(value, label);
    };

    return (
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
                <Item label="Balance" value="PendingPayment@balance" onSelect={handleSelect} />
                <Item label="Custom Duration" value="PendingPayment@Custom" onSelect={handleSelect} />
            </Section>

            <div className="bg-gray-50 border-t border-gray-300 font-semibold py-2 hidden">
                <Item label="Joinees Detailed Report" value="Joinee@detailed_download" onSelect={handleSelect} />
                <div className="w-full h-1"></div>
                <Item label="Joinees Filtered Report" value="Joinee@download" onSelect={handleSelect} />
            </div>

            <Section title="Joinees Report">
                {(open?.filtered) ? (
                    <div className="relative">
                        <Item label="Filtered" value="Joinee@Download" onSelect={handleSelect} />
                        <div className="text-[11px] bg-green-600 text-white rounded-full absolute top-0.5 right-2 px-2 z-10">New</div>
                        <div className="absolute w-12 h-6 rounded-full top-0 right-1 bg-green-400 animate-ping"></div>
                    </div>
                ) : (
                    <Item label="All Records" value="Joinee@Download" onSelect={handleSelect} />
                )
                } 
                <Item label="Detailed" value="Joinee@Detailed_Download" onSelect={handleSelect} />
            </Section>

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
