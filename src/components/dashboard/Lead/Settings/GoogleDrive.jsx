"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast } from "react-toastify";
import Image from "next/image";
import { Corporate } from "@/utility/TinyDB";

export default function GoogleDriveConnect() {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Fetch status on load
  const fetchStatus = async () => {
    try {
      // Primary check: corporate details includes Google Drive token/flag from DB.
      const corporateData = await xFetch({
        path: `/services/profile/getCorporateDetails?time=${Date.now()}`,
      });
      const token =
        corporateData?.google_drive_token ||
        corporateData?.google_refreshtoken ||
        "";
      const authorized =
        corporateData?.google_drive_connected === true || Boolean(token);

      setIsAuthorized(authorized);
    } catch {
      try {
        // Fallback to legacy status API if corporate details endpoint fails.
        const res = await xFetch({
          path: "/services/profile/getGoogleDriveStatus",
        });
        const authorized =
          typeof res === "boolean"
            ? res
            : Boolean(res?.authorized ?? res?.isAuthorized ?? res?.status);
        setIsAuthorized(authorized);
      } catch {
        toast.error("Failed to check Google Drive status");
        setIsAuthorized(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const saveGoogleRefreshToken = async (refreshToken, corporateId) => {
    const formData = new FormData();
    formData.append("corporateId", String(corporateId || Corporate?._id || ""));
    formData.append("drive_token", String(refreshToken || ""));

    const res = await xFetch({
      path: "/services/widget/saveGoogleDriveToken",
      method: "POST",
      payload: formData,
      isFormData: true,
    });

    if (res?.status === false) {
      throw new Error(res?.desc || "Failed to save Google Drive token");
    }
  };

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, message, refreshToken, corporateId } = event.data || {};

      if (type === "GOOGLE_DRIVE_CONNECTED") {
        setConnecting(false);
        try {
          await saveGoogleRefreshToken(refreshToken, corporateId);
          setIsAuthorized(true);
          toast.success("Connected to Google Drive");
          fetchStatus();
        } catch (err) {
          setIsAuthorized(false);
          toast.error(err?.message || "Failed to connect Google Drive");
        }
      }

      if (type === "GOOGLE_DRIVE_ERROR") {
        setConnecting(false);
        toast.error(message || "Google authentication failed");
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const connectDrive = () => {
    if (connecting) {
      toast.info("Google Drive connection is already in progress");
      return;
    }

    setConnecting(true);

    const popup = window.open(
      `/api/google/connect?corporateId=${encodeURIComponent(String(Corporate?._id || ""))}`,
      "_blank",
      "width=560,height=720"
    );

    if (!popup) {
      setConnecting(false);
      toast.error("Popup blocked. Please allow popups and try again.");
      return;
    }

    toast.info("Complete Google login in the opened tab");

    const popupTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupTimer);
        setConnecting(false);
      }
    }, 500);
  };

  const disconnectDrive = async () => {
    if (disconnecting) {
      toast.warning("Already processing...");
      return;
    }

    try {
      setDisconnecting(true);
      const formData = new FormData();
      formData.append("corporateId", Corporate?._id);

      const res = await xFetch({
        path: "/services/widget/disconnectGoogleDrive",
        method: "POST",
        payload: formData,
        isFormData: true,
      });

      if (res.status) {
        toast.success("Google Drive disconnected");
        setIsAuthorized(false);
      } else {
        toast.error(res.desc || "Failed to disconnect");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-lg">

        {/* Illustration */}
        <div className="mb-5">
          <Image
            src="/banners/cn-drive.jpg"
            width={500}
            height={300}
            alt="Google Drive Banner"
            className="rounded-xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800">
          {loading
            ? "Checking Google Drive status..."
            : isAuthorized
            ? "Connected to Google Drive"
            : "Connect Your Google Drive!"}
        </h1>
        {!loading && (
          <p className="mt-2 text-sm font-medium text-gray-700">
            Status:{" "}
            <span className={isAuthorized ? "text-green-600" : "text-orange-600"}>
              {isAuthorized ? "Connected" : "Not connected"}
            </span>
          </p>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mt-3">
          Keep the files you need at your fingertips as your Google Drive account is
          integrated with ConceptNinjas CRM.
        </p>

        {/* Buttons */}
        {!loading && isAuthorized !== null && (
          <div className="mt-6">
            {!isAuthorized ? (
              <button
                onClick={connectDrive}
                disabled={connecting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
              >
                {connecting ? "Connecting..." : "Connect Google Drive"}
              </button>
            ) : (
              <button
                disabled={disconnecting}
                onClick={disconnectDrive}
                className={`bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow ${
                  disconnecting ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {disconnecting ? "Disconnecting..." : "Disconnect Google Drive"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
