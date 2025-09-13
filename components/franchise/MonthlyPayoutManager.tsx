"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Coins,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
// FRC token functionality removed
import { toast } from 'sonner';

interface Franchise {
  _id: Id<"franchise">;
  businessId: Id<"brands">;
  owner_id: Id<"users">;
  locationAddress: string;
  building: string;
  carpetArea: number;
  costPerArea: number;
  totalInvestment: number;
  totalShares: number;
  selectedShares: number;
  createdAt: number;
  status: string;
  slug?: string;
  tokenMint?: string;
}

interface PayoutRecord {
  id: string;
  date: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  reserveFundContribution: number;
  shareholderDistribution: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionSignature?: string;
}

interface MonthlyPayoutManagerProps {
  franchise: Franchise;
}

export default function MonthlyPayoutManager({ franchise }: MonthlyPayoutManagerProps) {
  const { formatAmount } = useGlobalCurrency();
  // FRC token functionality removed

  const [tokenData, setTokenData] = useState<any>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([]);
  const [nextPayoutDate, setNextPayoutDate] = useState<Date | null>(null);
  const [canProcessPayout, setCanProcessPayout] = useState(false);
  const [loading, setLoading] = useState(false);

  // FRC token functionality removed - no token data loading

  const loadPayoutHistory = async () => {
    // Mock payout history for now
    const mockPayouts: PayoutRecord[] = [
      {
        id: '1',
        date: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        totalRevenue: 15000,
        totalExpenses: 8000,
        netProfit: 7000,
        reserveFundContribution: 1400, // 20% of net profit
        shareholderDistribution: 5600, // 80% of net profit
        status: 'completed',
        transactionSignature: 'payout_sig_1'
      },
      {
        id: '2',
        date: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
        totalRevenue: 12500,
        totalExpenses: 7200,
        netProfit: 5300,
        reserveFundContribution: 1060,
        shareholderDistribution: 4240,
        status: 'completed',
        transactionSignature: 'payout_sig_2'
      }
    ];
    setPayoutHistory(mockPayouts);
  };

  const calculateNextPayoutDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setNextPayoutDate(nextMonth);
    
    // Check if we can process payout (first day of the month)
    const today = new Date();
    const isFirstOfMonth = today.getDate() === 1;
    setCanProcessPayout(isFirstOfMonth);
  };

  const handleProcessPayout = async () => {
    if (!canProcessPayout) {
      toast.error('Payouts can only be processed on the 1st of each month');
      return;
    }

    try {
      // Mock payout processing since FRC token functionality was removed
      setLoading(true);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reload data
      await loadPayoutHistory();

      toast.success('Monthly payout processed successfully!');
    } catch (error) {
      console.error('Error processing payout:', error);
      toast.error('Failed to process payout');
    } finally {
      setLoading(false);
    }
  };

  const currentMonthRevenue = tokenData?.monthlyRevenue || 0;
  const currentMonthExpenses = tokenData?.monthlyExpenses || 0;
  const currentNetProfit = currentMonthRevenue - currentMonthExpenses;
  const reserveFundAmount = currentNetProfit * 0.2; // 20% to reserve fund
  const shareholderAmount = currentNetProfit * 0.8; // 80% to shareholders

  return (
    <div className="space-y-6">
      {/* Payout Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Monthly Payouts</h2>
              <p className="text-stone-600 dark:text-stone-400">
                Automated profit distribution to shareholders
              </p>
            </div>
          </div>
          <Badge 
            variant={canProcessPayout ? 'default' : 'secondary'}
            className={canProcessPayout ? 'bg-green-100 text-green-800' : ''}
          >
            {canProcessPayout ? 'Ready to Process' : 'Waiting for 1st'}
          </Badge>
        </div>

        {/* Current Month Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(currentMonthRevenue)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">This Month Revenue</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <DollarSign className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(currentMonthExpenses)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">This Month Expenses</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Coins className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${currentNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(currentNetProfit)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Net Profit</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {tokenData?.circulatingSupply || franchise.selectedShares}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Active Shareholders</div>
          </div>
        </div>

        {/* Payout Breakdown */}
        {currentNetProfit > 0 && (
          <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">Payout Breakdown</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Reserve Fund (20%)</span>
                </div>
                <span className="font-semibold text-blue-600">
                  {formatAmount(reserveFundAmount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Shareholder Distribution (80%)</span>
                </div>
                <span className="font-semibold text-green-600">
                  {formatAmount(shareholderAmount)}
                </span>
              </div>
              
              <div className="border-t border-stone-200 dark:border-stone-600 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Distribution</span>
                  <span className="text-lg font-bold">
                    {formatAmount(reserveFundAmount + shareholderAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Payout Info */}
        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800 dark:text-yellow-200">
                Next Payout Date
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                {nextPayoutDate?.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleProcessPayout}
            disabled={loading || !canProcessPayout || currentNetProfit <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 mr-2" />
                Process Payout
              </>
            )}
          </Button>
        </div>

        {/* Payout Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-3 rounded-lg border ${
            canProcessPayout 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-stone-50 border-stone-200 text-stone-600'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {canProcessPayout ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Date Requirement</span>
            </div>
            <div className="text-xs">
              {canProcessPayout ? 'Today is the 1st of the month' : 'Wait for the 1st of the month'}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg border ${
            currentNetProfit > 0 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {currentNetProfit > 0 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">Profit Requirement</span>
            </div>
            <div className="text-xs">
              {currentNetProfit > 0 ? 'Positive net profit available' : 'No profit to distribute'}
            </div>
          </div>
          

        </div>
      </Card>

      {/* Payout History */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payout History</h3>
        
        <div className="space-y-3">
          {payoutHistory.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  payout.status === 'completed' 
                    ? 'bg-green-100 text-green-600' 
                    : payout.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
                }`}>
                  {payout.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : payout.status === 'processing' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {new Date(payout.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })} Payout
                  </div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    Net Profit: {formatAmount(payout.netProfit)} • 
                    Distributed: {formatAmount(payout.shareholderDistribution)}
                  </div>
                </div>
              </div>
              <Badge 
                variant={payout.status === 'completed' ? 'default' : 'secondary'}
                className={payout.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              >
                {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
              </Badge>
            </div>
          ))}
          
          {payoutHistory.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout history yet</p>
              <p className="text-sm">Payouts will appear here after processing</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
