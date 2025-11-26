"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { xFetch } from "@/utility/xFetch";
import { Corporate, User, Test } from "@/utility/TinyDB";

// Lucide icons
import {
    Search,
    Trash2,
    Play,
    Square,
    RefreshCcw,
    Edit,
    Power,
    PowerOff,
    Plus, Check , X
} from "lucide-react";

export default function WhatsappAutomation() {
  const [loading, setLoading] = useState(false);
  const [triggers, setTriggers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [attributeValue, setAttributeValue] = useState({}); // expected object map key->label

  const [filterParameters, setFilterParameters] = useState({
    statuses: [],
    courses: [],
  });

  const [form, setForm] = useState({
    triggerId: 0,
    status: "",
    course: "",
    templateName: "",
    attributes: [],
  });

  // selection as Set for O(1) ops. Always create new Set when updating.
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Safe parser helper
  const safeParseAttributes = (value) => {
    if (!value) return [];
    try {
      if (typeof value === "string") return JSON.parse(value);
      if (Array.isArray(value)) return value;
      // object -> convert to array? we expect array so fallback:
      return [];
    } catch (e) {
      return [];
    }
  };

  // API calls return promises so they can be combined with Promise.all
  const loadFilterParams = useCallback(async () => {
    const params = new URLSearchParams({
      testId: Test?._id ?? "",
      corporateType: Corporate?.type ?? "",
      isManager: User?.isManager ?? "",
    }).toString();

    const res = await xFetch({
      method: "GET",
      path: `/services/invite/getFilterParameters&${params}`,
    });
    // Expect object with statuses and courses
    if (!res || typeof res !== "object") throw new Error("Invalid filter response");
    return {
      statuses: Array.isArray(res.statuses) ? res.statuses : [],
      courses: Array.isArray(res.courses) ? res.courses : [],
    };
  }, []);

  const loadTriggers = useCallback(async () => {
    const res = await xFetch({ path: "/services/profile/getWhatsappTriggers", method: "GET" });
    // server might return array or object with rows/data
    const data = Array.isArray(res) ? res : res?.rows ?? res?.data ?? [];
    // normalize attributes for each row to array form
    return (data || []).map((r) => ({
      ...r,
      attributes: safeParseAttributes(r.attributes),
    }));
  }, []);

  const getAttribute = useCallback(async () => {
    const res = await xFetch({ path: `/services/profile/getAttribute`, method: "GET" });
    // expecting an object map; if array convert to map with index keys
    if (!res) return {};
    if (Array.isArray(res)) {
      const map = {};
      res.forEach((v, i) => (map[i] = v));
      return map;
    }
    return typeof res === "object" ? res : {};
  }, []);

  // Load all initial data in parallel
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [filters, trs, attrs] = await Promise.all([loadFilterParams(), loadTriggers(), getAttribute()]);
      setFilterParameters(filters);
      setTriggers(trs);
      setAttributeValue(attrs);
    } catch (err) {
      console.error("Initial load failed:", err);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [loadFilterParams, loadTriggers, getAttribute]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- Form helpers ----------
  const openCreateModal = useCallback((trigger = null) => {
    if (!trigger) {
      setForm({
        triggerId: 0,
        status: "",
        course: "",
        templateName: "",
        attributes: [],
      });
    } else {
      // parse attributes safely
      const attrs = safeParseAttributes(trigger.attributes);
      setForm({
        triggerId: trigger.id ?? 0,
        status: trigger.status_label ?? trigger.status ?? "",
        course: trigger.course_label ?? trigger.course ?? "",
        templateName: trigger.template_name ?? "",
        attributes: Array.isArray(attrs) ? attrs : [],
      });
    }
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const setField = useCallback((k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  const addAttribute = useCallback(() => {
    setForm((p) => ({ ...p, attributes: [...(p.attributes || []), { name: "", value: "" }] }));
    // modal scroll will be handled after DOM update via setTimeout where used
  }, []);

  const removeAttribute = useCallback((idx) => {
    setForm((p) => ({ ...p, attributes: p.attributes.filter((_, i) => i !== idx) }));
  }, []);

  const updateAttribute = useCallback((idx, key, value) => {
    setForm((p) => {
      const attributes = (p.attributes || []).map((a, i) => (i === idx ? { ...a, [key]: value } : a));
      return { ...p, attributes };
    });
  }, []);

  // Submit create / update
  const submitMapping = useCallback(async () => {
    // validations
    if (!form.status || form.status.length < 1) {
      toast.error("Please select a status to trigger this template.");
      return;
    }
    if (!form.templateName || form.templateName.length < 1) {
      toast.error("Please enter a valid template name for this trigger.");
      return;
    }
    for (let i = 0; i < (form.attributes || []).length; i++) {
      const a = form.attributes[i];
      if (!a.name || !a.value) {
        toast.error(`Attribute #${i + 1} has empty name or value`);
        return;
      }
    }

    const fd = new FormData();
    fd.append("triggerId", form.triggerId || 0);
    fd.append("status", form.status);
    fd.append("course", form.course || "");
    fd.append("templateName", form.templateName);
    fd.append("attributes", JSON.stringify(form.attributes || []));
    if (Corporate?._id) fd.append("corporateId", Corporate?._id);

    try {
      setLoading(true);
      const res = await xFetch({
        path: "/services/profile/saveWhastappTrigger",
        method: "POST",
        payload: fd,
        isFormData: true,
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Trigger saved successfully");
        closeModal();
        // refresh triggers
        const fresh = await loadTriggers();
        setTriggers(fresh);
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error("Error saving trigger");
    } finally {
      setLoading(false);
    }
  }, [form, closeModal, loadTriggers]);

  // Update active status for list of ids
  const updateActiveStatus = useCallback(async (selectedIds = [], active = 1) => {
    if (!selectedIds || selectedIds.length < 1) {
      toast.info("No triggers selected");
      return;
    }
    const confirmMsg = `Are you sure you want to ${active ? "start" : "stop"} ${selectedIds.length} triggers?`;
    if (!confirm(confirmMsg)) return;

    const fd = new FormData();
    fd.append("triggerIds", JSON.stringify(selectedIds));
    fd.append("active", active ? 1 : 0);
    if (Corporate?._id) fd.append("corporateId", Corporate?._id);

    try {
      setLoading(true);
      const res = await xFetch({
        path: "/services/profile/updateWhastappTrigger",
        method: "POST",
        payload: fd,
        isFormData: true,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Updated status");
        const fresh = await loadTriggers();
        setTriggers(fresh);
        setSelectedRows(new Set());
      }
    } catch (err) {
      console.error("Update status failed", err);
      toast.error("Cannot update status");
    } finally {
      setLoading(false);
    }
  }, [loadTriggers]);

  // Delete triggers
  const deleteTriggers = useCallback(async (selectedIds = []) => {
    if (!selectedIds || selectedIds.length < 1) {
      toast.info("No triggers selected");
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} triggers? This cannot be undone.`)) return;

    const fd = new FormData();
    fd.append("triggerIds", JSON.stringify(selectedIds));
    if (Corporate?._id) fd.append("corporateId", Corporate?._id);

    try {
      setLoading(true);
      const res = await xFetch({
        path: "/services/profile/deleteWhastappTrigger",
        method: "POST",
        payload: fd,
        isFormData: true,
      });
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Deleted successfully");
        const fresh = await loadTriggers();
        setTriggers(fresh);
        setSelectedRows(new Set());
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  }, [loadTriggers]);

  // ---------- Selection helpers ----------
  const toggleSelect = useCallback((id) => {
    setSelectedRows((s) => {
      const ns = new Set(s);
      if (ns.has(id)) ns.delete(id);
      else ns.add(id);
      return ns;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedRows(new Set()), []);
  const selectAll = useCallback(() => setSelectedRows(new Set(triggers.map((t) => t.id))), [triggers]);

  // Filtered list memoized
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase().trim();
    if (!s) return triggers;
    return triggers.filter((t) => {
      const text = `${t.template_name || ""} ${t.course_label || t.course || ""} ${t.status_label || t.status || ""}`.toLowerCase();
      return text.indexOf(s) > -1;
    });
  }, [triggers, search]);

  // small helper to render attribute names safely
  const renderAttrNames = (row) => {
    const attrs = Array.isArray(row.attributes) ? row.attributes : safeParseAttributes(row.attributes);
    return (attrs.map((a) => a?.name || "").filter(Boolean).join(", ")) || "—";
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="mb-3 p-3 bg-yellow-50 border rounded">
        <strong>Note:</strong> This automation feature is in <b>BETA</b> and currently supports automation with <b>WATI</b> templates only.
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button className="btn" onClick={() => openCreateModal(null)}>＋</button>
        <button
          className="btn"
          onClick={() => deleteTriggers(Array.from(selectedRows))}
          disabled={selectedRows.size === 0}
        >
          🗑 Delete
        </button>
        <button className="btn btn-success" onClick={() => updateActiveStatus(Array.from(selectedRows), 1)} disabled={selectedRows.size === 0}>▶ Start</button>
        <button className="btn btn-danger" onClick={() => updateActiveStatus(Array.from(selectedRows), 0)} disabled={selectedRows.size === 0}>■ Stop</button>

        <div className="ml-auto flex gap-2 items-center">
          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 
                border border-gray-300 rounded-md 
                bg-white text-black 
                placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button className="btn" onClick={() => loadAll()} title="Reload">↻</button>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selectedRows.size > 0 && selectedRows.size === triggers.length && triggers.length > 0}
                  onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Status</th>
              <th>Course</th>
              <th>Template</th>
              <th>Attributes</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="p-4 text-center">Loading...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No matching records found</td>
              </tr>
            )}

            {!loading && filtered.map((row, idx) => (
              <tr key={row.id ?? idx} className="border-t">
                <td className="p-2 text-center">
                  <input type="checkbox" checked={selectedRows.has(row.id)} onChange={() => toggleSelect(row.id)} />
                </td>
                <td className="p-2">#{row.count ?? (idx + 1)}</td>
                <td className="p-2">
                  {row.status_label ?? row.status}
                  <span style={{ marginLeft: 8, color: (row.status > 0 ? "#4caf50" : "#f44336") }}>●</span>
                </td>
                <td className="p-2">{row.course_label ?? row.course}</td>
                <td className="p-2">{row.template_name}</td>
                <td className="p-2">{renderAttrNames(row)}</td>
                <td className="p-2 text-center flex items-center justify-center gap-2">
                    <button
                        className="icon-btn bg-gray-200 hover:bg-gray-300 text-black"
                        onClick={() =>
                        updateActiveStatus([row.id], row.status > 0 ? 0 : 1)
                        }
                        title={row.status > 0 ? "Stop" : "Start"}
                    >
                        {row.status > 0 ? (
                        <button className="bg-green-600 hover:bg-green-700 p-2 rounded">
                            <Square size={16} className="text-white" />
                        </button>
                        ) : (
                            <button className="bg-red-600 hover:bg-red-700 p-2 rounded">
                                <Play size={16} className="text-white" />
                            </button>
                        )}
                    </button>

                    <button
                        className="icon-btn bg-blue-500 hover:bg-blue-600"
                        onClick={() => openCreateModal(row)}
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        className="icon-btn bg-red-500 hover:bg-red-600"
                        onClick={() => deleteTriggers([row.id])}
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">{form.triggerId ? "Update trigger" : "Create new trigger"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <select value={form.status} onChange={(e) => setField("status", e.target.value)} className="mt-1 block w-full bg-white text-black border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Choose a status</option>
                  {filterParameters.statuses.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Course</label>
                <select value={form.course} onChange={(e) => setField("course", e.target.value)} className="mt-1 block w-full bg-white text-black border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option value="">Choose a course</option>
                  {filterParameters.courses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Template Name <span className="text-red-500">*</span></label>
                <input value={form.templateName} onChange={(e) => setField("templateName", e.target.value)} className="mt-1 block w-full bg-white text-black border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-100" placeholder="Enter template name" />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-end">
                <div>
                  <label className="block text-sm font-medium">Attributes <span className="text-gray-500">(Optional)</span></label>
                  <p className="text-xs text-gray-500">If the template requires attributes when triggered please provide those. Click on <b>Add Attribute</b> button to add one.</p>
                </div>

                <div>
                  <button className="btn" onClick={() => {
                    addAttribute();
                    // scroll to newly added attribute after DOM update
                    setTimeout(() => {
                      const el = document.querySelector(".attribute-item:last-child");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 120);
                  }}>＋ Add Attribute</button>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {(!form.attributes || form.attributes.length === 0) && <div className="text-sm text-gray-500">No attributes added</div>}

                {(form.attributes || []).map((a, idx) => (
                  <div key={idx} className="attribute-item p-3 bg-gray-50 border rounded flex gap-2 items-start">
                    <div className="flex-1">
                      <input value={a.name} onChange={(e) => updateAttribute(idx, "name", e.target.value)} placeholder="Enter attribute name" className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <div style={{ width: 220 }}>
                      <select value={a.value} onChange={(e) => updateAttribute(idx, "value", e.target.value)} className="w-full border rounded px-2 py-1">
                        <option value="">Choose a value</option>
                        {Object.entries(attributeValue || {}).map(([key, value], i) => (
                          <option key={i} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <button className="btn btn-danger" onClick={() => removeAttribute(idx)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              
              <button className="btn" onClick={() => {
                addAttribute();
                setTimeout(() => {
                  const el = document.querySelector(".attribute-item:last-child");
                  if (el) el.scrollIntoView({behavior: "smooth", block: "center"});
                }, 120);
              }}>Add Attribute</button>
              <button className="btn btn-warning" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-success" onClick={submitMapping}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn { padding: 6px 10px; border-radius: 6px; border: 1px solid #ddd; background:#fff; cursor:pointer; }
        .btn:hover{ filter:brightness(.98) }
        .btn-success { background: #2ecc71; color: white; border-color: #27ae60 }
        .btn-danger { background: #e74c3c; color: white; border-color: #e74c3c }
        .btn-warning { background: #f39c12; color: white; border-color: #d68910 }
        table td, table th { padding: 8px 10px; text-align: left; vertical-align: middle; }
        .attribute-item input, .attribute-item select { background: white; }

 
        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.15s;
        }
 

      `}</style>
    </div>
  );
}
