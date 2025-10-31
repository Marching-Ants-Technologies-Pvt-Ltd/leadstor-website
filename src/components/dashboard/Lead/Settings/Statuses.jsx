"use client";
import { xFetch } from "@/utility/xFetch";
import { useEffect, useState } from "react";
import { Search, Trash2, Edit3, Plus } from "lucide-react";

export default function Statuses({ corporateId = 64 }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, status: "", isFollowup: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const fetchData = () => {
    setLoading(true);
    xFetch({
      path: `/services/profile/getStatuses`,
      payload: { corporateId },
    })
      .then((res) => {
        setData(res);
        setFilteredData(res);
      })
      .catch((err) => {
        console.error("Error fetching statuses:", err);
        setData([]);
        setFilteredData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [corporateId]);

  // Search
  useEffect(() => {
    const result = data.filter((row) =>
      row.status.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(result);
    setCurrentPage(1);
  }, [search, data]);

  // Pagination calculation
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSave = () => {
    const newErrors = {};
    if (!form.status) newErrors.status = "Status name is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const url = editing
      ? "/services/profile/updateStatusesSettings"
      : "/services/profile/addStatusesSettings";

    const payload = { ...form, corporateId };
    xFetch({ path: url, method: "POST", payload })
      .then(() => {
        setShowModal(false);
        setForm({ id: null, status: "", isFollowup: 0 });
        setEditing(false);
        setErrors({});
        fetchData();
      })
      .catch((err) => console.error("Error saving status:", err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this status?")) return;
    xFetch({
      path: "/services/profile/deleteStatuses",
      method: "POST",
      payload: { statusId: id },
    })
      .then(() => fetchData())
      .catch((err) => console.error("Error deleting status:", err));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert("No records selected");
    if (!window.confirm("Delete selected records?")) return;

    for (const id of selectedIds) {
      await xFetch({
        path: "/services/profile/deleteStatuses",
        method: "POST",
        payload: { statusId: id },
      }).catch((err) => console.error("Error deleting status:", err));
    }

    setSelectedIds([]);
    fetchData();
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Statuses</h2>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              Delete Selected
            </button>
          )}
          <button
            onClick={() => {
              setEditing(false);
              setForm({ id: null, status: "", isFollowup: 0 });
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
          >
            + Add
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === currentRecords.length &&
                      currentRecords.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedIds(currentRecords.map((r) => r.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Follow-up</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => handleCheckboxChange(row.id)}
                    />
                  </td>
                  <td className="p-2">{row.status}</td>
                  <td className="p-2">
                    {row.isFollowup === 1 ? "Needed" : "Not Needed"}
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => {
                        setForm(row);
                        setEditing(true);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-600 hover:underline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentRecords.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-3">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center py-3 space-x-2 text-sm">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
            <h3 className="text-lg font-bold mb-4">
              {editing ? "Update" : "Add"} Status
            </h3>

            <input
              name="status"
              placeholder="Status Name"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-2 mb-3 
                bg-white text-gray-900 placeholder-gray-400 focus:outline-none 
                focus:ring-2 focus:ring-blue-500"
            />
            {errors.status && (
              <p className="text-red-500 text-sm mb-2">{errors.status}</p>
            )}

            <label className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                name="isFollowup"
                checked={form.isFollowup === 1}
                onChange={handleChange}
              />
              <span>Followup Needed</span>
            </label>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
