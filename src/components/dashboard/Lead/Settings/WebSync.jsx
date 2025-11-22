"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { toast } from "react-toastify";

export default function WebSync() {
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

  const fullURL = token
    ? `https://dashboard.conceptninjas.com/services/web/synclead/${token}`
    : "";

  return (
    <div className="p-5">
      <h2 className="text-xl mb-2">WebSync</h2>
      {/* Title */}
      <p className="text-gray-700 mb-3">
        This plugin is designed to streamline lead data management for website owners and
        marketers. With this plugin, you can effortlessly and in real-time send valuable
        lead data generated from your WordPress site directly to the Conceptninjas panel.
      </p>

      {/* URL Box */}
      <div className="border rounded-md p-3 bg-gray-50 mb-6">
        <p className="text-sm font-medium mb-1 text-red-600">URL</p>
        <div className="text-sm bg-white border rounded p-2 break-all">
          {loading ? "Loading..." : fullURL}
        </div>
      </div>

      {/* Requirements */}
      <h3 className="text-lg font-semibold mb-2">Requirements</h3>
      <p className="text-gray-700 mb-1">
        Before proceeding with the Conceptninjas plugin setup, please ensure its
        availability on your WordPress site.
      </p>

      <ul className="list-disc ml-6 text-gray-700 mb-6 leading-7">
        <li>WordPress Version &gt;5.0</li>
        <li>contactForm7 Plugin</li>
        <li>
          The inclusion of either a Mobile/Phone or Email field is mandatory in the
          form linked to this plugin
        </li>
      </ul>

      {/* Steps */}
      <h3 className="text-lg font-semibold mb-2">Steps to integrate & use</h3>
      <p className="text-gray-700 mb-3">Follow these steps to setup Conceptninjas Plugin on your wordpress site</p>

      <ul className="list-disc ml-6 text-gray-700 leading-7">
        <li>
          Click{" "}
          <a
            href="https://rebrand.ly/rplz65i" target="_blank"
            className="text-blue-600 underline"
          >
            here
          </a>{" "}
          to download the plugin
        </li>
        <li>Login to your WordPress admin dashboard</li>
        <li>Go to plugin section.</li>
        <li>Click add new plugin.</li>
        <li>Click on choose from files.</li>
        <li>Activate the plugin.</li>
        <li>
          Now, On your left menu section click on{" "}
          <span className="font-semibold">Settings/Conceptninjas</span> tab
        </li>
        <li>
          Enter the URL given above & specify the source (eg WebSync, but you can name it anything)
        </li>
        <li>Click Save to save changes.</li>
        <li>Now, Open/edit your contactForm7 form that you are willing to sync</li>
        <li>
          Enter this shortcode{" "}
          <span className="bg-gray-200 px-1 rounded font-mono">
            [hidden cnwebsync "1"]
          </span>
          . This shortcode triggers the sync event when a form is submitted to sync leads in real-time.
        </li>
      </ul>

      {/* Note Box */}
      <div className="border border-yellow-300 bg-yellow-50 text-yellow-900 p-3 rounded mt-6 text-sm">
        <strong>Please note that,</strong> Only fields like name, email, mobile/phone, course/service,
        location, message/remark can be synced so the form must have these fields.
      </div>
    </div>
  );
}
