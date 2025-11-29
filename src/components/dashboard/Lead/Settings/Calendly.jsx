"use client";

import { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { Corporate } from "@/utility/TinyDB";

export default function CalendlySettings() {
  const [form, setForm] = useState({
    token: "",
    orgName: "",
    orgEmail: "",
    orgId: "",
    userId: "",
    webhookId: "",
    calendlyMethod: "",
  });

  const [method, setMethod] = useState("insert");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Fetch saved data from your backend PHP endpoint
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    setLoadingVerify(true);
    try {
      const res = await xFetch({
        path: "/services/profile/getCalendlyDetails",
      });

      if (res.status == true) {
        setForm({
          token: res.token,
          orgName: res.orgName,
          orgEmail: res.orgEmail,
          orgId: res.orgId,
          userId: res.orgUserId,
          webhookId: res.orgWebhook,
          calendlyMethod: res.calendlyMethod,
        });
        setMethod(res.calendlyMethod);
      }
    } catch (err) {
      toast.error("Error fetching token");
    } finally {
      setLoadingVerify(false);
    }
  };

  // VERIFY TOKEN — Calendly API
  const verifyToken = async () => {
    if (!form.token) return toast.error("Enter Access Token");

    setLoadingVerify(true);

    try {
      const response = await fetch("https://api.calendly.com/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + form.token,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        const errorMsg =
          json.message ||
          json.title ||
          "Invalid Token";

        toast.error(errorMsg);
        setLoadingVerify(false);
        return;
      }

      const user = json.resource;

      setForm((prev) => ({
        ...prev,
        orgName: user.name,
        orgEmail: user.email,
        orgId: user.current_organization.split("organizations/")[1],
        userId: user.uri.split("users/")[1],
      }));

      toast.success("Verified Successfully");

      // Unsubscribe old webhook → then subscribe again
      await unsubscribeWebhook(json.resource);

    } catch (err) {
      toast.error("Verification Failed");
    }

    setLoadingVerify(false);
  };

  // Unsubscribe old webhook
  const unsubscribeWebhook = async () => {
    if (!form.webhookId || form.webhookId === "NA") {
      return subscribeWebhook();
    }

    try {
      await fetch(`https://api.calendly.com/webhook_subscriptions/${form.webhookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${form.token}` },
      });
    } catch (e) {
      console.error("Webhook delete failed");
    }

    await subscribeWebhook();
  };

  // SUBSCRIBE WEBHOOK
  const subscribeWebhook = async () => {
    try {
      const body = {
        url: `${window.location.origin}/services/callback/calendlyCallback.php`,
        events: ["invitee.created", "invitee.canceled"],
        organization: `https://api.calendly.com/organizations/${form.orgId}`,
        user: `https://api.calendly.com/users/${form.userId}`,
        scope: "user",
        signing_key: "5mEzn9C-I28UtwOjZJtFoob0sAAFZ95GbZkqj4y3i0I",
      };

      const res = await fetch("https://api.calendly.com/webhook_subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${form.token}`,
        },
        body: new URLSearchParams(body),
      });

      const json = await res.json();

      if (json.resource) {
        setForm((prev) => ({
          ...prev,
          webhookId: json.resource.uri.split("webhook_subscriptions/")[1],
        }));
        toast.success("Webhook Subscribed");
      } else {
        toast.error("Unable to subscribe webhook");
      }
    } catch (e) {
      toast.error("Webhook subscription error");
    }
  };

  // SAVE DATA TO BACKEND
  const save = async () => {
    if (!form.token || !form.orgName || !form.orgEmail) {
      toast.error("Token & Organization details required");
      return;
    }

    setLoadingSave(true);

    const fd = new FormData();
    fd.append("name", form.orgName);
    fd.append("email", form.orgEmail);
    fd.append("uuid_a", form.orgId);
    fd.append("uuid_b", form.userId);
    fd.append("uuid_c", form.webhookId);
    fd.append("token", form.token);
    fd.append("corporateId", Corporate?._id);


    await xFetch({
        path: `/services/widget/${method}CalendlyDetails/`,
        method: "POST",
        payload:fd,
        isFormData: true,
    })
    .then((res) => {
        toast.success("Saved Successfully");
        setMethod("update");
    })
    .catch ((e) => {
      toast.error("Unable to save");
    })
    setLoadingSave(false);
  };

  return (
    <div className="grid grid-cols-[350px_auto] gap-10 p-4">
      {/* Left Side */}
      <div>
        <h3 className="mt-4 mb-2 text-lg font-semibold">Calendly API</h3>

        <ul className="text-blue-600 underline">
          <li>
            <a href="https://developer.calendly.com/how-to-authenticate-with-personal-access-tokens" target="_blank">
              Get personal access token
            </a>
          </li>
          <li>
            <a href="#">View integration docs</a>
          </li>
        </ul>
      </div>

      {/* Right Form Section */}
      <div className="space-y-6">
        {/* Token */}
        <div>
          <label className="font-medium">Access Token</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              className="border rounded p-2 w-full bg-white"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              placeholder="Access Token"
            />
            <button
              className="bg-blue-600 text-white px-4 rounded"
              onClick={verifyToken}
              disabled={loadingVerify}
            >
              {loadingVerify ? "Checking..." : "Verify"}
            </button>
          </div>
        </div>

        {/* Extra Fields */}
        {form.orgName && (
          <>
            <div>
              <label>Organization</label>
              <input
                className="border rounded p-2 w-full bg-gray-100"
                value={form.orgName}
                readOnly
              />
            </div>

            <div>
              <label>Email</label>
              <input
                className="border rounded p-2 w-full bg-gray-100"
                value={form.orgEmail}
                readOnly
              />
            </div>

            <div>
              <label>UUIDs</label>
              <ul className="bg-white border rounded p-3 mt-1">
                <li><b>Organization:</b> {form.orgId}</li>
                <li><b>User:</b> {form.userId}</li>
                <li><b>Webhook:</b> {form.webhookId}</li>
              </ul>
            </div>

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
              onClick={save}
              disabled={loadingSave}
            >
              {loadingSave ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
