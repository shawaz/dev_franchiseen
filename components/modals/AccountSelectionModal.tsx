"use client";

import React from 'react';
import { X, User, Crown, UserCheck, Settings, CreditCard, ChevronRight, Plus, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // Get Convex user data
  const convexUser = useQuery(
    api.myFunctions.getUserByEmail,
    email ? { email } : "skip",
  );

  // Get user businesses from Convex
  const convexUserBusinesses = useQuery(
    api.brands.listByOwner,
    convexUser?._id ? { ownerId: convexUser._id as Id<"users"> } : "skip",
  ) || [];

  // Mock data for user businesses with role types - in real app, this would come from your database
  const mockUserBusinesses = [
    {
      id: 'codelude-1',
      name: 'Codelude',
      role: 'Business',
      icon: '🔗',
      href: '/codelude/account',
      color: 'bg-gray-100 dark:bg-stone-700'
    },
    {
      id: 'codelude-2',
      name: 'CodeLude',
      role: 'Business',
      icon: '🔗',
      href: '/codelude-2/account',
      color: 'bg-gray-100 dark:bg-stone-700'
    },
    {
      id: 'franchise-1',
      name: 'Franchise',
      role: 'Business',
      icon: '📦',
      href: '/franchise/account',
      color: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      id: 'daanah-1',
      name: 'Daanah',
      role: 'Business',
      icon: '💰',
      href: '/daanah/account',
      color: 'bg-pink-100 dark:bg-pink-900/30'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center md:p-4">
      <div className="bg-white dark:bg-stone-800 md:rounded-lg w-full md:max-w-2xl h-full md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">View Accounts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-stone-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        

        

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Profile Section */}
          {user && (
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-stone-700">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-stone-700 flex-shrink-0">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{user.fullName || 'Shawaz Sharif'}</h3>
                <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
          )}

          {/* Business Accounts */}
          <div className="space-y-3">
            {mockUserBusinesses.map((business) => (
              <Link
                key={business.id}
                href={business.href}
                onClick={onClose}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-stone-700/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${business.color}`}>
                  {business.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-lg">{business.name}</h4>
                  <p className="text-sm text-muted-foreground">{business.role}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Create New Business */}
          <div className="pt-4 border-t border-gray-200 dark:border-stone-700">
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-stone-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-stone-700 flex items-center justify-center">
                <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">Create New Business</h4>
                <p className="text-sm text-muted-foreground">Start a new business venture</p>
              </div>
              <Plus className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </Link>
          </div>


        </div>
      </div>
    </div>
  );
};

export default AccountSelectionModal;
