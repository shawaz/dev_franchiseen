// Main loading components
export { default as MainLoader } from '../MainLoader';
export { default as FullScreenLoader } from '../FullScreenLoader';
export { default as CompactLoader } from '../CompactLoader';
export { default as ButtonLoader } from '../ButtonLoader';
export { default as Spinner } from '../../Spinner';

// Loading component types
export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderColor = 'yellow' | 'stone' | 'white';

export interface BaseLoaderProps {
  message?: string;
  size?: LoaderSize;
  color?: LoaderColor;
  className?: string;
}
