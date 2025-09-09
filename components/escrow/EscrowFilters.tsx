'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface EscrowFiltersProps {
  filters: {
    status: string;
    stage: string;
    dateRange: string;
    amountRange: [number, number];
    searchQuery: string;
  };
  onFiltersChange: (filters: any) => void;
  escrowRecords: any[];
}

export default function EscrowFilters({ filters, onFiltersChange, escrowRecords }: EscrowFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      stage: 'all',
      dateRange: 'all',
      amountRange: [0, 10000],
      searchQuery: ''
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.stage !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Get unique values for filter options
  const uniqueStatuses = [...new Set(escrowRecords.map(record => record.status))];
  const uniqueStages = [...new Set(escrowRecords.map(record => record.stage))];

  return (
    <Card className="border-stone-200 dark:border-stone-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200">
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-stone-600 dark:text-stone-400"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search payments..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Status
            </label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Stage
            </label>
            <Select value={filters.stage} onValueChange={(value) => updateFilter('stage', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Date Range
            </label>
            <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
