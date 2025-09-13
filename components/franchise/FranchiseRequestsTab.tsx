"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Building,
  DollarSign,
  User,
  Calendar,
  Eye,
  AlertTriangle,
  Coins,
  TrendingUp
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
// FRC token functionality removed

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
}

interface FranchiseRequest {
  _id: Id<"approvals">;
  franchiseId: Id<"franchise">;
  brandId: Id<"brands">;
  submittedBy: Id<"users">;
  locationAddress: string;
  building: string;
  carpetArea: number;
  costPerAreaUSD: number;
  totalInvestmentUSD: number;
  totalShares: number;
  selectedShares: number;
  sharePrice: number;
  submittedAt: number;
  status: string;
}

interface FranchiseRequestsTabProps {
  business: Business;
}

export default function FranchiseRequestsTab({ business }: FranchiseRequestsTabProps) {
  const { formatAmount } = useGlobalCurrency();
  const [selectedRequest, setSelectedRequest] = useState<FranchiseRequest | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  
  // FRC token functionality removed
  
  // Get pending franchise requests
  const pendingRequests = useQuery(api.approvals.getPendingApprovalsByBrand, {
    brandId: business._id
  }) || [];

  // Mutations for approval/rejection
  const approveRequest = useMutation(api.approvals.approveApproval);
  const rejectRequest = useMutation(api.approvals.rejectApproval);

  // Calculate total investment budget across all requests
  const calculateTotalBudget = () => {
    return pendingRequests.reduce((total, request) => {
      const details = calculateInvestmentDetails(request);
      return total + details.totalInvestment;
    }, 0);
  };

  // Calculate correct investment values with $1.00 per share
  const calculateInvestmentDetails = (request: FranchiseRequest) => {
    const SHARE_PRICE = 1.00; // Fixed $1.00 per share
    const baseInvestment = request.selectedShares * SHARE_PRICE;
    const transactionFee = baseInvestment * 0.02; // 2% transaction fee
    const totalInvestment = baseInvestment + transactionFee;
    
    return {
      sharePrice: SHARE_PRICE,
      baseInvestment,
      transactionFee,
      totalInvestment,
      selectedShares: request.selectedShares
    };
  };

  const handleApprove = async (request: FranchiseRequest) => {
    setLoading(request._id);
    try {
      // Update approval status in database (FRC token creation removed)
      await approveRequest({
        approvalId: request._id,
        adminNotes: `Approved franchise request`
      });

      const investmentDetails = calculateInvestmentDetails(request);
      toast.success(
        `Franchise request approved! Token created for ${investmentDetails.selectedShares} shares at $${investmentDetails.sharePrice} each.`
      );
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (request: FranchiseRequest, reason: string) => {
    setLoading(request._id);
    try {
      await rejectRequest({
        approvalId: request._id,
        rejectionReason: reason,
        adminNotes: `Rejected: ${reason}`
      });

      toast.success('Franchise request rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject request. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Franchise Requests</h2>
          <p className="text-stone-600 dark:text-stone-400">
            Review and approve franchise investment requests for {business.name}
          </p>
        </div>
        <div className="flex items-center gap-8">
          {/* Total Investment Budget */}
          <div className="text-right">
            <div className="text-sm text-stone-600 dark:text-stone-400">Total Investment Budget</div>
            <div className="text-2xl font-bold text-blue-600">${calculateTotalBudget().toFixed(2)}</div>
            <div className="text-xs text-stone-500">{pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}</div>
          </div>
          {/* Share Price */}
          <div className="text-right">
            <div className="text-sm text-stone-600 dark:text-stone-400">Share Price</div>
            <div className="text-2xl font-bold text-green-600">$1.00</div>
            <div className="text-xs text-stone-500">Fixed per share</div>
          </div>
        </div>
      </div>

      {/* Investment Budget Summary */}
      {pendingRequests.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600 bg-blue-100 p-1.5 rounded" />
              <div>
                <h3 className="text-lg font-semibold">Total Investment Budget</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Combined investment from all pending requests
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">${calculateTotalBudget().toFixed(2)}</div>
              <div className="text-sm text-stone-600 dark:text-stone-400">
                {pendingRequests.reduce((total, request) => total + request.selectedShares, 0).toLocaleString()} total shares requested
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  ${pendingRequests.reduce((total, request) => {
                    const details = calculateInvestmentDetails(request);
                    return total + details.baseInvestment;
                  }, 0).toFixed(2)}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400">Base Investment</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  ${pendingRequests.reduce((total, request) => {
                    const details = calculateInvestmentDetails(request);
                    return total + details.transactionFee;
                  }, 0).toFixed(2)}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400">Transaction Fees (2%)</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  ${calculateTotalBudget().toFixed(2)}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400">Total Budget</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Requests List */}
      {pendingRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
          <p className="text-stone-600 dark:text-stone-400">
            All franchise requests have been reviewed. New requests will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingRequests.map((request) => {
            const investmentDetails = calculateInvestmentDetails(request);
            
            return (
              <Card key={request._id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building className="w-8 h-8 text-blue-600 bg-blue-100 p-1.5 rounded" />
                    <div>
                      <h3 className="font-semibold text-lg">{request.building}</h3>
                      <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                        <MapPin className="w-4 h-4" />
                        <span>{request.locationAddress}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Investment Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Investment Details (Corrected)
                    </h4>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Share Price:</span>
                        <span className="font-semibold text-green-600">${investmentDetails.sharePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Selected Shares:</span>
                        <span className="font-semibold">{investmentDetails.selectedShares.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Base Investment:</span>
                        <span className="font-semibold">${investmentDetails.baseInvestment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Transaction Fee (2%):</span>
                        <span className="font-semibold">${investmentDetails.transactionFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-medium">Total Investment:</span>
                        <span className="font-bold text-lg">${investmentDetails.totalInvestment.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Property Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Area:</span>
                        <span className="font-semibold">{request.carpetArea.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cost per sq ft:</span>
                        <span className="font-semibold">{formatAmount(request.costPerAreaUSD)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Shares Available:</span>
                        <span className="font-semibold">{request.totalShares.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Ownership %:</span>
                        <span className="font-semibold">{((request.selectedShares / request.totalShares) * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={loading === request._id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {loading === request._id ? 'Approving...' : 'Approve Request'}
                    </Button>

                    <Button
                      onClick={() => handleReject(request, "Request does not meet requirements")}
                      disabled={loading === request._id}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>

                    <Button
                      onClick={() => setSelectedRequest(request)}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                )}


              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
