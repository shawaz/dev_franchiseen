"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  Plus, 
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import Image from 'next/image';

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

interface ProductsManagementProps {
  business: Business;
  franchise: Franchise;
}

// Mock products data
const mockProducts = [
  {
    id: 1,
    name: 'Premium Coffee Blend',
    category: 'Beverages',
    price: 25.00,
    stock: 150,
    image: '/franchise/hubcv-1-1.png',
    status: 'active',
    sales: 89
  },
  {
    id: 2,
    name: 'Artisan Sandwich',
    category: 'Food',
    price: 45.00,
    stock: 75,
    image: '/franchise/hubcv-1-1.png',
    status: 'active',
    sales: 156
  },
  {
    id: 3,
    name: 'Fresh Pastry',
    category: 'Bakery',
    price: 15.00,
    stock: 0,
    image: '/franchise/hubcv-1-1.png',
    status: 'out_of_stock',
    sales: 234
  },
  {
    id: 4,
    name: 'Organic Tea',
    category: 'Beverages',
    price: 20.00,
    stock: 200,
    image: '/franchise/hubcv-1-1.png',
    status: 'active',
    sales: 67
  }
];

const categories = ['All', 'Beverages', 'Food', 'Bakery', 'Snacks'];

export default function ProductsManagement({ business, franchise }: ProductsManagementProps) {
  const { formatAmount } = useGlobalCurrency();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'inactive':
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h2>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
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

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex gap-3">
              {/* Product Image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {product.category}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatAmount(product.price)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {getStatusText(product.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Stock: {product.stock}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Sales: {product.sales}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No products found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
          </p>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Add Product
          </button>
        </Card>
      )}
    </div>
  );
}
