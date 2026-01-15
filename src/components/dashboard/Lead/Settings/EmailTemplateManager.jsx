"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { xFetch } from "@/utility/xFetch";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function EmailTemplateManager() {
    const editorRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [selectedId, setSelectedId] = useState("");
    const [openHelper, setOpenHelper] = useState(false);
    const handleOpenHelper = () => setOpenHelper(true);
    const handleCloseHelper = () => setOpenHelper(false);

    const [templateName, setTemplateName] = useState("");
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [open, setOpen] = useState(false);
    const placeholders = [
        { key: "$testName", label: "Test Name" },
        { key: "$candidateName", label: "Candidate Name" },
        { key: "$corporateName", label: "Your company/ institute name" },
        { key: "$candResult", label: "Candidate performance result link" },
        { key: "$rating", label: "Rating of the Candidate" },
        { key: "$percentage", label: "Percentage of the Candidate" }
    ];

    const handleOpen = () => {
        resetForm();
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const resetForm = () => {
        setTemplateName("");
        setSubject("");
        setContent("");
        setSelectedId("");
    };

    // Fetch templates
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
        const res = await xFetch({
            path: "/services/profile/getTemplates",
            method: "GET",
        });
        setTemplates(res);
        } catch (e) {
        toast.error("Failed to load templates");
        } finally {
        setLoading(false);
        }
    };

    // Load selected template
    const handleTemplateSelect = (id) => {
        setSelectedId(id);

        const temp = templates.find((t) => t.templateId === id);
        if (temp) {
            setTemplateName(temp.templateName);
            setSubject(temp.subject);

            const editorInstance = editorRef.current;
            if (editorInstance) {
            editorInstance.value = temp.htmlContent;   // Load HTML correctly
            }

            setContent(temp.htmlContent);
        }
    };

    // Save new template
    const saveTemplate = async () => {
        const payload = {
        atitle:templateName,
        asubject:subject,
        atextEditor: btoa(content),
        };

        try {
        await xFetch({
            path: "/services/profile/addTemplates",
            method: "POST",
            payload,
        });

        toast.success("Template created!");
        handleClose();
        fetchTemplates();
        } catch (e) {
        toast.error("Failed to save");
        }
    };

    // Update template
    const updateTemplate = async () => {
        const payload = {
        tid: selectedId,
        tname:templateName,
        tsub:subject,
        tcontent: btoa(content)
        };

        try {
        await xFetch({
            path: "/services/profile/updateTemplates",
            method: "POST",
            payload,
        });

        toast.success("Template updated!");
        fetchTemplates();
        } catch {
        toast.error("Update failed");
        }
    };

    // Delete template
    const deleteTemplate = async () => {
        if (!selectedId) return toast.info("Select a template");

        try {
        await xFetch({
            path: "/services/profile/deleteTemplates",
            method: "POST",
            payload: { tid: selectedId },
        });

        toast.success("Template deleted!");
        resetForm();
        fetchTemplates();
        } catch {
        toast.error("Delete failed");
        }
    };

    // ── Render ─────────────────────────────────────────────────
    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
            Email Template Manager
            </h2>
            <div className="flex flex-wrap gap-3">
            <button
                onClick={handleOpen}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
                Add Template
            </button>
            <button
                onClick={handleOpenHelper}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
                📌 Show Helper Fields
            </button>
            </div>
        </div>

        {/* Template Selector */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Template
            </label>
            <select
            value={selectedId}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition shadow-sm"
            >
            <option value="">-- Choose a template --</option>
            {templates.map((temp) => (
                <option key={temp.templateId} value={temp.templateId}>
                {temp.templateName}
                </option>
            ))}
            </select>
        </div>

        {/* Editor Form – shown when template selected */}
        {selectedId && (
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Template Name
                </label>
                <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject
                </label>
                <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Content
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                <JoditEditor
                    ref={editorRef}
                    value={content}
                    config={{
                    height: 320,
                    buttons:
                        "source,|,bold,italic,underline,|,ul,ol,|,link,image,table,|,align,left,center,right,justify",
                    }}
                    onBlur={(newContent) => setContent(newContent)}
                />
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <button
                onClick={updateTemplate}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                >
                Save Changes
                </button>
                <button
                onClick={deleteTemplate}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition shadow-sm"
                >
                Delete
                </button>
            </div>
            </div>
        )}

        {/* ── Add Template Modal ──────────────────────────────────────── */}
        {open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-semibold text-gray-900">
                    Add New Email Template
                </h3>
                <button
                    onClick={handleClose}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition"
                >
                    <i className="ri-close-line text-2xl"></i>
                </button>
                </div>

                <div className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Template Name
                    </label>
                    <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subject
                    </label>
                    <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Content
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <JoditEditor
                        ref={editorRef}
                        value={content}
                        config={{
                        height: 300,
                        buttons:
                            "source,|,bold,italic,underline,|,ul,ol,|,link,image,table,|,align,left,center,right,justify",
                        }}
                        onBlur={(newContent) => setContent(newContent)}
                    />
                    </div>
                </div>

                <button
                    onClick={saveTemplate}
                    className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                    Save Template
                </button>
                </div>
            </div>
            </div>
        )}

        {/* ── Helper Fields Modal ─────────────────────────────────────── */}
        {openHelper && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleCloseHelper}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-semibold text-gray-900">
                    💡 Helper Fields
                </h3>
                <button
                    onClick={handleCloseHelper}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 transition"
                >
                    <i className="ri-close-line text-2xl"></i>
                </button>
                </div>

                <div className="p-6 space-y-3">
                {placeholders.map((item) => (
                    <div
                    key={item.key}
                    onClick={() => insertPlaceholder(item.key)}
                    className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition group"
                    >
                    <div className="font-mono font-bold text-indigo-700 group-hover:text-indigo-800">
                        {item.key}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{item.label}</div>
                    </div>
                ))}

                <button
                    onClick={handleCloseHelper}
                    className="w-full mt-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                    Close
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}