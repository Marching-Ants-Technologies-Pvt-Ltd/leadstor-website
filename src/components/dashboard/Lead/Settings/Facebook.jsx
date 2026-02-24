import React, { useEffect, useState, useMemo } from "react";
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

/* ---------- Facebook Login Button ---------- */
function FacebookLoginButton({ onLoggedIn }) {
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded");
      return;
    }
    console.log("Calling FB.login – FB object:", window.FB);
    setLoading(true);

    window.FB.login(
      function (response) {
        setLoading(false);
        if (response.status === "connected") {
          toast.success("Logged in successfully");
          onLoggedIn && onLoggedIn(response);
        } else {
          toast.error("Login cancelled or failed");
        }
      },
      { scope: "public_profile,pages_show_list,pages_manage_metadata,pages_read_engagement,leads_retrieval" }
    );
  };

  return (
    <button
      className="px-4 py-2 bg-[#1877F2] text-white rounded shadow hover:bg-[#145FCC] transition"
      onClick={login}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Continue with Facebook"}
    </button>
  );
}

/* ---------- Facebook Login + Logout Button ---------- */
function FacebookAuthButton({ status, onLoggedIn, onLoggedOut }) {
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded");
      return;
    }
    console.log("Calling FB.login – FB object:", window.FB);
    setLoading(true);

    window.FB.login(
      function (response) {
        setLoading(false);
        if (response.status === "connected") {
          toast.success("Logged in successfully");
          onLoggedIn && onLoggedIn(response);
        } else {
          toast.error("Login cancelled or failed");
        }
      },
      { scope: "public_profile,pages_show_list,pages_manage_metadata,pages_read_engagement,leads_retrieval" }
    );
  };

  const logout = () => {
    if (!window.FB) return;
    setLoading(true);

    window.FB.logout(function (response) {
      setLoading(false);
      toast.info("Logged out from Facebook");
      onLoggedOut && onLoggedOut();
    });
  };

  const isConnected = status?.status === "connected";

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 font-medium">
          Connected to Facebook
        </span>
        <button
          onClick={logout}
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
      onClick={login}
      disabled={loading}
    >
      {loading ? "Connecting..." : "Continue with Facebook"}
    </button>
  );
}

/* ---------- SDK loader hook ---------- */
function useFacebookSDK(appId = "354120981351314", version = "v19.0") {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {

    if (window.FB) {
      console.log("FB already exists", window.FB);
      setLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      console.log("fbAsyncInit fired!");
      try {
        window.FB.init({
          appId,
          autoLogAppEvents: true,
          xfbml: true,
          version,
        });
        console.log("FB.init() succeeded");
      } catch (err) {
        console.error("FB.init failed", err);
      }

      window.FB.getLoginStatus(function (resp) {
        console.log("getLoginStatus:", resp);
        setStatus(resp);
      });
      setLoaded(true);
    };

    const id = "facebook-jssdk";
    if (document.getElementById(id)) return;
    const js = document.createElement("script");
    js.id = id;
    js.src = "https://connect.facebook.net/en_EB/sdk.js";
    document.getElementsByTagName("head")[0].appendChild(js);
  }, [appId, version]);

  const getStatus = (cb) => {
    if (!window.FB) return cb && cb(null);
    window.FB.getLoginStatus((r) => {
      setStatus(r);
      cb && cb(r);
    });
  };

  return { loaded, status, getStatus };
}

