"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileText,
  Building,
  DollarSign,
  CreditCard,
  Coins,
  ChevronRight
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
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
}

interface FranchiseManagementTabsProps {
  business: Business;
  franchise: Franchise;
  brandSlug: string;
}

const managementTabs = [
  {
    id: 'budget',
    label: 'Budget',
    icon: Wallet,
    description: 'Manage franchise budget and expenses'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    description: 'Manage products and inventory'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    description: 'View and manage customer orders'
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Receipt,
    description: 'Track and manage expenses'
  },
  {
    id: 'salaries',
    label: 'Salaries',
    icon: Users,
    description: 'Manage staff salaries and payroll'
  },
  {
    id: 'taxes',
    label: 'Taxes',
    icon: FileText,
    description: 'Handle tax calculations and filings'
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: Building,
    description: 'Manage franchise assets and equipment'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: DollarSign,
    description: 'View earnings and revenue reports'
  },
  {
    id: 'balance',
    label: 'Balance',
    icon: Wallet,
    description: 'Manage franchise balance and transactions'
  },
  {
    id: 'payouts',
    label: 'Payouts',
    icon: CreditCard,
    description: 'Manage payouts and distributions'
  },
  {
    id: 'token',
    label: 'Token Management',
    icon: Coins,
    description: 'Manage franchise tokens and shares'
  }
];

export default function FranchiseManagementTabs({ 
  business, 
  franchise, 
  brandSlug 
}: FranchiseManagementTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (tabId: string) => {
    router.push(`/${brandSlug}/${franchise._id}/manage/${tabId}`);
  };

  const isActiveTab = (tabId: string) => {
    return pathname?.includes(`/manage/${tabId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Tab List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {managementTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isActive ? 'bg-primary/5 border-r-2 border-primary' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {tab.label}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tab.description}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
