'use client';

import { useEffect, useState } from 'react';
import { xFetch } from '@/utility/xFetch';
import { Corporate } from '@/utility/TinyDB';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RouteData = ({ lead, isOpen, onClose, onSuccess }) => {
  const [siblings, setSiblings] = useState([]);
  const [filteredSiblings, setFilteredSiblings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [search, setSearch] = useState("");

  /* ---------------- Fetch siblings ---------------- */
  useEffect(() => {
    if (!isOpen || !lead) return;

    setLoading(true);

    xFetch({
      path: '/services/invite/getSiblings',
      method: 'POST',
      payload: {
        corporateId: Corporate.id,
        invitationId: lead.invitationId,
        firstName: lead.firstName,
        testId: lead.testId,
        testName: lead.testName,
        testType: lead.testType
      }
    })
      .then(res => {
        setSiblings(res || []);
        setFilteredSiblings(res || []);
      })
      .catch(() => toast.error("Failed to fetch route data"))
      .finally(() => setLoading(false));
  }, [isOpen, lead]);

  /* ---------------- Search filter ---------------- */
  useEffect(() => {
    if (!search) {
      setFilteredSiblings(siblings);
      return;
    }

    const q = search.toLowerCase();

    setFilteredSiblings(
      siblings.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.mobile?.toLowerCase().includes(q)
      )
    );
  }, [search, siblings]);

  if (!isOpen) return null;

  /* ---------------- Route handler ---------------- */
  const routeDataToSibling = () => {
    if (!confirmData) return;

    setLoading(true);

    xFetch({
      path: '/services/invite/routeToSibling',
      method: 'POST',
      payload: {
        corporateId: Corporate.id,
        siblingId: confirmData.siblingId,
        routeInvitationId: lead.invitationId
      }
    })
      .then((res) => {
            setLoading(false);
            setConfirmData(null);
            toast.success(res.message);
            onSuccess();
            onClose();
      })
      .catch(() => toast.error("Failed to route data to sibling"))
      .finally(() => {
      });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-xl w-[900px] max-h-[80vh] shadow-xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h2 className="text-lg font-semibold">Route To Sibling</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <i className="ri-close-line text-xl" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3">
            <div className="relative max-w-sm">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or mobile"
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto px-5 py-3">
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Loading siblings...
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-gray-100 text-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold tracking-wide">Name</th>
                    <th className="px-3 py-2 text-left font-semibold tracking-wide">Email</th>
                    <th className="px-3 py-2 text-left font-semibold tracking-wide">Mobile</th>
                    <th className="px-3 py-2 text-left font-semibold tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSiblings.map(s => (
                    <tr key={s.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">{s.name}</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{s.email}</td>
                      <td className="px-3 py-2 font-medium text-gray-900">{s.mobile}</td>
                      <td className="px-3 py-2 font-medium text-gray-900 text-center">
                        <button
                          title="Route to sibling"
                          onClick={() =>
                            setConfirmData({
                              siblingId: s.id,
                              siblingName: s.name
                            })
                          }
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                        >
                          <i className="ri-share-forward-fill text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredSiblings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-500">
                        No matching siblings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmData && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-[420px] shadow-xl">
              <div className="px-5 py-3 border-b font-semibold">Route Data</div>

              <div className="px-5 py-4 text-sm">
                Are you sure you want to route{" "}
                <span className="font-semibold">{lead.firstName}</span>{" "}
                to{" "}
                <span className="font-semibold">{confirmData.siblingName}</span>?
              </div>

              <div className="flex justify-end gap-3 px-5 py-3 border-t">
                <button
                  onClick={() => setConfirmData(null)}
                  className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  onClick={routeDataToSibling}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {loading ? "Routing..." : "OK"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RouteData;
