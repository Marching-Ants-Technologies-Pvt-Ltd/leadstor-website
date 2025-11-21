"use client";
import React, { useState, useEffect } from "react";
import { Mail, ToggleLeft, ToggleRight, Check } from "lucide-react";
import { xFetch } from "@/utility/xFetch";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';

export default function Preferences({ corporateId = 64 }) {
  const [settings, setSettings] = useState({
    paymentNotifications: true,
    leadAssignedEmail: true,
    redirectUrl: "",
    subdomain: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);

    await xFetch({
        path: `/services/profile/getBusinessDetails`
    })
    .then((res) => {
        if(res) setSettings(res);
    })
    .catch((error) => {
        toast.error("Something went wrong while loading preferences");
    })
    .finally(() => setLoading(false));
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({
        ...prev,
        [field]: prev[field] == 1 ? 0 : 1,
    }));
    };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    xFetch({
      path: "/services/profile/updatePreferences",
      method: "POST",
      payload: { ...settings},
    })
    .then((res) => toast.success("Profile updated successfully!"))
    .catch((error) => {
        toast.error("Something went wrong, please try again.");
    })
    .finally(() => setLoading(false));
  };

    return (
        <div className="w-full bg-white shadow-lg rounded-2xl p-8 border border-gray-200">

            <h2 className="text-xl mb-6 text-gray-800">
            Preferences
            </h2>

            {/* Switch Section */}
            <div className="space-y-6">

            {/* Lead Assigned Notification */}
            <div className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition">
                <div>
                <p className="font-medium text-gray-800">
                    Lead Assigned Email Notification
                </p>
                <p className="text-gray-500 text-sm">Send emails when a lead is assigned</p>
                </div>

                <button onClick={() => handleToggle("leadAssigned")}>
                {settings.leadAssigned == 1 ? (
                    <ToggleRight size={42} className="text-green-600" />
                ) : (
                    <ToggleLeft size={42} className="text-gray-400" />
                )}
                </button>
            </div>

            {/* Payment Notification */}
            <div className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition">
                <div>
                <p className="font-medium text-gray-800">Payment Notifications</p>
                <p className="text-gray-500 text-sm">Enable alerts for payments</p>
                </div>

                <button onClick={() => handleToggle("paymentTracking")}>
                {settings.paymentTracking == 1 ? (
                    <ToggleRight size={42} className="text-green-600" />
                ) : (
                    <ToggleLeft size={42} className="text-gray-400" />
                )}
                </button>
            </div>
            </div>

            <div className="mt-8 space-y-6">

            <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-800 flex items-center gap-2">
                List of CC mail ids for followup report
                </label>

                <input
                type="text"
                name="reportCCMailIds"
                value={settings.reportCCMailIds}
                onChange={handleChange}
                placeholder="Comma separated CC mail ids"
                className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-800 flex items-center gap-2">
                List of CC mail ids for payment report
                </label>

                <input
                type="text"
                name="paymentCCMailIds"
                value={settings.paymentCCMailIds}
                onChange={handleChange}
                placeholder="Comma separated CC mail ids"
                className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
            </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
            <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition">
                Update
            </button>
            
            </div>
        </div>
    );
}
