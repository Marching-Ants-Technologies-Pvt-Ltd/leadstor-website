"use client";
import React, { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Link, Phone, Briefcase, Cloud, Send, ClipboardCopy } from "lucide-react";
import {Corporate} from "@/utility/TinyDB";

export default function WhatsappConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [viewLogs, setViewLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  const [form, setForm] = useState({
    token: "",
    phoneId: "",
    businessId: "",
    webhookUrl: "",
    webhookToken: "",
    callbackActive: false,
    method: "insert",
  });

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await xFetch({
            path: "/services/profile/getWhatsAppConfig"
        });

      if (!res?.status) {
        toast.error("Failed loading data!");
        return;
      }

      setForm({
        token: res.token ?? "",
        phoneId: res.phoneNumberId ?? "",
        businessId: res.businessId ?? "",
        webhookUrl: `${window.location.protocol}//${window.location.host}/services/callback/whatsappCallback.php`,
        webhookToken: res.webhookToken,
        callbackActive: res.callbackActive == 1,
        method: res.method,
      });
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!");
    }
    setLoading(false);
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

    async function saveWpCloudAPICred(e) {
        let wpAPI_Method =  form.method;
        if (saving) {
            alert("Please wait.... We are processing your previous request.");
            return;
        }

        const token = form.token?.trim();
        const phoneId = form.phoneId?.trim();
        const businessId = form.businessId?.trim();

        // Validations
        if (!token) {
            return toast.error("Kindly provide the Whatsapp Cloud API access token." );
        }
        if (!phoneId) {
            return toast.error("Kindly provide the Whatsapp Cloud API phone number Id.");
        }
        if (!businessId) {
            return toast.error("Kindly provide the Whatsapp Cloud API business account Id.");
        }

        setSaving(true);

        // UI loader text (same as e.value = "Saving...")
        const oldValue = e.target.innerText;
        e.target.innerText = "Saving...";

        const formData = new FormData();
        formData.append("corporateId", Corporate?._id);
        formData.append("token", token);
        formData.append("phoneId", phoneId);
        formData.append("businessId", businessId);

        xFetch({
            path: `/services/widget/${wpAPI_Method}WhatsAppCloudAPI/`,
            method: "POST",
            payload: formData,
            isFormData: true
        })
        .then((json) => {
            console.log(json);

            e.target.innerText = oldValue;
            if (json?.status) {
                wpAPI_Method = "update";
                toast.success(json.desc);
            } else {
                toast.error(json?.desc || "Error occurred");
            }
        })
        .catch((err) => {
            console.error(err);
            e.target.innerText = oldValue;
            toast.error("Something went wrong!");
        })
        .finally(() => {
            setSaving(false);
        });
    }


    async function testWhatsapp() {
        if (testing) return;

        if (form.testNumber?.length < 10) {
            toast.error("Enter valid WhatsApp number!");
            return;
        }

        setTesting(true);

        try {
            const fd = new FormData();
            fd.append("corporateId", Corporate?._id);
            fd.append("targetNumber", form.testNumber);

            const res = await xFetch({
            path: "/services/widget/testWpCloudAPI/",
            method: "POST",
            payload: fd,
            isFormData: true
            });

            if (res.message_id) {
                toast.success("Message sent successfully!");
            } else {
                toast.error(res.status || "Failed sending message");
            }

        } catch (err) {
            toast.error("Error testing!");
        }

        setTesting(false);
    }

    async function fetchLogs() {
        setViewLogs(true);

        try {
            const fd = new FormData();
            fd.append("corporateId", Corporate?._id);

            const res = await xFetch({
            path: "/services/widget/logsWpCloudAPI/",
            method: "POST",
            payload: fd,
            isFormData: true
            });

            if (res.status) {
            setLogs(res.rows);
            } else {
            toast.error("No logs found");
            }

        } catch (err) {
            toast.error("Cannot load logs");
        }
    }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        <Loader2 className="animate-spin w-6 h-6 mx-auto" />
      </div>
    );

  return (
    <div className="w-full max-w-5xl mx-auto py-10">
      <ToastContainer />
      
      {!viewLogs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Left Info Section */}
          <div>
            <img src="/assets/img/wpninjas.jpg" alt="" className="w-56 mb-4" />
            <h2 className="text-xl font-semibold mb-4">WhatsApp Cloud API - Business</h2>

            <ul className="space-y-2 text-blue-600 underline">
              <li><a href="#" target="_blank">Get credentials</a></li>
              <li><a href="#" target="_blank">Connect Webhook</a></li>
              <li><a href="#" target="_blank">Watch integration tutorial</a></li>
              <li><a href="#" target="_blank">View integration docs</a></li>
            </ul>
          </div>

          {/* Right Form */}
          <div className="col-span-2 bg-white rounded-xl shadow p-6 space-y-5">

            {/* Token */}
            <InputField
              label="Access Token"
              icon={<Cloud size={18} />}
              value={form.token}
              name="token"
              onChange={onChange}
              placeholder="Access Token"
            />

            {/* Phone ID */}
            <InputField
              label="Phone Number ID"
              icon={<Phone size={18} />}
              value={form.phoneId}
              name="phoneId"
              onChange={onChange}
              placeholder="Phone Number ID"
            />

            {/* Business ID */}
            <InputField
              label="Business Account ID"
              icon={<Briefcase size={18} />}
              value={form.businessId}
              name="businessId"
              onChange={onChange}
              placeholder="Business Account ID"
            />

            {/* Webhook (Read-Only) */}
            {!form.callbackActive && (
              <>
                <InputField
                  label="Webhook URL"
                  icon={<Link size={18} />}
                  value={form.webhookUrl}
                  name="webhookUrl"
                  readOnly
                />

                <InputField
                  label="Webhook Token"
                  icon={<ClipboardCopy size={18} />}
                  value={form.webhookToken}
                  name="webhookToken"
                  readOnly
                />
              </>
            )}

            {/* Test Number */}
            {form.callbackActive && (
              <InputField
                label="WhatsApp Number for Testing"
                icon={<Send size={18} />}
                value={form.testNumber}
                name="testNumber"
                onChange={onChange}
                placeholder="9179XXXXXX96"
              />
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                className="px-6 py-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700"
                onClick={saveWpCloudAPICred}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              {form.callbackActive && (
                <>
                  <button
                    className="px-6 py-2 rounded bg-yellow-500 text-white shadow hover:bg-yellow-600"
                    onClick={testWhatsapp}
                  >
                    {testing ? "Testing..." : "Test"}
                  </button>

                  <button
                    className="px-6 py-2 rounded bg-indigo-500 text-white shadow hover:bg-indigo-600"
                    onClick={fetchLogs}
                  >
                    View Logs
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs Section */}
      {viewLogs && (
        <div className="bg-white shadow p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Logs (Last 10 Messages)</h2>

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">WhatsApp Number</th>
                <th className="p-2">Status</th>
                <th className="p-2">Template</th>
                <th className="p-2">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No Logs Found
                  </td>
                </tr>
              )}

              {logs.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2">{row.created_datetime}</td>
                  <td className="p-2">{row.mobile}</td>
                  <td className="p-2 capitalize">{row.message_status || "Sent"}</td>
                  <td className="p-2">{row.source}</td>
                  <td className="p-2">{row.data_response ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="mt-4 px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => setViewLogs(false)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

function InputField({ label, icon, ...props }) {
  return (
    <div className="space-y-1">
      <label className="font-medium text-sm">{label}</label>
      <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
        {icon}
        <input
          {...props}
          className="w-full bg-transparent outline-none ml-2"
        />
      </div>
    </div>
  );
}
