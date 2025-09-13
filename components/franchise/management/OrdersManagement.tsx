"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

interface Business {
  _id: Id<"brands">;
  name: string;
  logoUrl?: string;
}

interface Franchise {
  _id: Id<"franchise">;
  businessId: Id<"brands">;
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

interface OrdersManagementProps {
  business: Business;
  franchise: Franchise;
}

// Mock orders data
const mockOrders = [
  {
    id: '#ORD-001',
    customer: 'Ahmed Al-Rashid',
    items: ['Premium Coffee Blend', 'Artisan Sandwich'],
    total: 70.00,
    status: 'pending',
    date: '2025-01-20T10:30:00Z',
    type: 'dine-in'
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Johnson',
    items: ['Organic Tea', 'Fresh Pastry'],
    total: 35.00,
    status: 'preparing',
    date: '2025-01-20T10:15:00Z',
    type: 'takeaway'
  },
  {
    id: '#ORD-003',
    customer: 'Mohammed Hassan',
    items: ['Premium Coffee Blend x2'],
    total: 50.00,
    status: 'ready',
    date: '2025-01-20T09:45:00Z',
    type: 'delivery'
  },
  {
    id: '#ORD-004',
    customer: 'Lisa Chen',
    items: ['Artisan Sandwich', 'Organic Tea', 'Fresh Pastry'],
    total: 80.00,
    status: 'completed',
    date: '2025-01-20T09:30:00Z',
    type: 'dine-in'
  },
  {
    id: '#ORD-005',
    customer: 'Omar Abdullah',
    items: ['Premium Coffee Blend'],
    total: 25.00,
    status: 'cancelled',
    date: '2025-01-20T09:00:00Z',
    type: 'takeaway'
  }
];

const statusFilters = ['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export default function OrdersManagement({ business, franchise }: OrdersManagementProps) {
  const { formatAmount } = useGlobalCurrency();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = mockOrders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dine-in':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'takeaway':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'delivery':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredOrders.length} orders
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedStatus === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {order.id}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(order.type)}`}>
                  {order.type.replace('-', ' ')}
                </span>
              </div>
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            <div className="mb-3">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                {order.customer}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.items.join(', ')}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(order.date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatAmount(order.total)}
              </span>
            </div>

            {/* Action Buttons for pending/preparing orders */}
            {(order.status === 'pending' || order.status === 'preparing') && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {order.status === 'pending' && (
                  <button className="flex-1 py-2 px-3 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button className="flex-1 py-2 px-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors">
                    Mark Ready
                  </button>
                )}
                <button className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card className="p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Try adjusting your search terms' : 'Orders will appear here when customers place them'}
          </p>
        </Card>
      )}
    </div>
  );
}
