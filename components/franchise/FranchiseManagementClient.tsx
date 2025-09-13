"use client";

import React, { useState } from 'react';
import { ArrowLeft, Menu, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import FranchiseManagementTabs from './FranchiseManagementTabs';

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

interface SerializedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses?: {
    emailAddress: string;
  }[];
}

interface FranchiseManagementClientProps {
  user: SerializedUser;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convexUser: any;
  business: Business;
  franchise: Franchise;
  brandSlug: string;
}

export default function FranchiseManagementClient({ 
  user, 
  convexUser, 
  business, 
  franchise, 
  brandSlug 
}: FranchiseManagementClientProps) {
  const router = useRouter();
  const { formatAmount } = useGlobalCurrency();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Calculate budget balance (mock data for now)
  const totalBudget = franchise.totalInvestment;
  const budgetBalance = totalBudget * 0.8; // 80% of total budget as balance

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/${brandSlug}/owner`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Shop Name */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {franchise.building}
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

      {/* Hero Image with Live Badge */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <Image
          src="/images/1.svg"
          alt={franchise.building}
          fill
          className="object-cover"
        />
        {/* Live Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      </div>

      {/* Brand Info Section */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          {/* Brand Logo */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={business.name}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="text-gray-500 font-semibold text-lg">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Brand Info */}
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {business.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {business.category?.name || 'Business'} • {business.industry?.name || 'Industry'}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {franchise.building}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {franchise.locationAddress}
          </p>
        </div>

        {/* Budget Section */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budget Balance</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatAmount(budgetBalance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatAmount(totalBudget)}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${(budgetBalance / totalBudget) * 100}%` }}
          />
        </div>
      </div>

      {/* Management Tabs */}
      <FranchiseManagementTabs 
        business={business}
        franchise={franchise}
        brandSlug={brandSlug}
      />
    </div>
  );
}
