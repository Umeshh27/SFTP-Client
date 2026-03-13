'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';

const fetcher = (url) => fetch(url).then(res => res.json());

function FolderNode({ path, name, level, currentPath, onNavigate }) {
  const isCurrentOrParent = currentPath === path || currentPath.startsWith(path + '/');
  const [expanded, setExpanded] = useState(isCurrentOrParent);

  const { data: files } = useSWR(
    expanded ? `/api/sftp/list?path=${encodeURIComponent(path)}` : null, 
    fetcher
  );

  const subDirs = files?.filter(f => f.type === 'd').sort((a, b) => a.name.localeCompare(b.name)) || [];
  const isLoading = expanded && !files;
  const isSelected = currentPath === path;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-colors ${
          isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-neutral-700 hover:bg-neutral-100/80'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onNavigate(path)}
      >
        <div 
          onClick={(e) => { 
            e.stopPropagation(); 
            setExpanded(!expanded); 
          }} 
          className="w-5 h-5 mr-1 flex items-center justify-center text-neutral-400 hover:text-neutral-600 rounded"
        >
          {isLoading ? (
            <span className="w-3 h-3 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
          ) : subDirs.length > 0 || !files ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : <span className="w-4 h-4" />}
        </div>
        
        <div className="flex items-center flex-1 min-w-0">
          <Folder size={16} className={`mr-2 shrink-0 ${isSelected ? 'text-blue-500' : 'text-amber-400'}`} fill="currentColor" fillOpacity={isSelected ? 0.2 : 0.1} />
          <span className="text-sm truncate">{name}</span>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-0.5">
          {subDirs.map((dir) => (
            <FolderNode 
              key={dir.name}
              path={`${path === '/' ? '' : path}/${dir.name}`}
              name={dir.name}
              level={level + 1}
              currentPath={currentPath}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DirectoryTree({ currentPath, onNavigate, baseDir }) {
  return (
    <div className="py-2 overflow-x-hidden">
      <FolderNode 
        path={baseDir} 
        name={baseDir.split('/').pop() || 'Root'} 
        level={0} 
        currentPath={currentPath} 
        onNavigate={onNavigate} 
      />
    </div>
  );
}
