"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { xFetch } from "@/utility/xFetch";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Bot,
  Building2,
  KeyRound,
  Layers3,
  Link2,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

const defaultForm = {
  id: 0,
  business_id: "",
  campaign_id: "",
  api_url: "",
  auth_token: "",
};

export default function XtremeConfig() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await xFetch({ path: "/services/profile/getXtremeConfig" });
      setForm({ ...defaultForm, ...(res || {}) });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load config");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!form.business_id.trim()) return toast.error("Business ID is required");
    if (!form.campaign_id.trim()) return toast.error("Campaign ID is required");
    if (!form.api_url.trim()) return toast.error("API URL is required");

    setSaving(true);
    try {
      const res = await xFetch({
        path: "/services/profile/saveXtremeConfig",
        method: "POST",
        payload: form,
      });

      if (res?.status === false) {
        throw new Error(res?.desc || "Unable to save config");
      }

      toast.success(res?.desc || "Config saved successfully");
      loadConfig();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <ToastContainer transition={Bounce} autoClose={2200} />

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex justify-center">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                    <Bot className="text-blue-600" size={18} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-lg font-semibold text-slate-900">Xtreme Config</h1>
                    <p className="text-sm text-gray-500">
                      Manage the core Xtreme Gen AI integration settings.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : "Save Config"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-5 pt-4 pb-4 sm:px-6">
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2">
                <ShieldCheck className="text-emerald-600" size={16} />
                <p className="text-xs text-slate-600">
                  These values will be used for Xtreme Gen AI API communication.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 size={16} className="text-slate-500" />
                    Business ID
                  </label>
                  <input
                    type="text"
                    name="business_id"
                    value={form.business_id}
                    onChange={handleChange}
                    placeholder="Enter business ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Layers3 size={16} className="text-slate-500" />
                    Campaign ID
                  </label>
                  <input
                    type="text"
                    name="campaign_id"
                    value={form.campaign_id}
                    onChange={handleChange}
                    placeholder="Enter campaign ID"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Link2 size={16} className="text-slate-500" />
                    API URL
                  </label>
                  <input
                    type="text"
                    name="api_url"
                    value={form.api_url}
                    onChange={handleChange}
                    placeholder="https://example.com/api"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <KeyRound size={16} className="text-slate-500" />
                    Auth Token
                  </label>
                  <textarea
                    rows={5}
                    name="auth_token"
                    value={form.auth_token}
                    onChange={handleChange}
                    placeholder="Enter auth token"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
