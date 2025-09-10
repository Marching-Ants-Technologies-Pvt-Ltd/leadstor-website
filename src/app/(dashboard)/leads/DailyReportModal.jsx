'use client';

import { useEffect, useState } from "react";
import { Corporate, User, Owners, Test } from '@/utility/TinyDB';
import { xFetch } from "@/utility/xFetch";
import axios from "axios";

export default function DailyReportModal({ isOpen, onClose }) {
  const [reportData, setReportData] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [totalCall, setTotalCall] = useState(0);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [step, setStep] = useState("select"); // "select" | "report"

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
            (acc, val) => acc + parseInt(val.count || 0),0
            );
            setTotalCall(total);
            setStep("report"); // switch modal content
        })
        .catch((error) => {
            console.error("Error fetching report:", error);
            setReportData([]);
            setTotalCall(0);
        });
  };

    const downloadDailyReport = async (userId, userName) => {
        let url = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/services/invite/downloadDailyReport?testId=${Test?._id}&userId=${userId}&userName=${userName}`;
        try {
            const response = await axios.get(url, {
                responseType: "blob",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token"),
                },
            });

            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `${userName}-DailyReport.xlsx`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error fetching report:", error);
        }
    }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-[450px] p-6 max-h-[90vh] overflow-y-auto transform transition-all duration-300">
   
        {/* Step 1: Owner selection */}
        {step === "select" && User?._id == -1 && (
          <>
            <h2 className="text-lg font-semibold mb-4">Select Owner</h2>
            <select
              className="w-full border p-2 rounded mb-4 bg-white text-black cursor-pointer select-none focus:outline-none focus:border-gray-400 hover:border-gray-400 thin-scrollbar"
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
            >
              <option key="0" value="">Select Owner</option>
              <option key="-1" value="-1">Admin</option>
              {Object.entries(Owners).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium shadow hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
              disabled={!selectedOwner}
            >
              Get Report
            </button>
          </div>
          </>
        )}

        {/* Step 2: Report */}
        {step === "report" && (
        <>
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b">
            Daily Call Report
            </h2>

            {/* Username */}
            <div className="flex justify-center mb-6">
            <div className="bg-gray-50 border rounded-lg px-3 py-1 text-gray-700 font-medium shadow-inner">
                {userName}
            </div>
            </div>

            {/* Report Table */}
            <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm text-left border-collapse">
                <thead>
                <tr className="bg-blue-50 text-blue-800">
                    <th className="border px-3 py-2 font-semibold">Status</th>
                    <th className="border px-3 py-2 font-semibold text-right">
                    Count
                    </th>
                </tr>
                </thead>
                <tbody>
                {reportData.map((val, idx) => (
                    <tr
                    key={idx}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50 transition"
                    >
                    <td className="border px-3 py-2">{val.status}</td>
                    <td className="border px-3 py-2 text-right">{val.count}</td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                <tr className="bg-blue-100 font-bold">
                    <td className="border px-3 py-2">Total</td>
                    <td className="border px-3 py-2 text-right">{totalCall}</td>
                </tr>
                </tfoot>
            </table>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
            <button
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow hover:from-blue-700 hover:to-blue-600 transition"
                onClick={() => {
                downloadDailyReport(userId, userName);
                onClose();
                setStep("select"); // reset
                }}
            >
                Download
            </button>
            <button
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium shadow hover:bg-gray-400 transition"
                onClick={() => {
                onClose();
                setStep("select"); // reset
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
