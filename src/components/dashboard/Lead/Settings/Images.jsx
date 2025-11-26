"use client";
import React, { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.min.css";
import { RiFileCopyLine } from "react-icons/ri";

export default function MyImagesSection() {
    const [images, setImages] = useState([]);
    const [hoveredImage, setHoveredImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // -----------------------
    // 1) GET IMAGES FROM API
    // -----------------------
    const fetchImages = async () => {
        setLoading(true);
        await xFetch({
        path: "/services/profile/getCorporateImages",
        })
        .then((res) => {
            if (res?.status === "success") {
            setImages(res.data ?? []);
            }
        })
        .catch(() => {
            toast.error("Something went wrong while loading images");
        })
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // -----------------------
    // 2) UPLOAD IMAGE
    // -----------------------
    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        let formData = new FormData();
        formData.append("uploadImage", file);

        setLoading(true);

        await xFetch({
        path: "/services/profile/uploadImage",
        method: "POST",
        payload: formData,
        isFormData: true,
        })
        .then((res) => {
            if (res === true) {
            toast.success("Image uploaded successfully 🎉");
            fetchImages();
            }
        })
        .catch(() => {
            toast.error("Something went wrong while uploading the image");
        })
        .finally(() => setLoading(false));
    };

    // -----------------------
    // COPY IMAGE URL
    // -----------------------
    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);   // highlight the clicked one
        toast.success("Copied!");

        // Remove highlight after 2 sec
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white shadow rounded-xl">

        {/* LEFT: LIST + UPLOAD */}
        <div className="space-y-4">
            <h2 className="text-xl">Uploaded Images</h2>

            {/* Upload */}
            <div className="border rounded-lg p-4 bg-gray-50">
            <label className="font-medium block mb-2">Upload Image</label>
            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="w-full border rounded p-2 bg-white"
            />
            </div>

            {/* Image List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">

            {loading && <p className="text-gray-500">Loading images...</p>}

            {!loading &&
                images.map((img, index) => (
                <div
                    key={index}
                    onMouseEnter={() => setHoveredImage(img)}
                    onMouseLeave={() => setHoveredImage(null)}
                    className={`
                    flex items-center justify-between gap-2 p-2 rounded cursor-pointer 
                    hover:bg-gray-100 transition
                    ${copiedIndex === index ? "bg-green-100 border border-green-400" : ""}
                    `}
                    >
                    <span className="text-blue-600 underline break-all w-full">
                    {img}
                    </span>

                    <RiFileCopyLine
                    size={18}
                    className="text-gray-700 hover:text-black cursor-pointer"
                    onClick={() => copyToClipboard(img, index)}
                    title="Copy image URL"
                    />
                </div>
                ))}

            {!loading && images.length === 0 && (
                <p className="text-gray-500">No images found.</p>
            )}

            </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="border rounded-xl p-4 flex justify-center items-center bg-gray-50">
            {hoveredImage ? (
            <img
                src={hoveredImage}
                alt="preview"
                className="max-w-full max-h-[400px] rounded-lg shadow-lg"
            />
            ) : (
            <p className="text-gray-400">Hover over an image name to preview</p>
            )}
        </div>

        </div>

    );
}
