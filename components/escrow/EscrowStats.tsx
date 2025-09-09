'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Building
} from 'lucide-react';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

interface EscrowStatsProps {
  escrowRecords: any[];
  isAdmin: boolean;
}

export default function EscrowStats({ escrowRecords, isAdmin }: EscrowStatsProps) {
  const { formatAmount } = useGlobalCurrency();

  // Calculate statistics
  const stats = React.useMemo(() => {
    const held = escrowRecords.filter(record => record.status === 'held');
    const released = escrowRecords.filter(record => record.status === 'released');
    const refunded = escrowRecords.filter(record => record.status === 'refunded');
    const expired = escrowRecords.filter(record => record.status === 'expired');

    // Calculate amounts (using USD amounts for consistency)
    const totalHeldUSD = held.reduce((sum, record) => sum + (record.amountUSD || record.amount), 0);
    const totalReleasedUSD = released.reduce((sum, record) => sum + (record.amountUSD || record.amount), 0);
    const totalRefundedUSD = refunded.reduce((sum, record) => sum + (record.amountUSD || record.amount), 0);
    const totalVolumeUSD = escrowRecords.reduce((sum, record) => sum + (record.amountUSD || record.amount), 0);

    // Get unique counts
    const uniqueUsers = new Set(escrowRecords.map(record => record.userId)).size;
    const uniqueFranchises = new Set(escrowRecords.map(record => record.franchiseId)).size;
    const uniqueBusinesses = new Set(escrowRecords.map(record => record.businessId)).size;

    return {
      totalRecords: escrowRecords.length,
      heldCount: held.length,
      releasedCount: released.length,
      refundedCount: refunded.length,
      expiredCount: expired.length,
      totalHeldUSD,
      totalReleasedUSD,
      totalRefundedUSD,
      totalVolumeUSD,
      uniqueUsers,
      uniqueFranchises,
      uniqueBusinesses,
      averageAmountUSD: totalVolumeUSD / (escrowRecords.length || 1)
    };
  }, [escrowRecords]);

  const statCards = [
    {
      title: 'Total Held in Escrow',
      value: formatAmount(stats.totalHeldUSD),
      subtitle: `${stats.heldCount} active payments`,
      icon: Shield,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      title: 'Total Volume',
      value: formatAmount(stats.totalVolumeUSD),
      subtitle: `${stats.totalRecords} total payments`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Released Funds',
      value: formatAmount(stats.totalReleasedUSD),
      subtitle: `${stats.releasedCount} successful releases`,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Refunded Amount',
      value: formatAmount(stats.totalRefundedUSD),
      subtitle: `${stats.refundedCount} refunds processed`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30'
    }
  ];

  const additionalStats = isAdmin ? [
    {
      title: 'Active Users',
      value: stats.uniqueUsers.toString(),
      subtitle: 'Users with escrow',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Franchises',
      value: stats.uniqueFranchises.toString(),
      subtitle: 'With escrow payments',
      icon: Building,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
      title: 'Average Payment',
      value: formatAmount(stats.averageAmountUSD),
      subtitle: 'Per escrow record',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      title: 'Expired Records',
      value: stats.expiredCount.toString(),
      subtitle: 'Require attention',
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30'
    }
  ] : [];

  const allStats = [...statCards, ...additionalStats];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {allStats.map((stat, index) => (
        <Card key={index} className="border-stone-200 dark:border-stone-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-400">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {stat.value}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
