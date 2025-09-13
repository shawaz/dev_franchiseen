"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  Settings, 
  Crown,
  UserCheck,
  Calculator,
  ArrowLeft
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  slug?: string;
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

interface BrandAccountClientProps {
  user: SerializedUser;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convexUser: any;
  business: Business;
  franchises: Franchise[];
  brandSlug: string;
}

// Mock team data
const mockTeamMembers = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@daanah.com',
    role: 'Owner',
    avatar: '/avatars/owner.jpg',
    joinedAt: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@daanah.com',
    role: 'Manager',
    avatar: '/avatars/manager.jpg',
    joinedAt: '2024-03-01',
    status: 'active'
  },
  {
    id: 3,
    name: 'Mohammed Hassan',
    email: 'mohammed@daanah.com',
    role: 'Cashier',
    avatar: '/avatars/cashier.jpg',
    joinedAt: '2024-06-15',
    status: 'active'
  }
];

export default function BrandAccountClient({ 
  user, 
  convexUser, 
  business, 
  franchises, 
  brandSlug 
}: BrandAccountClientProps) {
  const [activeTab, setActiveTab] = useState<'team' | 'edit-business'>('team');
  const { formatAmount } = useGlobalCurrency();
  const router = useRouter();

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'cashier':
        return <Calculator className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cashier':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 dark:bg-stone-900">
      <div className="pt-[60px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.push(`/${brandSlug}/owner`)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {business.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Account Settings
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'team'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                Team
              </button>
              <button
                onClick={() => setActiveTab('edit-business')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === 'edit-business'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4" />
                Edit Business
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Team Members
                  </h2>
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Add Member
                  </button>
                </div>

                <div className="space-y-4">
                  {mockTeamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'edit-business' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Business Information
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      defaultValue={business.name}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Business Slug
                    </label>
                    <input
                      type="text"
                      defaultValue={business.slug}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      defaultValue={business.industry?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      defaultValue={business.category?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
