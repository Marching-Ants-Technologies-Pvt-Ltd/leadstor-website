"use client";
import React, { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { Plus, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";

export default function CourseTemplateMapping() {
  const [mappings, setMappings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);


  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    courseId: "",
    courseName: "",
    emailTemplateId: "",
  });

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    loadPageData();
  }, []);

  function loadPageData() {
    setLoading(true);

    Promise.all([fetchMappings(), fetchCourses(), fetchEmailTemplates()])
      .finally(() => setLoading(false));
  }

  function fetchMappings() {
    return xFetch({
      path: "/services/profile/getRuleManagersTemplates?attributeType=Course",
    })
      .then((res) => {
        const list = (res || []).map((r) => ({
          id: r.attributeId,
          course: r.attributeValue,
          emailTemplate: r.emailTempName || "-",
        }));
        setMappings(list);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load mappings");
      });
  }

  function fetchCourses() {
    return xFetch({ path: "/services/profile/getCourseAndFee" })
      .then((res) => setCourses(res || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load courses");
      });
  }

  function fetchEmailTemplates() {
    return xFetch({ path: "/services/profile/getTemplates" })
      .then((res) => setEmailTemplates(res || []))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load email templates");
      });
  }

    function toggleSelect(id) {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function toggleSelectAll() {
        const visibleIds = currentRecords.map((r) => r.id);
        const allSelected = visibleIds.every((id) => selectedIds.includes(id));

        if (allSelected) {
            // Unselect all visible
            setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
        } else {
            // Select all visible
            setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
        }
    }

    function handleBulkDelete() {
        if (selectedIds.length === 0) {
            return toast.error("No rows selected");
        }

        if (!window.confirm(`Delete ${selectedIds.length} selected mappings?`)) return;

        setLoading(true);

        Promise.all(
            selectedIds.map((id) =>
            xFetch({
                path: "/services/profile/updateRuleManagers",
                method: "POST",
                payload: { rid: id },
            })
            )
        )
        .then(() => {
        toast.success("Selected mappings deleted");
        setSelectedIds([]);
        fetchMappings();
        })
        .catch(() => toast.error("Bulk delete failed"))
        .finally(() => setLoading(false));
    }


    function handleFormChange(e) {
        const { name, value } = e.target;

        if (name === "courseId") {
        const c = courses.find((x) => Number(x.id) === Number(value));
        setForm((p) => ({
            ...p,
            courseId: value,
            courseName: c ? c.course : "",
        }));
        } else {
        setForm((p) => ({ ...p, [name]: value }));
        }
    }

  // ---------------- ADD MAPPING ----------------
  function handleAdd() {
    if (!form.courseId) return toast.error("Select Course");
    if (!form.emailTemplateId) return toast.error("Select Email Template");

    setLoading(true);

    xFetch({
      path: "/services/profile/addRuleManager",
      method: "POST",
      payload: {
        attributeType: "Course",
        attributeValue: form.courseName,
        tid: form.emailTemplateId,
        sid: "",
      },
    })
      .then(() => {
        toast.success("Mapping added successfully");
        setShowModal(false);
        setForm({ courseId: "", courseName: "", emailTemplateId: "" });
        fetchMappings();
      })
      .catch(() => toast.error("Failed to add mapping"))
      .finally(() => setLoading(false));
  }

  // ---------------- DELETE MAPPING ----------------
  function handleDelete(id) {
    if (!window.confirm("Delete this mapping?")) return;

    setLoading(true);

    xFetch({
      path: "/services/profile/updateRuleManagers",
      method: "POST",
      payload: { rid: id },
    })
      .then(() => {
        toast.success("Mapping deleted");
        fetchMappings();
      })
      .catch(() => toast.error("Delete failed"))
      .finally(() => setLoading(false));
  }

  // ---------------- SEARCH & PAGINATION ----------------
  const filtered = mappings.filter((m) =>
    (m.course || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / recordsPerPage));
  const start = (currentPage - 1) * recordsPerPage;
  const currentRecords = filtered.slice(start, start + recordsPerPage);

  return (
    <div className="p-6">
      <ToastContainer />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Course - Template Mapping</h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search course..."
            className="border px-3 py-1 rounded bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
            disabled={selectedIds.length === 0}
            >
            <Trash2 size={16} />
        </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left">
                <th className="p-2">
                <input
                    type="checkbox"
                    checked={
                    currentRecords.length > 0 &&
                    currentRecords.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={toggleSelectAll}
                />
                </th>
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-left">Email Template</th>
                <th className="p-2 text-left w-20">Action</th>
            </tr>
            </thead>
          <tbody>
            {currentRecords.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={3}>
                  No records found
                </td>
              </tr>
            )}

            {currentRecords.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                        <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        />
                    </td>
                    <td className="p-2">{row.course}</td>
                    <td className="p-2">{row.emailTemplate}</td>
                    <td className="p-2">
                        <button
                        className="text-red-600"
                        onClick={() => handleDelete(row.id)}
                        >
                        <Trash2 size={18} />
                        </button>
                    </td>
                </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-3">
          <span className="text-sm text-gray-600">
            Showing {filtered.length === 0 ? 0 : start + 1} –
            {Math.min(start + recordsPerPage, filtered.length)} of{" "}
            {filtered.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="border px-2 py-1 rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-sm">
              Page {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="border px-2 py-1 rounded disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">
                Add New Course Template Mapping
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  className="w-full border rounded p-2 bg-white"
                  value={form.courseId}
                  onChange={handleFormChange}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Select Email Template
                </label>
                <select
                  name="emailTemplateId"
                  className="w-full border rounded p-2 bg-white"
                  value={form.emailTemplateId}
                  onChange={handleFormChange}
                >
                  <option value="">Select Email Template</option>
                  {emailTemplates.map((t) => (
                    <option
                      key={t.templateId || t.template_id}
                      value={t.templateId || t.template_id}
                    >
                      {t.templateName || t.template_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-3 py-2 rounded" title="Close"
              >
                <X size={14} />
              </button>
              <button
                onClick={handleAdd}
                className="bg-blue-600 text-white px-3 py-2 rounded" title="Add Mapping"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
