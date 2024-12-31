import { useState } from "react";

let onCloseFn;
let filterOptionsFn;

export function showAppliedFilter(items = {}, onClose = null) {

    if (onClose && typeof onClose === 'function') onCloseFn = onClose;
    filterOptionsFn(items);
}

export default function AppliedFilters() {

    const [filterOptions, setFilterOptions] = useState(null);
    filterOptionsFn = setFilterOptions;

    const handelClose = (event) => {
        setFilterOptions(null);
        if (onCloseFn) onCloseFn();
    }

    return (
        <div
            style={{
                display: (filterOptions) ? 'flex' : 'none',
            }}
            className="bg-orange-50 w-full p-3 poppins flex-row">
            <div className="flex justify-start items-start gap-1 text-gray-600 border-r pr-3">
                <i className="ri-filter-fill text-lg"></i>
                <div className="font-medium text-sm relative top-1">Filters</div>
            </div>

            <div className="grow flex justify-start flex-wrap items-center text-sm text-gray-700 px-3 gap-3">
                {filterOptions && Object.entries(filterOptions).map(([key, value]) => (
                    <div key={key} className="bg-white border rounded-[4px] py-1 px-3">
                        <strong className="font-medium">{key}</strong> in ({value})
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-start border-l pl-3 pr-1">
                <i onClick={handelClose} className="ri-close-large-fill text-rose-500 font-semibold cursor-pointer relative top-0.5"></i>
            </div>
        </div>
    );
}