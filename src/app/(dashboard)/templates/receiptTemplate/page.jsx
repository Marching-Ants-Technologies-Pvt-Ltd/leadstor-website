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

export default function ReceiptTemplate() {
    const editor = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable values
    const [content, setContent] = useState("");
    const [subjectLine, setSubjectLine] = useState("");
    const [openHelper, setOpenHelper] = useState(false);
    const handleOpenHelper = () => setOpenHelper(true);
    const handleCloseHelper = () => setOpenHelper(false);
    const placeholders = [
        { key: "$companyName", label: "Your company/ institute name" },
        { key: "$companyAddress", label: "Your company/ institute address" },
        { key: "$receiptNo", label: "Receipt No" },
        { key: "$paymentDate", label: "Payment Date" },
        { key: "$candidateName", label: "Candidate Name" },
        { key: "$trackingId", label: "Candidate Tracking ID" },
        { key: "$installment", label: "Installment" },
        { key: "$logo", label: "Logo" },
        { key: "$parentAddress", label: "Parent Address" }
    ];

    // ✅ Fetch the existing template on mount
    useEffect(() => {
        const fetchTemplate = async () => {
        try {
            const res = await xFetch({
                path: `/services/profile/getReceiptTemplates`,
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
            receiptContent: content
        };
        setSaving(true);
        xFetch({
            path: `/services/profile/updateReceiptTemplates`,
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

    const insertPlaceholder = (text) => {
        const editorInstance = editor.current;
        if (editorInstance) {
            editorInstance.editor.selection.insertHTML(text);
        }
        handleCloseHelper();
    };

    if (loading) {
        return (
        <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
            Loading receipt template...
            </Typography>
        </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">✨ Certificate Template Editor</Typography>
                <Button
                variant="outlined"
                color="secondary"
                onClick={handleOpenHelper}
                sx={{ mb: 2 }}
                >
                📌 Show Helper Fields
                </Button>
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

            <Modal open={openHelper} onClose={handleCloseHelper}>
                <Box
                    sx={{
                    width: 350,
                    background: "#fff",
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 24,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                    💡 Helper Fields
                    </Typography>

                    {placeholders.map((item) => (
                    <Box
                        key={item.key}
                        sx={{
                        p: 1.5,
                        mb: 1,
                        border: "1px solid #ddd",
                        borderRadius: 1,
                        cursor: "pointer",
                        "&:hover": { background: "#f0f7ff" }
                        }}
                        onClick={() => insertPlaceholder(item.key)}
                    >
                        <Typography sx={{ fontWeight: "bold" }}>{item.key}</Typography>
                        <Typography variant="caption">{item.label}</Typography>
                    </Box>
                    ))}

                    <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={handleCloseHelper}
                    >
                    Close
                    </Button>
                </Box>
                </Modal>

        </Box>
    );
}