"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast } from "react-toastify";

export default function JustdialSulekha() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch webhook token
  const fetchToken = async () => {
    try {
      const res = await xFetch({
        path: "/services/profile/getWebhookToken",
      });

      if (res?.status === "success" && res?.token) {
        setToken(res.token);
      } else {
        toast.error("Failed to load Webhook Token");
      }
    } catch (err) {
      toast.error("Error fetching token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  const justdialURL = token
    ? `https://dashboard.conceptninjas.com/services/web/justdial/${token}`
    : "";

  const sulekhaURL = token
    ? `https://leads.conceptninjas.com/services/web/sulekha/${token}`
    : "";

  // ------------------------------
  // cURL Render Block (Reusable)
  // ------------------------------
  const CurlBlock = ({ fullURL }) => (
  <div className="bg-white p-3 text-m border rounded leading-6 font-mono whitespace-pre-wrap">
    <div>
      <span className="text-black">curl --location </span>
      <span className="text-blue-600">&#39;{fullURL}&#39;</span> <span>\</span>
    </div>

    <div>
      <span className="text-black">--header </span>
      <span className="text-orange-700">
        &#39;Content-Type: application/x-www-form-urlencoded&#39;
      </span>{" "}
      <span>\</span>
    </div>

    <div>
      <span className="text-black">--data-urlencode </span>
      <span className="text-green-700">&#39;leadid</span>
      <span className="text-black">=JD123456</span>&
      <span className="text-green-700">leadtype</span>=category&
      <span className="text-green-700">prefix</span>=Mr&
      <span className="text-green-700">name</span>=Test&
      <span className="text-green-700">mobile</span>=9876543210&
      <span className="text-green-700">phone</span>=022123456&
      <span className="text-green-700">email</span>=test@example.com&
      <span className="text-green-700">date</span>=2025-11-01&
      <span className="text-green-700">category</span>=Taxi&
      <span className="text-green-700">area</span>=Andheri&
      <span className="text-green-700">city</span>=Mumbai&
      <span className="text-green-700">brancharea</span>=East&
      <span className="text-green-700">dncmobile</span>=1&
      <span className="text-green-700">dncphone</span>=0&
      <span className="text-green-700">company</span>=ConceptNinjas&#39;
    </div>
  </div>
);

  return (
    <div className="p-4 space-y-12">
      {/* -------------------------------- */}
      {/*           JUSTDIAL               */}
      {/* -------------------------------- */}
      <div>
        <h2 className="text-xl mb-2">JustDial</h2>
        <p className="text-gray-600 text-base mb-4">
          Share below API details with Justdial technical team to integrate automatic lead sync.
        </p>

        {/* URL */}
        <div className="border rounded-md p-3 bg-gray-50">
          <p className="text-base font-medium mb-1 text-red-600">URL</p>
          <div className="text-base bg-white border rounded p-2 break-all">
            {loading ? "Loading..." : justdialURL}
          </div>
        </div>

        {/* cURL */}
        <div className="mt-5 border rounded-md p-3 bg-gray-50">
          <p className="text-base font-medium mb-2">cURL - Request Example</p>
          <CurlBlock fullURL={justdialURL} />
        </div>
      </div>

      {/* -------------------------------- */}
      {/*            SULEKHA               */}
      {/* -------------------------------- */}
      <div>
        <h2 className="text-xl mb-2">Sulekha</h2>
        <p className="text-gray-600 text-base mb-4">
          Share below API details with Sulekha technical team to integrate automatic lead sync.
        </p>

        {/* URL */}
        <div className="border rounded-md p-3 bg-gray-50">
          <p className="text-base font-medium mb-1 text-red-600">URL</p>
          <div className="text-base bg-white border rounded p-2 break-all">
            {loading ? "Loading..." : sulekhaURL}
          </div>
        </div>

        {/* cURL */}
        <div className="mt-5 border rounded-md p-3 bg-gray-50">
          <p className="text-base font-medium mb-2">cURL - Request Example</p>
          <CurlBlock fullURL={sulekhaURL} />
        </div>
      </div>
    </div>
  );
}
