"use client";

import { xFetch } from "@/utility/xFetch";
import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  X,
  Edit3,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Corporate } from "@/utility/TinyDB"; // assuming this still exists
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";

export default function PreferredCourses() {
  const isCorporate800 = Corporate?.type === 800;

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: null,
    preferredCourse: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await xFetch({
        path: `/services/profile/getPreferredCourse`,
      });
      setData(res || []);
      setFiltered(res || []);
    } catch (err) {
      console.error("Failed to load preferred courses", err);
      toast.error("Could not load preferred courses");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCorporate800) fetchData();
  }, []);

  useEffect(() => {
    const result = data.filter((item) =>
      (item.course || item.preferredCourse || '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setPage(1);
  }, [search, data]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ id: null, preferredCourse: "" });
    setErrors({});
    setEditing(false);
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!form.preferredCourse.trim()) {
      newErrors.preferredCourse = "Course name is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const url = editing
      ? "/services/profile/updatePreferredCourse"
      : "/services/profile/addPreferredCourse";

    const payload = {
      preferredCourseName: form.preferredCourse.trim(),
      ...(editing && { preferredCourseId: form.id }),
    };

    try {
      await xFetch({
        path: url,
        method: "POST",
        payload,
      });

      toast.success(
        editing ? "Preferred course updated" : "Preferred course added"
      );
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Failed to save preferred course");
    }
  };

  const handleEdit = (row) => {
    setForm({
      id: row.id,
      preferredCourse: row.preferredCourse || row.course || "",
    });
    setEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this preferred course?")) return;

    try {
      await xFetch({
        path: "/services/profile/deletePreferredCourse",
        method: "POST",
        payload: { courseId: id },
      });
      toast.success("Preferred course deleted");
      fetchData();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete course");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return toast.error("No courses selected");
    if (!window.confirm(`Delete ${selected.length} selected course(s)?`))
      return;

    const ids = [...selected];
    setSelected([]);

    let failed = 0;
    for (const id of ids) {
      try {
        await xFetch({
          path: "/services/profile/deletePreferredCourse",
          method: "POST",
          payload: { courseId: id },
        });
      } catch (err) {
        failed++;
        console.error("Delete failed", err);
      }
    }

    if (failed === 0) {
      toast.success("Selected courses deleted");
    } else if (failed === ids.length) {
      toast.error("Failed to delete selected courses");
    } else {
      toast.warn(`Deleted ${ids.length - failed} courses, ${failed} failed`);
    }

    fetchData();
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allSelectedOnPage =
    paginated.length > 0 && paginated.every((r) => selected.includes(r.id));

  if (!isCorporate800) return null;

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Preferred Courses</h2>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border rounded-lg bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px]"
            />
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            title="Add Preferred Course"
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={handleBulkDelete}
            title="Delete Selected"
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            disabled={selected.length === 0}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-100 text-gray-700">
                <tr className="text-left">
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={allSelectedOnPage}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? paginated.map((r) => r.id) : []
                        )
                      }
                      className="rounded bg-white"
                    />
                  </th>
                  <th className="p-3 text-left">Course</th>
                  <th className="p-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        className="rounded bg-white"
                      />
                    </td>
                    <td className="p-3">{row.preferredCourse || row.course}</td>
                    <td className="p-3 text-center space-x-3">
                      <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No preferred courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex justify-end items-center mt-4 gap-3 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`p-2 rounded ${
              page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-gray-700">
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className={`p-2 rounded ${
              page >= totalPages || totalPages === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-5">
              {editing ? "Update Preferred Course" : "Add Preferred Course"}
            </h3>

            <div className="space-y-4">
              <div>
                <input
                  name="preferredCourse"
                  placeholder="Course Name"
                  value={form.preferredCourse}
                  onChange={handleChange}
                  className="w-full border border-gray-300 text-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.preferredCourse && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.preferredCourse}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-5 py-2.5 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center gap-1.5"
              >
                <X size={16} /> Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5"
              >
                {editing ? <Check size={16} /> : <Plus size={16} />}
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}