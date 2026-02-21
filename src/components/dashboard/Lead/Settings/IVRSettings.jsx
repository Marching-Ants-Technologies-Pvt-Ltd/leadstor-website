"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import Image from "next/image";

export default function KnowlaritySettings() {
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    integration_id: "",
    caller_id: "",
    display_number: "",
    api_key: "",
    app_key: "",
  });

  // --------------------------
  // Fetch Knowlarity Data
  // --------------------------
  const fetchKnowlarity = async () => {
    try {
      const res = await xFetch({
            path:"/services/profile/getKnowlarityDetails"
        });
      
      if (res?.status) {
        setForm({
          integration_id: res.data.integration_id || "",
          caller_id: res.data.caller_id || "",
          display_number: res.data.display_number || "",
          api_key: res.data.api_key || "",
          app_key: res.data.app_key || "",
        });
      } else {
        toast.error("Failed to load Knowlarity settings");
      }
    } catch (err) {
      toast.error("Something went wrong while fetching Knowlarity details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowlarity();
  }, []);

  // --------------------------
  // Save Knowlarity Data
  // --------------------------
  const saveKnowlarity = async () => {

    try {

        const fd = new FormData();
        fd.append("callback", 1);

        Object.entries(form).forEach(([key, value]) => {
            fd.append(key, value ?? "");
        });

      const res = await xFetch({
        path: "/services/profile/knowlarity/",
        method: "POST",
        payload:fd,
        isFormData: true,
      });

      if (res?.status) {
        toast.success("Settings saved successfully");
        setShowAdvanced(false);
      } else {
        toast.error("Unable to save Knowlarity settings");
      }
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="flex gap-10 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* LEFT BANNER */}
      <div className="w-[330px]">
        <Image
          src="/banners/knowlarityBanner.jpg"
          width={330}
          height={250}
          className="rounded-md"
          alt="Knowlarity Banner"
        />

        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              href="https://www.knowlarity.com/"
              target="_blank"
              className="text-green-600 hover:underline"
            >
              Get credentials
            </a>
          </li>
        </ul>
      </div>

      {/* RIGHT FORM */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold">Knowlarity</h3>
        <p className="text-gray-600 mb-6">
          Configure your knowlarity settings, feel free tweak settings anytime.
        </p>

        {/* CALLER ID */}
        <label className="font-medium">Caller ID</label>
        <div className="flex mb-4">
          <span className="px-3 flex items-center bg-gray-200 border border-gray-300 rounded-l">
            👤
          </span>
          <input
            type="text"
            className="border border-gray-300 rounded-r p-2 w-full bg-white"
            value={form.caller_id}
            onChange={(e) => setForm({ ...form, caller_id: e.target.value })}
          />
        </div>

        {/* SHOW/HIDE ADVANCED */}
        <p
          className="text-green-600 cursor-pointer mb-4"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} advance settings
        </p>

        {/* ADVANCED SECTION */}
        {showAdvanced && (
          <div className="space-y-4">
            {/* Display Number */}
            <div>
              <label className="font-medium">Display Number</label>
              <div className="flex">
                <span className="px-3 flex items-center bg-gray-200 border border-gray-300 rounded-l">
                  📱
                </span>
                <input
                  type="text"
                  className="border border-gray-300 rounded-r p-2 w-full bg-white"
                  value={form.display_number}
                  onChange={(e) =>
                    setForm({ ...form, display_number: e.target.value })
                  }
                />
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="font-medium">API Key</label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2 w-full bg-white"
                value={form.api_key}
                onChange={(e) =>
                  setForm({ ...form, api_key: e.target.value })
                }
              />
            </div>

            {/* App Key */}
            <div>
              <label className="font-medium">App Key</label>
              <input
                type="text"
                className="border border-gray-300 rounded p-2 w-full bg-white"
                value={form.app_key}
                onChange={(e) =>
                  setForm({ ...form, app_key: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* SAVE BUTTON */}
        <button
          onClick={saveKnowlarity}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
