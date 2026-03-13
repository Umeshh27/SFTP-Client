'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { File, Folder, Download, Trash2, Edit, Eye, Upload } from 'lucide-react';
import UploadModal from './UploadModal';
import PreviewPanel from './PreviewPanel';

const fetcher = (url) => fetch(url).then(async (res) => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
});

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileListView({ currentPath, initialPath, initialFiles, onNavigate }) {
  const { data: files, mutate } = useSWR(
    `/api/sftp/list?path=${encodeURIComponent(currentPath)}`,
    fetcher,
    { fallbackData: currentPath === initialPath ? initialFiles : undefined, suspense: true }
  );

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const sortedFiles = (files || []).sort((a, b) => {
    if (a.type === 'd' && b.type !== 'd') return -1;
    if (a.type !== 'd' && b.type === 'd') return 1;
    return a.name.localeCompare(b.name);
  });

  const handleDelete = async (filename) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      const res = await fetch(`/api/sftp/delete?path=${encodeURIComponent(currentPath + '/' + filename)}`, {
        method: 'DELETE'
      });
      if (res.ok) mutate();
      else alert('Failed to delete resource');
    } catch {}
  };

  const handleRename = async (filename) => {
    const newName = prompt(`Rename ${filename} to:`, filename);
    if (!newName || newName === filename) return;
    try {
      const fromPath = `${currentPath}/${filename}`;
      const toPath = `${currentPath}/${newName}`;
      const res = await fetch('/api/sftp/rename', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromPath, toPath })
      });
      if (res.ok) mutate();
      else alert('Failed to rename resource');
    } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-neutral-800">Files</h2>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm text-sm font-medium"
        >
          <Upload size={16} className="mr-2" />
          Upload File
        </button>
      </div>

      <div className="overflow-x-auto flex-1 border border-neutral-200 rounded-lg">
        <table className="min-w-full text-left bg-white">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-sm text-neutral-500 uppercase">Name</th>
              <th className="px-6 py-4 font-semibold text-sm text-neutral-500 uppercase">Size</th>
              <th className="px-6 py-4 font-semibold text-sm text-neutral-500 uppercase">Last Modified</th>
              <th className="px-6 py-4 font-semibold text-sm text-neutral-500 justify-end uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sortedFiles.map(file => {
              const fullPath = `${currentPath}/${file.name}`;
              return (
                <tr 
                  key={file.name} 
                  className="hover:bg-blue-50/50 group transition-colors"
                >
                  <td className="px-6 py-3">
                    <div 
                      className="flex items-center"
                      data-test-id={file.type === 'd' ? 'dir-item' : 'file-item'}
                    >
                      {file.type === 'd' ? (
                        <Folder className="text-amber-400 mr-3" size={20} fill="currentColor" fillOpacity={0.1} />
                      ) : (
                        <File className="text-neutral-400 mr-3" size={20} />
                      )}
                      {file.type === 'd' ? (
                        <button 
                          onClick={() => onNavigate(fullPath)} 
                          className="font-medium text-neutral-800 hover:text-blue-600 truncate max-w-xs transition"
                        >
                          {file.name}
                        </button>
                      ) : (
                        <span className="font-medium text-neutral-800 truncate max-w-xs">{file.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-neutral-500 text-sm whitespace-nowrap">
                    {file.type === 'd' ? '--' : formatSize(file.size)}
                  </td>
                  <td className="px-6 py-3 text-neutral-500 text-sm whitespace-nowrap">
                    {new Date(file.modifyTime).toLocaleDateString()} {new Date(file.modifyTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.type !== 'd' && (
                        <>
                          <button 
                            onClick={() => setPreviewFile({ name: file.name, path: fullPath, size: file.size })}
                            className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-neutral-100 rounded-md transition"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <a 
                            href={`/api/sftp/download?path=${encodeURIComponent(fullPath)}`}
                            download={file.name}
                            className="p-1.5 text-neutral-500 hover:text-green-600 hover:bg-neutral-100 rounded-md transition"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                        </>
                      )}
                      
                      <button 
                        onClick={() => handleRename(file.name)}
                        className="p-1.5 text-neutral-500 hover:text-amber-600 hover:bg-neutral-100 rounded-md transition"
                        title="Rename"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.name)}
                        className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-md transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedFiles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Folder className="text-neutral-200" size={48} />
                    <p>This directory is empty</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isUploadOpen && (
        <UploadModal 
          currentPath={currentPath} 
          onClose={() => setIsUploadOpen(false)} 
          onSuccess={() => mutate()} 
        />
      )}
      
      {previewFile && (
        <PreviewPanel 
          file={previewFile}
          onClose={() => setPreviewFile(null)} 
        />
      )}
    </div>
  );
}
