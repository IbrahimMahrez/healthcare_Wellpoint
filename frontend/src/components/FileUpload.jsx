import React, { useState } from "react";
import { Upload, X, Image, FileText, Film } from "lucide-react";
import api from "../services/api";

export default function FileUpload({ onUpload, accept = "image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,application/json,video/mp4" }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [urls, setUrls] = useState([]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    setUploading(true);
    try {
      const res = await api.post("/upload/medical", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUrls(res.data.urls);
      onUpload?.(res.data.urls);
    } catch (err) {
      console.error("Upload error:", err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = async (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return <Image size={16} />;
    if (mimeType?.includes("pdf") || mimeType?.includes("document")) return <FileText size={16} />;
    if (mimeType?.includes("video")) return <Film size={16} />;
    return <Upload size={16} />;
  };

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50 p-6 text-center hover:border-primary-500 hover:bg-primary-100">
        <Upload size={24} className="text-primary-500" />
        <span className="text-sm font-medium text-ink-700">
          {uploading ? "Uploading..." : "Click or drag files to upload"}
        </span>
        <input type="file" multiple accept={accept} onChange={handleFileChange} className="hidden" disabled={uploading} />
      </label>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2">
              {getFileIcon(file.type)}
              <span className="flex-1 truncate text-sm text-ink-700">{file.name}</span>
              {urls[i] && <span className="text-xs text-green-600">✓ Uploaded</span>}
              <button onClick={() => removeFile(i)} className="text-ink-400 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}