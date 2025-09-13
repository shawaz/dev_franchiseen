"use client";

import React from "react";
import Link from "next/link";
import {
  Wallet,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  FileText,
  Building,
  DollarSign,
  CreditCard,
  ArrowLeft,
  MapPin
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "../ui/card";
import { useGlobalCurrency } from "@/contexts/GlobalCurrencyContext";

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
  slug?: string;
}

interface FranchiseManagementSideNavProps {
  business: Business;
  franchise: Franchise;
  brandSlug: string;
}

function FranchiseManagementSideNav({ 
  business, 
  franchise, 
  brandSlug 
}: FranchiseManagementSideNavProps) {
  const pathname = usePathname();
  const { formatAmount } = useGlobalCurrency();
  const isActive = (path: string) => pathname === path;

  // Calculate budget balance (mock data for now)
  const totalBudget = franchise.totalInvestment;
  const budgetBalance = totalBudget * 0.8; // 80% of total budget as balance

  const franchiseSlug = franchise.slug || franchise._id;
  const managementLinks = [
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/budget`,
      label: 'Budget',
      icon: Wallet,
      description: 'Manage budget and expenses'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/products`,
      label: 'Products',
      icon: Package,
      description: 'Manage products and inventory'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/orders`,
      label: 'Orders',
      icon: ShoppingCart,
      description: 'View and manage orders'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/expenses`,
      label: 'Expenses',
      icon: Receipt,
      description: 'Track expenses'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/salaries`,
      label: 'Salaries',
      icon: Users,
      description: 'Manage staff and payroll'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/taxes`,
      label: 'Taxes',
      icon: FileText,
      description: 'Handle tax calculations'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/assets`,
      label: 'Assets',
      icon: Building,
      description: 'Manage assets and equipment'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/earnings`,
      label: 'Earnings',
      icon: DollarSign,
      description: 'View earnings reports'
    },
    {
      href: `/${brandSlug}/${franchiseSlug}/manage/payouts`,
      label: 'Payouts',
      icon: CreditCard,
      description: 'Manage payouts'
    }
  ];

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-20">
        {/* Back to Brand Dashboard */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <Link 
              href={`/${brandSlug}/owner`}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>

        {/* Franchise Brief */}
        <Card className="py-6 lg:border-b border-stone-200 dark:border-stone-700/50">
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative rounded-lg overflow-hidden h-16 w-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {business.logoUrl ? (
                  <Image
                    src={business.logoUrl}
                    alt={business.name}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-500 font-semibold text-lg">
                    {business.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {franchise.building}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {business.name}
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                {franchise.locationAddress}
              </div>
              <div className="text-sm text-gray-500">
                {franchise.carpetArea} sq ft • {formatAmount(franchise.costPerArea)}/sq ft
              </div>
            </div>

            {/* Budget Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Budget Balance</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatAmount(budgetBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatAmount(totalBudget)}
                </p>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(budgetBalance / totalBudget) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Management Menu */}
        <Card className="py-4">
          <h3 className="text-lg font-semibold px-6 pb-4">Management</h3>
          <nav className="space-y-1">
            {managementLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center ${
                    isActive(link.href) 
                      ? "text-primary bg-primary/5" 
                      : "text-gray-600 dark:text-gray-400"
                  } hover:text-primary dark:hover:text-primary dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {link.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </Card>
      </div>
    </div>
  );
}

export default FranchiseManagementSideNav;
