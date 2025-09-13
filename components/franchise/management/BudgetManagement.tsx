"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

interface Business {
  _id: Id<"brands">;
  name: string;
  logoUrl?: string;
}

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
}

interface BudgetManagementProps {
  business: Business;
  franchise: Franchise;
}

// Mock budget data
const mockBudgetData = {
  totalBudget: 50000000, // AED 50,000,000
  currentBalance: 40000000, // AED 40,000,000
  monthlyIncome: 2500000, // AED 2,500,000
  monthlyExpenses: 1800000, // AED 1,800,000
  categories: [
    { name: 'Rent', amount: 800000, percentage: 44.4, color: 'bg-blue-500' },
    { name: 'Salaries', amount: 600000, percentage: 33.3, color: 'bg-green-500' },
    { name: 'Utilities', amount: 200000, percentage: 11.1, color: 'bg-yellow-500' },
    { name: 'Marketing', amount: 150000, percentage: 8.3, color: 'bg-purple-500' },
    { name: 'Other', amount: 50000, percentage: 2.8, color: 'bg-gray-500' }
  ],
  recentTransactions: [
    { id: 1, type: 'income', description: 'Monthly Revenue', amount: 2500000, date: '2025-01-15' },
    { id: 2, type: 'expense', description: 'Rent Payment', amount: -800000, date: '2025-01-14' },
    { id: 3, type: 'expense', description: 'Staff Salaries', amount: -600000, date: '2025-01-13' },
    { id: 4, type: 'expense', description: 'Electricity Bill', amount: -120000, date: '2025-01-12' },
    { id: 5, type: 'income', description: 'Product Sales', amount: 300000, date: '2025-01-11' }
  ]
};

export default function BudgetManagement({ business, franchise }: BudgetManagementProps) {
  const { formatAmount } = useGlobalCurrency();

  return (
    <div className="space-y-6">
      {/* Budget Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</h3>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(mockBudgetData.totalBudget)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance</h3>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(mockBudgetData.currentBalance)}
          </p>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Income</p>
              <p className="font-semibold text-green-600">
                {formatAmount(mockBudgetData.monthlyIncome)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="font-semibold text-red-600">
                {formatAmount(mockBudgetData.monthlyExpenses)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Expense Categories */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expense Categories</h3>
        <div className="space-y-3">
          {mockBudgetData.categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatAmount(category.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {category.percentage}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Transactions</h3>
        <div className="space-y-3">
          {mockBudgetData.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
