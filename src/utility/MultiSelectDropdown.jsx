import { useState, useRef, useEffect } from 'react';

export default function MultiSelectDropdown({
  label,
  options = [],
  value = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleValue = v => {
    onChange(
      value.includes(v)
        ? value.filter(x => x !== v)
        : [...value, v]
    );
  };

  const displayText =
    value.length === 0
      ? 'All'
      : value.length === 1
      ? value[0]
      : `${value[0]} +${value.length - 1}`;

  return (
    <div ref={ref} className="relative">
      <label className="text-xs text-slate-500">{label}</label>

      <div
        className="w-full border rounded-lg px-3 py-2 text-sm cursor-pointer bg-white"
        onClick={() => setOpen(o => !o)}
      >
        {displayText}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg">
          {/* scroll container */}
          <div className="max-h-80 overflow-y-auto">
            {options.map(opt => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* footer */}
          <div className="flex gap-2 p-2 border-t">
            <button
              className="text-xs px-2 py-1 border rounded"
              onClick={() => onChange([])}
            >
              Clear
            </button>
            <button
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
              onClick={() => setOpen(false)}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
