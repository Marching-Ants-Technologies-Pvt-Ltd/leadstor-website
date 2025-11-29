'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Corporate } from '@/utility/TinyDB';
import { xFetch } from "@/utility/xFetch";
import { Dialog } from '@headlessui/react';
import Spinner from "@/components/common/Spinner";
import 'remixicon/fonts/remixicon.css';

export default function Teams() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);

  /** -----------------------------------------
   *  FETCH FUNCTIONS (return promises)
   * ---------------------------------------- */

  const fetchRoles = () => {
    return xFetch({
      path: `/services/authentication/getRoles?corporateId=${Corporate?._id}&time=${Date.now()}`,
      method: "GET"
    })
      .then((res) => setRoles(Array.isArray(res) ? res : []))
      .catch(() => setRoles([]));
  };

  const fetchTeam = () => {
    return xFetch({
      path: `/services/profile/getUsers`,
      payload: { corporateId: Corporate?._id }
    })
      .then((res) => setMembers(Array.isArray(res) ? res : []))
      .catch(() => setMembers([]));
  };

  const fetchManagers = () => {
    return xFetch({
      path: `/services/profile/getUserManagers`,
      payload: { corporateId: Corporate?._id }
    })
      .then((res) => setManagers(res || []))
      .catch(() => setManagers([]));
  };

  /** -----------------------------------------
   *  RUN ALL FETCHES TOGETHER
   * ---------------------------------------- */
  useEffect(() => {
    if (!Corporate?._id) return;

    setLoading(true);
    Promise.all([fetchTeam(), fetchRoles(), fetchManagers()])
      .finally(() => setLoading(false));
  }, [Corporate?._id]);

  /** -----------------------------------------
   *  SEARCH FILTER
   * ---------------------------------------- */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return members.filter(m =>
      (m.name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      ((m.roles || []).join(',').toLowerCase().includes(q))
    );
  }, [members, query]);

  /** -----------------------------------------
   *  TABLE SELECTION
   * ---------------------------------------- */
  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  /** -----------------------------------------
   *  EDIT USER
   * ---------------------------------------- */
  const openEdit = (member) => {
    setEditMember(member);

    const roleIds = (member.roles || []).map(r => {
      if (typeof r === "object" && r.id) return parseInt(r.id);
      if (!isNaN(r)) return parseInt(r);
      const match = roles.find(role => role.name === r);
      return match ? match.id : null;
    }).filter(Boolean);

    setSelectedRoles(roleIds);
    setShowModal(true);
  };

  /** -----------------------------------------
   *  SAVE / UPDATE USER
   * ---------------------------------------- */
  const saveMember = async (newMember) => {
    let corporateId = Corporate?._id;
    const payload = {
      ...newMember,
      corporateId,
      salary: newMember.salary,
      roles: selectedRoles,
      sign: btoa(newMember.signature || ""),
      managers: newMember.managerId || ""
    };

    if (editMember?.id) payload.id = editMember.id;

    try {
      await xFetch({
        path: editMember ? `/services/profile/updateUserSettings` : `/services/profile/addUserSettings`,
        payload,
        method: "POST"
      });

      fetchTeam();
      setShowModal(false);
    } catch (err) {
      console.error("Save error", err);
    }
  };

  /** -----------------------------------------
   *  DISABLE / ENABLE USER
   * ---------------------------------------- */
  const openDisableDialog = (user) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const handleDisableToggle = async () => {
    if (!selectedUser) return;

    const disableValue = selectedUser.userDisabled == 1 ? 0 : 1;
    try {
      await xFetch({
        path: `/services/profile/enableDisableUser`,
        payload: { userId: selectedUser.id, disable: disableValue },
        method: "POST",
      });

      closeDialog();
      fetchTeam();
    } catch (err) {
      console.error("Toggle Disable failed:", err);
    }
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setIsOpen(false);
  };

  /** -----------------------------------------
   *  DELETE USER(S)
   * ---------------------------------------- */
  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user?")) return;

    await xFetch({
      path: `/services/profile/deleteUser`,
      payload: { userId },
      method: "POST",
    });

    fetchTeam();
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return alert("Nothing selected");

    if (!confirm("Delete selected users?")) return;

    for (let id of selected) await handleDeleteUser(id);

    setSelected(new Set());
  };

  /** -----------------------------------------
   *  UI COMPONENTS
   * ---------------------------------------- */
  const RoleBadges = ({ roles }) => {
    return (
      <div className="flex flex-wrap gap-1">
        {roles?.map((r, i) => {
          const role = typeof r === "object" ? r : roles.find(ro => ro.id === r);
          return (
            <span key={i} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
              {role?.name || r}
            </span>
          );
        })}
      </div>
    );
  };

  /** -----------------------------------------
   *  RENDER
   * ---------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>

        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              placeholder="Search team..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border pl-9 pr-3 py-2 rounded bg-white focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={() => {
              setEditMember(null);
              setSelectedRoles([]);
              setShowModal(true);
            }}
            className="bg-teal-500 text-white p-2 rounded shadow hover:bg-teal-600"
          >
            <i className="ri-user-add-line text-lg"></i>
          </button>

          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 text-white p-2 rounded shadow hover:bg-red-600"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3"><input type="checkbox" /></th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Password</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Signature</th>
                <th className="p-3">Roles</th>
                <th className="p-3">Manager</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((member) => (
                <tr key={member.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggleSelect(member.id)}
                    />
                  </td>
                  <td className="p-3">{member.name}</td>
                  <td className="p-3">{member.email}</td>
                  <td className="p-3">{member.mobile}</td>
                  <td className="p-3">{member.password}</td>
                  <td className="p-3">{member.salary}</td>
                  <td className="p-3">{member.signature || "-"}</td>
                  <td className="p-3"><RoleBadges roles={member.roles} /></td>
                  <td className="p-3">{member.managerName || "-"}</td>

                  <td className="p-3 flex justify-center gap-3">
                    <button onClick={() => openEdit(member)} className="text-blue-500 hover:text-blue-700">
                      <i className="ri-edit-line text-lg"></i>
                    </button>

                    <button
                      onClick={() => openDisableDialog(member)}
                      className="transition hover:scale-110"
                      title={member.userDisabled == 1 ? "Enable User Login" : "Disable User Login"}
                    >
                      {member.userDisabled == 1 ? (
                        <i className="ri-user-follow-line text-green-600 text-xl"></i>
                      ) : (
                        <i className="ri-user-unfollow-line text-orange-600 text-xl"></i>
                      )}
                    </button>

                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="p-5 text-center text-gray-500" colSpan="10">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <Dialog.Panel className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="bg-sky-600 text-white px-4 py-3 flex justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <i className="ri-user-line"></i>
                {editMember ? "Edit User" : "Add User"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.target);
                const newMember = Object.fromEntries(form.entries());
                saveMember(newMember);
              }}
              className="p-4 space-y-3"
            >
              {/* INPUTS */}
              {[
                { name: "name", icon: "ri-user-line", placeholder: "Name" },
                { name: "email", icon: "ri-mail-line", placeholder: "Email" },
                { name: "mobile", icon: "ri-phone-line", placeholder: "Mobile" },
                { name: "password", icon: "ri-lock-line", placeholder: "Password" },
                { name: "salary", icon: "ri-money-rupee-circle-line", placeholder: "Salary" },
                { name: "signature", icon: "ri-edit-line", placeholder: "Signature" },
              ].map((f) => (
                <div key={f.name} className="border rounded px-3 py-2 bg-gray-50 flex items-center">
                  <i className={`${f.icon} text-gray-500 mr-2`}></i>
                  <input
                    name={f.name}
                    defaultValue={editMember?.[f.name]}
                    placeholder={f.placeholder}
                    className="w-full bg-transparent outline-none"
                  />
                </div>
              ))}

              {/* ROLES */}
              <div>
                <label className="text-sm font-medium text-gray-700">Assign Roles</label>
                <select
                  multiple
                  value={selectedRoles}
                  onChange={(e) =>
                    setSelectedRoles(
                      Array.from(e.target.selectedOptions, (opt) => parseInt(opt.value))
                    )
                  }
                  className="w-full border p-2 rounded bg-white"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MANAGER SELECT */}
              {editMember && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Manager</label>
                  <select
                    name="managerId"
                    defaultValue={editMember.managerId || ""}
                    className="w-full border p-2 rounded bg-white"
                  >
                    <option value="">Select Manager</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                  Save
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* DISABLE / ENABLE MODAL */}
      <Dialog open={isOpen} onClose={closeDialog} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <Dialog.Title className="text-lg font-semibold text-blue-600 mb-2">
              {selectedUser?.userDisabled == 1 ? "Enable User" : "Disable User"}
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 mb-6">
              {selectedUser?.userDisabled == 1
                ? "This will allow the user to login again."
                : "This will disable user login. Are you sure?"}
            </Dialog.Description>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDisableToggle}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                OK
              </button>

              <button
                onClick={closeDialog}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
