"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@solana/wallet-adapter-react';
import { useFranchiseProgram } from '@/hooks/useFranchiseProgram';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { DollarSign, TrendingUp, Users, Calendar, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface RevenueDistributionProps {
  brandSlug: string;
  franchiseSlug: string;
}

export default function RevenueDistribution({
  brandSlug,
  franchiseSlug
}: RevenueDistributionProps) {
  const { connected } = useWallet();
  const franchiseProgramHook = useFranchiseProgram();

  // Safely destructure the hook result
  const {
    distributeRevenue,
    getFranchise
  } = franchiseProgramHook || {};
  const { formatAmount } = useGlobalCurrency();

  const [revenueAmount, setRevenueAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [franchiseData, setFranchiseData] = useState<any>(null);

  // Load franchise data
  useEffect(() => {
    if (connected) {
      loadFranchiseData();
    }
  }, [connected, brandSlug, franchiseSlug]);

  const loadFranchiseData = async () => {
    try {
      const franchise = await getFranchise(brandSlug, franchiseSlug);
      setFranchiseData(franchise);
    } catch (error) {
      console.error('Error loading franchise data:', error);
    }
  };

  const calculateDistribution = () => {
    const revenue = parseFloat(revenueAmount) || 0;
    if (!franchiseData || revenue <= 0) return null;

    // Safely handle blockchain data
    const totalInvestment = typeof franchiseData.totalInvestment === 'object' && franchiseData.totalInvestment?.toNumber
      ? franchiseData.totalInvestment.toNumber() / LAMPORTS_PER_SOL
      : (franchiseData.totalInvestment || 0);

    const capitalRecovered = typeof franchiseData.capitalRecovered === 'object' && franchiseData.capitalRecovered?.toNumber
      ? franchiseData.capitalRecovered.toNumber() / LAMPORTS_PER_SOL
      : (franchiseData.capitalRecovered || 0);

    const remainingCapital = Math.max(0, totalInvestment - capitalRecovered);

    // 50% goes to capital recovery, 50% to dividends (until capital is recovered)
    const capitalRecoveryAmount = Math.min(revenue * 0.5, remainingCapital);
    const dividendAmount = revenue - capitalRecoveryAmount;

    return {
      totalRevenue: revenue,
      capitalRecoveryAmount,
      dividendAmount,
      remainingCapital,
      isCapitalFullyRecovered: remainingCapital <= 0
    };
  };

  const handleDistribute = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const revenue = parseFloat(revenueAmount);
    if (!revenue || revenue <= 0) {
      toast.error('Please enter a valid revenue amount');
      return;
    }

    setLoading(true);
    try {
      // Convert to lamports
      const revenueInLamports = Math.floor(revenue * LAMPORTS_PER_SOL);
      
      const tx = await distributeRevenue(brandSlug, franchiseSlug, revenueInLamports);
      if (tx) {
        setRevenueAmount('');
        await loadFranchiseData();
      }
    } catch (error) {
      console.error('Error distributing revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const distribution = calculateDistribution();

  if (!franchiseData) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Loading franchise data...
          </p>
        </div>
      </Card>
    );
  }

  // Handle both blockchain data (with .toNumber()) and regular numbers
  const totalInvestment = typeof franchiseData.totalInvestment === 'object' && franchiseData.totalInvestment?.toNumber
    ? franchiseData.totalInvestment.toNumber() / LAMPORTS_PER_SOL
    : (franchiseData.totalInvestment || 0);

  const capitalRecovered = typeof franchiseData.capitalRecovered === 'object' && franchiseData.capitalRecovered?.toNumber
    ? franchiseData.capitalRecovered.toNumber() / LAMPORTS_PER_SOL
    : (franchiseData.capitalRecovered || 0);

  const totalRevenue = typeof franchiseData.totalRevenue === 'object' && franchiseData.totalRevenue?.toNumber
    ? franchiseData.totalRevenue.toNumber() / LAMPORTS_PER_SOL
    : (franchiseData.totalRevenue || 0);

  const pendingDividends = typeof franchiseData.pendingDividends === 'object' && franchiseData.pendingDividends?.toNumber
    ? franchiseData.pendingDividends.toNumber() / LAMPORTS_PER_SOL
    : (franchiseData.pendingDividends || 0);

  const lastPayout = typeof franchiseData.lastPayout === 'object' && franchiseData.lastPayout?.toNumber
    ? franchiseData.lastPayout.toNumber()
    : (franchiseData.lastPayout || 0);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Revenue Status</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(totalRevenue)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatAmount(capitalRecovered)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Capital Recovered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(Math.max(0, totalInvestment - capitalRecovered))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Remaining Capital</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatAmount(pendingDividends)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Dividends</div>
          </div>
        </div>

        {/* Capital Recovery Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Capital Recovery Progress</span>
            <span>{((capitalRecovered / totalInvestment) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((capitalRecovered / totalInvestment) * 100, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Revenue Distribution */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Distribute Revenue</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="revenueAmount">Revenue Amount (SOL) *</Label>
            <Input
              id="revenueAmount"
              type="number"
              step="0.001"
              value={revenueAmount}
              onChange={(e) => setRevenueAmount(e.target.value)}
              placeholder="Enter revenue amount"
              className="mt-1"
              min="0.001"
            />
          </div>

          {distribution && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Distribution Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">{formatAmount(distribution.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capital Recovery (50%):</span>
                  <span className="font-medium text-blue-600">
                    {formatAmount(distribution.capitalRecoveryAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Investor Dividends:</span>
                  <span className="font-medium text-green-600">
                    {formatAmount(distribution.dividendAmount)}
                  </span>
                </div>
                {distribution.isCapitalFullyRecovered && (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 rounded text-green-800 dark:text-green-400">
                    ✅ Capital fully recovered! 100% of future revenue goes to dividends.
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handleDistribute}
            disabled={!connected || loading || !revenueAmount || parseFloat(revenueAmount) <= 0}
            className="w-full"
          >
            {!connected ? (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet to Distribute
              </>
            ) : loading ? (
              'Distributing Revenue...'
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Distribute {revenueAmount ? formatAmount(parseFloat(revenueAmount)) : 'Revenue'}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Distribution History */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Distribution History</h3>
        </div>

        {lastPayout > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium">Last Distribution</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(lastPayout * 1000).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatAmount(totalRevenue)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Distributed</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No revenue distributions yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Distribute your first revenue to start investor payouts
            </p>
          </div>
        )}
      </Card>

      {/* Information */}
      <Card className="p-6">
        <h4 className="font-medium mb-3">How Revenue Distribution Works</h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div>• 50% of revenue goes to capital recovery until investors get their money back</div>
          <div>• 50% of revenue goes to investor dividends</div>
          <div>• Once capital is fully recovered, 100% of revenue goes to dividends</div>
          <div>• Investors can claim their dividends anytime</div>
          <div>• All distributions are transparent and recorded on-chain</div>
        </div>
      </Card>
    </div>
  );
}
