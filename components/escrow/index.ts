// Escrow components
export { default as EscrowDashboard } from './EscrowDashboard';
export { default as EscrowStats } from './EscrowStats';
export { default as EscrowFilters } from './EscrowFilters';
export { default as EscrowOverview } from './EscrowOverview';
export { default as EscrowTable } from './EscrowTable';

// Types
export interface EscrowRecord {
  _id: string;
  franchiseId: string;
  userId: string;
  businessId: string;
  paymentSignature: string;
  amount: number;
  amountUSD?: number;
  currency: string;
  shares: number;
  status: 'held' | 'released' | 'refunded' | 'expired';
  stage: 'pending_approval' | 'funding' | 'launching' | 'active';
  createdAt: number;
  expiresAt: number;
  userEmail?: string;
  userWallet: string;
  contractSignature?: string;
  contractAddress?: string;
  autoRefundEnabled: boolean;
  manualReleaseRequired: boolean;
  processedBy?: string;
  adminNotes?: string;
  refundReason?: string;
  refundSignature?: string;
  refundedAt?: number;
  releaseSignature?: string;
  releasedAt?: number;
  user?: any;
  franchise?: any;
  business?: any;
}