/* ---------- API wrappers ---------- */
const facebookApi = {
  fetchSubscribedForms: (corporateId, pages) =>
    xFetch({
      path: API.getSubscribedForms,
      method: "POST",
      payload: { pages },
    }).catch((err) => {
      console.error("fetchSubscribedForms error:", err);
      throw err;
    }),

  fetchCNFields: () =>
    xFetch({
      path: API.getConceptNinjasFields,
      method: "GET",
    }).catch((err) => {
      console.error("fetchCNFields error:", err);
      throw err;
    }),

  subscribe: (payload) =>
    xFetch({
      path: API.subscribeFBPage,
      method: "POST",
      payload,
    }).catch((err) => {
      console.error("subscribe error:", err);
      throw err;
    }),

  updateSubscription: (payload) =>
    xFetch({
      path: API.updateSubscription,
      method: "POST",
      payload,
    }).catch((err) => {
      console.error("updateSubscription error:", err);
      throw err;
    }),

  deleteSubscription: (formTableId) =>
    xFetch({
      path: API.deleteSubscribeForm,
      method: "POST",
      payload: { form_table_id: formTableId },
    }).catch((err) => {
      console.error("deleteSubscription error:", err);
      throw err;
    }),

  getMappedFields: (corporateId, pageId, formId) =>
    xFetch({
      path: API.getMappedFields,
      method: "POST",
      payload: { corporateId, pageId, formId },
    }).catch((err) => {
      console.error("getMappedFields error:", err);
      throw err;
    }),

  getExtendedToken: (userToken) =>
    xFetch({
      path: `${API.getExtendedUserToken}?userToken=${userToken}`,
      method: "GET",
    }).catch((err) => {
      console.error("getExtendedToken error:", err);
      throw err;
    }),
};

