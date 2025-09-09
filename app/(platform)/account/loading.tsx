import MainLoader from '@/components/ui/MainLoader';

export default function AccountLoading() {
  return (
    <MainLoader 
      message="Loading your account..." 
      showProgress={true}
    />
  );
}
