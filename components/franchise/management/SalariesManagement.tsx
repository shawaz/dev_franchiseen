"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Plus, DollarSign } from 'lucide-react';
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

interface SalariesManagementProps {
  business: Business;
  franchise: Franchise;
}

// Mock staff data
const mockStaff = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    position: 'Store Manager',
    salary: 120000,
    status: 'active',
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    position: 'Barista',
    salary: 80000,
    status: 'active',
    joinDate: '2024-03-01'
  },
  {
    id: 3,
    name: 'Mohammed Hassan',
    position: 'Cashier',
    salary: 75000,
    status: 'active',
    joinDate: '2024-06-15'
  }
];

export default function SalariesManagement({ business, franchise }: SalariesManagementProps) {
  const { formatAmount } = useGlobalCurrency();

  const totalSalaries = mockStaff.reduce((sum, staff) => sum + staff.salary, 0);
  const activeStaff = mockStaff.filter(staff => staff.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Staff & Salaries</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Salaries</h3>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(totalSalaries)}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Staff</h3>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {activeStaff}
          </p>
        </Card>
      </div>

      {/* Staff List */}
      <div className="space-y-3">
        {mockStaff.map((staff) => (
          <Card key={staff.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {staff.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {staff.position} • Joined {new Date(staff.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatAmount(staff.salary)}/month
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  staff.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {staff.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
