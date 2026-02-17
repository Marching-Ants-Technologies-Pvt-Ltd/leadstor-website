// FacebookLeadManager.jsx
import React, { useEffect, useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { xFetch } from "@/utility/xFetch";
import { Search } from "lucide-react";
/**
 * Single-file React module replacing the old jQuery/PHP Facebook leadgen UI.
 * - Use: import FacebookLeadManager and render it.
 * - Adjust styling and paths to xFetch if needed.
 */

/* ---------- API endpoints (kept same as original) ---------- */
const API = {
  getSubscribedForms: "/services/facebook/getSubscribedForms",
  getConceptNinjasFields: "/services/facebook/conceptninjasFields",
  subscribeFBPage: "/services/facebook/subscribeFBPage",
  updateSubscription: "/services/facebook/updateSubscription",
  deleteSubscribeForm: "/services/facebook/deleteSubscribeForm",
  getMappedFields: "/services/facebook/getMappedFields",
  getExtendedUserToken: "/services/facebook/getExtendedUserToken",
};

function FacebookLoginButton({ onLoggedIn }) {
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded");
      return;
    }

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

/* ---------- SDK loader hook ---------- */
function useFacebookSDK(appId = "354120981351314", version = "v19.0") {
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (window.FB) {
      setLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        autoLogAppEvents: true,
        xfbml: true,
        version,
      });
      window.FB.getLoginStatus(function (resp) {
        setStatus(resp);
      });
      setLoaded(true);
    };

    const id = "facebook-jssdk";
    if (document.getElementById(id)) return;
    const js = document.createElement("script");
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
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

/* ---------- Small wrapper around xFetch ---------- */
const facebookApi = {
  fetchSubscribedForms: (corporateId, pages) => {
    return xFetch({
      path: API.getSubscribedForms,
      method: "POST",
      payload: { pages }
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: fetchSubscribedForms", err);
        throw err;
      });
  },

  fetchCNFields: () => {
    return xFetch({
      path: API.getConceptNinjasFields,
      method: "GET",
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: fetchCNFields", err);
        throw err;
      });
  },

  subscribe: (payload) => {
    return xFetch({
      path: API.subscribeFBPage,
      method: "POST",
      payload: payload,
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: subscribe", err);
        throw err;
      });
  },

  updateSubscription: (payload) => {
    return xFetch({
      path: API.updateSubscription,
      method: "POST",
      payload: payload,
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: updateSubscription", err);
        throw err;
      });
  },

  deleteSubscription: (formTableId) => {
    return xFetch({
      path: API.deleteSubscribeForm,
      method: "POST",
      payload: { form_table_id: formTableId },
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: deleteSubscription", err);
        throw err;
      });
  },

  getMappedFields: (corporateId, pageId, formId) => {
    return xFetch({
      path: API.getMappedFields,
      method: "POST",
      payload: { corporateId, pageId, formId },
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: getMappedFields", err);
        throw err;
      });
  },

  getExtendedToken: (userToken) => {
    return xFetch({
      path: `${API.getExtendedUserToken}?userToken=${userToken}`,
      method: "GET",
    })
      .then(res => res)
      .catch(err => {
        console.error("Error: getExtendedToken", err);
        throw err;
      });
  },
};

