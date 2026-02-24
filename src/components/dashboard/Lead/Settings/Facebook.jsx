import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { xFetch } from "@/utility/xFetch";
import { Search } from "lucide-react";
import { Corporate } from "@/utility/TinyDB";

/* ---------- API endpoints ---------- */
const API = {
  getSubscribedForms: "/services/facebook/getSubscribedForms",
  getConceptNinjasFields: "/services/facebook/conceptninjasFields",
  subscribeFBPage: "/services/facebook/subscribeFBPage",
  updateSubscription: "/services/facebook/updateSubscription",
  deleteSubscribeForm: "/services/facebook/deleteSubscribeForm",
  getMappedFields: "/services/facebook/getMappedFields",
  getExtendedUserToken: "/services/facebook/getExtendedUserToken",
};

/* ---------- Unified Facebook Auth Button (Login + Logout) ---------- */
function FacebookAuthButton({ status, onSuccess, onLogout }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded");
      return;
    }

    setLoading(true);

    window.FB.login(
      (response) => {
        setLoading(false);
        if (response.status === "connected") {
          toast.success("Logged in successfully");
          onSuccess?.();
        } else {
          toast.error("Login cancelled or failed");
        }
      },
      {
        scope: "public_profile,pages_show_list,pages_manage_metadata,pages_read_engagement,leads_retrieval",
      }
    );
  };

  const handleLogout = () => {
    if (!window.FB) return;
    setLoading(true);

    window.FB.logout((response) => {
      setLoading(false);
      toast.info("Logged out from Facebook");
      onLogout?.();
    });
  };

  const isConnected = status?.status === "connected";

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 font-medium">Connected to Facebook</span>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <button
      className="px-4 py-2 bg-[#1877F2] text-white rounded shadow hover:bg-[#145FCC] transition"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Continue with Facebook"}
    </button>
  );
}

/* ---------- SDK Loader Hook ---------- */
function useFacebookSDK(appId = "354120981351314", version = "v19.0") {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (window.FB) {
      setLoaded(true);
      return;
    }

    window.fbAsyncInit = () => {
      try {
        window.FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: true,
          version,
        });
      } catch (err) {
        console.error("FB.init failed", err);
      }

      window.FB.getLoginStatus((resp) => {
        setStatus(resp);
      });
      setLoaded(true);
    };

    const id = "facebook-jssdk";
    if (document.getElementById(id)) return;

    const js = document.createElement("script");
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js"; // ← fixed locale
    document.head.appendChild(js);
  }, [appId, version]);

  const refreshStatus = useCallback((callback) => {
    if (!window.FB) return callback?.(null);
    window.FB.getLoginStatus((resp) => {
      setStatus(resp);
      callback?.(resp);
    });
  }, []);

  return { loaded, status, refreshStatus };
}

