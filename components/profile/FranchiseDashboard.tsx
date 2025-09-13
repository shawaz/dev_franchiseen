"use client";

import React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Building2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Wallet,
  MapPin,
  Users,
  Settings,
  Plus,
  Edit,
  Package,
  Target,
  CreditCard,
  PieChart,
  Calendar,
  Upload,
  Download,
  BarChart3,
  Shield,
  Zap,
  Gift,
  Megaphone,
  Smartphone,
  TrendingDown,
  AlertTriangle,
  Banknote,
  Building,
  FileCheck,
  Calculator
} from 'lucide-react';
import BrandWalletWithLocalCurrency from '@/components/wallet/BrandWalletWithLocalCurrency';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Id } from '@/convex/_generated/dataModel';

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
  owner_id: Id<"users">;
  createdAt: number;
  updatedAt: number;
  costPerArea?: number;
  min_area?: number;
  serviceable_countries?: string[];
  currency?: string;
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
  slug?: string;
}



// Franchise Budget Management Interfaces
interface BudgetItem {
  id: string;
  category: 'investment' | 'operational' | 'marketing' | 'salaries' | 'expenses' | 'taxes' | 'assets';
  name: string;
  amount: number;
  allocated: number;
  spent: number;
  remaining: number;
  status: 'on-track' | 'over-budget' | 'under-budget';
  lastUpdated: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  lastRestocked: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'loyalty' | 'referral' | 'digital' | 'local';
  budget: number;
  spent: number;
  startDate: number;
  endDate: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    roi: number;
  };
}

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  paymentMethod: 'autopay' | 'manual';
  lastPaid: number;
  nextPayment: number;
  status: 'active' | 'inactive';
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
  };
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: number;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  approvedBy?: string;
}

// Note: Additional interfaces for TaxPayment, Asset, MonthlyReport, and Payout
// can be added here when implementing those specific features

interface FranchiseDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convexUser: any;
  business: Business;
  franchise: Franchise; // Single franchise for this dashboard
  brandSlug: string;
}

// Mock data generators for franchise management
const generateMockBudgetItems = (franchise: Franchise): BudgetItem[] => {
  const baseInvestment = franchise.totalInvestment;
  return [
    {
      id: '1',
      category: 'investment',
      name: 'Initial Setup & Equipment',
      amount: baseInvestment * 0.4,
      allocated: baseInvestment * 0.4,
      spent: baseInvestment * 0.35,
      remaining: baseInvestment * 0.05,
      status: 'on-track',
      lastUpdated: Date.now() - 7 * 24 * 60 * 60 * 1000
    },
    {
      id: '2',
      category: 'operational',
      name: 'Monthly Operations',
      amount: baseInvestment * 0.3,
      allocated: baseInvestment * 0.3,
      spent: baseInvestment * 0.32,
      remaining: -baseInvestment * 0.02,
      status: 'over-budget',
      lastUpdated: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: '3',
      category: 'marketing',
      name: 'Marketing & Promotions',
      amount: baseInvestment * 0.15,
      allocated: baseInvestment * 0.15,
      spent: baseInvestment * 0.08,
      remaining: baseInvestment * 0.07,
      status: 'under-budget',
      lastUpdated: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: '4',
      category: 'salaries',
      name: 'Staff Salaries',
      amount: baseInvestment * 0.1,
      allocated: baseInvestment * 0.1,
      spent: baseInvestment * 0.1,
      remaining: 0,
      status: 'on-track',
      lastUpdated: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: '5',
      category: 'expenses',
      name: 'Miscellaneous Expenses',
      amount: baseInvestment * 0.05,
      allocated: baseInvestment * 0.05,
      spent: baseInvestment * 0.03,
      remaining: baseInvestment * 0.02,
      status: 'under-budget',
      lastUpdated: Date.now() - 5 * 24 * 60 * 60 * 1000
    }
  ];
};

