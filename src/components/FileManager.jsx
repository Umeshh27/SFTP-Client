'use client';
import { useState, Suspense } from 'react';
import DirectoryTree from './DirectoryTree';
import FileListView from './FileListView';
import Breadcrumbs from './Breadcrumbs';

function FileListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-2 bg-slate-200 rounded w-3/4"></div>
            <div className="h-2 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FileManager({ initialPath, initialFiles }) {
  const [currentPath, setCurrentPath] = useState(initialPath);

  return (
    <>
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-3" data-test-id="breadcrumbs">
        <Breadcrumbs currentPath={currentPath} onNavigate={setCurrentPath} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 min-w-[200px] border-r border-neutral-200 bg-neutral-50 overflow-y-auto p-4 hidden md:block">
          <div data-test-id="directory-tree" className="h-full">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Navigation</h2>
            <DirectoryTree currentPath={currentPath} onNavigate={setCurrentPath} baseDir={initialPath} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto relative bg-white" data-test-id="file-list-view">
          <div className="p-6 h-full">
            <Suspense fallback={<FileListSkeleton />}>
              <FileListView 
                currentPath={currentPath} 
                initialPath={initialPath} 
                initialFiles={initialFiles} 
                onNavigate={setCurrentPath} 
              />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
