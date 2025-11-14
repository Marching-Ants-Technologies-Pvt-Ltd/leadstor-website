"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Modal,
  TextField,
  Stack,
  IconButton,
} from "@mui/material";
import { xFetch } from "@/utility/xFetch";
import ImageIcon from "@mui/icons-material/Image";
import MapIcon from "@mui/icons-material/Map";
import SubjectIcon from "@mui/icons-material/Subject";
import CloseIcon from "@mui/icons-material/Close";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.min.css';
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function CertificateTemplate() {
    const editor = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable values
    const [content, setContent] = useState("");
    const [subjectLine, setSubjectLine] = useState("");

    // ✅ Fetch the existing template on mount
    useEffect(() => {
        const fetchTemplate = async () => {
        try {
            const res = await xFetch({
                path: `/services/profile/getCertificateTemplate`,
                method: "GET",
                responseType: "text"
            });
            if (res) setContent(res);
        } catch (error) {
            toast.error("Failed to load template");
        } finally {
            setLoading(false);
        }
        };
        fetchTemplate();
    }, []);

    // ✅ Save Template Function
    const saveTemplate = async () => {
        const payload = {
            certificateContent: content
        };
        setSaving(true);
        xFetch({
            path: `/services/profile/updateCertificateTemplate`,
            method: "POST",
            payload
        })
        .then(() => {
            toast.success("Template saved successfully!");
        })
        .catch((err) => {
            toast.error("Error saving template!");
        })
        .finally(() => setSaving(false));
    };

    if (loading) {
        return (
        <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
            Loading certificate template...
            </Typography>
        </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">✨ Certificate Template Editor</Typography>
            </Box>

            {/* 🧩 WYSIWYG Editor */}
            {typeof window !== "undefined" && (

                <JoditEditor
                    ref={editor}
                    value={content}
                    config={{
                    height: 400,
                    readonly: false,
                    toolbarAdaptive: false,
                    toolbarSticky: false,
                    buttons: ["bold", "italic", "underline", "|", "ul", "ol", "|", "link", "image", "table", "|", "source"],
                    askBeforePasteHTML: false,
                    askBeforePasteFromWord: false,
                    processPasteHTML: true,
                    }}
                    onBlur={(newContent) => setContent(newContent)}
                />
            )}

            {/* 💾 Save Template */}
            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={saveTemplate}
                disabled={saving}
            >
                {saving ? "Saving..." : "Save Template"}
            </Button>

            {/* 👁️ Live Preview */}
            <Box
                sx={{
                mt: 3,
                mb: 3,
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                background: "#fff",
                }}
            >
                <Typography variant="h6" gutterBottom>
                🔍 Live Preview
                </Typography>
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </Box>
        </Box>
    );
}