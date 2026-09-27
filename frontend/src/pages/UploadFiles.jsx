import React, { useState } from "react";
import { Upload, Image, FileText, Film } from "lucide-react";
import FileUpload from "../components/FileUpload";

export default function UploadFiles() {
  const [uploadedUrls, setUploadedUrls] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Upload Files</h1>
        <p className="mt-2 text-sm text-ink-500">Upload medical records, lab results, prescriptions, or any other documents.</p>

        <div className="mt-8">
          <FileUpload
            accept="image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,application/json,video/mp4"
            onUpload={(urls) => setUploadedUrls(urls)}
          />
        </div>

        {uploadedUrls.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-ink-900">Uploaded Files</h2>
            <div className="mt-3 space-y-2">
              {uploadedUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-3">
                  <FileText size={20} className="text-primary-600" />
                  <a href={url} target="_blank" rel="noreferrer" className="flex-1 text-sm font-medium text-primary-700 hover:underline">
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}