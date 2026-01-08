'use client';

import React, { useEffect, useState } from 'react';
import { Corporate, User, Owners, Test } from '@/utility/TinyDB';
import { xFetch } from '@/utility/xFetch';

export default function DailyReportModal({ isOpen, onClose }) {
  const [reportData, setReportData] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [totalCall, setTotalCall] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState("select");

  useEffect(() => {
    if (User?._id === -1) {
      setStep("select");
    } else {
      setStep("report");
      setSelectedOwner(User?._id);
      setUserId(User?._id);
      setUserName(User?.name || "");
    }
  }, [User]);

  const handleConfirm = () => {
    if (selectedOwner) {
      const ownerName = selectedOwner === "-1" ? "Admin" : Owners[selectedOwner] || "";
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
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                    w-[480px] p-7 max-h-[90vh] overflow-y-auto border border-gray-100
                    animate-scaleIn">

        {/* Step 1: Select Owner */}
        {step === "select" && User?._id == -1 && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Select Owner
            </h2>

            <select
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-800 
                        cursor-pointer focus:outline-none
                        hover:border-[#3B82F6] transition"
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
            >
              <option value="">Select Owner</option>
              <option value="-1">Admin</option>
              {Object.entries(Owners).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-medium 
                          shadow hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={!selectedOwner}
                className="px-5 py-2.5 rounded-lg 
                          bg-[#3B82F6] text-white font-medium shadow 
                          hover:bg-[#2563EB] transition disabled:opacity-40"
              >
                Get Report
              </button>
            </div>
          </>
        )}

        {/* Step 2: Report */}
        {step === "report" && (
          <>
            <h3 className="text-xl text-gray-900 text-center mb-1">
              Daily Call Report
            </h3>

            <div className="flex justify-center mb-5 mt-2">
              <div className="bg-[#3B82F6] text-white rounded-full px-4 py-1 text-sm shadow-sm">
                {userName}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr
                    style={{
                      background: "#EFF6FF",           // Leadstor light blue
                      color: "#1E293B",
                      borderBottom: "2px solid #DBEAFE" // soft blue border
                    }}
                  >
                    <th className="border px-3 py-2 font-semibold">Status</th>
                    <th className="border px-3 py-2 font-semibold text-right">Count</th>
                  </tr>
                </thead>

                <tbody>
                  {reportData.map((val, idx) => (
                    <tr
                      key={idx}
                      className="odd:bg-white even:bg-gray-50 hover:bg-[#EFF6FF] transition" // light blue hover
                    >
                      <td className="border px-3 py-2">{val.status}</td>
                      <td className="border px-3 py-2 text-right">{val.count}</td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr style={{ background: "#DBEAFE", color: "#1E293B" }} className="font-bold"> {/* soft blue total row */}
                    <td className="border px-3 py-2">Total</td>
                    <td className="border px-3 py-2 text-right">{totalCall}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] text-white 
                          font-medium shadow hover:bg-[#2563EB] transition"
                onClick={() => {
                  downloadDailyReport(userId, userName);
                  onClose();
                  setStep("select");
                }}
              >
                Download
              </button>

              <button
                className="px-5 py-2.5 rounded-lg bg-gray-300 text-gray-800 font-medium 
                          shadow hover:bg-gray-400 transition"
                onClick={() => {
                  onClose();
                  setStep("select");
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}