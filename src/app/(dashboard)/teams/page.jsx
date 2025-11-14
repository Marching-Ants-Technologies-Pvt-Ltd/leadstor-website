'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Corporate } from '@/utility/TinyDB';
import { xFetch } from "@/utility/xFetch";
import { Dialog } from '@headlessui/react';
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
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  // Fetch all roles dynamically
  const fetchRoles = () => {
  
      xFetch({
        path: `/services/authentication/getRoles?corporateId=${Corporate?._id}&time=${new Date().getMilliseconds()}`,
        method: 'GET'
      })
      .then((res) => {
        if (Array.isArray(res)) {
          setRoles(res);
        } else {
          console.error("Unexpected response format:", res);
          setRoles([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching roles:", err);
      setRoles([]);
      })
      .finally(() => setLoading(false));

  };

  // Fetch team users
  const fetchTeam = () => {
    setLoading(true);
    let corporateId = Corporate?._id;
    xFetch({
      path: `/services/profile/getUsers`,
      payload: { corporateId },
    })
      .then((res) => {
        if (Array.isArray(res)) {
          setMembers(res);
        } else {
          console.error("Unexpected response format:", res);
          setMembers([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching team:", err);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  };

  // ✅ Fetch managers list
  const fetchManagers = () => {
    let  corporateId = Corporate?._id;
    xFetch({
      path: `/services/profile/getUserManagers`,
      payload: { corporateId},
    })
      .then((res) => setManagers(res || []))
      .catch((err) => {
        console.error("Error fetching managers:", err);
        setManagers([]);
      });
  };

  useEffect(() => {
    fetchTeam();
    fetchManagers();
    fetchRoles();
  }, [Corporate?._id]);

  // ✅ Search filter
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return members.filter(m =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      ((m.roles || []).join(',').toLowerCase().includes(q))
    );
  }, [members, query]);

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const deleteSelected = () => {
    if (selected.size === 0) return;
    setMembers(members.filter(m => !selected.has(m.id)));
    setSelected(new Set());
  };

  const openEdit = (member) => {
    setEditMember(member);
    
    // Convert to clean integer IDs based on structure
    const roleIds = (member.roles || []).map(r => {
        if (typeof r === "object" && r.id) return parseInt(r.id);
        if (!isNaN(r)) return parseInt(r);
        // Try to match name if roles only contain names
        const matched = roles.find(role => role.name === r);
        return matched ? matched.id : null;
    }).filter(Boolean);

    setSelectedRoles(roleIds);
    setShowModal(true);
  };

  // Save or update user
  const saveMember = async (newMember) => {
    let corporateId = Corporate?._id;
    const payload = {
      corporateId,
      name: newMember.name,
      email: newMember.email,
      mobile: newMember.mobile,
      password: newMember.password,
      salary: newMember.salary,
      roles: selectedRoles, // sending array of role IDs
      sign: btoa(newMember.signature || ''),
      managers: newMember.managerId || "",
    };

    if (editMember && editMember.id) {
      payload.id = editMember.id;
    }

    try {
      const res = await xFetch({
        path: editMember ? '/services/profile/updateUserSettings' : '/services/profile/addUserSettings',
        payload,
        method: 'POST',
      });
      console.log("User saved:", res);
      fetchTeam();
      setShowModal(false);
      setEditMember(null);
      setSelectedRoles([]);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const openDialog = (user) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const openDisableDialog = (user) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setIsOpen(false);
  };

  // Role Selection
  const handleRoleChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setSelectedRoles(options);
  };

  const RoleBadges = ({ roles }) => (
    <div className="flex flex-wrap gap-1">
      {roles?.map(r => {
        const roleObj = typeof r === "object" ? r : roles.find(ro => ro.id === r);
        return (
          <span key={r.id || r} className="text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-800">
            {roleObj?.name || r}
          </span>
        );
      })}
    </div>
  );

const handleDisable = async () => {
    if (!selectedUser) return;
    try {
      await xFetch({
        path: `/services/profile/enableDisableUser`,
        payload: { userId: selectedUser.id, disable: true },
        method: "POST",
      });
      console.log("User disabled:", selectedUser.id);
      closeDialog();
      fetchTeam();
    } catch (err) {
      console.error("Error disabling user:", err);
    }
  };

 const handleDeleteSelected = async () => {
    if (selected.size === 0) return alert("No users selected");
    if (!confirm("Delete all selected users?")) return;
    for (let id of selected) {
      await handleDeleteUser(id);
    }
    setSelected(new Set());
};

const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await xFetch({
        path: `/services/profile/deleteUser`,
        payload: { userId },
        method: "POST",
      });
      fetchTeam();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              placeholder="Search team..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="border pl-9 pr-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={() => {
              setEditMember(null);
              setSelectedRoles([]);
              setShowModal(true);
            }}
            className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg shadow transition"
            title="Add Member"
          >
            <i className="ri-user-add-line text-lg"></i>
          </button>

          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow transition"
            title="Delete Selected"
          >
            <i className="ri-delete-bin-line text-lg"></i>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <p className="p-4 text-gray-600 text-center">Loading team members...</p>
        ) : (
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3"><input type="checkbox" /></th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Mobile</th>
                <th className="text-left p-3">Password</th>
                <th className="text-left p-3">Salary</th>
                <th className="text-left p-3">Signature</th>
                <th className="text-left p-3">Roles</th>
                <th className="text-left p-3">Manager</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(member => (
                <tr key={member.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(member.id)}
                      onChange={() => toggleSelect(member.id)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-800">{member.name}</td>
                  <td className="p-3 text-gray-600">{member.email}</td>
                  <td className="p-3">{member.mobile}</td>
                  <td className="p-3">{member.password}</td>
                  <td className="p-3">{member.salary}</td>
                  <td className="p-3">{member.signature || '-'}</td>
                  <td className="p-3"><RoleBadges roles={member.roles || []} /></td>
                  <td className="p-3">{member.managerName || '-'}</td>
                  <td className="p-3 text-center flex gap-3 justify-center">
                    <button
                      onClick={() => openEdit(member)}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Edit"
                    >
                      <i className="ri-edit-line text-lg"></i>
                    </button>
                    <button
                        onClick={() => openDisableDialog(member)}
                        className={`${
                            member.userDisabled == 1
                            ? "text-green-500 hover:text-green-600"
                            : "text-orange-500 hover:text-orange-600"
                        } hover:scale-110 transition`}
                        title={member.userDisabled == 1 ? "Enable User Login" : "Disable User Login"}
                        >
                        <i
                            className={`${
                            member.userDisabled == 1 ? "ri-user-follow-line" : "ri-user-unfollow-line"
                            } text-xl`}
                        ></i>
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center p-6 text-gray-500">No team members found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-sky-600 text-white px-5 py-3 flex justify-between items-center">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <i className="ri-user-add-line text-lg"></i>
                {editMember ? 'Edit User' : 'Add User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="hover:bg-sky-700 p-1 rounded-md transition">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = new FormData(e.target);
                const newMember = Object.fromEntries(form.entries());
                saveMember(newMember);
              }}
              className="p-5 space-y-3"
            >
              {/* Inputs */}
              {[
                { name: 'name', icon: 'ri-user-line', placeholder: 'Name' },
                { name: 'email', icon: 'ri-mail-line', placeholder: 'Email' },
                { name: 'mobile', icon: 'ri-phone-line', placeholder: 'Mobile' },
                { name: 'password', icon: 'ri-lock-line', placeholder: 'Password' },
                { name: 'salary', icon: 'ri-money-rupee-circle-line', placeholder: 'Salary' },
                { name: 'signature', icon: 'ri-edit-2-line', placeholder: 'Signature' },
              ].map(f => (
                <div key={f.name} className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                  <i className={`${f.icon} text-gray-500 mr-2`}></i>
                  <input
                    name={f.name}
                    defaultValue={editMember?.[f.name]}
                    placeholder={f.placeholder}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              ))}

              {/* Dynamic Roles Dropdown */}
              <div className="border rounded-md px-3 py-2 bg-gray-50">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <i className="ri-shield-user-line text-gray-500"></i> Assign Role
                </label>
                <select
                  multiple
                  value={selectedRoles}
                  onChange={handleRoleChange}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                        {role.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles
                </p>
              </div>

              {editMember && (
                <div className="border rounded-md px-3 py-2 bg-gray-50">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                    <i className="ri-user-star-line text-gray-500"></i> Assign Manager
                    </label>
                    <select
                    name="managerId"
                    defaultValue={editMember?.managerId || ""}
                    className="w-full bg-white border border-gray-200 rounded-md p-2 outline-none focus:ring-2 focus:ring-emerald-400 hover:border-emerald-300 transition"
                    >
                    <option value="">Select Manager</option>
                    {managers.map((mgr) => (
                        <option key={mgr.id} value={mgr.id}>
                        {mgr.name}
                        </option>
                    ))}
                    </select>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-1"
                >
                  <i className="ri-close-line"></i> Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 flex items-center gap-1"
                >
                  <i className="ri-check-line"></i> Save
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Disable Confirmation */}
      <Dialog open={isOpen} onClose={closeDialog} className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 z-10">
          <Dialog.Title className="text-lg font-semibold text-blue-600 mb-2">
            Disable User Login
          </Dialog.Title>
          <Dialog.Description className="text-gray-600 mb-6">
            User login will be disabled. Are you sure you want to proceed?
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDisable}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-1 transition"
            >
              <i className="ri-check-line"></i> OK
            </button>
            <button
              onClick={closeDialog}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-1 transition"
            >
              <i className="ri-close-line"></i> Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
