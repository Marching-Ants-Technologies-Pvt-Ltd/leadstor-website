import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast, ToastContainer } from "react-toastify";
import { Search, Trash2, X, Edit3, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Statuses() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, status: "", isFollowup: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    xFetch({ path: "/services/profile/getStatuses" })
      .then((res) => {
        setData(res);
        setFilteredData(res);
      })
      .catch(() => {
        setData([]);
        setFilteredData([]);
        toast.error("Failed to load statuses");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchData(), []);

  useEffect(() => {
    const result = data.filter((r) => r.status.toLowerCase().includes(search.toLowerCase()));
    setFilteredData(result);
    setCurrentPage(1);
  }, [search, data]);

  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredData.slice(startIndex, startIndex + recordsPerPage);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? (checked ? 1 : 0) : value });
  };

  const handleSave = () => {
    const errs = {};
    if (!form.status.trim()) errs.status = "Status name required";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const url = editing
      ? "/services/profile/updateStatusesSettings"
      : "/services/profile/addStatusesSettings";

    xFetch({ path: url, method: "POST", payload: form })
      .then(() => {
        toast.success(editing ? "Updated successfully" : "Added successfully");
        setModalOpen(false);
        setForm({ id: null, status: "", isFollowup: 0 });
        setEditing(false);
        fetchData();
      })
      .catch(() => toast.error("Failed to save"));
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this status?")) return;
    xFetch({ path: "/services/profile/deleteStatuses", method: "POST", payload: { statusId: id } })
      .then(() => {
        toast.success("Deleted");
        fetchData();
      })
      .catch(() => toast.error("Failed to delete"));
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return toast.warning("No records selected");
    if (!confirm("Delete selected statuses?")) return;

    Promise.all(
      selectedIds.map((id) =>
        xFetch({ path: "/services/profile/deleteStatuses", method: "POST", payload: { statusId: id } })
      )
    )
      .then(() => {
        toast.success("Deleted selected statuses");
        setSelectedIds([]);
        fetchData();
      })
      .catch(() => toast.error("Error while deleting selected items"));
  };

  return (
    <div className="p-6 space-y-4">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Statuses</h2>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => {
              setForm({ id: null, status: "", isFollowup: 0 });
              setEditing(false);
              setModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg shadow flex items-center gap-1"
          >
            <Plus size={16} /> Add
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg shadow flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-center py-6 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === currentRecords.length && currentRecords.length > 0
                    }
                    onChange={(e) =>
                      setSelectedIds(e.target.checked ? currentRecords.map((r) => r.id) : [])
                    }
                  />
                </th>
                <th className="p-2">Status</th>
                <th className="p-2">Follow-up</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() =>
                        setSelectedIds((prev) =>
                          prev.includes(row.id)
                            ? prev.filter((x) => x !== row.id)
                            : [...prev, row.id]
                        )
                      }
                    />
                  </td>
                  <td className="p-2">{row.status}</td>
                  <td className="p-2">{row.isFollowup == 1 ? "Needed" : "Not Needed"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => {
                        setForm({ id: row.id, status: row.status, isFollowup: Number(row.isFollowup) });
                        setEditing(true);
                        setModalOpen(true);
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
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 flex justify-center items-center gap-3 text-sm bg-gray-50">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-xl w-96"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editing ? "Update Status" : "Add Status"}
              </h3>

              {/* Input */}
              <div>
                <input
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  placeholder="Status name"
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                )}
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-2 mt-4 select-none cursor-pointer">
                <input
                  type="checkbox"
                  name="isFollowup"
                  checked={form.isFollowup === 1}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span className="text-gray-700">Follow-up Needed</span>
              </label>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg flex items-center gap-1"
                >
                  <X size={16} /> Cancel
                </button>

                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                >
                  {editing ? <Check size={16} /> : <Plus size={16} />} {editing ? "Update" : "Add"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

