import { useEffect, useState } from "react";
import { Search, Trash2, X, Edit3, Plus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { xFetch } from "@/utility/xFetch";
import { Corporate } from "@/utility/TinyDB";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

export default function LeadAllocation() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, leadAllocationRule: "" });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;
  const corporateId = Corporate?._id;

  const fetchData = () => {
    setLoading(true);
    let payload = { corporateId };
    xFetch({
      path: `/services/profile/getLeadAllocations`,
      payload,
    })
      .then((data) => {
        setData(data);
        setFiltered(data);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [corporateId]);

  useEffect(() => {
    const result = data.filter((item) => {
        const name = item?.leadAllocationRule ?? "";
        return name.toLowerCase().includes(search.toLowerCase());
    });

    setFiltered(result);
    setPage(1);
  }, [search, data]);

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const handleSave = async () => {
    const newErrors = {};
    if (!form.leadAllocationRule) newErrors.leadAllocationRule = "Rule name is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const url = editing
      ? "/services/profile/addLeadAllocationForSettings"
      : "/services/profile/addLeadAllocationForSettings";

    const payload = { ...form };

    xFetch({ path: url, method: "POST", payload })
      .then((res) => {
        if(res.leadAllocationId){
            setShowModal(false);
            setForm({ id: null, leadAllocationRule: "" });
            setEditing(false);
            fetchData();
        }
      })
      .catch((err) => toast.error("Something went wrong, please try again."))
      .finally(() => 
        toast.success(`Lead Allocation ${editing ? "updated" : "added"} successfully!`),
        setLoading(false)
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    let payload = { Id: id };
    xFetch({ path: "/services/profile/deleteLeadAllocation", method: "POST", payload })
        .then(() => 
            toast.success("Lead Allocation Rule has been deleted successfully."),
            fetchData()
        )
        .catch((err) => toast.error("Error deleting the rule."))
        .finally(() => setLoading(false));
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return alert("No rules selected");
    if (!window.confirm("Delete selected rules?")) return;
    for (const id of selected) await handleDelete(id);
    setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl">Lead Allocation</h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search rule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 border rounded-lg text-sm bg-white"
            />
          </div>

          <button
            onClick={() => {
              setEditing(false);
              setForm({ id: null, leadAllocationRule: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded"
          >
            <Plus size={16} />
          </button>

          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelected(e.target.checked ? paginated.map((r) => r.id) : [])
                    }
                    checked={paginated.every((r) => selected.includes(r.id))}
                  />
                </th>
                <th className="p-2 text-left">Rule Name</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>
                  <td className="p-2">{row.leadAllocationRule}</td>
                  <td className="p-2 text-center space-x-2">
                    {/* <button
                      onClick={() => {
                        setForm(row);
                        setEditing(true);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit3 size={16} />
                    </button> */}
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
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-end items-center mt-3 gap-2 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-200"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="text-gray-700">Page {page} of {totalPages || 1}</span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h3 className="text-lg mb-4">{editing ? "Update" : "Add"} Lead Allocation</h3>

            <select
            name="leadAllocationRule"
            value={form.leadAllocationRule}
            onChange={(e) => setForm({ ...form, leadAllocationRule: e.target.value })}
            className="w-full border border-gray-300 rounded p-2 mb-2 bg-white text-black"
            >
                <option value="" disabled>Select Lead Allocation Rule</option>
                <option value="BY_ROUND_ROBIN">BY_ROUND_ROBIN</option>
            </select>
            {errors.leadAllocationRule && (
              <p className="text-red-500 text-sm mb-2">{errors.leadAllocationRule}</p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                <X size={15} />
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {editing ? <Check size={15} /> : <Plus size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
