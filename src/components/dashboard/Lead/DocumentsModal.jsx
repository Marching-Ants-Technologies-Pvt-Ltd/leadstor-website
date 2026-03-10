'use client';

import { useState, useEffect, useRef } from 'react';
import { xFetch } from '@/utility/xFetch';
import { toast } from 'react-toastify';
import { User } from '@/utility/TinyDB';

import { FaUpload, FaTrash, FaFolderOpen } from 'react-icons/fa';

export default function DocumentsModal({ invitationId, isOpen, onClose }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const fileInputRef = useRef(null);

    useEffect(() => {
    if (isOpen) {
        loadDocuments();
        loadCorporateDetails();
    }
    }, [isOpen, invitationId]);

    const loadDocuments = async () => {
        setLoading(true);

        try {
            const [docsData] = await Promise.all([
            xFetch({
                path: `/services/invite/getDocuments?invitationId=${invitationId}&time=${Date.now()}`,
            }),
            ]);

            setDocs(Array.isArray(docsData) ? docsData : []);

        } catch (err) {
            console.error(err);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const loadCorporateDetails = async () => {
        setLoading(true);

        try {
            const [corporateData] = await Promise.all([
                xFetch({
                    path: `/services/profile/getCorporateDetails?time=${Date.now()}`,
                }),
            ]);

            if (corporateData) {
                setRefreshToken(corporateData.google_drive_token || "");
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to load corporate details");
        } finally {
            setLoading(false);
        }
    };

    const refreshGoogleToken = async () => {
        if (!refreshToken) return false;

        try {
            const res = await fetch('/api/conceptninjas/refresh-google-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error_description || 'Token refresh failed');
            }

            const { access_token } = await res.json();
            localStorage.setItem('GOOGLE_DRIVE_ACCESS_TOKEN', access_token);
            return true;
        } catch (err) {
            console.error(err);
            toast.error('Google Drive connection failed. Please reconnect.');
            return false;
        }
    };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingFile(file);
    setShowConfirm(true);
    // Do NOT clear input here — clear only after upload or cancel
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;

    setShowConfirm(false);
    setUploading(true);

    try {
      toast.info(`Uploading ${pendingFile.name}...`);

      const file = pendingFile;

      // Step 1: Upload to Google Drive
      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify({ name: file.name, mimeType: file.type })], {
          type: 'application/json',
        })
      );
      formData.append('file', file);

      const hasToken = await refreshGoogleToken();
      if (!hasToken) return;
      const token = localStorage.getItem('GOOGLE_DRIVE_ACCESS_TOKEN');

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Google Drive upload failed');

      const uploadData = await uploadRes.json();
      const fileId = uploadData.id;

      // Step 2: Make file publicly readable
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      });

      // Step 3: Generate preview link & save to DB
      const previewLink = `https://drive.google.com/file/d/${fileId}/preview`;

      await xFetch({
        path: '/services/invite/saveDocument',
        method: 'POST',
        payload: {
          owner: User?._id ?? -1,
          invitationId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_link: previewLink,
          time: Date.now(),
        },
      });

      toast.success('File uploaded and saved successfully!');
      loadDocuments();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Check console or try again.');
    } finally {
      setUploading(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cancelUpload = () => {
    setShowConfirm(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteDocument = async (docsId) => {
    if (!confirm('Remove this file from ConceptNinjas? (It will remain in Google Drive)')) return;

    try {
      await xFetch({
        path: `/services/invite/deleteDocuments?docsId=${docsId}&invitationId=${invitationId}&time=${Date.now()}`,
        method: 'GET',
      });
      toast.success('File removed');
      loadDocuments();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const formatFileSize = (bytes) => {
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(num) || num === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(num) / Math.log(1024));
    return (num / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Documents Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-600 hover:text-gray-900"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading documents...</div>
            ) : docs.length === 0 ? (
              <div className="empty-folder text-center py-12">
                {/* You can replace with your own image */}
                <FaFolderOpen className="mx-auto text-8xl text-yellow-500 mb-6 opacity-80" />
                <h3 className="text-xl font-medium text-gray-700 mb-3">
                  You haven&apos;t uploaded any docs for this lead yet!
                </h3>
                <p className="text-gray-600 mb-2">
                  <label
                    htmlFor="file-upload"
                    className="text-blue-600 font-bold underline cursor-pointer hover:text-blue-800"
                  >
                    Click here
                  </label>{' '}
                  to upload documents, supported formats:
                </p>
                <ul className="text-gray-600 text-sm mt-3 inline-block text-left">
                  <li>• Documents: PDF, TXT, DOC, DOCX, XLS, XLSX, CSV</li>
                  <li>• Images: PNG, JPG, JPEG, WEBP, GIF</li>
                  <li className="text-red-600 mt-1">• Videos are not supported</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div
                    key={doc.docs_id}
                    className="docs-list grid grid-cols-[1fr_40px] items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="docs-summary">
                      <a
                        href={doc.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline font-medium"
                      >
                        {doc.title}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatFileSize(doc.size)} • {doc.date_time}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.docs_id)}
                      className="text-red-600 hover:text-red-800 text-xl flex justify-center"
                      title="Delete file"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-5 py-2.5 rounded-lg cursor-pointer transition
                ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium`}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                <>
                  <FaUpload className="mr-2" /> Upload
                </>
              )}
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.gif"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && pendingFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 text-white">
              <h3 className="text-lg font-semibold">Are you sure you want to upload this file?</h3>
            </div>
            <div className="p-6 space-y-3">
              <p>
                <strong>Name:</strong> {pendingFile.name}
              </p>
              <p>
                <strong>Type:</strong> {pendingFile.type || 'Unknown'}
              </p>
              <p>
                <strong>Size:</strong> {formatFileSize(pendingFile.size)}
              </p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={cancelUpload}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Yes! Upload Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}