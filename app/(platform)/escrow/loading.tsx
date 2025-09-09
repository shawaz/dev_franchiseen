import MainLoader from '@/components/ui/MainLoader';

export default function EscrowLoading() {
  return (
    <MainLoader 
      message="Loading escrow dashboard..." 
      showProgress={true}
    />
  );
}
