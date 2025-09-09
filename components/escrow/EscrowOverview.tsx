'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Calendar,
  DollarSign,
  Building,
  User
} from 'lucide-react';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

interface EscrowOverviewProps {
  escrowRecords: any[];
  filters: any;
  isAdmin: boolean;
}

export default function EscrowOverview({ escrowRecords, filters, isAdmin }: EscrowOverviewProps) {
  const { formatAmount } = useGlobalCurrency();

  // Apply filters to records
  const filteredRecords = React.useMemo(() => {
    return escrowRecords.filter(record => {
      // Status filter
      if (filters.status !== 'all' && record.status !== filters.status) return false;
      
      // Stage filter
      if (filters.stage !== 'all' && record.stage !== filters.stage) return false;
      
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = [
          record.paymentSignature,
          record.userEmail,
          record.franchise?.slug,
          record.business?.name,
          record.user?.firstName,
          record.user?.lastName
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      // Date range filter
      if (filters.dateRange !== 'all') {
        const recordDate = new Date(record.createdAt);
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            if (recordDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (recordDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (recordDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            if (recordDate < quarterAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            if (recordDate < yearAgo) return false;
            break;
        }
      }
      
      return true;
    });
  }, [escrowRecords, filters]);

  // Get recent records (last 5)
  const recentRecords = filteredRecords
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  // Get records requiring attention
  const attentionRecords = filteredRecords.filter(record => {
    const now = Date.now();
    const expiresAt = record.expiresAt;
    const daysUntilExpiry = (expiresAt - now) / (1000 * 60 * 60 * 24);
    
    return (
      record.status === 'held' && 
      (daysUntilExpiry <= 7 || record.status === 'expired')
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'held':
        return <Shield className="w-4 h-4 text-yellow-600" />;
      case 'released':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'refunded':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Shield className="w-4 h-4 text-stone-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      held: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      released: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      refunded: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.held}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Escrow Payments */}
      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRecords.length === 0 ? (
            <p className="text-stone-500 dark:text-stone-400 text-center py-4">
              No recent payments found
            </p>
          ) : (
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <div className="font-medium text-stone-900 dark:text-stone-100">
                        {formatAmount(record.amountUSD || record.amount)}
                      </div>
                      <div className="text-sm text-stone-500 dark:text-stone-400">
                        {isAdmin ? (
                          <>
                            {record.user?.firstName} {record.user?.lastName} • {record.business?.name}
                          </>
                        ) : (
                          record.franchise?.slug || 'Unknown Franchise'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(record.status)}
                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Records Requiring Attention */}
      <Card className="border-stone-200 dark:border-stone-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            Requires Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attentionRecords.length === 0 ? (
            <p className="text-stone-500 dark:text-stone-400 text-center py-4">
              No records require immediate attention
            </p>
          ) : (
            <div className="space-y-4">
              {attentionRecords.map((record) => {
                const now = Date.now();
                const daysUntilExpiry = Math.ceil((record.expiresAt - now) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={record._id} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <div>
                        <div className="font-medium text-stone-900 dark:text-stone-100">
                          {formatAmount(record.amountUSD || record.amount)}
                        </div>
                        <div className="text-sm text-stone-600 dark:text-stone-400">
                          {daysUntilExpiry <= 0 ? 'Expired' : `Expires in ${daysUntilExpiry} days`}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
