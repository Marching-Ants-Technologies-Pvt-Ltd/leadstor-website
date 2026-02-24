'use client';

import React, { useEffect, useState } from 'react';
import { Corporate, User, Test } from '@/utility/TinyDB';
import { xFetch } from '@/utility/xFetch';

export default function DailyReportModal({ isOpen, onClose }) {
  const [reportData, setReportData] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [totalCall, setTotalCall] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState("select");
  const [owner, setOwner] = useState([]);

  const fetchOwners = () => {
    xFetch({
          path: '/services/profile/getUsers',
          payload: { basic: 1 }
      })
      .then(data => {
        setOwner(data);
      })
      .catch(error => {
          console.error(`An error occurred while fetching leads`, error);
      });
  }

  // Load owners list (only needed for admin)
  useEffect(() => {
    if (isOpen) {
      fetchOwners();
    }
  }, [isOpen]);

  // Auto-load report for normal users + reset on modal open
  useEffect(() => {
    if (!isOpen) return;

    // Reset state when modal opens
    setReportData([]);
    setTotalCall(0);
    setStep("select");
    setSelectedOwner("");
    setUserId(null);
    setUserName("");

    if (User?._id == null || User?._id === "") {
      // strange case — treat as select
      setStep("select");
      return;
    }

    if (User._id === -1) {
      // Admin → show selector
      setStep("select");
    } else {
      // Normal user → auto load their own report
      const uid = User._id;
      const uname = User?.name || "User";
      setUserId(uid);
      setUserName(uname);
      setSelectedOwner(uid);
      setStep("report");
      showDailyReport(uid, uname);
    }
  }, [isOpen, User?._id, User?.name]);
  
  const handleConfirm = () => {
    if (selectedOwner) {
      const ownerName = selectedOwner === "-1" ? "Admin" : owner[selectedOwner] || "";
      setUserId(selectedOwner);
      setUserName(ownerName);
      showDailyReport(selectedOwner, ownerName);
    }
  };

  const showDailyReport = async (ownerId, ownerName) => {
    xFetch({
      method: "GET",
      path: `/services/invite/dailyReport?testId=${Test?._id}&userId=${ownerId}&time=${new Date().getMilliseconds()}`
    })
      .then((data) => {
        setReportData(data || []);
        const total = data.reduce(
          (acc, val) => acc + parseInt(val.count || 0), 0
        );
        setTotalCall(total);
        setStep("report");
      })
      .catch((error) => {
        console.error("Error fetching report:", error);
        setReportData([]);
        setTotalCall(0);
      });
  };

  const downloadDailyReport = async (userId, userName) => {
    let payload = {
      "testId": Test?._id,
      "userId": userId,
      "userName": userName
    };
    xFetch({ 
      path: '/services/invite/downloadDailyReport',
      payload: payload,
      responseType: "blob"
    })
      .then(blob => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${userName}-DailyReport.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);
      })
      .catch(error => {
        console.error(`An error occurred while fetching report`, error);
      })
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto border border-gray-200 animate-fadeIn">

        {/* Modern Lead-style Header */}
        <div className="px-6 py-2 flex justify-between items-center
              border-b backdrop-blur lead-header">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {step === "select" ? "Select Owner" : "Daily Call Report"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center
                  rounded-full hover:bg-slate-200
                  text-slate-600 hover:text-black transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Select Owner */}
          {step === "select" && User?._id == -1 && (
            <>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Choose the owner for the report
                </label>

                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800 
                            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none 
                            transition shadow-sm hover:border-blue-400"
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                >
                  <option value="">-- Select Owner --</option>
                  <option value="-1">Admin</option>
                  {Object.entries(owner).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium 
                            hover:bg-gray-200 transition shadow-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedOwner}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
                            hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Report
                </button>
              </div>
            </>
          )}

          {/* Step 2: Report */}
          {step === "report" && (
            <>
              <div className="text-center space-y-2 mb-6">
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-medium shadow-sm">
                  {userName}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-100">
                      <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 font-semibold text-gray-700 text-right">Count</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {reportData.map((val, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-3 text-gray-800">{val.status}</td>
                        <td className="px-6 py-3 text-right font-medium text-gray-900">{val.count}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="bg-blue-50 font-bold border-t border-blue-100">
                      <td className="px-6 py-3 text-gray-800">Total</td>
                      <td className="px-6 py-3 text-right text-gray-900">{totalCall}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium 
                            hover:bg-gray-300 transition shadow-sm"
                  onClick={() => {
                    onClose();
                    setStep("select");
                  }}
                >
                  Close
                </button>

                <button
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium 
                            hover:bg-blue-700 transition shadow-md flex items-center gap-2"
                  onClick={() => {
                    downloadDailyReport(userId, userName);
                    onClose();
                    setStep("select");
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}