/* ---------- Subscribe / Edit Modal ---------- */
function SubscribeModal({
  isOpen,
  onClose,
  fbPages = [],
  initialData = null,
  corporateId,
  corporateType,
  onSaved,
}) {
  const [pageSelection, setPageSelection] = useState("");
  const [formsForPage, setFormsForPage] = useState([]);
  const [formSelection, setFormSelection] = useState("");
  const [cnFields, setCnFields] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [course, setCourse] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [loadingFields, setLoadingFields] = useState(false);

  // Load CN fields once
  useEffect(() => {
    facebookApi
      .fetchCNFields()
      .then((d) => setCnFields(Array.isArray(d) ? d : []))
      .catch(() => setCnFields([]));
  }, []);

  // Reset & load initial data
  useEffect(() => {
    if (!isOpen) return;

    setPageSelection("");
    setFormSelection("");
    setFormsForPage([]);
    setFieldMap({});
    setCourse("");
    setTargetLocation("");
    setLoadingFields(false);

    if (initialData) {
      const { pageId, pageAccessToken, formId, course: c, target_location } = initialData;
      setCourse(c || "");
      setTargetLocation(target_location || "");
      const pageVal = `${pageId}_${pageAccessToken}`;
      setPageSelection(pageVal);

      // Load forms → then select form → then load mapped fields
      loadFormsForPage(pageVal).then(() => {
        const formVal = `${pageVal}_${formId}`;
        setFormSelection(formVal);
        updateFields(formVal, formId, initialData.subscriptionId, initialData.formTableId, c, target_location);
      });
    }
  }, [isOpen, initialData]);

  const loadFormsForPage = async (val) => {
    if (!val) return [];
    const [pageId, pageAccessToken] = val.split("_");
    if (!window.FB) return [];

    return new Promise((resolve) => {
      window.FB.api(`/${pageId}/leadgen_forms?access_token=${pageAccessToken}&limit=200`, (response) => {
        const list = (response && Array.isArray(response.data) ? response.data : []);
        setFormsForPage(list);
        resolve(list);
      });
    });
  };

  const loadFieldsForForm = (val) => {
    if (!val) return;
    const [pageId, pageAccessToken, formId] = val.split("_");
    setLoadingFields(true);

    window.FB.api(`/${formId}?fields=id,name,questions&access_token=${pageAccessToken}`, (response) => {
      const questions = (response && Array.isArray(response.questions) ? response.questions : []);
      const defaultMap = {};
      questions.forEach((q) => {
        if (q.key) defaultMap[q.key] = "";
      });
      setFieldMap(defaultMap);
      setLoadingFields(false);
    });
  };

  const updateFields = async (formVal, formId, subscriptionId, formTableId, courseVal, targetLocationVal) => {
    if (!formVal || !formId) return;
    const [pageId, pageAccessToken] = formVal.split("_");

    setLoadingFields(true);

    try {
      const mapped = await facebookApi.getMappedFields(corporateId, pageId, formId);
      const mappedArray = Array.isArray(mapped) ? mapped : (mapped?.data || []);

      window.FB.api(`/${formId}?fields=id,name,questions&access_token=${pageAccessToken}`, (response) => {
        const questions = (response && Array.isArray(response.questions) ? response.questions : []);
        const defaultMap = {};
        questions.forEach((q) => {
          if (q.key) defaultMap[q.key] = "";
        });

        mappedArray.forEach((m) => {
          if (m.form_field_key && defaultMap.hasOwnProperty(m.form_field_key)) {
            defaultMap[m.form_field_key] = String(m.cn_field_id || "");
          }
        });

        setFieldMap(defaultMap);
        setLoadingFields(false);
      });
    } catch (err) {
      console.error(err);
      setLoadingFields(false);
    }
  };

  const onPageChange = (e) => {
    const val = e.target.value;
    setPageSelection(val);
    setFormSelection("");
    setFieldMap({});
    loadFormsForPage(val);
  };

  const onFormChange = (e) => {
    const val = e.target.value;
    setFormSelection(val);
    loadFieldsForForm(val);
  };

  const onFieldMapChange = (key, val) => {
    setFieldMap((prev) => ({ ...prev, [key]: val }));
  };

  const submit = async () => {
    if (!pageSelection || !formSelection) {
      toast.error("Please select page and form before subscribing");
      return;
    }

    const [pageId, pageToken] = pageSelection.split("_");
    const [, , formId] = formSelection.split("_");

    const payload = {
      corporateId,
      pageId,
      pageAccessToken: pageToken,
      formId,
      course,
      target_location: targetLocation,
      mapped: Object.keys(fieldMap).map((k) => ({
        form_field_key: k,
        cn_field_id: fieldMap[k],
      })),
    };

    try {
      const result = initialData
        ? await facebookApi.updateSubscription(payload)
        : await facebookApi.subscribe(payload);

      if (result && result.status === "OK") {
        toast.success(initialData ? "Subscription updated" : "Subscribed successfully");
        onSaved && onSaved();
        onClose();
      } else {
        toast.error(result?.msg || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving subscription");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-3xl bg-white rounded shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Facebook Form Subscribe</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl">
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Page Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page</label>
            <select
              value={pageSelection}
              onChange={onPageChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Page</option>
              {Array.isArray(fbPages) && fbPages.length > 0 ? (
                fbPages.map((p) => (
                  <option key={p.id} value={`${p.id}_${p.access_token}`}>
                    {p.name}
                  </option>
                ))
              ) : (
                <option disabled>No pages available</option>
              )}
            </select>
          </div>

          {/* Form Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Form</label>
            <select
              value={formSelection}
              onChange={onFormChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!pageSelection}
            >
              <option value="">Select Form</option>
              {Array.isArray(formsForPage) && formsForPage.length > 0 ? (
                formsForPage.map((f) => (
                  <option key={f.id} value={`${pageSelection}_${f.id}`}>
                    {f.name}
                  </option>
                ))
              ) : (
                <option disabled>{pageSelection ? "No forms found" : "Select page first"}</option>
              )}
            </select>
          </div>

          {/* Field Mapping */}
          <div>
            <h4 className="text-sm font-medium mb-2">Field Mapping</h4>
            <div className="border rounded p-3 bg-gray-50 max-h-60 overflow-auto">
              {loadingFields ? (
                <div className="text-center py-4">Loading fields...</div>
              ) : Object.keys(fieldMap).length === 0 ? (
                <div className="text-center py-4 text-gray-500">No fields loaded</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Field Key</th>
                      <th className="text-left py-2">Mapped To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(fieldMap).map((k) => (
                      <tr key={k} className="border-t">
                        <td className="py-2 pr-4">{k}</td>
                        <td className="py-2">
                          <select
                            value={fieldMap[k] || ""}
                            onChange={(e) => onFieldMapChange(k, e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Field</option>
                            {Array.isArray(cnFields) && cnFields.length > 0 ? (
                              cnFields.map((f) => (
                                <option
                                  key={f.id || f.fieldId || f}
                                  value={f.id || f.fieldId || f}
                                >
                                  {f.name || f}
                                </option>
                              ))
                            ) : (
                              <option disabled>No fields available</option>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Optional fields */}
          {(corporateType === 100 || corporateType === 500 || corporateType === 800) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course (Optional)</label>
              <input
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
            <input
              value={targetLocation}
              onChange={(e) => setTargetLocation(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Update Subscription" : "Subscribe"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function FacebookLeadManager({}) {
  const { loaded, status } = useFacebookSDK();
  const [pages, setPages] = useState([]);
  const [subscribed, setSubscribed] = useState([]);
  const [search, setSearch] = useState("");
  const [pageIdx, setPageIdx] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const corporateId = Corporate?._id || "";

  useEffect(() => {
    if (!loaded) return;

    if (status?.status === "connected") {
      let userAccessToken = status.authResponse.accessToken;

      facebookApi
        .getExtendedToken(userAccessToken)
        .then((data) => {
          if (data?.access_token) userAccessToken = data.access_token;

          window.FB.api(`/me/accounts?access_token=${userAccessToken}`, (response) => {
            const p = Array.isArray(response?.data) ? response.data : [];
            setPages(p);

            facebookApi
              .fetchSubscribedForms(corporateId, p)
              .then((d) => setSubscribed(Array.isArray(d) ? d : []))
              .catch(() => setSubscribed([]));
          });
        })
        .catch(() => {
          // Fallback without extended token
          window.FB.api(`/me/accounts?access_token=${status.authResponse.accessToken}`, (response) => {
            const p = Array.isArray(response?.data) ? response.data : [];
            setPages(p);

            facebookApi
              .fetchSubscribedForms(corporateId, p)
              .then((d) => setSubscribed(Array.isArray(d) ? d : []))
              .catch(() => setSubscribed([]));
          });
        });
    }
  }, [loaded, status, corporateId]);

  // Fetch pages + subscriptions when connected
  const fetchFacebookData = () => {
    if (!loaded || status?.status !== "connected") return;

    let userAccessToken = status.authResponse?.accessToken;

    const loadPagesAndSubs = (token) => {
      window.FB.api(`/me/accounts?access_token=${token}`, (response) => {
        const p = Array.isArray(response?.data) ? response.data : [];
        setPages(p);

        facebookApi
          .fetchSubscribedForms(corporateId, p)
          .then((d) => setSubscribed(Array.isArray(d) ? d : []))
          .catch(() => setSubscribed([]));
      });
    };

    facebookApi
      .getExtendedToken(userAccessToken)
      .then((data) => {
        if (data?.access_token) {
          loadPagesAndSubs(data.access_token);
        } else {
          loadPagesAndSubs(userAccessToken);
        }
      })
      .catch(() => {
        // Fallback
        loadPagesAndSubs(userAccessToken);
      });
  };

  useEffect(() => {
    if (loaded && status) {
      fetchFacebookData();
    }
  }, [loaded, status?.status, status?.authResponse?.accessToken, corporateId]);

  const handleLoginSuccess = () => {
    // Re-check login status and fetch data (no page reload)
    getStatus((resp) => {
      if (resp?.status === "connected") {
        fetchFacebookData();
      }
    });
  };

  const handleLogout = () => {
    setPages([]);
    setSubscribed([]);
    // Optional: you can also reset other states if needed
  };

  const refreshList = () => {
    fetchFacebookData();
    toast.info("Refreshing subscriptions...");
  };

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
    const subs = Array.isArray(subscribed) ? subscribed : [];
    if (!q) return subs;
    return subs.filter(
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            disabled={status?.status !== "connected"}
          >
            + Subscribe New Form
          </button>
          <button
            onClick={refreshList}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
            disabled={status?.status !== "connected"}
          >
            Refresh List
          </button>
        </div>

        <FacebookAuthButton
          status={status}
          onLoggedIn={handleLoginSuccess}
          onLoggedOut={handleLogout}
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

      {/* Optional: show message when not logged in */}
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
                  No subscriptions found
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