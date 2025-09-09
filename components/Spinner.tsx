interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'stone' | 'white';
}

export default function Spinner({ size = 'md', color = 'yellow' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const colorClasses = {
    yellow: 'border-stone-200 dark:border-stone-700 border-t-yellow-500',
    stone: 'border-stone-300 dark:border-stone-600 border-t-stone-800 dark:border-t-stone-200',
    white: 'border-white/30 border-t-white'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} />
  );
}