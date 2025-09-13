'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import BrandWalletWithLocalCurrency from '@/components/wallet/BrandWalletWithLocalCurrency';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Doc } from '@/convex/_generated/dataModel';
import {
  Receipt,
  ShoppingCart,
  Package,
  Calculator,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Truck,
  BarChart3,
  FileText,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { Money2 } from 'iconsax-reactjs';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

// Interfaces for cashier operations
interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  available: boolean;
}

interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'completed';
  paymentMethod?: 'cash' | 'card' | 'wallet';
  createdAt: number;
  completedAt?: number;
}

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  currentOrder?: string;
  itemCount: number;
}

interface CashierDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convexUser: any;
  business: Doc<"brands">;
  franchise: Doc<"franchise">;
  brandSlug: string;
}

// Mock data generators
const generateMockMenuItems = (): MenuItem[] => {
  return [
    { id: '1', name: 'Fish & Chips', category: 'Breakfast', price: 7.5, available: true },
    { id: '2', name: 'Roast Chicken', category: 'Main Course', price: 12.90, available: true },
    { id: '3', name: 'Lemonade', category: 'Beverages', price: 3.50, available: true },
    { id: '4', name: 'Cappuccino', category: 'Beverages', price: 4.25, available: true },
    { id: '5', name: 'Apple Pie', category: 'Desserts', price: 5.75, available: true },
    { id: '6', name: 'Caesar Salad', category: 'Salads', price: 8.90, available: true }
  ];
};

const generateMockTables = (): Table[] => {
  return [
    { id: '1', number: 'Table 1', capacity: 4, status: 'occupied', currentOrder: 'ORD001', itemCount: 8 },
    { id: '2', number: 'Table 2', capacity: 4, status: 'occupied', currentOrder: 'ORD002', itemCount: 8 },
    { id: '3', number: 'Table 3', capacity: 6, status: 'occupied', currentOrder: 'ORD003', itemCount: 8 },
    { id: '4', number: 'Breakfast', capacity: 2, status: 'available', itemCount: 0 },
    { id: '5', number: 'Breakfast', capacity: 2, status: 'available', itemCount: 0 },
    { id: '6', number: 'Main Course', capacity: 4, status: 'available', itemCount: 0 },
    { id: '7', number: 'Breakfast', capacity: 4, status: 'available', itemCount: 0 },
    { id: '8', number: 'Breakfast', capacity: 4, status: 'available', itemCount: 0 }
  ];
};

const generateMockOrders = (): Order[] => {
  const menuItems = generateMockMenuItems();
  return [
    {
      id: '1',
      orderNumber: '#412',
      tableNumber: 'Line A1',
      items: [
        { id: '1', menuItem: menuItems[0], quantity: 1, notes: '' },
        { id: '2', menuItem: menuItems[2], quantity: 1, notes: '' },
        { id: '3', menuItem: menuItems[3], quantity: 3, notes: '' },
        { id: '4', menuItem: menuItems[4], quantity: 3, notes: '' }
      ],
      subtotal: 17.50,
      tax: 1.75,
      total: 19.25,
      status: 'pending',
      createdAt: Date.now() - 10 * 60 * 1000
    },
    {
      id: '2',
      orderNumber: '#413',
      tableNumber: 'Line A2',
      items: [
        { id: '1', menuItem: menuItems[0], quantity: 1, notes: '' },
        { id: '2', menuItem: menuItems[2], quantity: 1, notes: '' },
        { id: '3', menuItem: menuItems[3], quantity: 3, notes: '' },
        { id: '4', menuItem: menuItems[4], quantity: 3, notes: '' }
      ],
      subtotal: 17.50,
      tax: 1.75,
      total: 19.25,
      status: 'in_progress',
      createdAt: Date.now() - 20 * 60 * 1000
    },
    {
      id: '3',
      orderNumber: '#414',
      tableNumber: 'Line A3',
      items: [
        { id: '1', menuItem: menuItems[0], quantity: 1, notes: '' },
        { id: '2', menuItem: menuItems[2], quantity: 1, notes: '' },
        { id: '3', menuItem: menuItems[3], quantity: 3, notes: '' },
        { id: '4', menuItem: menuItems[4], quantity: 3, notes: '' }
      ],
      subtotal: 17.50,
      tax: 1.75,
      total: 19.25,
      status: 'ready',
      createdAt: Date.now() - 30 * 60 * 1000
    },
    {
      id: '4',
      orderNumber: '#415',
      tableNumber: 'Line A4',
      items: [
        { id: '1', menuItem: menuItems[0], quantity: 1, notes: '' },
        { id: '2', menuItem: menuItems[2], quantity: 1, notes: '' },
        { id: '3', menuItem: menuItems[3], quantity: 3, notes: '' },
        { id: '4', menuItem: menuItems[4], quantity: 3, notes: '' }
      ],
      subtotal: 17.50,
      tax: 1.75,
      total: 19.25,
      status: 'completed',
      createdAt: Date.now() - 40 * 60 * 1000,
      completedAt: Date.now() - 35 * 60 * 1000
    }
  ];
};

