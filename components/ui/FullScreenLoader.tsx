import MainLoader from './MainLoader';

interface FullScreenLoaderProps {
  message?: string;
  showProgress?: boolean;
}

export default function FullScreenLoader({
  message = "Loading...",
  showProgress = false
}: FullScreenLoaderProps) {
  return (
    <MainLoader
      message={message}
      showProgress={showProgress}
      fullScreen={true}
    />
  );
}