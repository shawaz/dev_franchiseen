'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Copy,
  Calendar
} from 'lucide-react';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { toast } from 'sonner';

interface EscrowTableProps {
  escrowRecords: any[];
  filters: any;
  isAdmin: boolean;
  currentUser: any;
}

export default function EscrowTable({ escrowRecords, filters, isAdmin, currentUser }: EscrowTableProps) {
  const { formatAmount } = useGlobalCurrency();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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

  // Sort records by creation date (newest first)
  const sortedRecords = filteredRecords.sort((a, b) => b.createdAt - a.createdAt);

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
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </Badge>
    );
  };

  const getStageBadge = (stage: string) => {
    const variants = {
      pending_approval: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      funding: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      launching: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };

    const displayName = stage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    return (
      <Badge variant="outline" className={variants[stage as keyof typeof variants] || 'bg-stone-100 text-stone-800'}>
        {displayName}
      </Badge>
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const truncateSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  return (
    <Card className="border-stone-200 dark:border-stone-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Escrow Payments</span>
          <Badge variant="outline">
            {sortedRecords.length} records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedRecords.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400 mb-2">
              No escrow records found
            </h3>
            <p className="text-stone-500 dark:text-stone-400">
              Try adjusting your filters to see more results.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stage</TableHead>
                  {isAdmin && <TableHead>User</TableHead>}
                  <TableHead>Franchise</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record) => {
                  const daysUntilExpiry = Math.ceil((record.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <TableRow key={record._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(record.paymentSignature, 'Payment signature')}
                            className="p-1 h-auto"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <code className="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
                            {truncateSignature(record.paymentSignature)}
                          </code>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatAmount(record.amountUSD || record.amount)}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {record.shares} shares
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      
                      <TableCell>
                        {getStageBadge(record.stage)}
                      </TableCell>
                      
                      {isAdmin && (
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {record.user?.firstName} {record.user?.lastName}
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400">
                              {record.userEmail}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {record.franchise?.slug || 'Unknown'}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {record.business?.name}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className={`text-sm ${daysUntilExpiry <= 7 ? 'text-red-600 font-medium' : 'text-stone-600 dark:text-stone-400'}`}>
                          {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry}d`}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRecord(record)}
                            className="p-2 h-auto"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 h-auto"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
