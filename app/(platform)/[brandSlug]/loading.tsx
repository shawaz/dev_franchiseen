import MainLoader from '@/components/ui/MainLoader';

export default function BrandLoading() {
  return (
    <MainLoader 
      message="Loading brand details..." 
      showProgress={true}
    />
  );
}
