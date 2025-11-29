"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast } from "react-toastify";
import Image from "next/image";

export default function GoogleDriveConnect() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  // Fetch status on load
  const fetchStatus = async () => {
    try {
      const res = await xFetch({ path: "/services/widget/getGoogleDriveStatus" });
      // API expected to return: { authorized: true/false }
      setIsAuthorized(res.authorized || false);
    } catch {
      toast.error("Failed to check Google Drive status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const connectDrive = () => {
    window.open("/services/google/oAuthGoogleDrive.php", "_blank");
    toast.info("Please complete authentication in the opened window.");
  };

  const disconnectDrive = async () => {
    if (disconnecting) {
      toast.warning("Already processing...");
      return;
    }

    try {
      setDisconnecting(true);

      const res = await xFetch({
        path: "/services/widget/disconnectGoogleDrive",
        method: "POST",
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
          {isAuthorized ? "Connected With Your Google Drive!" : "Connect Your Google Drive!"}
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-sm mt-3">
          Keep the files you need at your fingertips as your Google Drive account is
          integrated with ConceptNinjas CRM.
        </p>

        {/* Buttons */}
        {!loading && (
          <div className="mt-6">
            {!isAuthorized ? (
              <button
                onClick={connectDrive}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
              >
                Connect Google Drive
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