/* ---------- Subscribe / Update Modal ---------- */
function SubscribeModal({ isOpen, onClose, fbPages, initialData = null, corporateId, corporateType, onSaved }) {
  const [pageSelection, setPageSelection] = useState("");
  const [formsForPage, setFormsForPage] = useState([]);
  const [formSelection, setFormSelection] = useState("");
  const [cnFields, setCnFields] = useState([]);
  const [fieldMap, setFieldMap] = useState({});
  const [course, setCourse] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [loadingFields, setLoadingFields] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCnFields([]);
    setFormsForPage([]);
    setFieldMap({});
    setCourse("");
    setTargetLocation("");
    setPageSelection("");
    setFormSelection("");

    if (initialData) {
      const { pageId, pageAccessToken, formId, course: c, target_location } = initialData;
      setCourse(c || "");
      setTargetLocation(target_location || "");
      setPageSelection(pageId + "_" + pageAccessToken);
      // load forms then fields
      loadFormsForPage(pageId + "_" + pageAccessToken).then(() => {
        setFormSelection(pageId + "_" + pageAccessToken + "_" + formId);
        updateFields(pageId + "_" + pageAccessToken + "_" + formId, formId, initialData.subscriptionId, initialData.formTableId, c, target_location);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    // fetch CN fields once
    facebookApi.fetchCNFields().then((d) => setCnFields(d || [])).catch((e) => console.error(e));
  }, []);

  const loadFormsForPage = async (val) => {
    if (!val) return;
    const [pageId, pageAccessToken] = val.split("_");
    if (!window.FB) return;
    return new Promise((resolve) => {
      window.FB.api(`/${pageId}/leadgen_forms?access_token=${pageAccessToken}&limit=200`, function (response) {
        const list = (response && response.data) || [];
        setFormsForPage(list);
        resolve(list);
      });
    });
  };

  const loadFieldsForForm = (val) => {
    if (!val) return;
    const [pageId, pageAccessToken, formId] = val.split("_");
    setLoadingFields(true);
    window.FB.api(`/${formId}?fields=id,name,questions&access_token=${pageAccessToken}`, function (response) {
      const questions = response.questions || [];
      const defaultMap = {};
      questions.forEach((q) => (defaultMap[q.key] = ""));
      setFieldMap(defaultMap);
      setLoadingFields(false);
    });
  };

  const updateFields = (formVal, formId, subscriptionId, formTableId, courseVal, targetLocationVal) => {
    if (!formVal) return;
    const [pageId, pageAccessToken] = formVal.split("_");
    setLoadingFields(true);
    facebookApi
      .getMappedFields(corporateId, pageId, formId)
      .then((mapped) => {
        window.FB.api(`/${formId}?fields=id,name,questions&access_token=${pageAccessToken}`, function (response) {
          const questions = response.questions || [];
          const defaultMap = {};
          questions.forEach((q) => (defaultMap[q.key] = ""));
          (mapped || []).forEach((m) => {
            if (m.form_field_key && defaultMap.hasOwnProperty(m.form_field_key)) {
              defaultMap[m.form_field_key] = String(m.cn_field_id);
            }
          });
          setFieldMap(defaultMap);
          setLoadingFields(false);
        });
      })
      .catch((err) => {
        setLoadingFields(false);
        console.error(err);
      });
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
      mapped: Object.keys(fieldMap).map((k) => ({ form_field_key: k, cn_field_id: fieldMap[k] })),
    };

    try {
      const result = initialData ? await facebookApi.updateSubscription(payload) : await facebookApi.subscribe(payload);

      if (result && result.status === "OK") {
        toast.success(initialData ? "Subscription updated" : "Subscribed successfully");
        onSaved && onSaved();
        onClose();
      } else {
        toast.error((result && result.msg) || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving subscription");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-full max-w-3xl bg-white rounded shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Facebook Form Subscribe</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Page</label>
            <select value={pageSelection} onChange={onPageChange} className="mt-1 block w-full border rounded px-3 py-2 bg-white">
              <option value="">Select Page</option>
              {fbPages.map((p) => (
                <option key={p.id} value={`${p.id}_${p.access_token}`}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Form</label>
            <select value={formSelection} onChange={onFormChange} className="mt-1 block w-full border rounded px-3 py-2 bg-white">
              <option value="">Select Form</option>
              {formsForPage.map((f) => (
                <option key={f.id} value={`${pageSelection}_${f.id}`}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <h4 className="text-sm font-medium">Fields</h4>
            <div className="mt-2 border rounded p-3 bg-gray-50 max-h-56 overflow-auto">
              {loadingFields ? (
                <div>Loading fields...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-1">Field Key</th>
                      <th className="text-left py-1">Mapped Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(fieldMap).length === 0 && <tr><td colSpan={2} className="py-2">No fields loaded</td></tr>}
                    {Object.keys(fieldMap).map((k) => (
                      <tr key={k} className="border-t">
                        <td className="py-1">{k}</td>
                        <td className="py-1">
                          <select value={fieldMap[k]} onChange={(e) => onFieldMapChange(k, e.target.value)} className="w-full bg-white border rounded px-2 py-1 text-sm">
                            <option value="">Select Field</option>
                            {cnFields.map((f) => (
                              <option key={f.id || f.fieldId || f} value={f.id || f.fieldId || f}>{f.name || f}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {(corporateType == 100 || corporateType == 500 || corporateType == 800) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Course (Optional)</label>
              <input value={course} onChange={(e) => setCourse(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 bg-white" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
            <input value={targetLocation} onChange={(e) => setTargetLocation(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 bg-white" />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
            <button onClick={submit} className="px-4 py-2 rounded bg-blue-600 text-white">{initialData ? "Update" : "Subscribe"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main manager component ---------- */
export default function FacebookLeadManager({ corporateId = 64, corporateType = 100 }) {
  const { loaded, status } = useFacebookSDK();
  const [pages, setPages] = useState([]);
  const [subscribed, setSubscribed] = useState([]);
  const [tokenExpired, setTokenExpired] = useState(false);

  const [search, setSearch] = useState("");
  const [pageIdx, setPageIdx] = useState(1);
  const pageSize = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleLogout = () => {
    if (window.FB) {
      window.FB.logout((response) => {
        setTokenExpired(false);
        setPages([]);
        setSubscribed([]);
        toast.info("Logged out successfully. Please login again.");
        window.location.reload();
      });
    } else {
      setTokenExpired(false);
      setPages([]);
      setSubscribed([]);
      toast.info("Session cleared. Please login again.");
      window.location.reload();
    }
  };

  const checkTokenValidity = async (accessToken) => {
    try {
      const response = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=354120981351314|b718f752a6f897792912b96b07b65e88`);
      const data = await response.json();
      return data.data && data.data.is_valid;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!loaded) return;
    
    if (status && status.status === "connected") {
      let userAccessToken = status.authResponse.accessToken;
      
      // Check if token is valid
      checkTokenValidity(userAccessToken).then((isValid) => {
        if (!isValid) {
          setTokenExpired(true);
          toast.error("Your Facebook session has expired. Please login again.");
          return;
        }

        facebookApi
          .getExtendedToken(userAccessToken)
          .then((data) => {
            if (data && data.access_token) userAccessToken = data.access_token;
            window.FB.api(`/me/accounts?access_token=${userAccessToken}`, function (response) {
              if (response && response.error) {
                // Token expired or invalid
                if (response.error.code === 190 || response.error.subcode === 460) {
                  setTokenExpired(true);
                  toast.error("Your Facebook session has expired. Please login again.");
                  return;
                }
                const p = (response && response.data) || [];
                setPages(p);
                facebookApi.fetchSubscribedForms(corporateId, p).then((d) => setSubscribed(d || []));
              } else {
                const p = (response && response.data) || [];
                setPages(p);
                facebookApi.fetchSubscribedForms(corporateId, p).then((d) => setSubscribed(d || []));
              }
            });
          })
          .catch((err) => {
            console.error(err);
            // Check if error is token-related
            if (err && err.message && (err.message.includes("OAuth") || err.message.includes("token"))) {
              setTokenExpired(true);
              toast.error("Your Facebook session has expired. Please login again.");
              return;
            }
            if (window.FB) {
              window.FB.api(`/me/accounts?access_token=${status.authResponse.accessToken}`, function (response) {
                if (response && response.error) {
                  if (response.error.code === 190 || response.error.subcode === 460) {
                    setTokenExpired(true);
                    toast.error("Your Facebook session has expired. Please login again.");
                    return;
                  }
                }
                const p = (response && response.data) || [];
                setPages(p);
                facebookApi.fetchSubscribedForms(corporateId, p).then((d) => setSubscribed(d || []));
              });
            }
          });
      });
    }
  }, [loaded, status]);

  const refreshList = () => {
    facebookApi.fetchSubscribedForms(corporateId, pages).then((d) => setSubscribed(d || [])).catch(console.error);
    toast.info("Refreshing list...");
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
    if (!confirm("Are you sure you want to delete this subscription?")) return;
    try {
      const res = await facebookApi.deleteSubscription(row.form_table_id);
      if (res && res.msg === "success") {
        toast.success("Deleted");
        refreshList();
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while deleting");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const subArray = Array.isArray(subscribed) ? subscribed : [];
    if (!q) return subArray;
    return subArray.filter((r) => (r.form_name || "").toLowerCase().includes(q) || (r.page_name || "").toLowerCase().includes(q));
  }, [search, subscribed]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((pageIdx - 1) * pageSize, pageIdx * pageSize);

  return (
    <div className="p-4">
      <ToastContainer position="top-right" />

      {/* Token Expired Banner */}
      {tokenExpired && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Facebook Session Expired</h3>
                <p className="text-red-700 text-sm">Your Facebook access token has expired. Please login again to continue.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
              >
                Logout & Re-login
              </button>
              <button
                onClick={() => setTokenExpired(false)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={openSubscribe} className="px-3 py-2 bg-blue-600 text-white rounded">+ Subscribe</button>
          <button onClick={refreshList} className="px-3 py-2 border rounded">Refresh</button>
        </div>
        <div className="flex items-center gap-3">
          <FacebookLoginButton onLoggedIn={() => window.location.reload()} />
          <button
            onClick={handleLogout}
            className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition text-sm"
            title="Logout from Facebook"
          >
            Logout
          </button>
        </div>
        <div className="relative">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 border rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
      </div>

      <div className="bg-white border rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Page Name</th>
              <th className="p-2 text-left">Form Id</th>
              <th className="p-2 text-left">Form Name</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, i) => (
              <tr key={row.form_table_id || i} className="border-t">
                <td className="p-2">{(pageIdx - 1) * pageSize + i + 1}</td>
                <td className="p-2">{row.page_name}</td>
                <td className="p-2">{row.form_id}</td>
                <td className="p-2">{row.form_name}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => openEdit(row)} className="px-2 py-1 text-sm border rounded">Edit</button>
                  <button onClick={() => doDelete(row)} className="px-2 py-1 text-sm border rounded text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && <tr><td colSpan={5} className="p-4">No records found</td></tr>}
          </tbody>
        </table>

        <div className="flex items-center justify-between p-3">
          <div>Showing {filtered.length} results</div>
          <div className="flex items-center gap-2">
            <button disabled={pageIdx === 1} onClick={() => setPageIdx((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded">Prev</button>
            <div>Page {pageIdx} / {totalPages}</div>
            <button disabled={pageIdx === totalPages} onClick={() => setPageIdx((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded">Next</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <SubscribeModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          fbPages={pages}
          initialData={editData}
          corporateId={corporateId}
          corporateType={corporateType}
          onSaved={() => refreshList()}
        />
      )}
    </div>
  );
}