"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  Eye,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Id } from '@/convex/_generated/dataModel';

interface InvestmentTrackingDashboardProps {
  franchiseId?: Id<"franchise">;
  showSummary?: boolean;
}

export default function InvestmentTrackingDashboard({ 
  franchiseId, 
  showSummary = false 
}: InvestmentTrackingDashboardProps) {
  const { formatAmount } = useGlobalCurrency();
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null);

  // Queries
  const investmentSummary = useQuery(api.franchise.getInvestmentSummary, {}) || [];
  const franchiseTracking = useQuery(
    api.franchise.getInvestmentTracking,
    franchiseId ? { franchiseId } : "skip"
  );

  if (showSummary) {
    // Summary view for all franchises
    const totalInvestment = investmentSummary.reduce((sum, f) => sum + f.totalInvestment, 0);
    const totalInvested = investmentSummary.reduce((sum, f) => sum + f.totalInvested, 0);
    const totalInvestors = investmentSummary.reduce((sum, f) => sum + f.uniqueInvestors, 0);
    const fullyFundedCount = investmentSummary.filter(f => f.isFullyFunded).length;
    const atRiskCount = investmentSummary.filter(f => f.isAtRisk).length;

    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Target</p>
                <p className="text-xl font-bold">{formatAmount(totalInvestment)}</p>
              </div>
              <Target className="h-6 w-6 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Raised</p>
                <p className="text-xl font-bold text-green-600">{formatAmount(totalInvested)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Investors</p>
                <p className="text-xl font-bold">{totalInvestors}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fully Funded</p>
                <p className="text-xl font-bold text-green-600">{fullyFundedCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">At Risk</p>
                <p className="text-xl font-bold text-red-600">{atRiskCount}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Franchise List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Investment Overview</h3>
          <div className="space-y-4">
            {investmentSummary.map((franchise) => (
              <div key={franchise.franchiseId} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Building className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">{franchise.building}</h4>
                      <p className="text-sm text-gray-600">{franchise.locationAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={franchise.isFullyFunded ? "default" : franchise.isAtRisk ? "destructive" : "secondary"}>
                      {franchise.isFullyFunded ? "Funded" : franchise.isAtRisk ? "At Risk" : franchise.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFranchise(
                        selectedFranchise === franchise.franchiseId ? null : franchise.franchiseId
                      )}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {selectedFranchise === franchise.franchiseId ? "Hide" : "Details"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Funding Progress</p>
                    <p className="font-semibold">{franchise.fundingPercentage.toFixed(1)}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          franchise.fundingPercentage >= 100 ? 'bg-green-500' : 
                          franchise.fundingPercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, franchise.fundingPercentage)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Invested / Target</p>
                    <p className="font-semibold">
                      {formatAmount(franchise.totalInvested)} / {formatAmount(franchise.totalInvestment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Investors</p>
                    <p className="font-semibold">{franchise.uniqueInvestors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Days Remaining</p>
                    <p className={`font-semibold ${
                      franchise.daysRemaining <= 7 ? 'text-red-600' : 
                      franchise.daysRemaining <= 30 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {franchise.daysRemaining} days
                    </p>
                  </div>
                </div>

                {selectedFranchise === franchise.franchiseId && (
                  <div className="mt-4 pt-4 border-t">
                    <InvestmentTrackingDashboard franchiseId={franchise.franchiseId as Id<"franchise">} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Detailed view for specific franchise
  if (!franchiseTracking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // franchiseTracking contains the investment data directly

  return (
    <div className="space-y-6">
      {/* Investment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Invested</p>
              <p className="text-xl font-bold text-green-600">{formatAmount(franchiseTracking.totalInvestment)}</p>
              <p className="text-xs text-gray-500">{franchiseTracking.investmentGrowth.toFixed(1)}% growth</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Investors</p>
              <p className="text-xl font-bold">{franchiseTracking.uniqueInvestors}</p>
              <p className="text-xs text-gray-500">{franchiseTracking.totalShares} shares sold</p>
            </div>
            <Users className="h-6 w-6 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selected Shares</p>
              <p className="text-xl font-bold">{franchiseTracking.selectedShares}</p>
              <p className="text-xs text-gray-500">of {franchiseTracking.totalShares} total</p>
            </div>
            <Clock className="h-6 w-6 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Investment</p>
              <p className="text-xl font-bold">{formatAmount(franchiseTracking.averageInvestment)}</p>
              <div className="flex items-center gap-1">
                {franchiseTracking.investmentGrowth > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <p className={`text-xs ${franchiseTracking.investmentGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {franchiseTracking.investmentGrowth > 0 ? 'Growing' : 'Declining'}
                </p>
              </div>
            </div>
            <BarChart3 className="h-6 w-6 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Investment Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Investment Summary</h3>
          <Badge variant="secondary">
            Active Investment
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
              <p className="text-lg font-semibold">{formatAmount(franchiseTracking.totalInvestment)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent Investment</p>
              <p className="text-lg font-semibold">{formatAmount(franchiseTracking.recentInvestment)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className="text-lg font-semibold text-green-600">{franchiseTracking.investmentGrowth}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unique Investors</p>
              <p className="text-lg font-semibold">{franchiseTracking.uniqueInvestors}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
