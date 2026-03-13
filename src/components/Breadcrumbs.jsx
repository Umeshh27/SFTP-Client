'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

export default function Breadcrumbs({ currentPath, onNavigate }) {
  const parts = currentPath.split('/').filter(Boolean);
  
  const handleNavigate = (index) => {
    if (index === -1) {
      onNavigate('/' + parts[0]); // Base upload dir, assumed first part
    } else {
      const newPath = '/' + parts.slice(0, index + 1).join('/');
      onNavigate(newPath);
    }
  };

  return (
    <nav className="flex text-sm text-neutral-600" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <button 
            onClick={() => handleNavigate(-1)}
            className="inline-flex items-center text-neutral-500 hover:text-blue-600 transition-colors"
          >
            <Home size={16} className="mr-2" />
            Home
          </button>
        </li>
        {parts.map((part, index) => {
          // Skip the first part if it's the base directory we consider "Home"
          if (index === 0 && part === 'upload') return null;
          
          const isLast = index === parts.length - 1;
          
          return (
            <Fragment key={index}>
              <li>
                <div className="flex items-center">
                  <ChevronRight size={16} className="text-neutral-400 mx-1" />
                  <button
                    onClick={() => !isLast && handleNavigate(index)}
                    className={`${
                      isLast 
                        ? 'text-neutral-800 font-medium cursor-default' 
                        : 'text-neutral-500 hover:text-blue-600 transition-colors'
                    }`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {part}
                  </button>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
