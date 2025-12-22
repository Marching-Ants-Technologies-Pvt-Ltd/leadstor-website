"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { Search } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FieldMapping() {
  const [fields, setFields] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [defaultFields, setDefaultFields] = useState([]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showDefaultFields, setShowDefaultFields] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  const fetchMapping = () => {
    setLoading(true);

    xFetch({ path: "/services/profile/getLeadFields" })
      .then((res) => {
        const updated = res.allFields.map((item) => ({
          ...item,
          displayName: item.displayName || "",
          fieldType: item.fieldType || "",
        }));

        const defaultF = res.defaultFields.map((item) => ({
          ...item,
        }));

        setFields(updated);
        setFiltered(updated);

        setSelectedIds(
          updated.filter((x) => x.selected).map((x) => x.id)
        );
        setDefaultFields(
          defaultF.filter((x) => x.isDefaultField).map((x) => x.id)
        );
      })
      .catch(() => {
        toast.error("Failed to load field mapping");
      })
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    fetchMapping();
  }, []);

  // Search + filter
  useEffect(() => {
    let result = fields;

    if (search) {
      result = result.filter((f) =>
        f.fieldName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (showOnlySelected) {
      result = result.filter((f) => selectedIds.includes(f.id));
    }

    if (showDefaultFields) {
      result = result.filter((f) => selectedIds.includes(f.id));
    }

    setFiltered(result);
  }, [search, fields, showOnlySelected, showDefaultFields, selectedIds]);


  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  const toggleCheckbox = (id) => {
    if (defaultFields.includes(id)) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Update only selected
  const updateField = (id, key, value) => {
    if (!selectedIds.includes(id)) return;

    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  // Save with validation
  const handleSave = () => {
    const invalid = fields.find(
      (f) =>
        selectedIds.includes(f.id) &&
        (!f.fieldType || f.fieldType.trim() === "")
    );

    if (invalid) {
      toast.error(`Select field type for "${invalid.fieldName}"`);
      return;
    }

    const formData = new FormData();
    formData.append("selectedFields", JSON.stringify(selectedIds));

    const updatedFields = fields
      .filter((f) => selectedIds.includes(f.id))
      .map((f) => ({
        id: f.id,
        fieldName: f.fieldName,
        displayName: f.displayName,
        dataFormatter: f.dataFormatter,
        dataField: f.dataField,
        fieldType: f.fieldType,
      }));

    formData.append("updatedFields", JSON.stringify(updatedFields));

    setLoading(true);
    xFetch({
      path: "/services/profile/updateLeadFieldMapping",
      method: "POST",
      payload: formData,
      isFormData: true,
    })
      .then((res) => {
        if (res.status === true) {
          toast.success("Field mapping updated successfully");
        }
      })
      .catch(() => toast.error("Error saving field mapping"))
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Field Mapping</h2>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDefaultFields}
              onChange={(e) => setShowDefaultFields(e.target.checked)}
            />
            Show default fields
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlySelected}
              onChange={(e) => setShowOnlySelected(e.target.checked)}
            />
            Show added fields only
          </label>

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

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2"></th>
              <th className="p-2">Sr.</th>
              <th className="p-2">Field Name</th>
              <th className="p-2">Display Name</th>
              <th className="p-2">Field Type</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : currentRecords.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No fields found
                </td>
              </tr>
            ) : (
              currentRecords.map((row, index) => (
                <tr
                  key={row.id}
                  className={index % 2 ? "bg-gray-50" : ""}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      disabled={defaultFields.includes(row.id)}
                      onChange={() => toggleCheckbox(row.id)}
                    />
                    {defaultFields.includes(row.id) && (
                      <span className="ml-1 text-xs text-gray-500">(Default)</span>
                    )}
                  </td>
                  <td className="p-2">{row.sr}</td>
                  <td className="p-2">{row.fieldName}</td>

                  <td className="p-2">
                    <div className="relative" title={
                            selectedIds.includes(row.id)
                              ? ""
                              : "Enable this field by checking the box"
                          }>
                         <input
                          disabled={!selectedIds.includes(row.id)}
                          className="w-full border rounded px-2 py-1 disabled:bg-gray-100"
                          placeholder={
                            selectedIds.includes(row.id)
                              ? "Enter display name"
                              : "Check box to enable"
                          }
                          value={row.displayName}
                          onChange={(e) =>
                            updateField(row.id, "displayName", e.target.value)
                          }
                        />

                        {!selectedIds.includes(row.id) && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            🔒
                          </span>
                        )}
                      </div>
                  </td>

                  <td className="p-2">
                    <select
                      className={`w-full border rounded px-2 py-1 ${
                        selectedIds.includes(row.id) && !row.fieldType
                          ? "border-red-500"
                          : ""
                      }`}
                      value={row.fieldType}
                      onChange={(e) =>
                        updateField(row.id, "fieldType", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      <option value="text">Text</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="textarea">Textarea</option>
                      <option value="datetime">Date & Time</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span>Rows:</span>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex gap-1">
            {[...Array(totalPages)].slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
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
