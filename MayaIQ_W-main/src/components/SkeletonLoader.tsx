import React from 'react';

// Generic skeleton loader
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Message skeleton loader
export const MessageSkeleton: React.FC = () => (
  <div className="flex space-x-3 p-3 animate-pulse">
    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Group card skeleton loader
export const GroupCardSkeleton: React.FC = () => (
  <div className="p-4 border rounded-lg animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// Chat input skeleton
export const ChatInputSkeleton: React.FC = () => (
  <div className="flex items-center space-x-2 p-3 animate-pulse">
    <div className="flex-1 h-10 bg-gray-200 rounded-full"></div>
    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
  </div>
);

// Sidebar skeleton
export const SidebarSkeleton: React.FC = () => (
  <div className="w-64 bg-gray-50 p-4 space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((item) => (
      <div key={item} className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded flex-1"></div>
      </div>
    ))}
  </div>
);

// Header skeleton
export const HeaderSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
      <div className="h-6 bg-gray-200 rounded w-32"></div>
    </div>
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
  </div>
); 