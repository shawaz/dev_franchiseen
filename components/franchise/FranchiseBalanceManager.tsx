"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Receipt,
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
// FRC token functionality removed
import { toast } from 'sonner';

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
  tokenMint?: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  source?: 'pos' | 'delivery' | 'catering' | 'other';
  date: number;
  signature?: string;
}

interface FranchiseBalanceManagerProps {
  franchise: Franchise;
}

export default function FranchiseBalanceManager({ franchise }: FranchiseBalanceManagerProps) {
  const { formatAmount } = useGlobalCurrency();
  // FRC token functionality removed

  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses'>('overview');
  const [tokenData, setTokenData] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Income form
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState<'pos' | 'delivery' | 'catering' | 'other'>('pos');
  const [incomeDescription, setIncomeDescription] = useState('');
  
  // Expense form
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  // FRC token functionality removed - no token data loading

  const loadTransactions = async () => {
    // Mock transactions for now
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 2500,
        category: 'Sales',
        description: 'Daily POS sales',
        source: 'pos',
        date: Date.now() - 24 * 60 * 60 * 1000,
        signature: 'income_sig_1'
      },
      {
        id: '2',
        type: 'expense',
        amount: 800,
        category: 'Inventory',
        description: 'Food supplies purchase',
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        signature: 'expense_sig_1'
      },
      {
        id: '3',
        type: 'income',
        amount: 1200,
        category: 'Delivery',
        description: 'Online delivery orders',
        source: 'delivery',
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        signature: 'income_sig_2'
      }
    ];
    setTransactions(mockTransactions);
  };

  const handleRecordIncome = async () => {
    // FRC token wallet connection check removed

    if (!incomeAmount || !incomeDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // FRC token income recording functionality removed
      toast.success('Income recording functionality has been removed');
    } catch (error) {
      console.error('Error recording income:', error);
      toast.error('Failed to record income');
    }
  };

  const handleRecordExpense = async () => {
    // FRC token wallet connection check removed

    if (!expenseAmount || !expenseCategory || !expenseDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // FRC token expense recording functionality removed
      toast.success('Expense recording functionality has been removed');
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error('Failed to record expense');
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-full">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Franchise Balance</h2>
              <p className="text-stone-600 dark:text-stone-400">
                {franchise.building} • Financial Management
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(totalIncome)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Total Income</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(totalExpenses)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Total Expenses</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(netProfit)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Net Profit</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Receipt className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">
              {tokenData?.reserveFund ? formatAmount(tokenData.reserveFund) : formatAmount(0)}
            </div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Reserve Fund</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'income', label: 'Record Income', icon: Plus },
            { id: 'expenses', label: 'Record Expenses', icon: Minus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-stone-600 dark:text-stone-400">
                        {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'income' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Record Income</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Source</label>
                <select
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value as any)}
                  className="w-full p-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800"
                >
                  <option value="pos">POS Sales</option>
                  <option value="delivery">Delivery Orders</option>
                  <option value="catering">Catering Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                placeholder="Describe the income source..."
                value={incomeDescription}
                onChange={(e) => setIncomeDescription(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleRecordIncome}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Income (Disabled)
            </Button>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Record Expense</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Input
                  placeholder="e.g., Inventory, Rent, Utilities"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                placeholder="Describe the expense..."
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </div>
            
            <Button
              onClick={handleRecordExpense}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Minus className="w-4 h-4 mr-2" />
              Record Expense (Disabled)
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