const generateMockProducts = (): Product[] => {
  return [
    {
      id: '1',
      name: 'Premium Coffee Beans',
      category: 'Beverages',
      sku: 'PCB-001',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 12.50,
      sellingPrice: 25.00,
      supplier: 'Coffee Roasters Inc.',
      lastRestocked: Date.now() - 5 * 24 * 60 * 60 * 1000,
      status: 'in-stock'
    },
    {
      id: '2',
      name: 'Pastry Mix',
      category: 'Food',
      sku: 'PM-002',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 8.75,
      sellingPrice: 18.50,
      supplier: 'Bakery Supplies Co.',
      lastRestocked: Date.now() - 12 * 24 * 60 * 60 * 1000,
      status: 'low-stock'
    },
    {
      id: '3',
      name: 'Disposable Cups',
      category: 'Supplies',
      sku: 'DC-003',
      currentStock: 0,
      minStock: 100,
      maxStock: 500,
      unitCost: 0.15,
      sellingPrice: 0.30,
      supplier: 'Packaging Solutions',
      lastRestocked: Date.now() - 20 * 24 * 60 * 60 * 1000,
      status: 'out-of-stock'
    }
  ];
};

const generateMockMarketingCampaigns = (): MarketingCampaign[] => {
  return [
    {
      id: '1',
      name: 'Loyalty Rewards Program',
      type: 'loyalty',
      budget: 5000,
      spent: 3200,
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 60 * 24 * 60 * 60 * 1000,
      status: 'active',
      metrics: {
        reach: 1250,
        engagement: 0.68,
        conversions: 340,
        roi: 2.4
      }
    },
    {
      id: '2',
      name: 'Social Media Campaign',
      type: 'digital',
      budget: 2500,
      spent: 1800,
      startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
      endDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
      status: 'active',
      metrics: {
        reach: 8500,
        engagement: 0.12,
        conversions: 85,
        roi: 1.8
      }
    }
  ];
};

// Add more mock data generators
const generateMockEmployees = (): Employee[] => {
  return [
    {
      id: '1',
      name: 'Alice Johnson',
      position: 'Store Manager',
      salary: 4500,
      paymentMethod: 'autopay',
      lastPaid: Date.now() - 15 * 24 * 60 * 60 * 1000,
      nextPayment: Date.now() + 15 * 24 * 60 * 60 * 1000,
      status: 'active',
      bankDetails: {
        accountNumber: '****1234',
        routingNumber: '021000021'
      }
    },
    {
      id: '2',
      name: 'Bob Smith',
      position: 'Barista',
      salary: 2800,
      paymentMethod: 'autopay',
      lastPaid: Date.now() - 15 * 24 * 60 * 60 * 1000,
      nextPayment: Date.now() + 15 * 24 * 60 * 60 * 1000,
      status: 'active'
    }
  ];
};

const generateMockExpenses = (): Expense[] => {
  return [
    {
      id: '1',
      category: 'Utilities',
      description: 'Monthly electricity bill',
      amount: 450,
      date: Date.now() - 5 * 24 * 60 * 60 * 1000,
      receiptUrl: '/receipts/electricity-march.pdf',
      status: 'approved',
      submittedBy: 'Alice Johnson',
      approvedBy: 'Manager'
    },
    {
      id: '2',
      category: 'Maintenance',
      description: 'Coffee machine repair',
      amount: 280,
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      receiptUrl: '/receipts/repair-invoice.pdf',
      status: 'pending',
      submittedBy: 'Bob Smith'
    }
  ];
};

