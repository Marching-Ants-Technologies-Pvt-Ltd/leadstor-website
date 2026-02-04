'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { xFetch } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import { Dialog } from '@headlessui/react';
import Spinner from '@/components/common/Spinner';
import 'remixicon/fonts/remixicon.css';

export default function Teams() {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Pagination States ───────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); // default rows per page
  const [totalPages, setTotalPages] = useState(1);

  // ─── Fetch Data ──────────────────────────────────────────────
  const fetchData = async () => {
    if (!Corporate?._id) return;

    setLoading(true);
    try {
      const [teamRes, rolesRes, managersRes] = await Promise.all([
        xFetch({
          path: `/services/profile/getUsers`,
          payload: { corporateId: Corporate._id },
        }),
        xFetch({
          path: `/services/authentication/getRoles?corporateId=${Corporate._id}&time=${Date.now()}`,
          method: 'GET',
        }),
        xFetch({
          path: `/services/profile/getUserManagers`,
          payload: { corporateId: Corporate._id },
        }),
      ]);

      setMembers(Array.isArray(teamRes) ? teamRes : []);
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      setManagers(managersRes || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [Corporate?._id]);

  // ─── Filtered Members ────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return members.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q) ||
        (m.roles || []).join(',').toLowerCase().includes(q)
    );
  }, [members, query]);

  // ─── Pagination Logic ────────────────────────────────────────
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * limit;
    const end = start + limit;
    return filtered.slice(start, end);
  }, [filtered, currentPage, limit]);

  useEffect(() => {
    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    setTotalPages(pages);

    // Reset to page 1 if current page is out of range
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [filtered, limit, currentPage]);

  // Generate page numbers (1,2,3... or with ellipsis)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  // ─── Handlers ────────────────────────────────────────────────
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // reset to first page
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openEdit = (member) => {
    setEditMember(member);
    const roleIds = (member.roles || []).map((r) => {
      if (typeof r === 'object' && r.id) return parseInt(r.id);
      if (!isNaN(r)) return parseInt(r);
      const match = roles.find((role) => role.name === r);
      return match ? match.id : null;
    }).filter(Boolean);

    setSelectedRoles(roleIds);
    setShowModal(true);
  };

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
     *  TABLE SELECTION
     * ---------------------------------------- */
    const toggleSelect = (id) => {
      const s = new Set(selected);
      s.has(id) ? s.delete(id) : s.add(id);
      setSelected(s);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
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

      {/* Table Container */}
      <div className="bg-white shadow rounded relative">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            {/* SCROLL WRAPPER */}
            <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
              <table className="min-w-[1500px] w-full text-[13px] border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="p-3 w-10 text-center">
                      <input type="checkbox" />
                    </th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Mobile</th>
                    <th className="p-3 text-left">Password</th>
                    <th className="p-3 text-left">Salary</th>
                    <th className="p-3 text-left">Signature</th>
                    <th className="p-3 text-left">Roles</th>
                    <th className="p-3 text-left">Manager</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-500">
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    paginatedMembers.map((member) => (
                      <tr key={member.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-center">
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
                        <td className="p-3">{member.signature || '-'}</td>
                        <td className="p-3">
                          <RoleBadges roles={member.roles} />
                        </td>
                        <td className="p-3">{member.managerName || '-'}</td>
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t bg-white px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
              <div>
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, filtered.length)} of{" "}
                {filtered.length} members
              </div>

              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {[5, 10, 20, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    ‹
                  </button>

                  {pageNumbers.map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`px-3 py-1 border rounded ${
                        p === currentPage
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          </>
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