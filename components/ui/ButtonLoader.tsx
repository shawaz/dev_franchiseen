'use client';

import Spinner from '../Spinner';

interface ButtonLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'stone' | 'white';
}

export default function ButtonLoader({ 
  message = "Loading...", 
  size = 'sm',
  color = 'white'
}: ButtonLoaderProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Spinner size={size} color={color} />
      {message && (
        <span className="text-sm font-medium">
          {message}
        </span>
      )}
    </div>
  );
}
