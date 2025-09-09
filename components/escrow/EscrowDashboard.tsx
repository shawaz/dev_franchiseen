'use client';

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EscrowOverview from './EscrowOverview';
import EscrowTable from './EscrowTable';
import EscrowStats from './EscrowStats';
import EscrowFilters from './EscrowFilters';
import { CompactLoader } from '@/components/ui/loaders';
import { AlertTriangle } from 'lucide-react';

interface EscrowDashboardProps {
  currentUser: any;
}

export interface EscrowFilters {
  status: string;
  stage: string;
  dateRange: string;
  amountRange: [number, number];
  searchQuery: string;
}

export default function EscrowDashboard({ currentUser }: EscrowDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<EscrowFilters>({
    status: 'all',
    stage: 'all',
    dateRange: 'all',
    amountRange: [0, 10000],
    searchQuery: ''
  });

  // Fetch all escrow records (admin view)
  const allEscrowRecords = useQuery(api.escrow.getAllEscrowRecords, {});
  
  // Fetch user's escrow records
  const userEscrowRecords = useQuery(
    api.escrow.getEscrowByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Check if user is admin (you can implement your own admin check logic)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('admin');

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <CompactLoader message="Loading user data..." />
      </div>
    );
  }

  const escrowData = isAdmin ? allEscrowRecords : userEscrowRecords;

  if (escrowData === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <CompactLoader message="Loading escrow data..." />
      </div>
    );
  }

  if (!escrowData || escrowData.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200 mb-2">
          No Escrow Records Found
        </h3>
        <p className="text-stone-600 dark:text-stone-400">
          {isAdmin 
            ? 'No escrow payments have been made on the platform yet.'
            : 'You haven\'t made any escrow payments yet. Create a franchise to get started.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <EscrowStats escrowRecords={escrowData} isAdmin={isAdmin} />

      {/* Filters */}
      <EscrowFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        escrowRecords={escrowData}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">All Payments</TabsTrigger>
          {isAdmin && <TabsTrigger value="management">Management</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EscrowOverview 
            escrowRecords={escrowData} 
            filters={filters}
            isAdmin={isAdmin}
          />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <EscrowTable 
            escrowRecords={escrowData} 
            filters={filters}
            isAdmin={isAdmin}
            currentUser={currentUser}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="management" className="space-y-6">
            <div className="bg-white dark:bg-stone-800 rounded-lg p-6 border border-stone-200 dark:border-stone-700">
              <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-4">
                Admin Management Tools
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Advanced escrow management features coming soon...
              </p>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