export default function CashierDashboard({ business, franchise }: CashierDashboardProps) {
  const [activeTab, setActiveTab] = useState<'billing' | 'orders' | 'procurement' | 'inventory' | 'accounting'>('billing');
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<'counter' | 'table'>('table');

  // Use global currency context for formatting
  const { formatAmount } = useGlobalCurrency();

  // Generate mock data
  const mockMenuItems = generateMockMenuItems();
  const mockTables = generateMockTables();
  const mockOrders = generateMockOrders();

  // State management
  const [menuItems] = useState<MenuItem[]>(mockMenuItems);
  const [tables] = useState<Table[]>(mockTables);
  const [orders] = useState<Order[]>(mockOrders);

  const handleAddSOL = () => {
    alert('Add SOL clicked! You can get devnet SOL from the airdrop button or Solana faucet.');
  };

  const tabs = [
    { id: 'billing', label: 'Billing', icon: Receipt },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'procurement', label: 'Procurement', icon: Truck },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
  ];

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = currentOrder.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCurrentOrder([...currentOrder, {
        id: Date.now().toString(),
        menuItem,
        quantity: 1
      }]);
    }
  };

  const removeFromOrder = (menuItemId: string) => {
    const existingItem = currentOrder.find(item => item.menuItem.id === menuItemId);
    if (existingItem && existingItem.quantity > 1) {
      setCurrentOrder(currentOrder.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCurrentOrder(currentOrder.filter(item => item.menuItem.id !== menuItemId));
    }
  };

  const calculateOrderTotal = () => {
    const subtotal = currentOrder.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateOrderTotal();

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
     <div className="space-y-6 py-6 ">
      {/* Header */}
      <BrandWalletWithLocalCurrency onAddMoney={handleAddSOL} business={business} brandSlug={business.slug || ''} />


      

      {/* Content */}
      <div>
        {/* Navigation Tabs */}
      <div className=" bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300 dark:text-stone-400 dark:hover:text-stone-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      <div className=" bg-white dark:bg-stone-800 p-6">
        {/* Billing Tab - POS System */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
            {/* Left Side - Tables and Menu */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search Bar and Order Type Selector */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div className="relative">
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as 'counter' | 'table')}
                    className="appearance-none bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent text-stone-900 dark:text-white"
                  >
                    <option value="counter">Counter</option>
                    <option value="table">Table</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Tables Section - Only show when table order type is selected */}
              {orderType === 'table' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Tables & Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tables.map((table) => (
                      <Card
                        key={table.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedTable === table.id ? 'ring-2 ring-primary' : ''
                        } ${
                          table.status === 'occupied' ? 'bg-orange-100 dark:bg-orange-900/20' : 'bg-stone-50 dark:bg-stone-800'
                        }`}
                        onClick={() => setSelectedTable(table.id)}
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-stone-700 rounded-full mb-3 mx-auto">
                          <div className="w-3 h-3 bg-stone-400 rounded-full"></div>
                        </div>
                        <h4 className="font-medium text-center">{table.number}</h4>
                        <p className="text-sm text-stone-500 text-center">{table.itemCount} items</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <p>No menu items found matching "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filteredMenuItems.map((item) => (
                      <Card key={item.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className="text-sm text-stone-500">{item.category}</span>
                        </div>
                        <p className="text-lg font-bold text-green-600 mb-3">{formatAmount(item.price)}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => removeFromOrder(item.id)}
                            className="p-1 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="mx-2 font-medium">
                            {currentOrder.find(orderItem => orderItem.menuItem.id === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => addToOrder(item)}
                            className="p-1 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="dark:bg-stone-900 border dark:border-stone-700 border-stone-200 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Order</h3>
                <span className="text-sm text-stone-400">
                  {orderType === 'table' && selectedTable ? `Table: ${tables.find(t => t.id === selectedTable)?.number}` : 'Counter Order'}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {currentOrder.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <p>No items in order</p>
                    <p className="text-sm">Add items from the menu</p>
                  </div>
                ) : (
                  currentOrder.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-stone-100 dark:bg-stone-800 p-3 rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-stone-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="font-medium">{item.menuItem.name}</span>
                          <p className="text-xs text-stone-400">{formatAmount(item.menuItem.price)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{formatAmount(item.menuItem.price * item.quantity)}</span>
                        <button
                          onClick={() => removeFromOrder(item.menuItem.id)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary */}
              <div className="border-t border-stone-700 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax 10%</span>
                  <span>{formatAmount(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-stone-700 pt-2">
                  <span>Total</span>
                  <span>{formatAmount(total)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Payment Method</h4>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button className="flex flex-col items-center p-3 bg-stone-100 rounded hover:bg-stone-700 transition-colors">
                    <Money2 className="h-6 w-6 mb-1" />
                    <span className="text-sm">Cash</span>
                  </button>
                  <button className="flex flex-col items-center p-3 bg-stone-100 rounded hover:bg-stone-700 transition-colors">
                    <CreditCard className="h-6 w-6 mb-1" />
                    <span className="text-sm">Card</span>
                  </button>
                  <button className="flex flex-col items-center p-3 bg-stone-100 rounded hover:bg-stone-700 transition-colors">
                    <Wallet className="h-6 w-6 mb-1" />
                    <span className="text-sm">Solana Pay</span>
                  </button>
                </div>
                <button
                  className="w-full bg-yellow-600 text-white py-3  font-medium hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentOrder.length === 0}
                >
                  {currentOrder.length === 0 ? 'Add Items to Order' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{order.tableNumber}</h3>
                    <span className="text-sm text-stone-500">Order {order.orderNumber}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">QT</span>
                      <span className="font-medium">Items</span>
                      <span className="font-medium">Price</span>
                    </div>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}</span>
                        <span className="flex-1 px-2">{item.menuItem.name}</span>
                        <span>{formatAmount(item.menuItem.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>{formatAmount(order.subtotal)}</span>
                    </div>
                  </div>

                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      order.status === 'pending'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : order.status === 'in_progress'
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : order.status === 'ready'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-stone-500 text-white'
                    }`}
                  >
                    {order.status === 'pending' && 'ORDER'}
                    {order.status === 'in_progress' && 'IN PROGRESS'}
                    {order.status === 'ready' && 'DELIVERED'}
                    {order.status === 'completed' && 'COMPLETED'}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Procurement Tab */}
        {activeTab === 'procurement' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Procurement Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                <span>New Purchase Order</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Suppliers */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Truck className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Suppliers</h3>
                    <p className="text-sm text-stone-500">Manage vendor relationships</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                    <span>Fresh Foods Co.</span>
                    <span className="text-green-600 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                    <span>Beverage Distributors</span>
                    <span className="text-green-600 text-sm">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                    <span>Kitchen Supplies Ltd</span>
                    <span className="text-yellow-600 text-sm">Pending</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 dark:hover:">
                  View All Suppliers
                </button>
              </Card>

              {/* Purchase Orders */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Purchase Orders</h3>
                    <p className="text-sm text-stone-500">Track orders and deliveries</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                    <div>
                      <span className="font-medium">PO-2024-001</span>
                      <p className="text-sm text-stone-500">Fresh Foods Co.</p>
                    </div>
                    <span className="text-orange-600 text-sm">In Transit</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                    <div>
                      <span className="font-medium">PO-2024-002</span>
                      <p className="text-sm text-stone-500">Beverage Distributors</p>
                    </div>
                    <span className="text-green-600 text-sm">Delivered</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                    <div>
                      <span className="font-medium">PO-2024-003</span>
                      <p className="text-sm text-stone-500">Kitchen Supplies Ltd</p>
                    </div>
                    <span className="text-blue-600 text-sm">Pending</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 dark:hover:">
                  View All Orders
                </button>
              </Card>

              {/* Budget & Spending */}
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Budget Overview</h3>
                    <p className="text-sm text-stone-500">Monthly procurement budget</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Food & Beverages</span>
                      <span className="text-sm">75%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Kitchen Supplies</span>
                      <span className="text-sm">45%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Cleaning Supplies</span>
                      <span className="text-sm">30%</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Monthly Budget: {formatAmount(15000)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Spent: {formatAmount(8250)}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Inventory Management Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inventory Management</h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 dark:hover:">
                  <Package className="h-4 w-4" />
                  <span>Stock Take</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Inventory Stats */}
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-stone-500">Total Items</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-stone-500">Low Stock</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-stone-500">In Stock</p>
                    <p className="text-2xl font-bold">235</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-stone-500">Total Value</p>
                    <p className="text-2xl font-bold">{formatAmount(45230)}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Inventory Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Inventory Items</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 dark:hover:">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-700">
                      <th className="text-left py-3 px-4 font-medium">Item Name</th>
                      <th className="text-left py-3 px-4 font-medium">Category</th>
                      <th className="text-left py-3 px-4 font-medium">Current Stock</th>
                      <th className="text-left py-3 px-4 font-medium">Min Stock</th>
                      <th className="text-left py-3 px-4 font-medium">Unit Price</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Chicken Breast', category: 'Meat', stock: 25, minStock: 10, price: 8.50, status: 'In Stock' },
                      { name: 'French Fries', category: 'Frozen', stock: 5, minStock: 15, price: 3.20, status: 'Low Stock' },
                      { name: 'Coca Cola', category: 'Beverages', stock: 48, minStock: 20, price: 1.50, status: 'In Stock' },
                      { name: 'Lettuce', category: 'Vegetables', stock: 12, minStock: 8, price: 2.30, status: 'In Stock' },
                      { name: 'Cooking Oil', category: 'Pantry', stock: 3, minStock: 5, price: 12.00, status: 'Low Stock' }
                    ].map((item, index) => (
                      <tr key={index} className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">{item.stock}</td>
                        <td className="py-3 px-4">{item.minStock}</td>
                        <td className="py-3 px-4">{formatAmount(item.price)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.status === 'Low Stock'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-stone-500 hover:text-blue-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-stone-500 hover:text-green-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-stone-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Accounting Tab */}
        {activeTab === 'accounting' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Accounting & Finance</h2>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  <span>New Transaction</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 dark:hover:">
                  <FileText className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-stone-500">Today's Revenue</p>
                    <p className="text-2xl font-bold">{formatAmount(2847.50)}</p>
                    <p className="text-sm text-green-600">+12.5% from yesterday</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-stone-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatAmount(78420.30)}</p>
                    <p className="text-sm text-blue-600">+8.2% from last month</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <Calculator className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-stone-500">Total Expenses</p>
                    <p className="text-2xl font-bold">{formatAmount(23150.75)}</p>
                    <p className="text-sm text-red-600">+3.1% from last month</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-stone-500">Net Profit</p>
                    <p className="text-2xl font-bold">{formatAmount(55269.55)}</p>
                    <p className="text-sm text-green-600">+15.7% from last month</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {[
                    { type: 'Sale', description: 'Order #412 - Table 5', amount: 67.50, time: '2 minutes ago', positive: true },
                    { type: 'Expense', description: 'Fresh Foods Co. - Invoice #FF-2024-001', amount: -245.30, time: '1 hour ago', positive: false },
                    { type: 'Sale', description: 'Order #411 - Takeaway', amount: 23.75, time: '1 hour ago', positive: true },
                    { type: 'Expense', description: 'Utility Bill - Electricity', amount: -156.80, time: '2 hours ago', positive: false },
                    { type: 'Sale', description: 'Order #410 - Table 2', amount: 89.25, time: '3 hours ago', positive: true }
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-stone-50 dark: rounded">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-stone-500">{transaction.time}</p>
                      </div>
                      <span className={`font-semibold ${
                        transaction.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.positive ? '+' : ''}{formatAmount(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 dark:hover:">
                  View All Transactions
                </button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Payment Methods Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Cash Payments</span>
                      <span className="text-sm font-medium">{formatAmount(1247.30)} (44%)</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '44%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Card Payments</span>
                      <span className="text-sm font-medium">{formatAmount(1356.70)} (48%)</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Digital Wallet</span>
                      <span className="text-sm font-medium">{formatAmount(243.50)} (8%)</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 bg-white dark: border border-blue-200 dark:border-blue-700 rounded text-sm hover:bg-blue-50 dark:hover:bg-blue-800">
                      Daily Report
                    </button>
                    <button className="px-3 py-2 bg-white dark: border border-blue-200 dark:border-blue-700 rounded text-sm hover:bg-blue-50 dark:hover:bg-blue-800">
                      Tax Summary
                    </button>
                    <button className="px-3 py-2 bg-white dark: border border-blue-200 dark:border-blue-700 rounded text-sm hover:bg-blue-50 dark:hover:bg-blue-800">
                      Expense Report
                    </button>
                    <button className="px-3 py-2 bg-white dark: border border-blue-200 dark:border-blue-700 rounded text-sm hover:bg-blue-50 dark:hover:bg-blue-800">
                      P&L Statement
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      </div>
      
    </div>
  );
}
