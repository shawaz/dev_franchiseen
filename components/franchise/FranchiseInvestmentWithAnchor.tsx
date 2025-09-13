"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFranchiseProgram } from '@/hooks/useFranchiseProgram';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Wallet, TrendingUp, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface FranchiseInvestmentWithAnchorProps {
  brandSlug: string;
  franchiseSlug: string;
  franchiseData: {
    building: string;
    locationAddress: string;
    carpetArea: number;
    costPerArea: number;
    totalInvestment: number;
    totalShares: number;
    selectedShares?: number;
  };
}

export default function FranchiseInvestmentWithAnchor({
  brandSlug,
  franchiseSlug,
  franchiseData
}: FranchiseInvestmentWithAnchorProps) {
  const { connected, publicKey } = useWallet();
  const franchiseProgramHook = useFranchiseProgram();

  // Safely destructure the hook result
  const {
    program,
    investInFranchise,
    getFranchise,
    getInvestorTokenBalance,
    claimDividends
  } = franchiseProgramHook || {};
  const { formatAmount } = useGlobalCurrency();

  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onChainData, setOnChainData] = useState<any>(null);
  const [investorBalance, setInvestorBalance] = useState(0);
  const [pendingDividends, setPendingDividends] = useState(0);

  // Load on-chain franchise data
  useEffect(() => {
    if (program && connected && typeof getFranchise === 'function' && typeof getInvestorTokenBalance === 'function') {
      loadFranchiseData();
      loadInvestorData();
    }
  }, [program, connected, brandSlug, franchiseSlug, getFranchise, getInvestorTokenBalance]);

  const loadFranchiseData = async () => {
    if (typeof getFranchise !== 'function') return;

    try {
      const franchise = await getFranchise(brandSlug, franchiseSlug);
      if (franchise) {
        setOnChainData(franchise);
        // Convert BN to number for dividends - safely handle BN
        let dividends = 0;
        if (franchise.pendingDividends && typeof franchise.pendingDividends.toNumber === 'function') {
          dividends = franchise.pendingDividends.toNumber() / LAMPORTS_PER_SOL;
        } else if (typeof franchise.pendingDividends === 'number') {
          dividends = franchise.pendingDividends / LAMPORTS_PER_SOL;
        }
        setPendingDividends(dividends);
      }
    } catch (error) {
      console.error('Error loading franchise data:', error);
    }
  };

  const loadInvestorData = async () => {
    if (!publicKey || typeof getInvestorTokenBalance !== 'function') return;

    try {
      const balance = await getInvestorTokenBalance(brandSlug, franchiseSlug);
      setInvestorBalance(balance);
    } catch (error) {
      console.error('Error loading investor data:', error);
    }
  };

  const handleInvest = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (typeof investInFranchise !== 'function') {
      toast.error('Blockchain functionality not available. Please refresh the page.');
      return;
    }

    if (sharesToBuy <= 0) {
      toast.error('Please enter a valid number of shares');
      return;
    }

    setLoading(true);
    try {
      const tx = await investInFranchise(brandSlug, franchiseSlug, sharesToBuy);
      if (tx) {
        // Refresh data after successful investment
        await loadFranchiseData();
        await loadInvestorData();
        setSharesToBuy(1);
      }
    } catch (error) {
      console.error('Investment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDividends = async () => {
    if (!connected || pendingDividends <= 0 || typeof claimDividends !== 'function') return;

    setLoading(true);
    try {
      const tx = await claimDividends(brandSlug, franchiseSlug);
      if (tx) {
        await loadFranchiseData();
        await loadInvestorData();
      }
    } catch (error) {
      console.error('Claim dividends error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sharePrice = franchiseData.totalInvestment / franchiseData.totalShares;
  const investmentAmount = sharePrice * sharesToBuy;
  const availableShares = onChainData 
    ? onChainData.totalShares - onChainData.soldShares 
    : franchiseData.totalShares;

  const fundingProgress = onChainData 
    ? (onChainData.soldShares / onChainData.totalShares) * 100 
    : 0;

  // Show fallback UI if Anchor program is not available
  if (!program || typeof investInFranchise !== 'function') {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Blockchain Features Unavailable</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your wallet to access on-chain investment features.
            </p>
            {!connected && (
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Franchise Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">On-Chain Franchise Status</h3>
          {onChainData && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              onChainData.status === 'Funding' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : onChainData.status === 'Active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {onChainData.status}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {onChainData ? onChainData.soldShares : 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Shares Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {availableShares}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {fundingProgress.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Funded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatAmount(
                onChainData && onChainData.totalRaised && typeof onChainData.totalRaised.toNumber === 'function'
                  ? onChainData.totalRaised.toNumber() / LAMPORTS_PER_SOL
                  : (franchiseData.selectedShares || 0) * (franchiseData.totalInvestment / Math.max(1, franchiseData.totalShares))
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Raised</div>
          </div>
        </div>

        {/* Funding Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Funding Progress</span>
            <span>{fundingProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(fundingProgress, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Investment Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Invest in Franchise</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Shares
            </label>
            <Input
              type="number"
              min="1"
              max={availableShares}
              value={sharesToBuy}
              onChange={(e) => setSharesToBuy(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Price per share: {formatAmount(sharePrice)} • Available: {availableShares} shares
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Investment:</span>
              <span className="text-lg font-bold text-primary">
                {formatAmount(investmentAmount)}
              </span>
            </div>
          </div>

          <Button
            onClick={handleInvest}
            disabled={!connected || loading || availableShares <= 0}
            className="w-full"
          >
            {!connected ? (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet to Invest
              </>
            ) : loading ? (
              'Processing...'
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Invest {formatAmount(investmentAmount)}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Investor Dashboard */}
      {connected && investorBalance > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Your Investment</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {investorBalance}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {((investorBalance / franchiseData.totalShares) * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ownership</div>
            </div>
          </div>

          {pendingDividends > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-800 dark:text-green-400">
                    Dividends Available
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatAmount(pendingDividends)}
                  </div>
                </div>
                <Button
                  onClick={handleClaimDividends}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Claim
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Revenue Information */}
      {onChainData && onChainData.totalRevenue &&
       typeof onChainData.totalRevenue.toNumber === 'function' &&
       onChainData.totalRevenue.toNumber() > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Revenue Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatAmount(
                  onChainData.totalRevenue && typeof onChainData.totalRevenue.toNumber === 'function'
                    ? onChainData.totalRevenue.toNumber() / LAMPORTS_PER_SOL
                    : 0
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatAmount(
                  onChainData.capitalRecovered && typeof onChainData.capitalRecovered.toNumber === 'function'
                    ? onChainData.capitalRecovered.toNumber() / LAMPORTS_PER_SOL
                    : 0
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Capital Recovered</div>
            </div>
          </div>

          {onChainData.lastPayout &&
           typeof onChainData.lastPayout.toNumber === 'function' &&
           onChainData.lastPayout.toNumber() > 0 && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Last payout: {new Date(onChainData.lastPayout.toNumber() * 1000).toLocaleDateString()}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
