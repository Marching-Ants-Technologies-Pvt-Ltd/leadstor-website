"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Settings2,
  Save,
  Shuffle,
  Target,
  GraduationCap,
  Plus,
  Trash2,
  X,
  Check,
  Pencil,
  Sparkles,
  ArrowRight
} from "lucide-react";

import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { xFetch } from "@/utility/xFetch";
import { Corporate } from "@/utility/TinyDB";

export default function LeadAllocationSettings() {
  const router = useRouter();
  const corporateId = Corporate?._id;
  const isAdvancedAllocationEnabled = Number(corporateId) === 64;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedRule, setSelectedRule] = useState("");
  const [currentRule, setCurrentRule] = useState("");

  const [sourceMap, setSourceMap] = useState([]);
  const [courseMap, setCourseMap] = useState([]);

  const [sources, setSources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  const [showSourcePopup, setShowSourcePopup] = useState(false);
  const [showCoursePopup, setShowCoursePopup] = useState(false);

  const [selectedSource, setSelectedSource] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const rules = [
    {
      value: "BY_ROUND_ROBIN",
      title: "Round Robin",
      subtitle: "Distribute leads equally among agents.",
      icon: Shuffle,
      color: "from-blue-500/10 to-cyan-500/10 border-blue-200",
    },
    {
      value: "BY_SOURCE",
      title: "By Source",
      subtitle: "Allocate leads by source wise user mapping.",
      icon: Target,
      color: "from-green-500/10 to-emerald-500/10 border-green-200",
    },
    {
      value: "BY_COURSE",
      title: "By Course",
      subtitle: "Allocate leads by course wise user mapping.",
      icon: GraduationCap,
      color: "from-violet-500/10 to-purple-500/10 border-violet-200",
    },
  ];

  const init = async () => {
    setLoading(true);

    Promise.all([
      xFetch({ path: "/services/profile/getLeadAllocations", payload: { corporateId } }),
      xFetch({ path: "/services/profile/getLeadSourceMappings", payload: { corporateId } }),
      xFetch({ path: "/services/profile/getLeadCourseMappings", payload: { corporateId } }),
      xFetch({ path: "/services/profile/getSources", payload: { corporateId } }),
      xFetch({ path: "/services/profile/getCourseAndFee", payload: { corporateId } }),
      xFetch({ path: "/services/profile/getUsers", payload: { corporateId, userRole:'Counsellor' } }),
    ])
      .then(([ruleRes, sourceRes, courseRes, sourceDropdown, courseDropdown, userDropdown]) => {
        if (ruleRes?.length) {
          setCurrentRule(ruleRes[0].leadAllocationRule);
          setSelectedRule(ruleRes[0].leadAllocationRule);
        }

        setSourceMap(sourceRes || []);
        setCourseMap(courseRes || []);
        setSources(sourceDropdown || []);
        setCourses(courseDropdown || []);
        setUsers(userDropdown || []);
      })
      .catch(() => toast.error("Unable to load settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    init();
  }, []);

  const handleSaveRule = () => {
    setSaving(true);

    xFetch({
      path: "/services/advancedLeadAllocation/addLeadAllocationForSettings",
      method: "POST",
      payload: {
        corporateId,
        leadAllocationRule: selectedRule,
      },
    })
      .then(() => {
        setCurrentRule(selectedRule);
        toast.success("Rule updated successfully");
      })
      .catch(() => toast.error("Failed"))
      .finally(() => setSaving(false));
  };

  const deleteCurrentRule = async () => {
    if (!confirm("Are you sure you want to delete lead allocation rule?")) return;

    await xFetch({
      path: "/services/profile/deleteLeadAllocation",
      method: "POST",
      payload: { corporateId }
    });

    setCurrentRule("");
    setSelectedRule("");
    toast.success("Rule deleted successfully");
  };


  const toggleUser = (user) => {
    const exists = selectedUsers.find((x) => x.id === user.id);

    if (exists) {
      setSelectedUsers(selectedUsers.filter((x) => x.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  /* ===========================
     GROUPED TABLE DATA
  =========================== */

  const groupedSource = Object.values(
    (sourceMap || []).reduce((acc, row) => {
      if (!acc[row.source_name]) {
        acc[row.source_name] = {
          name: row.source_name,
          users: [],
          ids: [],
        };
      }

      acc[row.source_name].users.push(row.user_name);
      acc[row.source_name].ids.push(row.user_id);

      return acc;
    }, {})
  );

  const groupedCourse = Object.values(
    (courseMap || []).reduce((acc, row) => {
      if (!acc[row.course_name]) {
        acc[row.course_name] = {
          name: row.course_name,
          users: [],
          ids: [],
        };
      }

      acc[row.course_name].users.push(row.user_name);
      acc[row.course_name].ids.push(row.user_id);

      return acc;
    }, {})
  );

  /* ===========================
     OPEN POPUPS WITH AUTO CHECK
  =========================== */

  const openSourceEdit = (row) => {
    if (selectedRule !== "BY_SOURCE") {
      toast.error("Please select BY_SOURCE rule");
      return;
    }

    setSelectedSource(row.name);
    setSelectedUsers(users.filter((u) => row.ids.includes(u.id)));
    setShowSourcePopup(true);
  };

  const openCourseEdit = (row) => {
    if (selectedRule !== "BY_COURSE") {
      toast.error("Please select BY_COURSE rule");
      return;
    }

    setSelectedCourse(row.name);
    setSelectedUsers(users.filter((u) => row.ids.includes(u.id)));
    setShowCoursePopup(true);
  };

  /* ===========================
     SAVE SOURCE
  =========================== */

  const saveSourceMapping = async () => {
    if (selectedRule !== "BY_SOURCE") {
      toast.error("Please activate BY_SOURCE rule first");
      return;
    }

    if (!selectedSource || selectedUsers.length === 0) {
      toast.error("Select source and users");
      return;
    }

    const userIds = selectedUsers.map(x => x.id).join(",");

    await xFetch({
      path: "/services/profile/addLeadSourceMapping",
      method: "POST",
      payload: {
        corporateId,
        source_name: selectedSource,
        user_ids: userIds,
        sort_order: 1
      }
    });

    toast.success("Source mapping updated");
    setShowSourcePopup(false);
    setSelectedUsers([]);
    init();
  };

  /* ===========================
     SAVE COURSE
  =========================== */

  const saveCourseMapping = async () => {
    if (selectedRule !== "BY_COURSE") {
      toast.error("Please activate BY_COURSE rule first");
      return;
    }

    if (!selectedCourse || selectedUsers.length === 0) {
      toast.error("Select course and users");
      return;
    }

    const userIds = selectedUsers.map(x => x.id).join(",");

    await xFetch({
      path: "/services/profile/addLeadCourseMapping",
      method: "POST",
      payload: {
        corporateId,
        course_name: selectedCourse,
        user_ids: userIds,
        sort_order: 1
      }
    });

    toast.success("Course mapping updated");
    setShowCoursePopup(false);
    setSelectedUsers([]);
    init();
  };

  const deleteSource = async (name) => {
  if (!confirm("Delete all users for this source?")) return;

  await xFetch({
    path: "/services/profile/deleteLeadSourceMapping",
    method: "POST",
    payload: {
      corporateId,
      source_name: name
    }
  });

  toast.success("Source mapping deleted");
  init();
};

const deleteCourse = async (name) => {
  if (!confirm("Delete all users for this course?")) return;

  await xFetch({
    path: "/services/profile/deleteLeadCourseMapping",
    method: "POST",
    payload: {
      corporateId,
      course_name: name
    }
  });

  toast.success("Course mapping deleted");
  init();
};

const openAdvancedAllocation = async () => {
  try {
    await xFetch({
      path: "/services/advancedLeadAllocation/activateRule",
      method: "POST",
      payload: {
        corporateId,
        leadAllocationRule: "BY_ADVANCED_COURSE",
      }
    });
    router.push("/leads/settings/lead-allocation/advanced");
  } catch {
    toast.error("Unable to activate advanced lead allocation");
  }
};
  

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <ToastContainer transition={Bounce} autoClose={2200} />

      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3 items-center">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Settings2 className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold">Lead Allocation Settings</h1>
              <p className="text-sm text-slate-500">Configure lead routing logic</p>
            </div>
          </div>

          {isAdvancedAllocationEnabled && (
            <button
              type="button"
              onClick={openAdvancedAllocation}
              className="
                group flex items-center gap-3 rounded-2xl
                border border-indigo-200
                bg-gradient-to-r from-indigo-50 via-violet-50 to-blue-50
                px-4 py-3 text-left
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-indigo-300
                hover:shadow-md
              "
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Sparkles size={20} />
              </span>

              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Advanced Lead Allocation
                </span>
                <span className="block text-xs text-slate-500">
                  Group, ratios, limits and advisor controls
                </span>
              </span>

              <ArrowRight
                size={18}
                className="ml-2 text-indigo-600 transition-transform group-hover:translate-x-1"
              />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 flex justify-center">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div
            className={`mb-5 border rounded-2xl p-4 flex gap-3 ${
              currentRule === "NO_RULE"
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <CheckCircle2
              className={
                currentRule === "NO_RULE"
                  ? "text-red-600"
                  : "text-green-600"
              }
            />

            <div>
              <p className="text-sm text-slate-500">Current Rule</p>
              <p className="font-semibold">
                {currentRule === "NO_RULE"
                  ? "No Rule Applied"
                  : currentRule}
              </p>
            </div>
          </div>

          {/* RULES */}
          <div className="grid md:grid-cols-3 gap-5">
            {rules.map((rule) => {
              const Icon = rule.icon;
              const active = selectedRule === rule.value;

              return (
                <button
                  key={rule.value}
                  onClick={() => setSelectedRule(rule.value)}
                  className={`rounded-2xl border p-5 text-left bg-gradient-to-br ${rule.color}
                  ${active ? "ring-2 ring-blue-500 shadow-md" : "bg-white hover:shadow-sm"}`}
                >
                  <Icon className="mb-4" />
                  <h3 className="font-semibold">{rule.title}</h3>
                  <p className="text-sm text-slate-500 mt-2">{rule.subtitle}</p>
                </button>
              );
            })}
          </div>

          {/* SAVE RULE */}
          <div className="mt-6 bg-white rounded-2xl border p-5 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">Selected Rule</p>
              <p className="font-semibold">{selectedRule}</p>
            </div>

            <div className="flex gap-3">
              {/* Delete Button */}
              <button
                onClick={deleteCurrentRule}
                className="bg-red-600 text-white px-5 py-3 rounded-xl flex gap-2"
              >
                <Trash2 size={18} />
                Delete Rule
              </button>

              {/* Save Button */}
              <button
                onClick={handleSaveRule}
                className="bg-blue-600 text-white px-5 py-3 rounded-xl flex gap-2"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save Rule
              </button>
            </div>
          </div>

          {/* SOURCE */}
          {selectedRule === "BY_SOURCE" && (
            <MappingTable
              title="Source → User Mapping"
              color="green"
              rows={groupedSource}
              onAdd={() => {
                setSelectedSource("");
                setSelectedUsers([]);
                setShowSourcePopup(true);
              }}
              onEdit={openSourceEdit}
              onDelete={(row) => deleteSource(row.name)}
            />
          )}

          {/* COURSE */}
          {selectedRule === "BY_COURSE" && (
            <MappingTable
              title="Course → User Mapping"
              color="violet"
              rows={groupedCourse}
              onAdd={() => {
                setSelectedCourse("");
                setSelectedUsers([]);
                setShowCoursePopup(true);
              }}
              onEdit={openCourseEdit}
              onDelete={(row) => deleteCourse(row.name)}
            />
          )}
        </>
      )}

      {/* SOURCE POPUP */}
      {showSourcePopup && (
        <PopupCard
          title="Add / Update Source Mapping"
          onClose={() => setShowSourcePopup(false)}
          onSave={saveSourceMapping}
        >
          <select
              className="w-full border rounded-xl px-4 py-3 mb-4"
              value={selectedSource}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSource(val);

                const found = groupedSource.find(x => x.name === val);

                if (found) {
                  setSelectedUsers(users.filter(u => found.ids.includes(u.id)));
                } else {
                  setSelectedUsers([]);
                }
              }}
            >
            <option value="">Select Source</option>
            {sources.map((x) => (
              <option key={x.id}>{x.source}</option>
            ))}
          </select>

          <UserList
            key={selectedSource || selectedCourse}
            users={users}
            selectedUsers={selectedUsers}
            toggleUser={toggleUser}
          />
        </PopupCard>
      )}

      {/* COURSE POPUP */}
      {showCoursePopup && (
        <PopupCard
          title="Add / Update Course Mapping"
          onClose={() => setShowCoursePopup(false)}
          onSave={saveCourseMapping}
        >
          <select
            className="w-full border rounded-xl px-4 py-3 mb-4"
            value={selectedCourse}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCourse(val);

              const found = groupedCourse.find(x => x.name === val);

              if (found) {
                setSelectedUsers(users.filter(u => found.ids.includes(u.id)));
              } else {
                setSelectedUsers([]);
              }
            }}
          >
            <option value="">Select Course</option>
            {courses.map((x) => (
              <option key={x.id}>{x.course}</option>
            ))}
        </select>

          <UserList
            key={selectedSource || selectedCourse}
            users={users}
            selectedUsers={selectedUsers}
            toggleUser={toggleUser}
          />
        </PopupCard>
      )}
    </div>
  );
}

/* ===================== COMPONENTS ===================== */

function MappingTable({ title, color, rows, onAdd, onEdit, onDelete }) {
  return (
    <div className="mt-8 bg-white rounded-2xl border p-6">
      <div className="flex justify-between mb-5">
        <h2 className="text-lg font-semibold">{title}</h2>

        <button
          onClick={onAdd}
          className={`px-4 py-2 rounded-xl text-white flex gap-2 ${
            color === "green" ? "bg-green-600" : "bg-violet-600"
          }`}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Users</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t">
              <td className="p-2">{row.name}</td>
              <td className="p-2">{row.users.join(", ")}</td>
              <td className="p-2 text-center">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => onEdit(row)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(row)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PopupCard({ title, children, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[520px] rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between mb-5">
          <h3 className="text-lg font-semibold">{title}</h3>

          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {children}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-300">
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white flex gap-2"
          >
            <Check size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function UserList({ users, selectedUsers, toggleUser }) {
  return (
    <div>
      <p className="text-sm font-medium mb-3">Assign Multiple Users</p>

      <div className="space-y-2 max-h-[250px] overflow-auto">
        {users.map((user) => {
          const checked = selectedUsers.some(
            (x) => Number(x.id) === Number(user.id)
          );

          return (
            <label
              key={user.id}
              className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleUser(user)}
              />
              <span>{user.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