export default function FranchiseDashboard({ business, franchise }: FranchiseDashboardProps) {
  const [activeTab, setActiveTab] = useState<'budget' | 'products' | 'marketing' | 'salaries' | 'expenses' | 'taxes' | 'assets' | 'earnings' | 'payouts'>('budget');

  // Use global currency context for formatting
  const { formatAmount } = useGlobalCurrency();

  // Generate mock data
  const mockBudgetItems = generateMockBudgetItems(franchise);
  const mockProducts = generateMockProducts();
  const mockMarketingCampaigns = generateMockMarketingCampaigns();
  const mockEmployees = generateMockEmployees();
  const mockExpenses = generateMockExpenses();

  // State management (setters would be used for real functionality)
  const [budgetItems] = useState<BudgetItem[]>(mockBudgetItems);
  const [products] = useState<Product[]>(mockProducts);
  const [marketingCampaigns] = useState<MarketingCampaign[]>(mockMarketingCampaigns);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [expenses] = useState<Expense[]>(mockExpenses);

  const handleAddSOL = () => {
    alert('Add SOL clicked! You can get devnet SOL from the airdrop button or Solana faucet.');
  };

  const tabs = [
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'salaries', label: 'Salaries', icon: CreditCard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'taxes', label: 'Taxes', icon: Calculator },
    { id: 'assets', label: 'Assets', icon: Building },
    { id: 'earnings', label: 'Earnings', icon: BarChart3 },
    { id: 'payouts', label: 'Payouts', icon: Banknote },
  ];

  return (
    <div className="space-y-6 py-6">

      {/* Brand Wallet Card */}
      <BrandWalletWithLocalCurrency
        onAddMoney={handleAddSOL}
        className="w-full"
        business={business}
        brandSlug={business.slug || ''}
      />

      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Budget Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Budget Item</span>
                </button>
              </div>

              {/* Budget Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                      <p className="text-xl font-bold">{formatAmount(franchise.totalInvestment)}</p>
                    </div>
                    <Wallet className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Allocated</p>
                      <p className="text-xl font-bold">{formatAmount(budgetItems.reduce((sum, item) => sum + item.allocated, 0))}</p>
                    </div>
                    <Target className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                      <p className="text-xl font-bold">{formatAmount(budgetItems.reduce((sum, item) => sum + item.spent, 0))}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                      <p className="text-xl font-bold text-green-600">{formatAmount(budgetItems.reduce((sum, item) => sum + item.remaining, 0))}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>

              {/* Budget Items */}
              <div className="space-y-4">
                {budgetItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          item.category === 'investment' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          item.category === 'operational' ? 'bg-green-100 dark:bg-green-900/20' :
                          item.category === 'marketing' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          item.category === 'salaries' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          {item.category === 'investment' && <Building className="h-4 w-4 text-blue-600" />}
                          {item.category === 'operational' && <Settings className="h-4 w-4 text-green-600" />}
                          {item.category === 'marketing' && <Megaphone className="h-4 w-4 text-purple-600" />}
                          {item.category === 'salaries' && <Users className="h-4 w-4 text-yellow-600" />}
                          {item.category === 'expenses' && <Receipt className="h-4 w-4 text-gray-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'on-track' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          item.status === 'over-budget' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {item.status.replace('-', ' ')}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Allocated</p>
                        <p className="font-semibold">{formatAmount(item.allocated)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Spent</p>
                        <p className="font-semibold">{formatAmount(item.spent)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Remaining</p>
                        <p className={`font-semibold ${item.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(item.remaining)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === 'over-budget' ? 'bg-red-500' :
                              item.status === 'on-track' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min((item.spent / item.allocated) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Inventory Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Inventory Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                      <p className="text-xl font-bold">{products.length}</p>
                    </div>
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In Stock</p>
                      <p className="text-xl font-bold text-green-600">{products.filter(p => p.status === 'in-stock').length}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                      <p className="text-xl font-bold text-yellow-600">{products.filter(p => p.status === 'low-stock').length}</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                      <p className="text-xl font-bold text-red-600">{products.filter(p => p.status === 'out-of-stock').length}</p>
                    </div>
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                </Card>
              </div>

              {/* Products List */}
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category} • SKU: {product.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.status === 'in-stock' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          product.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {product.status.replace('-', ' ')}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Current Stock</p>
                        <p className="font-semibold">{product.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Min Stock</p>
                        <p className="font-semibold">{product.minStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Unit Cost</p>
                        <p className="font-semibold">{formatAmount(product.unitCost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Selling Price</p>
                        <p className="font-semibold">{formatAmount(product.sellingPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Supplier</p>
                        <p className="font-semibold">{product.supplier}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Last Restocked</p>
                        <p className="font-semibold">{new Date(product.lastRestocked).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {product.status === 'low-stock' || product.status === 'out-of-stock' ? (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          <Plus className="h-3 w-3" />
                          <span>Restock Now</span>
                        </button>
                      </div>
                    ) : null}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'marketing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Marketing & Promotions</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>New Campaign</span>
                </button>
              </div>

              {/* Marketing Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Campaigns</p>
                      <p className="text-xl font-bold">{marketingCampaigns.filter(c => c.status === 'active').length}</p>
                    </div>
                    <Megaphone className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                      <p className="text-xl font-bold">{formatAmount(marketingCampaigns.reduce((sum, c) => sum + c.budget, 0))}</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                      <p className="text-xl font-bold">{formatAmount(marketingCampaigns.reduce((sum, c) => sum + c.spent, 0))}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Avg ROI</p>
                      <p className="text-xl font-bold text-green-600">
                        {(marketingCampaigns.reduce((sum, c) => sum + c.metrics.roi, 0) / marketingCampaigns.length).toFixed(1)}x
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>

              {/* Campaign Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Gift className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Loyalty Programs</h4>
                      <p className="text-sm text-gray-500">Reward repeat customers</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Referral Programs</h4>
                      <p className="text-sm text-gray-500">Customer referrals</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-medium">Digital Marketing</h4>
                      <p className="text-sm text-gray-500">Online campaigns</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-8 w-8 text-orange-500" />
                    <div>
                      <h4 className="font-medium">Local Marketing</h4>
                      <p className="text-sm text-gray-500">Community outreach</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Active Campaigns */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Active Campaigns</h4>
                {marketingCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          campaign.type === 'loyalty' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          campaign.type === 'referral' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          campaign.type === 'digital' ? 'bg-green-100 dark:bg-green-900/20' :
                          'bg-orange-100 dark:bg-orange-900/20'
                        }`}>
                          {campaign.type === 'loyalty' && <Gift className="h-4 w-4 text-purple-600" />}
                          {campaign.type === 'referral' && <Users className="h-4 w-4 text-blue-600" />}
                          {campaign.type === 'digital' && <Smartphone className="h-4 w-4 text-green-600" />}
                          {campaign.type === 'local' && <MapPin className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{campaign.type} Campaign</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {campaign.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Budget</p>
                        <p className="font-semibold">{formatAmount(campaign.budget)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Spent</p>
                        <p className="font-semibold">{formatAmount(campaign.spent)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Reach</p>
                        <p className="font-semibold">{campaign.metrics.reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Engagement</p>
                        <p className="font-semibold">{(campaign.metrics.engagement * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Conversions</p>
                        <p className="font-semibold">{campaign.metrics.conversions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">ROI</p>
                        <p className="font-semibold text-green-600">{campaign.metrics.roi}x</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'salaries' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Salary Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Employee</span>
                </button>
              </div>

              {/* Salary Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
                      <p className="text-xl font-bold">{employees.length}</p>
                    </div>
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payroll</p>
                      <p className="text-xl font-bold">{formatAmount(employees.reduce((sum, emp) => sum + emp.salary, 0))}</p>
                    </div>
                    <CreditCard className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Autopay Enabled</p>
                      <p className="text-xl font-bold text-green-600">{employees.filter(emp => emp.paymentMethod === 'autopay').length}</p>
                    </div>
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Payroll</p>
                      <p className="text-xl font-bold">15 days</p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Autopay Settings */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-medium">Autopay Settings</h4>
                    <p className="text-sm text-gray-500">Automatically process salaries on the 30th of each month</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Next Processing Date</p>
                    <p className="font-semibold">March 30, 2024</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="font-semibold">{formatAmount(employees.reduce((sum, emp) => sum + emp.salary, 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Employees</p>
                    <p className="font-semibold">{employees.filter(emp => emp.paymentMethod === 'autopay').length} of {employees.length}</p>
                  </div>
                </div>
              </Card>

              {/* Employee List */}
              <div className="space-y-4">
                {employees.map((employee) => (
                  <Card key={employee.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{employee.name}</h4>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          employee.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {employee.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          employee.paymentMethod === 'autopay' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {employee.paymentMethod}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Monthly Salary</p>
                        <p className="font-semibold">{formatAmount(employee.salary)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Last Paid</p>
                        <p className="font-semibold">{new Date(employee.lastPaid).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Next Payment</p>
                        <p className="font-semibold">{new Date(employee.nextPayment).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Bank Account</p>
                        <p className="font-semibold">{employee.bankDetails?.accountNumber || 'Not set'}</p>
                      </div>
                    </div>

                    {employee.paymentMethod === 'manual' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                          <CreditCard className="h-3 w-3" />
                          <span>Process Payment</span>
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Expense Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Expense</span>
                </button>
              </div>

              {/* Expense Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                      <p className="text-xl font-bold">{formatAmount(expenses.reduce((sum, exp) => sum + exp.amount, 0))}</p>
                    </div>
                    <Receipt className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
                      <p className="text-xl font-bold text-yellow-600">{expenses.filter(exp => exp.status === 'pending').length}</p>
                    </div>
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                      <p className="text-xl font-bold text-green-600">{expenses.filter(exp => exp.status === 'approved').length}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                      <p className="text-xl font-bold">{formatAmount(expenses.filter(exp => new Date(exp.date).getMonth() === new Date().getMonth()).reduce((sum, exp) => sum + exp.amount, 0))}</p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Upload className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Upload Receipt</h4>
                      <p className="text-sm text-gray-500">Scan or upload receipt</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-medium">Bulk Approve</h4>
                      <p className="text-sm text-gray-500">Approve multiple expenses</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <Download className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Export Report</h4>
                      <p className="text-sm text-gray-500">Download expense report</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Expense List */}
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <Card key={expense.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          expense.status === 'approved' ? 'bg-green-100 dark:bg-green-900/20' :
                          expense.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                          'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          <Receipt className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{expense.description}</h4>
                          <p className="text-sm text-gray-500">{expense.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          expense.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {expense.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Amount</p>
                        <p className="font-semibold">{formatAmount(expense.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Date</p>
                        <p className="font-semibold">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Submitted By</p>
                        <p className="font-semibold">{expense.submittedBy}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Receipt</p>
                        <p className="font-semibold">
                          {expense.receiptUrl ? (
                            <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                              <ExternalLink className="h-3 w-3" />
                              <span>View</span>
                            </button>
                          ) : (
                            'No receipt'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Approved By</p>
                        <p className="font-semibold">{expense.approvedBy || 'Pending'}</p>
                      </div>
                    </div>

                    {expense.status === 'pending' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                        <button className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                          <CheckCircle className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                          <AlertCircle className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Tax Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Tax Payment</span>
                </button>
              </div>

              {/* Tax Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Tax Due</p>
                      <p className="text-xl font-bold">{formatAmount(12500)}</p>
                    </div>
                    <Calculator className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paid This Year</p>
                      <p className="text-xl font-bold text-green-600">{formatAmount(45000)}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                      <p className="text-xl font-bold text-red-600">{formatAmount(2500)}</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Due Date</p>
                      <p className="text-xl font-bold">Apr 15</p>
                    </div>
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
              </div>

              {/* Tax Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Income Tax</h4>
                      <p className="text-sm text-gray-500">Federal & State</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Receipt className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-medium">Sales Tax</h4>
                      <p className="text-sm text-gray-500">Monthly filing</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Property Tax</h4>
                      <p className="text-sm text-gray-500">Annual payment</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-orange-500" />
                    <div>
                      <h4 className="font-medium">Payroll Tax</h4>
                      <p className="text-sm text-gray-500">Employee taxes</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Mock Tax Payments */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Recent Tax Payments</h4>
                {[
                  { id: '1', type: 'income', amount: 15000, dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, status: 'pending', taxPeriod: 'Q1 2024' },
                  { id: '2', type: 'sales', amount: 2500, dueDate: Date.now() - 5 * 24 * 60 * 60 * 1000, status: 'overdue', taxPeriod: 'March 2024' },
                  { id: '3', type: 'payroll', amount: 3200, dueDate: Date.now() - 15 * 24 * 60 * 60 * 1000, status: 'paid', taxPeriod: 'March 2024' }
                ].map((tax) => (
                  <Card key={tax.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          tax.type === 'income' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          tax.type === 'sales' ? 'bg-green-100 dark:bg-green-900/20' :
                          tax.type === 'property' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          'bg-orange-100 dark:bg-orange-900/20'
                        }`}>
                          {tax.type === 'income' && <Building className="h-4 w-4 text-blue-600" />}
                          {tax.type === 'sales' && <Receipt className="h-4 w-4 text-green-600" />}
                          {tax.type === 'property' && <Building2 className="h-4 w-4 text-purple-600" />}
                          {tax.type === 'payroll' && <Users className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium capitalize">{tax.type} Tax</h4>
                          <p className="text-sm text-gray-500">{tax.taxPeriod}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tax.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          tax.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {tax.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Amount</p>
                        <p className="font-semibold">{formatAmount(tax.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Due Date</p>
                        <p className="font-semibold">{new Date(tax.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Action</p>
                        {tax.status === 'pending' || tax.status === 'overdue' ? (
                          <button className="flex items-center space-x-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                            <CreditCard className="h-3 w-3" />
                            <span>Pay Now</span>
                          </button>
                        ) : (
                          <span className="text-green-600 text-xs">✓ Paid</span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Asset Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Asset</span>
                </button>
              </div>

              {/* Asset Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
                      <p className="text-xl font-bold">{formatAmount(125000)}</p>
                    </div>
                    <Building className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Equipment</p>
                      <p className="text-xl font-bold">{formatAmount(85000)}</p>
                    </div>
                    <Settings className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Depreciation</p>
                      <p className="text-xl font-bold text-red-600">{formatAmount(15000)}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                      <p className="text-xl font-bold text-green-600">{formatAmount(110000)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>

              {/* Mock Assets */}
              <div className="space-y-4">
                {[
                  { id: '1', name: 'Coffee Machine Pro', category: 'equipment', purchasePrice: 15000, currentValue: 12000, condition: 'excellent', purchaseDate: Date.now() - 365 * 24 * 60 * 60 * 1000 },
                  { id: '2', name: 'POS System', category: 'technology', purchasePrice: 3500, currentValue: 2800, condition: 'good', purchaseDate: Date.now() - 180 * 24 * 60 * 60 * 1000 },
                  { id: '3', name: 'Delivery Vehicle', category: 'vehicle', purchasePrice: 25000, currentValue: 20000, condition: 'good', purchaseDate: Date.now() - 200 * 24 * 60 * 60 * 1000 }
                ].map((asset) => (
                  <Card key={asset.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          asset.category === 'equipment' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          asset.category === 'technology' ? 'bg-green-100 dark:bg-green-900/20' :
                          asset.category === 'vehicle' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          {asset.category === 'equipment' && <Settings className="h-4 w-4 text-blue-600" />}
                          {asset.category === 'technology' && <Smartphone className="h-4 w-4 text-green-600" />}
                          {asset.category === 'vehicle' && <MapPin className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium">{asset.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{asset.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          asset.condition === 'excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          asset.condition === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          asset.condition === 'fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {asset.condition}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Purchase Price</p>
                        <p className="font-semibold">{formatAmount(asset.purchasePrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Current Value</p>
                        <p className="font-semibold">{formatAmount(asset.currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Depreciation</p>
                        <p className="font-semibold text-red-600">{formatAmount(asset.purchasePrice - asset.currentValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Purchase Date</p>
                        <p className="font-semibold">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Monthly Earnings Report</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
              </div>

              {/* Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                      <p className="text-xl font-bold">{formatAmount(45000)}</p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                      <p className="text-xl font-bold">{formatAmount(32000)}</p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Net Profit</p>
                      <p className="text-xl font-bold text-green-600">{formatAmount(13000)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reserve Fund</p>
                      <p className="text-xl font-bold text-purple-600">{formatAmount(6500)}</p>
                    </div>
                    <Shield className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Investor Share</p>
                      <p className="text-xl font-bold text-green-600">{formatAmount(6500)}</p>
                    </div>
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>

              {/* Reserve Fund Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Reserve Fund Status</h4>
                  <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Building Reserve
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Reserve Fund</p>
                    <p className="text-2xl font-bold text-purple-600">{formatAmount(45000)}</p>
                    <p className="text-sm text-gray-500 mt-1">Target: {formatAmount(100000)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fund Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div className="bg-purple-600 h-3 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <p className="text-sm text-gray-500">45% Complete</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Distribution Split</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Reserve Fund:</span>
                        <span className="font-semibold text-purple-600">50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Investor Share:</span>
                        <span className="font-semibold text-green-600">50%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Once reserve fund reaches {formatAmount(100000)}, 100% goes to investors
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Monthly Report Details */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">March 2024 Earnings Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Revenue Sources</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Food Sales</span>
                        <span className="font-semibold">{formatAmount(28000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beverage Sales</span>
                        <span className="font-semibold">{formatAmount(12000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fees</span>
                        <span className="font-semibold">{formatAmount(3500)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Revenue</span>
                        <span className="font-semibold">{formatAmount(1500)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Revenue</span>
                        <span>{formatAmount(45000)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Total Expenses</span>
                        <span className="font-semibold">-{formatAmount(32000)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold text-green-600">
                        <span>Net Profit</span>
                        <span>{formatAmount(13000)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Profit Distribution</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Net Profit Available</span>
                        <span className="font-semibold">{formatAmount(13000)}</span>
                      </div>
                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Shield className="h-3 w-3 mr-1 text-purple-500" />
                            Reserve Fund (50%)
                          </span>
                          <span className="font-semibold text-purple-600">{formatAmount(6500)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1 text-green-500" />
                            Investor Share (50%)
                          </span>
                          <span className="font-semibold text-green-600">{formatAmount(6500)}</span>
                        </div>
                      </div>
                      <div className="border-t pt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          <strong>Next Payout:</strong> April 1st, 2024
                        </p>
                        <p className="text-xs text-gray-500">
                          Shareholders will receive {formatAmount(6500)} total
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Historical Earnings */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">Last 6 Months Performance</h4>
                <div className="space-y-3">
                  {[
                    { month: 'March 2024', revenue: 45000, expenses: 32000, netProfit: 13000, reserveFund: 6500, investorShare: 6500 },
                    { month: 'February 2024', revenue: 42000, expenses: 30000, netProfit: 12000, reserveFund: 6000, investorShare: 6000 },
                    { month: 'January 2024', revenue: 38000, expenses: 28000, netProfit: 10000, reserveFund: 5000, investorShare: 5000 },
                    { month: 'December 2023', revenue: 41000, expenses: 29000, netProfit: 12000, reserveFund: 6000, investorShare: 6000 },
                    { month: 'November 2023', revenue: 39000, expenses: 27000, netProfit: 12000, reserveFund: 6000, investorShare: 6000 },
                    { month: 'October 2023', revenue: 37000, expenses: 26000, netProfit: 11000, reserveFund: 5500, investorShare: 5500 }
                  ].map((monthData, index) => (
                    <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{monthData.month}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                        <p className="font-semibold">{formatAmount(monthData.revenue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Expenses</p>
                        <p className="font-semibold text-red-600">{formatAmount(monthData.expenses)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Net Profit</p>
                        <p className="font-semibold text-green-600">{formatAmount(monthData.netProfit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Reserve Fund</p>
                        <p className="font-semibold text-purple-600">{formatAmount(monthData.reserveFund)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Investor Share</p>
                        <p className="font-semibold text-green-600">{formatAmount(monthData.investorShare)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Shareholder Payout Management</h3>
                <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Payout</span>
                </button>
              </div>

              {/* Payout Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">This Month&apos;s Payout</p>
                      <p className="text-xl font-bold">{formatAmount(6500)}</p>
                    </div>
                    <Banknote className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Shareholders</p>
                      <p className="text-xl font-bold">{franchise.selectedShares}</p>
                    </div>
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Per Share Payout</p>
                      <p className="text-xl font-bold">{formatAmount(6500 / franchise.selectedShares)}</p>
                    </div>
                    <PieChart className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next Payout Date</p>
                      <p className="text-xl font-bold">Apr 1</p>
                    </div>
                    <Calendar className="h-6 w-6 text-orange-500" />
                  </div>
                </Card>
              </div>

              {/* Payout Schedule */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium">Monthly Payout Schedule</h4>
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Auto-scheduled for 1st of every month
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Month Distribution</p>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(6500)}</p>
                    <p className="text-sm text-gray-500 mt-1">From March 2024 profits</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Distribution Method</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Net Profit:</span>
                        <span className="font-semibold">{formatAmount(13000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserve Fund (50%):</span>
                        <span className="font-semibold text-purple-600">{formatAmount(6500)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shareholder Payout (50%):</span>
                        <span className="font-semibold text-green-600">{formatAmount(6500)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Shareholder Breakdown</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Shares:</span>
                        <span className="font-semibold">{franchise.totalShares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sold Shares:</span>
                        <span className="font-semibold">{franchise.selectedShares}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per Share Amount:</span>
                        <span className="font-semibold text-green-600">{formatAmount(6500 / franchise.selectedShares)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shareholder List */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">Franchise Shareholders</h4>
                <div className="space-y-3">
                  {[
                    { id: '1', name: 'John Smith', shares: Math.floor(franchise.selectedShares * 0.4), walletAddress: '0x1234...5678', status: 'active' },
                    { id: '2', name: 'Sarah Johnson', shares: Math.floor(franchise.selectedShares * 0.3), walletAddress: '0x2345...6789', status: 'active' },
                    { id: '3', name: 'Mike Chen', shares: Math.floor(franchise.selectedShares * 0.2), walletAddress: '0x3456...7890', status: 'active' },
                    { id: '4', name: 'Emma Wilson', shares: franchise.selectedShares - Math.floor(franchise.selectedShares * 0.9), walletAddress: '0x4567...8901', status: 'active' }
                  ].map((shareholder) => (
                    <div key={shareholder.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{shareholder.name}</p>
                        <p className="text-sm text-gray-500">{shareholder.walletAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Shares Owned</p>
                        <p className="font-semibold">{shareholder.shares}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Ownership %</p>
                        <p className="font-semibold">{((shareholder.shares / franchise.selectedShares) * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payout</p>
                        <p className="font-semibold text-green-600">{formatAmount((6500 / franchise.selectedShares) * shareholder.shares)}</p>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          shareholder.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {shareholder.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Payouts History */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Recent Payout History</h4>
                {[
                  { id: '1', month: 'March 2024', totalAmount: 6500, payoutDate: 'April 1, 2024', status: 'scheduled', shareholders: franchise.selectedShares },
                  { id: '2', month: 'February 2024', totalAmount: 6000, payoutDate: 'March 1, 2024', status: 'completed', shareholders: franchise.selectedShares },
                  { id: '3', month: 'January 2024', totalAmount: 5000, payoutDate: 'February 1, 2024', status: 'completed', shareholders: franchise.selectedShares },
                  { id: '4', month: 'December 2023', totalAmount: 6000, payoutDate: 'January 1, 2024', status: 'completed', shareholders: franchise.selectedShares }
                ].map((payout) => (
                  <Card key={payout.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          payout.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20' :
                          payout.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-yellow-100 dark:bg-yellow-900/20'
                        }`}>
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{payout.month} Shareholder Payout</h4>
                          <p className="text-sm text-gray-500">{payout.shareholders} shareholders</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payout.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          payout.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {payout.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="font-semibold">{formatAmount(payout.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Payout Date</p>
                        <p className="font-semibold">{payout.payoutDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Per Share</p>
                        <p className="font-semibold text-green-600">{formatAmount(payout.totalAmount / payout.shareholders)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}


        </div>
      </Card>
    </div>
  );
}
