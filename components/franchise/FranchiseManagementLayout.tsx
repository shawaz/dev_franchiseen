"use client";

import React, { useState } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
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

interface FranchiseManagementLayoutProps {
  business: Business;
  franchise: Franchise;
  brandSlug: string;
  activeTab: string;
  children: React.ReactNode;
}

export default function FranchiseManagementLayout({ 
  business, 
  franchise, 
  brandSlug, 
  activeTab,
  children 
}: FranchiseManagementLayoutProps) {
  const router = useRouter();
  const { formatAmount } = useGlobalCurrency();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate budget balance (mock data for now)
  const totalBudget = franchise.totalInvestment;
  const budgetBalance = totalBudget * 0.8; // 80% of total budget as balance

  const getTabTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
      budget: 'Budget',
      products: 'Products',
      orders: 'Orders',
      expenses: 'Expenses',
      salaries: 'Salaries',
      taxes: 'Taxes',
      assets: 'Assets',
      earnings: 'Earnings',
      payouts: 'Payouts'
    };
    return titles[tab] || 'Management';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/${brandSlug}/${franchise._id}/manage`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Tab Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getTabTitle(activeTab)}
            </h1>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Franchise Info Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={business.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : (
              <div className="text-gray-500 font-semibold text-sm">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Franchise Info */}
          <div className="flex-1">
            <h2 className="font-medium text-gray-900 dark:text-white text-sm">
              {franchise.building}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {franchise.locationAddress}
            </p>
          </div>

          {/* Budget Info */}
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatAmount(budgetBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
