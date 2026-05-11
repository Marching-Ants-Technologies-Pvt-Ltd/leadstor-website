"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { xFetch } from "@/utility/xFetch";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Edit3,
  GitBranch,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

const defaultForm = {
  id: 0,
  course_id: "",
  course_name: "",
  agent_id: "",
};

export default function CourseAgentMapping() {
  const [mappings, setMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef(null);

  const recordsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [mappingRes, courseRes] = await Promise.all([
        xFetch({ path: "/services/profile/getXtremeMappings" }),
        xFetch({ path: "/services/profile/getAvailableCourses" }),
      ]);

      setMappings(mappingRes || []);
      setCourses(courseRes || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mappings");
      setMappings([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!courseDropdownRef.current?.contains(event.target)) {
        setCourseDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredData = (mappings || []).filter((item) => {
    const text = `${item.course_name || ""} ${item.agent_id || ""} ${item.agent_label || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / recordsPerPage));
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredData.slice(startIndex, startIndex + recordsPerPage);

  const openAddModal = () => {
    setForm(defaultForm);
    setEditing(false);
    setCourseSearch("");
    setCourseDropdownOpen(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setForm({
      id: Number(row.id) || 0,
      course_id: String(row.course_id || ""),
      course_name: row.course_name || "",
      agent_id: row.agent_id || "",
    });
    setEditing(true);
    setCourseSearch("");
    setCourseDropdownOpen(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(false);
    setForm(defaultForm);
    setCourseSearch("");
    setCourseDropdownOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "course_id") {
      const selectedCourse = (courses || []).find((item) => String(item.id) === String(value));
      setForm((prev) => ({
        ...prev,
        course_id: value,
        course_name: selectedCourse?.course_name || "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: name === "agent_id" ? value.slice(0, 150) : value }));
  };

  const handleSave = async () => {
    const trimmedAgentId = form.agent_id.trim();

    if (!editing && !form.course_id) return toast.error("Please select course");
    if (!trimmedAgentId) return toast.error("Please enter Agent ID");
    if (trimmedAgentId.length > 150) return toast.error("Agent ID must be 150 characters or less");

    setSaving(true);
    try {
      const res = await xFetch({
        path: editing
          ? "/services/profile/updateXtremeMapping"
          : "/services/profile/addXtremeMapping",
        method: "POST",
        payload: editing
          ? {
              id: form.id,
              agent_id: trimmedAgentId,
            }
          : {
              course_id: form.course_id,
              course_name: form.course_name,
              agent_id: trimmedAgentId,
            },
      });

      if (res?.status === false) {
        throw new Error(res?.desc || "Unable to save mapping");
      }

      toast.success(res?.desc || (editing ? "Mapping updated" : "Mapping created"));
      closeModal();
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mapping?")) return;

    try {
      const res = await xFetch({
        path: "/services/profile/deleteXtremeMapping",
        method: "POST",
        payload: { id },
      });

      if (res?.status === false) {
        throw new Error(res?.desc || "Unable to delete mapping");
      }

      toast.success(res?.desc || "Mapping deleted");
      loadData();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to delete mapping");
    }
  };

  const filteredCourses = (courses || []).filter((course) =>
    (course?.course_name || "").toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleCourseSearchChange = (value) => {
    setCourseSearch(value);
    setForm((prev) => ({
      ...prev,
      course_id: "",
      course_name: "",
    }));
    setCourseDropdownOpen(true);
  };

  const handleCourseSelect = (course) => {
    setForm((prev) => ({
      ...prev,
      course_id: String(course.id),
      course_name: course.course_name || "",
    }));
    setCourseSearch(course.course_name || "");
    setCourseDropdownOpen(false);
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <ToastContainer transition={Bounce} autoClose={2200} />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-200 bg-white sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-violet-50">
                <GitBranch className="text-violet-600" size={18} />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-900">Xtreme Course Agent Mapping</h1>
                <p className="text-sm text-gray-500">
                  Courses already mapped will not appear again while adding.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search mapping..."
                  className="h-11 w-full sm:w-[260px] rounded-lg border border-slate-200 bg-white pl-9 pr-4 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-white shadow-sm hover:bg-violet-700"
              >
                <Plus size={16} />
                Add Mapping
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left w-20">#</th>
                <th className="px-4 py-3 text-left">Course</th>
                <th className="px-4 py-3 text-left">Agent ID</th>
                <th className="px-4 py-3 text-left w-32">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <Loader2 className="animate-spin" size={18} />
                      Loading mappings...
                    </div>
                  </td>
                </tr>
              ) : currentRecords.length ? (
                currentRecords.map((row, index) => (
                  <tr key={row.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3">{startIndex + index + 1}</td>
                    <td className="px-4 py-3">{row.course_name}</td>
                    <td className="px-4 py-3">{row.agent_label || row.agent_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(row)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No mappings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t bg-slate-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredData.length ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + recordsPerPage, filteredData.length)} of {filteredData.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-violet-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border">
                    <Bot className="text-violet-600" size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {editing ? "Edit Mapping" : "Add Mapping"}
                  </h3>
                </div>

                <button onClick={closeModal} className="text-slate-500 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Course
                  </label>

                  {editing ? (
                    <input
                      type="text"
                      value={form.course_name}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
                    />
                  ) : (
                    <div className="relative" ref={courseDropdownRef}>
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        type="text"
                        value={courseSearch}
                        onChange={(e) => handleCourseSearchChange(e.target.value)}
                        onFocus={() => setCourseDropdownOpen(true)}
                        placeholder="Search and select course..."
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                      />

                      {courseDropdownOpen && (
                        <div className="absolute z-20 mt-2 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                          {filteredCourses.length ? (
                            filteredCourses.map((course) => (
                              <button
                                type="button"
                                key={course.id}
                                onClick={() => handleCourseSelect(course)}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-violet-50"
                              >
                                {course.course_name}
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-3 text-sm text-slate-500">No course found</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Agent ID
                  </label>
                  <input
                    type="text"
                    name="agent_id"
                    value={form.agent_id}
                    onChange={handleChange}
                    maxLength={150}
                    placeholder="Enter Agent ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-4 py-2.5"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {saving ? "Saving..." : editing ? "Update Mapping" : "Save Mapping"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
