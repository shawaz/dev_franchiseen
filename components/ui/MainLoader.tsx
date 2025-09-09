'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface MainLoaderProps {
  message?: string;
  showProgress?: boolean;
  fullScreen?: boolean;
}

export default function MainLoader({ 
  message = "Loading...", 
  showProgress = false,
  fullScreen = true 
}: MainLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate progress bar
  useEffect(() => {
    if (!showProgress) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showProgress]);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900"
    : "flex flex-col items-center justify-center p-8 bg-stone-50 dark:bg-stone-900 rounded-lg";

  return (
    <div className={containerClasses}>
      {/* Logo */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        <Image
          src="/logo.svg"
          alt="Franchiseen Logo"
          width={120}
          height={120}
          className="relative z-10 drop-shadow-lg"
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>

      {/* Animated Spinner */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-stone-200 dark:border-stone-700 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
        
        {/* Inner ring */}
        <div className="absolute top-2 left-2 w-12 h-12 border-3 border-stone-300 dark:border-stone-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
          <div className="absolute top-0 left-0 w-full h-full border-3 border-transparent border-t-yellow-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
      </div>

      {/* Loading Message */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-2">
          {message}
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 min-h-[20px]">
          Please wait{dots}
        </p>
      </div>

      {/* Progress Bar (optional) */}
      {showProgress && (
        <div className="w-64 bg-stone-200 dark:bg-stone-700 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Loading Tips */}
      <div className="text-xs text-stone-500 dark:text-stone-400 text-center max-w-xs">
        <p>Setting up your franchise experience...</p>
      </div>
    </div>
  );
}
