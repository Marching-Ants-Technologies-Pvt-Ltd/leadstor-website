"use client";

import React, { useEffect, useState, useMemo } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast } from "react-toastify";
import { Search, ChevronLeft, ChevronRight  } from "lucide-react";

// Toggle Switch Component
const Toggle = ({ checked, onChange }) => (
  <label className="inline-flex cursor-pointer items-center">
    <span className="relative">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={`block w-11 h-6 rounded-full transition ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      ></span>
      <span
        className={`dot absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition ${
          checked ? "translate-x-5" : ""
        }`}
      ></span>
    </span>
  </label>
);

export default function CurrencySettings() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  // ----------------------------
  // PAGINATION STATES
  // ----------------------------
  const [page, setPage] = useState(1);
  const limit = 5; // rows per page
  // ----------------------------

  // Fetch Data
  const loadData = () => {
    xFetch({ path: "/services/admin/getCurrencyList" })
      .then((data) => setList(data))
      .catch((err) => console.error("Currency fetch error", err));
  };

  useEffect(() => {
    loadData();
  }, []);

  // SEARCH filter
  const filteredList = useMemo(() => {
    if (!search.trim()) return list;

    const s = search.toLowerCase();
    return list.filter((row) => {
        const s = search.toLowerCase();
        return (
            row.name?.toLowerCase().includes(s) ||
            row.currency_name?.toLowerCase().includes(s) ||
            row.currency_code?.toLowerCase().includes(s)
        );
    });

  }, [search, list]);

  // ----------------------------
  // APPLY PAGINATION ON FILTERED LIST
  // ----------------------------
  const paginatedList = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredList.slice(start, start + limit);
  }, [filteredList, page]);

  const totalPages = Math.ceil(filteredList.length / limit);
  // ----------------------------

  // STATUS Toggle (multiple allowed)
    const toggleStatus = async (id, newStatus) => {
        try {
            await xFetch({
            path: "/services/admin/updateCurrencyStatusForSettings",
            method: "POST",
            payload: { 
                id: id,
                status: String(newStatus) 
            },
            });

            setList((prev) =>
            prev.map((i) =>
                i.ID === id ? { ...i, status: String(newStatus) } : i
            )
            );

            toast.success("Status updated");
        } catch (e) {
            toast.error("Failed to update status");
        }
    };


    const toggleDefault = async (id) => {
        try {
            await xFetch({
            path: "/services/admin/updateCurrencyStatusForSettings",
            method: "POST",
            payload: { 
                id: id,
                status: 1,    // Default currency must ALWAYS be active
                default: 1 
            },
            });

            // Update UI
            setList((prev) =>
            prev.map((i) => ({
                ...i,
                default_currency: i.ID === id ? "1" : "0",
                status: i.ID === id ? "1" : i.status,  // ensure ON in UI also
            }))
            );

            toast.success("Default currency updated");
        } catch (e) {
            toast.error("Failed to update default");
        }
    };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow">
      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <h2 className="text-xl">Currency Settings</h2>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search currency..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to first page on search
            }}
            className="pl-8 pr-3 py-2 border rounded-lg bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="p-3 border">Country</th>
            <th className="p-3 border">Currency Name</th>
            <th className="p-3 border">Symbol</th>
            <th className="p-3 border">Currency Code</th>
            <th className="p-3 border">Default</th>
            <th className="p-3 border">Status</th>
          </tr>
        </thead>

        <tbody>
          {paginatedList.map((item, index) => (
            <tr
              key={item.ID}
              className={index % 2 === 1 ? "bg-gray-50" : "bg-white"}
            >
              <td className="p-3 border">{item.name}</td>
              <td className="p-3 border">{item.currency_name}</td>
              <td className="p-3 border">{item.currency_symbol}</td>
              <td className="p-3 border">{item.currency_code}</td>

              {/* DEFAULT toggle */}
              <td className="p-3 border">
                <Toggle
                  checked={item.default_currency === "1"}
                  onChange={() => toggleDefault(item.ID)}
                />
              </td>

              {/* STATUS toggle */}
              <td className="p-3 border">
                <Toggle
                  checked={item.status === "1"}
                  onChange={(e) =>
                    toggleStatus(item.ID, e.target.checked ? 1 : 0)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-3 gap-2 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-3 py-1 rounded ${
            page === 1
              ? "bg-gray-200 text-gray-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-gray-700">
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          className={`px-3 py-1 rounded ${
            page === totalPages || totalPages === 0
              ? "bg-gray-200 text-gray-500"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}