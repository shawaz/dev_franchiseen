import MainLoader from '@/components/ui/MainLoader';

export default function CreateFranchiseLoading() {
  return (
    <MainLoader 
      message="Preparing franchise creation..." 
      showProgress={true}
    />
  );
}
