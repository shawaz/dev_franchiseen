'use client';

import Spinner from '../Spinner';

interface CompactLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'stone' | 'white';
  className?: string;
}

export default function CompactLoader({ 
  message = "Loading...", 
  size = 'md',
  color = 'yellow',
  className = ''
}: CompactLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Spinner size={size} color={color} />
      {message && (
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-400 text-center">
          {message}
        </p>
      )}
    </div>
  );
}
