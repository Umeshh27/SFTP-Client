'use client';

import { useState, useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';

export default function UploadModal({ currentPath, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const xhrRef = useRef(null);

  const handleUpload = () => {
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      setError('File exceeds 100MB limit');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('path', currentPath);
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201 || xhr.status === 200) {
        onSuccess();
        onClose();
      } else {
        setIsUploading(false);
        try {
          const res = JSON.parse(xhr.responseText);
          setError(res.error || 'Upload failed');
        } catch {
          setError('Upload failed with status: ' + xhr.status);
        }
      }
    });

    xhr.addEventListener('error', () => {
      setIsUploading(false);
      setError('Network error during upload');
    });

    xhr.addEventListener('abort', () => {
      setIsUploading(false);
      setError('Upload cancelled');
    });

    xhr.open('POST', '/api/sftp/upload', true);
    xhr.send(formData);
  };

  const handleCancel = () => {
    if (isUploading && xhrRef.current) {
      xhrRef.current.abort();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-neutral-100">
          <h3 className="font-semibold text-lg text-neutral-800">Upload File</h3>
          <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {!isUploading ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 flex flex-col items-center justify-center bg-neutral-50">
                <UploadCloud size={40} className="text-blue-500 mb-3" />
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (selected) setFile(selected);
                  }}
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-100 transition text-sm"
                >
                  Browse Files
                </label>
                {file && (
                  <p className="mt-3 text-sm text-neutral-600 truncate max-w-full font-medium">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={!file}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium text-sm disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-neutral-700">Uploading {file?.name}...</span>
                <span className="text-blue-600">{Math.round(progress)}%</span>
              </div>
              
              <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  data-test-id="upload-progress-bar"
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-center pt-2">
                <button 
                  onClick={handleCancel}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition px-3 py-1.5 rounded bg-red-50 hover:bg-red-100"
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
