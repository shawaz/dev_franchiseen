"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Receipt, Plus, TrendingDown, Calendar } from 'lucide-react';
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

interface ExpensesManagementProps {
  business: Business;
  franchise: Franchise;
}

// Mock expenses data
const mockExpenses = [
  {
    id: 1,
    category: 'Rent',
    description: 'Monthly rent payment',
    amount: 800000,
    date: '2025-01-15',
    status: 'paid'
  },
  {
    id: 2,
    category: 'Utilities',
    description: 'Electricity bill',
    amount: 120000,
    date: '2025-01-14',
    status: 'paid'
  },
  {
    id: 3,
    category: 'Supplies',
    description: 'Coffee beans and ingredients',
    amount: 85000,
    date: '2025-01-13',
    status: 'pending'
  },
  {
    id: 4,
    category: 'Marketing',
    description: 'Social media advertising',
    amount: 45000,
    date: '2025-01-12',
    status: 'paid'
  }
];

export default function ExpensesManagement({ business, franchise }: ExpensesManagementProps) {
  const { formatAmount } = useGlobalCurrency();

  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = mockExpenses.filter(expense => 
    new Date(expense.date).getMonth() === new Date().getMonth()
  ).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
            <Receipt className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(totalExpenses)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</h3>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(monthlyExpenses)}
          </p>
        </Card>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {mockExpenses.map((expense) => (
          <Card key={expense.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Receipt className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {expense.description}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  -{formatAmount(expense.amount)}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  expense.status === 'paid' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {expense.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
