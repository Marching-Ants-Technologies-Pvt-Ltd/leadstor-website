"use client";
import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { Search } from "lucide-react";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

export default function FieldMapping() {
  const [fields, setFields] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const fetchMapping = () => {
        setLoading(true);
        xFetch({
            path: "/services/profile/getCustomizedFields"
        })
        .then((res) => {
        setFields(res);
        setFiltered(res);

        // Pre-select already mapped fields
        const selected = res.filter((x) => x.selected).map((x) => x.id);
            setSelectedIds(selected);
        })
        .finally(() => setLoading(false));
    };


  useEffect(() => {
    fetchMapping();
  }, []);

  // Search Filter
  useEffect(() => {
    const result = fields.filter((f) =>
      f.label.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setCurrentPage(1);
  }, [search, fields]);

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  const toggleCheckbox = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const payload = {
      selectedFields: selectedIds,
    };

    setLoading(true);
    xFetch({
      path: "/services/profile/updateFieldMapping",
      method: "POST",
      payload,
    })
      .then(() => toast.success("Field mapping updated successfully"))
      .catch(() => toast.error("Error saving field mapping"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Field Mapping</h2>

        <div className="flex items-center gap-2">
          <div className="flex items-center px-2 border rounded bg-white">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search field..."
              className="px-2 py-1 text-sm bg-white outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-left">
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={
                    currentRecords.length > 0 &&
                    currentRecords.every((r) => selectedIds.includes(r.id))
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newIds = [
                        ...new Set([
                          ...selectedIds,
                          ...currentRecords.map((r) => r.id),
                        ]),
                      ];
                      setSelectedIds(newIds);
                    } else {
                      const filteredIds = selectedIds.filter(
                        (id) => !currentRecords.map((r) => r.id).includes(id)
                      );
                      setSelectedIds(filteredIds);
                    }
                  }}
                />
              </th>
              <th className="p-2">Sr.</th>
              <th className="p-2">Label</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No fields found
                </td>
              </tr>
            ) : (
              currentRecords.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 1 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleCheckbox(row.id)}
                    />
                  </td>
                  <td className="p-2">{row.sr}</td>
                  <td className="p-2">{row.label}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 text-sm">
          <p>
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filtered.length)} of {filtered.length} rows
          </p>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50 bg-white"
            >
              Prev
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50 bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Update"}
        </button>
      </div>
    </div>
  );
}
