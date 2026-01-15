"use client";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import { xFetch } from "@/utility/xFetch";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WelcomeEmail() {
  const editor = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [openLogo, setOpenLogo] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [openSubject, setOpenSubject] = useState(false);

  // Editable values
  const [content, setContent] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [logo, setLogo] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoWidth, setLogoWidth] = useState("");
  const [logoHeight, setLogoHeight] = useState("");
  const [mapLink, setMapLink] = useState("");

  // Fetch existing template
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await xFetch({
          path: `/services/admin/getLeadTemplate`,
          method: "GET",
        });

        if (res?.invite_email) setContent(res.invite_email);
        if (res?.invite_email_subject) setSubjectLine(res.invite_email_subject);
        if (res?.logo_url)
          setLogo(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/${res.logo_url}`);
        if (res?.logo_width) setLogoWidth(res.logo_width);
        if (res?.logo_height) setLogoHeight(res.logo_height);
        if (res?.map_location) setMapLink(res.map_location);
      } catch (error) {
        console.error("Error fetching template:", error);
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  // Save main content + subject
  const saveTemplate = async () => {
    setSaving(true);
    const payload = {
      emailContent: content,
      subjectLine,
      type: "Emailcontent",
    };

    try {
      await xFetch({
        path: `/services/admin/updateEmailTemplate`,
        method: "POST",
        payload,
      });
      toast.success("Template saved successfully!");
    } catch {
      toast.error("Error saving template!");
    } finally {
      setSaving(false);
    }
  };

  // Save subject line separately
  const saveSubjectLine = async () => {
    setSaving(true);
    const payload = {
      subjectLine,
      type: "Emailsubject",
    };

    try {
      await xFetch({
        path: `/services/admin/updateEmailTemplate`,
        method: "POST",
        payload,
      });
      toast.success("Subject line updated successfully!");
      setOpenSubject(false);
    } catch {
      toast.error("Failed to update subject line");
    } finally {
      setSaving(false);
    }
  };

  // Save map link
  const saveMap = async () => {
    setSaving(true);

    try {
      await xFetch({
        path: `/services/admin/updateMap`,
        method: "POST",
        payload: { mapLocation: mapLink },
      });
      toast.success("Map link updated successfully!");
      setOpenMap(false);
    } catch {
      toast.error("Failed to update map link");
    } finally {
      setSaving(false);
    }
  };

  // Save / upload logo
  const saveLogo = async () => {
    setSaving(true);
    let uploadedLogoPath = logo;

    if (logoFile) {
      const formData = new FormData();
      formData.append("logoWidth", logoWidth);
      formData.append("logoHeight", logoHeight);
      formData.append("uploadMap", logoFile);

      try {
        const res = await xFetch({
          path: `/services/admin/uploadLogo`,
          method: "POST",
          isFormData: true,
          payload: formData,
        });
        toast.success("Logo uploaded successfully!");
        uploadedLogoPath = res.source;
        setLogo(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/${res.source}`);
      } catch {
        toast.error("Failed to upload logo");
      }
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        <p className="text-gray-600">Loading email template...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="bottom-center" theme="colored" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">✨ Welcome Template Editor</h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setOpenLogo(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
          >
            <i className="ri-image-line text-lg"></i>
            Edit Logo
          </button>

          <button
            onClick={() => setOpenMap(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
          >
            <i className="ri-map-pin-line text-lg"></i>
            Edit Map
          </button>

          <button
            onClick={() => setOpenSubject(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition"
          >
            <i className="ri-text text-lg"></i>
            Edit Subject
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <JoditEditor
          ref={editor}
          value={content}
          config={{
            height: 420,
            readonly: false,
            toolbarAdaptive: false,
            toolbarSticky: false,
            buttons: "bold,italic,underline,|,ul,ol,|,link,image,table,|,source",
            askBeforePasteHTML: false,
            askBeforePasteFromWord: false,
            processPasteHTML: true,
          }}
          onBlur={(newContent) => setContent(newContent)}
        />
      </div>

      {/* Save main button */}
      <button
        onClick={saveTemplate}
        disabled={saving}
        className={`px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60 disabled:cursor-not-allowed ${
          saving ? "cursor-wait" : ""
        }`}
      >
        {saving ? "Saving..." : "Save Template"}
      </button>

      {/* Live Preview */}
      <div className="mt-10 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <i className="ri-eye-line"></i>
          Live Preview
        </h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* ── Logo Modal ──────────────────────────────────────────────── */}
      {openLogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenLogo(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold">Upload Logo Image</h3>
              <button
                onClick={() => setOpenLogo(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preview */}
              <div className="flex items-center gap-6">
                <span className="font-medium text-gray-700 min-w-[60px]">Logo:</span>

                {logo ? (
                  <div className="text-center">
                    <img
                      src={logo}
                      alt="Logo preview"
                      style={{
                        width: logoWidth || "auto",
                        height: logoHeight || "80px",
                        objectFit: "contain",
                      }}
                      className="mx-auto border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("logoInput")?.click()}
                      className="mt-2 text-sm text-indigo-600 hover:underline"
                    >
                      Click to change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => document.getElementById("logoInput")?.click()}
                    className="px-5 py-2.5 border border-dashed border-gray-400 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition"
                  >
                    Upload Logo
                  </button>
                )}

                <input
                  id="logoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogo(URL.createObjectURL(file));
                      setLogoFile(file);
                    }
                  }}
                />
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Width
                  </label>
                  <input
                    type="text"
                    value={logoWidth}
                    onChange={(e) => setLogoWidth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. 180"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Height
                  </label>
                  <input
                    type="text"
                    value={logoHeight}
                    onChange={(e) => setLogoHeight(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="e.g. 60"
                  />
                </div>
              </div>

              <button
                onClick={saveLogo}
                disabled={saving}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {saving ? "Updating..." : "Update Logo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Map Modal ───────────────────────────────────────────────── */}
      {openMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenMap(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold">Update Map Link</h3>
              <button
                onClick={() => setOpenMap(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Google Map Embed Link
              </label>
              <input
                type="text"
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />

              <button
                onClick={saveMap}
                disabled={saving}
                className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {saving ? "Updating..." : "Update Map"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Subject Modal ───────────────────────────────────────────── */}
      {openSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpenSubject(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold">Edit Subject Line</h3>
              <button
                onClick={() => setOpenSubject(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Welcome to [Company]!"
              />

              <button
                onClick={saveSubjectLine}
                disabled={saving}
                className="mt-6 w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
              >
                {saving ? "Updating..." : "Update Subject Line"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}