/* ---------- Main Component ---------- */
export default function FacebookLeadManager() {
  const { loaded, status, refreshStatus } = useFacebookSDK();
  const [pages, setPages] = useState([]);
  const [subscribed, setSubscribed] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIdx, setPageIdx] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const corporateId = Corporate?._id || "";
  const corporateType = Corporate?.type || 0;

  // Core data fetching function
  const fetchFacebookData = useCallback(async () => {
    if (!loaded || status?.status !== "connected" || !window.FB) {
      setPages([]);
      setSubscribed([]);
      return;
    }

    let token = status.authResponse?.accessToken;

    try {
      const ext = await facebookApi.getExtendedToken(token).catch(() => null);
      if (ext?.access_token) token = ext.access_token;

      // Fetch pages
      const pageRes = await new Promise((resolve) => {
        window.FB.api(`/me/accounts?access_token=${token}`, (res) => resolve(res));
      });

      const fbPages = Array.isArray(pageRes?.data) ? pageRes.data : [];
      setPages(fbPages);

      // Fetch subscribed forms
      const subs = await facebookApi.fetchSubscribedForms(corporateId, fbPages);
      setSubscribed(Array.isArray(subs) ? subs : []);
    } catch (err) {
      console.error("Fetch Facebook data failed:", err);
      setSubscribed([]);
    }
  }, [loaded, status?.status, status?.authResponse?.accessToken, corporateId]);

  // Auto-fetch on mount + status change
  useEffect(() => {
    if (loaded) {
      fetchFacebookData();
    }
  }, [loaded, status?.status, fetchFacebookData]);

  // Handle successful login
  const handleLoginSuccess = useCallback(() => {
    refreshStatus((resp) => {
      if (resp?.status === "connected") {
        fetchFacebookData();
      }
    });
  }, [refreshStatus, fetchFacebookData]);

  // Handle logout → reset everything
  const handleLogout = useCallback(() => {
    setPages([]);
    setSubscribed([]);
    setEditData(null);
    setModalOpen(false);
    // Optional: force status refresh
    refreshStatus();
  }, [refreshStatus]);

  const refreshList = useCallback(() => {
    fetchFacebookData();
    toast.info("Refreshing subscriptions...");
  }, [fetchFacebookData]);

  const openSubscribe = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditData({
      pageId: row.page_id,
      subscriptionId: row.subscription_id,
      pageAccessToken: row.page_access_token,
      formId: row.form_id,
      formTableId: row.form_table_id,
      course: row.course,
      target_location: row.target_location,
    });
    setModalOpen(true);
  };

  const doDelete = async (row) => {
    if (!confirm("Delete this subscription?")) return;

    try {
      const res = await facebookApi.deleteSubscription(row.form_table_id);
      if (res?.msg === "success") {
        toast.success("Subscription deleted");
        refreshList();
      } else {
        toast.error(res?.msg || "Delete failed");
      }
    } catch (err) {
      toast.error("Network error while deleting");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribed;
    return subscribed.filter(
      (r) =>
        (r.form_name || "").toLowerCase().includes(q) ||
        (r.page_name || "").toLowerCase().includes(q)
    );
  }, [search, subscribed]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((pageIdx - 1) * pageSize, pageIdx * pageSize);

  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openSubscribe}
            disabled={status?.status !== "connected"}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            + Subscribe New Form
          </button>
          <button
            onClick={refreshList}
            disabled={status?.status !== "connected"}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50"
          >
            Refresh List
          </button>
        </div>

        <FacebookAuthButton
          status={status}
          onSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIdx(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Not connected message */}
      {loaded && status?.status !== "connected" && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Please connect your Facebook account to view and manage form subscriptions.
        </div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Page Name</th>
              <th className="p-3 text-left">Form ID</th>
              <th className="p-3 text-left">Form Name</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  {status?.status === "connected" ? "No subscriptions found" : "Not connected"}
                </td>
              </tr>
            ) : (
              pageItems.map((row, i) => (
                <tr key={row.form_table_id || i} className="border-t hover:bg-gray-50">
                  <td className="p-3">{(pageIdx - 1) * pageSize + i + 1}</td>
                  <td className="p-3">{row.page_name || "—"}</td>
                  <td className="p-3">{row.form_id || "—"}</td>
                  <td className="p-3">{row.form_name || "—"}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => doDelete(row)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <div>Showing {pageItems.length} of {filtered.length}</div>
            <div className="flex gap-2">
              <button
                disabled={pageIdx === 1}
                onClick={() => setPageIdx((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-3 py-1 font-medium">
                Page {pageIdx} of {Math.ceil(filtered.length / pageSize)}
              </span>
              <button
                disabled={pageIdx >= Math.ceil(filtered.length / pageSize)}
                onClick={() => setPageIdx((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <SubscribeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          fbPages={pages}
          initialData={editData}
          corporateId={corporateId}
          corporateType={corporateType}
          onSaved={refreshList}
        />
      )}
    </div>
  );
}