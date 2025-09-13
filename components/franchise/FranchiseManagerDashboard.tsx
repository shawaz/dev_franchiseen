"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Wallet,
  Receipt,
  Plus,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Shield,
  Zap,
  Target,
  Building,
  CreditCard,
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Id } from '@/convex/_generated/dataModel';
import BrandWalletWithLocalCurrency from '@/components/wallet/BrandWalletWithLocalCurrency';
import TransactionManager from './TransactionManager';

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
  owner_id: Id<"users">;
  currency?: string;
}

interface Franchise {
  _id: Id<"franchise">;
  brandId: Id<"brands">;
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
}

interface FranchiseManagerDashboardProps {
  business: Business;
  franchise: Franchise;
  brandSlug: string;
}

export default function FranchiseManagerDashboard({ 
  business, 
  franchise, 
  brandSlug 
}: FranchiseManagerDashboardProps) {
  const { formatAmount } = useGlobalCurrency();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analytics'>('overview');

  // Queries - FRC token functionality removed
  const investmentStats = useQuery(api.investments.getFranchiseInvestmentStats, {
    franchiseId: franchise._id,
  });
  const recentTransactions = useQuery(api.transactions.getTransactionsByBusiness, {
    businessId: franchise.brandId,
  });

  const handleAddSOL = () => {
    alert('Add SOL clicked! You can get devnet SOL from the airdrop button or Solana faucet.');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{franchise.building} Manager</h1>
          <p className="text-stone-600 dark:text-stone-400">{franchise.locationAddress}</p>
          <Badge variant={franchise.status === "Active" ? "default" : "secondary"} className="mt-2">
            {franchise.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Wallet Integration */}
      <BrandWalletWithLocalCurrency
        onAddMoney={handleAddSOL}
        className="w-full"
        business={business}
        brandSlug={brandSlug}
      />

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(investmentStats?.totalAmountUSD || 0)}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {investmentStats?.totalShares || 0}
                  </p>
                </div>
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Investors</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {investmentStats?.uniqueInvestors.size || 0}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {franchise.totalShares || 0}
                  </p>
                </div>
                <Coins className="h-6 w-6 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </div>
            <div className="space-y-3">
              {recentTransactions?.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-600">{transaction.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                    </p>
                    <Badge variant={
                      transaction.status === 'approved' ? 'default' : 
                      transaction.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>



        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <TransactionManager franchiseId={franchise._id} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Chart Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Performance</h3>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization would go here</p>
                </div>
              </div>
            </Card>

            {/* Category Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Pie chart would go here</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(investmentStats?.averageInvestment || 0)}
                </p>
                <p className="text-sm text-gray-600">Avg Investment</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {investmentStats?.completedInvestments || 0}
                </p>
                <p className="text-sm text-gray-600">Completed Investments</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {formatAmount(investmentStats?.totalCommission || 0)}
                </p>
                <p className="text-sm text-gray-600">Total Commission</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
