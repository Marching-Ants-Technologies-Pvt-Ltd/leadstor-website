"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  MenuItem,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" >Email Template Manager</Typography>
                {/* Button to open Add Template Modal */}
                <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpen}>
                    Add Template
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleOpenHelper}
                    sx={{ mb: 2 }}
                    >
                    📌 Show Helper Fields
                </Button>
            </Box>

            {/* Template Dropdown */}
            <TextField
                select
                fullWidth
                label="Select Template"
                value={selectedId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
            >
                {templates.map((temp) => (
                <MenuItem key={temp.templateId} value={temp.templateId}>
                    {temp.templateName}
                </MenuItem>
                ))}
            </TextField>

            {/* Selected Template Fields */}
            {selectedId && (
                <>
                <TextField
                    label="Template Name"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                />

                <TextField
                    label="Subject"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <Box sx={{ mt: 2 }}>
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
                </Box>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={updateTemplate}>
                    Save Changes
                    </Button>

                    <Button variant="contained" color="error" onClick={deleteTemplate}>
                    Delete
                    </Button>
                </Stack>
                </>
            )}

            {/* Add Template Modal */}
            <Modal open={open} onClose={handleClose}>
                <Box
                sx={{
                    width: 700,
                    background: "#fff",
                    p: 3,
                    borderRadius: 2,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
                >
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">Add New Email Template</Typography>
                    <IconButton onClick={handleClose}>
                    <CloseIcon />
                    </IconButton>
                </Stack>

                <TextField
                    label="Template Name"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                />

                <TextField
                    label="Subject"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />

                <Box sx={{ mt: 2 }}>
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
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={saveTemplate}
                >
                    Save Template
                </Button>
                </Box>
            </Modal>

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