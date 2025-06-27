'use client';

import { LeadsCurrentPage } from "@/utility/TinyDB";
export default function SearchBox() {

    let searchTextChangeTimer;
    let lastText = '';
    const onSearchInput = (e) => {
        if (typeof window.tableRefresh !== 'function') return;
        if (searchTextChangeTimer) clearTimeout(searchTextChangeTimer);

        // This check if to avoid search on non alphanumeric key press
        if (lastText.length > 0 && e.target.value == lastText) return;
        lastText = e.target.value;

        searchTextChangeTimer = setTimeout(() => {
            LeadsCurrentPage.setValue(1);
            window.tableRefresh();
        }, 750);
    }
    return (
        <div id="table-search-bar" className="border rounded-md h-full flex px-2 gap-1.5 max-w-80">
            <div className="flex justify-center items-center border-r pr-2">
                <i className="ri-search-line text-lg text-gray-600"></i>
            </div>
            <input
                onKeyUp={onSearchInput}
                type="text"
                placeholder="Search by name/email . . ."
                className="w-full text-base bg-transparent outline-none" />
        </div>
    )
}