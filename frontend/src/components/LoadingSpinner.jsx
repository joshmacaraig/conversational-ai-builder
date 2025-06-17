// 🔄 Loading Spinner Component - Professional loading indicators
// Reusable spinner with multiple sizes and colors

import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  // Size configurations
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Color configurations
  const colors = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    yellow: 'border-yellow-600',
    red: 'border-red-600'
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.primary;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`${sizeClass} border-2 border-t-transparent rounded-full animate-spin ${colorClass}`}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className={`text-sm ${
          color === 'white' ? 'text-white' : 'text-gray-600'
        }`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Preset loading states
export const LoadingStates = {
  // Chat loading
  ChatLoading: () => (
    <LoadingSpinner size="sm" text="AI is thinking..." />
  ),

  // Audio generation
  AudioLoading: () => (
    <LoadingSpinner size="sm" color="primary" text="Generating audio..." />
  ),

  // API connection
  ConnectionLoading: () => (
    <LoadingSpinner size="md" text="Connecting to server..." />
  ),

  // Page loading
  PageLoading: () => (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Loading application...</p>
    </div>
  ),

  // Button loading
  ButtonLoading: ({ color = 'white' }) => (
    <LoadingSpinner size="xs" color={color} />
  )
};

// Loading overlay component
export const LoadingOverlay = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading component for text
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`h-4 bg-gray-200 rounded ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
      />
    ))}
  </div>
);

// Skeleton loading for chat messages
export const MessageSkeleton = () => (
  <div className="flex space-x-3 animate-pulse">
    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

export default LoadingSpinner;
