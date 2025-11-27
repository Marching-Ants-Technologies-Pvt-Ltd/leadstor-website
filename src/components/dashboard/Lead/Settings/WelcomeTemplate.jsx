"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
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

export default function WelcomeEmail() {
    const editor = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: "", type: "success" });

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

    // ✅ Fetch the existing template on mount
    useEffect(() => {
        const fetchTemplate = async () => {
        try {
            const res = await xFetch({
            path: `/services/admin/getLeadTemplate`,
            method: "GET",
            });
            if (res?.invite_email) setContent(res.invite_email);
            if (res?.invite_email_subject) setSubjectLine(res.invite_email_subject);
            if (res?.logo_url) setLogo(`${process.env.NEXT_PUBLIC_LEADSTOR_REST}/`+res.logo_url);
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

    // ✅ Save Template Function
    const saveTemplate = async () => {
        const payload = {
            emailContent: content,
            subjectLine,
            type: "Emailcontent",
        };
        setSaving(true);
        xFetch({
            path: `/services/admin/updateEmailTemplate`,
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

    // ✅ Save Subject Line
    const saveSubjectLine = async () => {
        setOpenSubject(true);
        const payload = {
            subjectLine,
            type: "Emailsubject",
        };
        setSaving(true);
        xFetch({
            path: `/services/admin/updateEmailTemplate`,
            method: "POST",
            payload,
        })
        .then(() => {
            toast.success("Subject line updated successfully!");
            setOpenSubject(false);
        })
        .catch(() => {
            toast.error("Failed to update subject line");
        })
        .finally(() => setSaving(false));
    };

    // ✅ Save Map Link
    const saveMap = async () => {
        setOpenMap(true);
        const payload = {
            mapLocation: mapLink
        };
        setSaving(true);
        xFetch({
            path: `/services/admin/updateMap`,
            method: "POST",
            payload,
        })
        .then(() => {
            toast.success("Map link updated successfully!");
            setOpenMap(false);
        })
        .catch(() => {
            toast.error("Failed to update map link");
        })
        .finally(() => setSaving(false));
    };

    // ✅ Save Logo (with image upload)
    const saveLogo = async () => {
        setSaving(true);
        let uploadedLogoPath = logo;
        if (logoFile) {
            const payload = {
                logoHeight:logoHeight,
                logoWidth:logoWidth,
                uploadMap:logoFile
            };
            const formData = new FormData();
            formData.append("logoWidth", logoWidth);
            formData.append("logoHeight", logoHeight);
            formData.append("uploadMap", logoFile); // image file input

            await xFetch({
                path: `/services/admin/uploadLogo`,
                method: "POST",
                isFormData: true,
                payload:formData
            })
            .then((res) => {
                toast.success("Logo uploaded successfully!");
                uploadedLogoPath = res.source;
            })
            .catch((error) => {
                toast.error("Failed to upload logo");
            })
            .finally(() => setSaving(false));
        }
    };

    if (loading) {
        return (
        <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
            Loading email template...
            </Typography>
        </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">✨ Welcome Template Editor</Typography>

            {/* Settings Buttons */}
            <Stack direction="row" spacing={1}>
            <Button
                size="small"
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => setOpenLogo(true)}
            >
                Edit Logo
            </Button>
            <Button
                size="small"
                variant="outlined"
                startIcon={<MapIcon />}
                onClick={() => setOpenMap(true)}
            >
                Edit Map
            </Button>
            <Button
                size="small"
                variant="outlined"
                startIcon={<SubjectIcon />}
                onClick={() => setOpenSubject(true)}
            >
                Edit Subject Line
            </Button>
            </Stack>
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

        {/* ✅ Snackbar */}
        <Snackbar
            open={snack.open}
            autoHideDuration={3000}
            onClose={() => setSnack({ ...snack, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert severity={snack.type}>{snack.message}</Alert>
        </Snackbar>

        {/* 🖼️ Logo Modal */}
        <Modal open={openLogo} onClose={() => setOpenLogo(false)}>
            <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                p: 3,
                borderRadius: 2,
                boxShadow: 24,
                width: 480,
            }}
            >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Upload Logo Image</Typography>
                <IconButton onClick={() => setOpenLogo(false)}>
                <CloseIcon />
                </IconButton>
            </Stack>

            {/* Logo Preview Section */}
            <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ minWidth: 60 }}>Logo :</Typography>
                {logo ? (
                <Box sx={{ textAlign: "center" }}>
                    <img
                    src={logo}
                    alt="Uploaded Logo"
                    style={{
                        width: logoWidth || "auto",
                        height: logoHeight || "80px",
                        objectFit: "contain",
                    }}
                    />
                    <Typography
                    variant="body2"
                    color="primary"
                    sx={{ mt: 1, cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => document.getElementById("logoInput").click()}
                    >
                    Click to change
                    </Typography>
                </Box>
                ) : (
                <Button
                    variant="outlined"
                    onClick={() => document.getElementById("logoInput").click()}
                >
                    Upload Logo
                </Button>
                )}
                <input
                id="logoInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        setLogo(URL.createObjectURL(e.target.files[0]));
                        setLogoFile(e.target.files[0]);
                    }
                }}
                />
            </Box>

            {/* Logo Width / Height Fields */}
            <Box sx={{ mt: 3 }}>
                <TextField
                label="Logo Width"
                fullWidth
                value={logoWidth}
                onChange={(e) => setLogoWidth(e.target.value)}
                sx={{ mb: 2 }}
                />
                <TextField
                label="Logo Height"
                fullWidth
                value={logoHeight}
                onChange={(e) => setLogoHeight(e.target.value)}
                />
            </Box>

            {/* Update Button */}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={saveLogo}
                disabled={saving}
            >
                {saving ? "Updating..." : "Update"}
            </Button>
            </Box>
        </Modal>

        {/* 🗺️ Map Modal */}
        <Modal open={openMap} onClose={() => setOpenMap(false)}>
            <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                p: 3,
                borderRadius: 2,
                boxShadow: 24,
                width: 400,
            }}
            >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Update Map Link</Typography>
                <IconButton onClick={() => setOpenMap(false)}>
                <CloseIcon />
                </IconButton>
            </Stack>
            <TextField
                label="Google Map Embed Link"
                fullWidth
                sx={{ mt: 2 }}
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
            />
            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={saveMap}
                disabled={saving}
            >
                {saving ? "Updating..." : "Update Map"}
            </Button>
            </Box>
        </Modal>

        {/* 📨 Subject Line Modal */}
        <Modal open={openSubject} onClose={() => setOpenSubject(false)}>
            <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                p: 3,
                borderRadius: 2,
                boxShadow: 24,
                width: 400,
            }}
            >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Edit Subject Line</Typography>
                <IconButton onClick={() => setOpenSubject(false)}>
                <CloseIcon />
                </IconButton>
            </Stack>
            <TextField
                label="Subject Line"
                fullWidth
                sx={{ mt: 2 }}
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
            />
            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={saveSubjectLine}
                disabled={saving}
            >
                {saving ? "Updating..." : "Update Subject Line"}
            </Button>
            </Box>
        </Modal>
        </Box>
    );
}