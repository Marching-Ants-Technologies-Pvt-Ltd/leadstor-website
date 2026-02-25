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
  const [formQuestions, setFormQuestions] = useState([]);

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

    // Optional: also fetch mapped fields when creating new (for consistency)
    Promise.all([
      facebookApi.getMappedFields(corporateId, pageId, formId).catch(() => []),
      new Promise((resolve) => {
        window.FB.api(`/${formId}?fields=id,name,questions&access_token=${pageAccessToken}`, resolve);
      })
    ])
    .then(([mappedRes, fbResponse]) => {
      console.log('[FB API] Full response for form', formId, fbResponse);

      if (fbResponse?.error) {
        console.error('[FB API Error]', fbResponse.error);
        toast.error(`Facebook API error: ${fbResponse.error.message || 'Unknown'}`);
        setLoadingFields(false);
        return;
      }

      const questions = Array.isArray(fbResponse?.questions) ? fbResponse.questions : [];
      console.log('[FB Questions] Count:', questions.length, 'Keys:', questions.map(q => q.key || 'no-key'));

      const defaultMap = {};
      questions.forEach((q) => {
        if (q?.key) defaultMap[q.key] = "";
      });

      const mappedArray = Array.isArray(mappedRes) ? mappedRes : (mappedRes?.data || []);

      mappedArray.forEach((m) => {
        if (m.form_field_key && defaultMap.hasOwnProperty(m.form_field_key)) {
          defaultMap[m.form_field_key] = String(m.cn_field_id || "");
          console.log(`Applied mapping: ${m.form_field_key} → ${m.cn_field_id}`);
        } else if (m.form_field_key) {
          console.warn(`Saved mapping ignored - key not in current form: ${m.form_field_key}`);
        }
      });

      setFieldMap(defaultMap);
      setFormQuestions(questions);
      setLoadingFields(false);
    })
    .catch(err => {
      console.error(err);
      setLoadingFields(false);
    });
  };

  const updateFields = async (formVal, formId, subscriptionId, formTableId, courseVal, targetLocationVal) => {
    if (!formVal || !formId) return;

    const [pageId, pageAccessToken] = formVal.split("_");

    setLoadingFields(true);

    try {
      // Fetch backend mappings first
      const mapped = await facebookApi.getMappedFields(corporateId, pageId, formId);
      const mappedArray = Array.isArray(mapped) ? mapped : (mapped?.data || []);

      // Then fetch Facebook form questions (promise wrapper for cleaner error handling)
      const fbResponse = await new Promise((resolve, reject) => {
        window.FB.api(
          `/${formId}?fields=id,name,questions`,
          { access_token: pageAccessToken },
          (response) => {
            if (response?.error) {
              reject(new Error(response.error.message || "Facebook API error"));
            } else {
              resolve(response);
            }
          }
        );
      });

      console.log('[updateFields] FB response:', fbResponse);

      const questions = Array.isArray(fbResponse?.questions) ? fbResponse.questions : [];
      console.log('[updateFields] Questions count:', questions.length, 'Keys:', questions.map(q => q.key || 'no-key'));

      const defaultMap = {};
      questions.forEach((q) => {
        if (q?.key) {
          defaultMap[q.key] = "";
        }
      });

      // Apply saved mappings only if key still exists
      mappedArray.forEach((m) => {
        if (m?.form_field_key && defaultMap.hasOwnProperty(m.form_field_key)) {
          defaultMap[m.form_field_key] = String(m.cn_field_id || "");
        }
      });

      setFieldMap(defaultMap);
      setFormQuestions(questions);
      setCourse(courseVal || "");
      setTargetLocation(targetLocationVal || "");
    } catch (err) {
      console.error("[updateFields] Error:", err);
      toast.error("Failed to load form fields: " + (err.message || "Unknown error"));
      setFieldMap({});
      setFormQuestions([]);
    } finally {
      setLoadingFields(false); // always stop loading
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
                  <div className="text-center py-4">Loading form questions from Facebook...</div>
                ) : Object.keys(fieldMap).length === 0 ? (
                  <div className="text-center py-6 text-amber-700 bg-amber-50 rounded">
                    <p className="font-medium">No questions found in this lead form</p>
                    <p className="text-sm mt-2">
                      This form might have no fields configured, or Facebook isn't returning questions.<br />
                      <strong>Check in Ads Manager:</strong> Page → Publishing Tools → Instant Forms → edit the form → ensure it has at least Name/Email/Phone.
                    </p>
                    <p className="text-xs mt-3 text-gray-600">
                      Expected keys (examples): full_name, email, phone_number, company_name
                    </p>
                  </div>
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
                        <td className="py-2 pr-4">{formQuestions.find(q => q.key === k)?.label || k}</td>
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