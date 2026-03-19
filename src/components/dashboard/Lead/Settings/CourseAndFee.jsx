"use client";
import { xFetch } from "@/utility/xFetch";
import { useEffect, useState } from "react";
import { Search, Trash2, X, Edit3, Plus, Check , ChevronLeft, ChevronRight  } from "lucide-react";
import { Corporate } from "@/utility/TinyDB";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";

export default function CoursesAndFee() {
  const isCorporate800 = Corporate?.type === 800;
  const courseLabel = isCorporate800 ? 'Country' : 'Course';
  const feeLabel = isCorporate800 ? 'Processing Fee' : 'Standard Fee';
  const titleLabel = isCorporate800 ? 'Country and Processing Fee' : 'Courses & Fees';
  const itemLabel = isCorporate800 ? 'Country' : 'Course';
  const addLabel = isCorporate800 ? 'Country & Processing Fee' : 'Course & Fee';
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, course: "", standardFee: "", maximumDiscount: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(null);
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = () => {
    setLoading(true);
    xFetch({
      path: `/services/profile/getCourseAndFee`
    })
      .then((data) => {
        setData(data);
        setFiltered(data);
      })
      .catch((error) => {
        console.error(`Error fetching course and fee`, error);
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  },[]);

  useEffect(() => {
    const result = data.filter((item) =>
      item.course.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    setPage(1);
  }, [search, data]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (name === "maximumDiscount" || name === "standardFee") {
      if (updated.standardFee && updated.maximumDiscount) {
        setMaxDiscountAmount((updated.standardFee * updated.maximumDiscount) / 100);
      } else {
        setMaxDiscountAmount(null);
      }
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!form.course) newErrors.course = `${courseLabel} is required`;
    if (!form.standardFee) newErrors.standardFee = `${feeLabel} is required`;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (form.maximumDiscount && (form.maximumDiscount < 1 || form.maximumDiscount > 100)) {
      return toast.error("Maximum discount must be between 1 and 100");
    }

    const url = editing
      ? "/services/profile/updateCourseAndFeeSettings"
      : "/services/profile/addCourseFeeSettings";

    const payload = {
      ...form,
      standardFee: Number(form.standardFee),
      maximumDiscount: Number(form.maximumDiscount),
    };

    xFetch({
      path: url,
      method: "POST",
      payload,
    })
      .then(() => {
        toast.success(editing ? `${courseLabel} updated successfully` : `${courseLabel} added successfully`);
        setShowModal(false);
        setErrors({});
        setForm({ id: null, course: "", standardFee: "", maximumDiscount: "" });
        setEditing(false);
        setMaxDiscountAmount(null);
        fetchData();
      })
      .catch((error) => {
        console.error(`Error saving course`, error);
        toast.error(`Failed to save ${itemLabel.toLowerCase()}`);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    let payload = { courseId: id };
    xFetch({
      path: "/services/profile/deleteCourseAndFee",
      method: "POST",
      payload,
    })
      .then(() => {
        toast.success(`${courseLabel} deleted successfully`);
        fetchData();
      })
      .catch((error) => {
        console.error(`Error deleting course`, error);
        toast.error(`Failed to delete ${itemLabel.toLowerCase()}`);
      })
      .finally(() => setLoading(false));
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return toast.error(`No ${itemLabel.toLowerCase()}s selected`);
    if (!window.confirm(`Delete selected ${itemLabel.toLowerCase()}s?`)) return;
    for (const id of selected) {
      await handleDelete(id);
    }
    setSelected([]);
    toast.success(`Selected ${itemLabel.toLowerCase()}s deleted successfully`);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl">{titleLabel}</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${itemLabel.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border rounded-lg bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => {
              setEditing(false);
              setForm({ id: null, course: "", standardFee: "", maximumDiscount: "" });
              setShowModal(true);
            }} title={`Add ${addLabel}`}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleBulkDelete} title="Delete Selected"
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          ><Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="text-left">
                <th className="p-2 text-left">
                  <input
                    type="checkbox" className="bg-white"
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? paginated.map((r) => r.id) : []
                      )
                    }
                    checked={
                      paginated.length > 0 &&
                      paginated.every((r) => selected.includes(r.id))
                    }
                  />
                </th>
                <th className="p-2 text-left">{courseLabel}</th>
                <th className="p-2 text-left">{feeLabel}</th>
                <th className="p-2 text-left">Max Discount %</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-2">
                    <input
                      type="checkbox" className="bg-white"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>
                  <td className="p-2">{row.course}</td>
                  <td className="p-2">{row.standardFee}</td>
                  <td className="p-2">{row.maximumDiscount}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => {
                        setForm(row);
                        setEditing(true);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-lg mb-4">
              {editing ? "Update" : "Add"} {addLabel}
            </h3>

            <input
              name="course"
              placeholder={courseLabel}
              value={form.course}
              onChange={handleChange}
              className="w-full border bg-white border-gray-300 text-gray-600 rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500"
            />
            {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}

            <input
              name="standardFee"
              placeholder={feeLabel}
              value={form.standardFee}
              onChange={handleChange}
              className="w-full border bg-white border-gray-300 text-gray-600 rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500"
            />
            {errors.standardFee && (
              <p className="text-red-500 text-sm">{errors.standardFee}</p>
            )}

            <input
              name="maximumDiscount"
              placeholder="Maximum Discount %"
              value={form.maximumDiscount}
              onChange={handleChange}
              className="w-full border bg-white text-gray-600 border-gray-300 rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500"
            />

            {maxDiscountAmount !== null && (
              <p className="text-sm text-gray-600 mb-2">
                Max Discount Amount - {maxDiscountAmount}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrors({});
                  setMaxDiscountAmount(null);
                }} title="Cancel"
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              > 
                <X size={15} />
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" title={editing ? "Update" : "Add"}
              > 
              {editing ? <Check  size={15} /> : <Plus  size={15} />}
              
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
