'use client';

import { useState, useEffect } from 'react';
import { X, Download, File as FileIcon } from 'lucide-react';

export default function PreviewPanel({ file, onClose }) {
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  const isText = ['txt', 'md', 'json', 'csv', 'log', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'xml'].includes(ext);

  const isUnsupported = !isImage && !isText;

  useEffect(() => {
    if (isUnsupported || isImage) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/sftp/download?path=${encodeURIComponent(file.path)}`)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(() => setContent('Failed to load content'))
      .finally(() => setIsLoading(false));

  }, [file.path, isUnsupported, isImage]);

  const downloadUrl = `/api/sftp/download?path=${encodeURIComponent(file.path)}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        data-test-id="preview-panel"
      >
        <div className="flex justify-between items-center p-4 border-b border-neutral-100 bg-neutral-50 shrink-0">
          <div className="flex items-center text-neutral-800 font-medium">
            <FileIcon size={18} className="text-neutral-500 mr-2" />
            <span className="truncate max-w-md">{file.name}</span>
            <span className="ml-3 text-sm text-neutral-500 font-normal">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-neutral-100 flex items-center justify-center relative min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <span className="w-8 h-8 border-4 border-neutral-200 border-t-blue-500 rounded-full animate-spin"></span>
            </div>
          )}

          {isImage && (
            <div className="p-4 w-full h-full flex items-center justify-center bg-transparent backdrop-pattern">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={downloadUrl} 
                alt={file.name} 
                className="max-w-full max-h-full object-contain shadow-sm border border-neutral-200 bg-white"
                data-test-id="preview-image"
              />
            </div>
          )}

          {isText && content !== null && (
            <div className="w-full h-full p-4 bg-white overflow-auto text-left">
              <pre 
                data-test-id="preview-text"
                className="text-sm font-mono text-neutral-800 whitespace-pre-wrap break-words"
              >
                {content}
              </pre>
            </div>
          )}

          {isUnsupported && (
            <div 
              data-test-id="preview-unsupported" 
              className="bg-white w-full h-full flex flex-col items-center justify-center p-8 space-y-4"
            >
              <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-neutral-100 text-neutral-400">
                <span className="text-2xl font-bold uppercase">{ext || '?'}</span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-neutral-800">Unsupported File Type</h3>
                <p className="text-neutral-500 mt-1 max-w-sm">
                  We cannot preview this file type in the browser. You can download it to view locally.
                </p>
              </div>
              
              <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-lg w-full max-w-sm text-sm my-4">
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-medium">Name:</span>
                  <span className="text-neutral-800 truncate pl-4">{file.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-medium">Size:</span>
                  <span className="text-neutral-800">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
              </div>

              <a 
                href={downloadUrl}
                download={file.name}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow flex items-center"
              >
                <Download size={18} className="mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
