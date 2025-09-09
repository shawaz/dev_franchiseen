'use client';

import React from 'react';
import EscrowDashboard from '@/components/escrow/EscrowDashboard';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import MainLoader from '@/components/ui/MainLoader';
import { Shield, AlertTriangle } from 'lucide-react';

export default function EscrowPage() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser, {});

  if (!isLoaded) {
    return <MainLoader message="Loading escrow dashboard..." showProgress={true} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">
            Authentication Required
          </h1>
          <p className="text-stone-600 dark:text-stone-400">
            Please sign in to view escrow payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                Escrow Management
              </h1>
              <p className="text-stone-600 dark:text-stone-400">
                Monitor and manage secure payment holdings for franchise funding
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EscrowDashboard currentUser={currentUser} />
      </div>
    </div>
  );
}
