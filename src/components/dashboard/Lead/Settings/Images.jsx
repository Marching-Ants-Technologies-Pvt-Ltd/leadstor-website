"use client";
import React, { useEffect, useState } from "react";
import { xFetch } from "@/utility/xFetch";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiFileCopyLine } from "react-icons/ri";

export default function MyImagesSection() {
  const [images, setImages] = useState([]);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const fetchImages = async () => {
    setIsFetching(true);
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
      .finally(() => setIsFetching(false));
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    const formData = new FormData();
    formData.append("uploadImage", selectedFile);

    setIsUploading(true);

    await xFetch({
      path: "/services/profile/uploadImage",
      method: "POST",
      payload: formData,
      isFormData: true,
    })
      .then((res) => {
        if (res === true) {
          toast.success("Image uploaded successfully");
          setSelectedFile(null);
          setFileInputKey((prev) => prev + 1);
          fetchImages();
        } else if (res?.status === "size error") {
          toast.error(res.message);
        } else {
          toast.error("Upload failed. Please try again.");
        }
      })
      .catch(() => {
        toast.error("Something went wrong while uploading the image");
      })
      .finally(() => setIsUploading(false));
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white shadow rounded-xl">
        <div className="space-y-4">
          <h2 className="text-xl">Uploaded Images</h2>

          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="font-medium block mb-2">Upload Image</label>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="w-full border rounded p-2 bg-white"
            />

            <div className="mt-2 text-sm text-gray-600">
              {selectedFile ? `Selected: ${selectedFile.name}` : "No file selected"}
            </div>

            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className={`mt-3 px-4 py-2 rounded text-white text-sm ${
                !selectedFile || isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {isFetching && <p className="text-gray-500">Loading images...</p>}

            {!isFetching &&
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
                  <span className="text-blue-600 underline break-all w-full">{img}</span>

                  <RiFileCopyLine
                    size={18}
                    className="text-gray-700 hover:text-black cursor-pointer"
                    onClick={() => copyToClipboard(img, index)}
                    title="Copy image URL"
                  />
                </div>
              ))}

            {!isFetching && images.length === 0 && <p className="text-gray-500">No images found.</p>}
          </div>
        </div>

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
    </div>
  );
}
