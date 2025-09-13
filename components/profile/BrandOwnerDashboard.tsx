"use client";

import React from 'react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  FileText,
  ArrowUpRight,
  Receipt,
  Building2,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowDownRight,
  Clock,
  Wallet,
  Store,
  MapPin,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Phone,
  Save
} from 'lucide-react';
import BrandWalletWithLocalCurrency from '@/components/wallet/BrandWalletWithLocalCurrency';
import SolanaTransactions from '@/components/wallet/SolanaTransactions';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Id } from '@/convex/_generated/dataModel';
import FranchisesListView from '@/components/franchise/FranchisesListView';
import FranchiseRequestsTab from '@/components/franchise/FranchiseRequestsTab';
import TeamsTab from '@/components/teams/TeamsTab';

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
  owner_id: Id<"users">;
  createdAt: number;
  updatedAt: number;
  costPerArea?: number;
  min_area?: number;
  serviceable_countries?: string[];
  currency?: string;
}

interface Franchise {
  _id: Id<"franchise">;
  brandId: Id<"brands">;
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
  slug?: string;
}



interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'brand_manager' | 'franchise_manager' | 'cashier';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: number;
  lastActive: number;
  permissions: string[];
}

interface BrandSettings {
  general: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
  };
  privacy: {
    publicProfile: boolean;
    showEarnings: boolean;
    showFranchiseCount: boolean;
    allowDirectContact: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    apiAccess: boolean;
    dataExport: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
}

interface BrandOwnerDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convexUser: any;
  business: Business;
  franchises: Franchise[];
  brandSlug: string;
}

// Mock data generators for brand owner
const generateMockEarnings = (franchises: Franchise[]) => {
  return franchises.map((franchise, index) => ({
    id: franchise._id,
    franchiseId: franchise._id,
    month: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
    earnings: Math.floor(franchise.totalInvestment * 0.08 * (0.8 + Math.random() * 0.4)),
    totalInvestment: franchise.totalInvestment,
    status: Math.random() > 0.1 ? 'received' : 'pending'
  }));
};

const generateMockContracts = (franchises: Franchise[]) => {
  return franchises.map((franchise) => ({
    id: franchise._id,
    franchiseId: franchise._id,
    contractAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
    tokenId: Math.floor(Math.random() * 10000),
    totalShares: franchise.totalShares,
    selectedShares: franchise.selectedShares,
    createdDate: franchise.createdAt,
    status: 'active',
    blockchainNetwork: 'Solana',
    transactionHash: `${Math.random().toString(16).substring(2, 66)}`
  }));
};

const generateMockInvoices = (franchises: Franchise[]) => {
  const invoices = [];
  for (const franchise of franchises) {
    // Franchise setup invoice
    invoices.push({
      id: `inv-${franchise._id}-setup`,
      franchiseId: franchise._id,
      type: 'setup',
      amount: franchise.totalInvestment * 0.05, // 5% setup fee
      date: franchise.createdAt,
      description: `Franchise setup fee for ${franchise.building}`,
      status: 'paid',
      invoiceNumber: `SETUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });
    
    // Monthly management fees
    for (let i = 0; i < 3; i++) {
      const date = Date.now() - i * 30 * 24 * 60 * 60 * 1000;
      invoices.push({
        id: `inv-${franchise._id}-mgmt-${i}`,
        franchiseId: franchise._id,
        type: 'management',
        amount: Math.floor(franchise.totalInvestment * 0.02), // 2% monthly management fee
        date,
        description: `Monthly management fee`,
        status: i === 0 ? 'pending' : 'paid',
        invoiceNumber: `MGMT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
    }
  }
  return invoices.sort((a, b) => b.date - a.date);
};

const generateMockTeamMembers = (business: Business): TeamMember[] => {
  return [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      role: 'owner',
      status: 'active',
      joinedAt: business.createdAt,
      lastActive: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1-555-0124',
      role: 'brand_manager',
      status: 'active',
      joinedAt: business.createdAt + 7 * 24 * 60 * 60 * 1000, // 1 week after business creation
      lastActive: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      permissions: ['manage_franchises', 'view_analytics', 'manage_contracts']
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@example.com',
      phone: '+1-555-0125',
      role: 'franchise_manager',
      status: 'active',
      joinedAt: business.createdAt + 14 * 24 * 60 * 60 * 1000, // 2 weeks after
      lastActive: Date.now() - 4 * 60 * 60 * 1000, // 4 hours ago
      permissions: ['manage_specific_franchises', 'view_earnings', 'handle_operations']
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      phone: '+1-555-0126',
      role: 'cashier',
      status: 'pending',
      joinedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      lastActive: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
      permissions: ['handle_transactions', 'basic_reporting']
    }
  ];
};

const generateMockBrandSettings = (business: Business): BrandSettings => {
  return {
    general: {
      name: business.name,
      logo: business.logoUrl || '',
      address: '123 Business Street, City, State 12345',
      phone: '+1-555-0100',
      email: 'contact@' + business.slug + '.com',
      website: 'https://' + business.slug + '.com',
      description: 'A leading franchise business in the ' + (business.industry?.name || 'service') + ' industry.'
    },
    privacy: {
      publicProfile: true,
      showEarnings: false,
      showFranchiseCount: true,
      allowDirectContact: true
    },
    security: {
      twoFactorEnabled: false,
      loginNotifications: true,
      apiAccess: false,
      dataExport: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      monthlyReports: true
    }
  };
};

export default function BrandOwnerDashboard({ business, franchises, brandSlug }: BrandOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'franchises' | 'requests' | 'contracts' | 'invoices' | 'earnings' | 'payouts' | 'transactions' | 'teams' | 'settings'>('overview');
  // const router = useRouter();

  // Use global currency context for formatting
  const { formatAmount } = useGlobalCurrency();

  const mockEarnings = generateMockEarnings(franchises);
  const mockContracts = generateMockContracts(franchises);
  const mockInvoices = generateMockInvoices(franchises);
  const mockTeamMembers = generateMockTeamMembers(business);
  const mockBrandSettings = generateMockBrandSettings(business);

  // State for teams and settings
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(mockBrandSettings);
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Calculate totals
  const totalInvestment = franchises.reduce((sum, franchise) => sum + franchise.totalInvestment, 0);
  const totalFranchises = franchises.length;
  const totalShares = franchises.reduce((sum, franchise) => sum + franchise.totalShares, 0);
  const selectedShares = franchises.reduce((sum, franchise) => sum + franchise.selectedShares, 0);
  const totalEarnings = mockEarnings.reduce((sum, earning) => sum + earning.earnings, 0);

  const getFranchiseName = (franchiseId: Id<"franchise">) => {
    const franchise = franchises.find(f => f._id === franchiseId);
    return franchise?.building || 'Unknown Franchise';
  };

  const handleAddSOL = () => {
    alert('Add SOL clicked! You can get devnet SOL from the airdrop button or Solana faucet.');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'franchises', label: 'Franchises', icon: Store },
    { id: 'requests', label: 'Requests', icon: CheckCircle },
    { id: 'contracts', label: 'Contracts', icon: LinkIcon },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'payouts', label: 'Payouts', icon: Receipt },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 py-6">

      {/* Brand Wallet Card */}
      <BrandWalletWithLocalCurrency
        onAddMoney={handleAddSOL}
        className="w-full"
        business={business}
        brandSlug={business.slug || ''}
      />

      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
                      <p className="text-xl font-bold">{formatAmount(totalInvestment)}</p>
                    </div>
                    <Wallet className="h-6 w-6 text-blue-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Franchises</p>
                      <p className="text-xl font-bold">{totalFranchises}</p>
                    </div>
                    <Store className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Shares Sold</p>
                      <p className="text-xl font-bold">{selectedShares}/{totalShares}</p>
                    </div>
                    <Building2 className="h-6 w-6 text-purple-500" />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                      <p className="text-xl font-bold text-green-600">{formatAmount(totalEarnings)}</p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Recent Earnings</h3>
                  <div className="space-y-3">
                    {mockEarnings.slice(0, 3).map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{getFranchiseName(earning.franchiseId)}</p>
                          <p className="text-xs text-gray-500">{earning.month}</p>
                        </div>
                        <p className="font-semibold text-green-600">{formatAmount(earning.earnings)}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Active Franchises</h3>
                  <div className="space-y-3">
                    {franchises.slice(0, 3).map((franchise) => (
                      <div key={franchise._id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{franchise.building}</p>
                          <p className="text-xs text-gray-500">{franchise.locationAddress}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          franchise.status === 'Active' ? 'bg-green-100 text-green-800' :
                          franchise.status === 'Launching' ? 'bg-blue-100 text-blue-800' :
                          franchise.status === 'Funding' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {franchise.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'franchises' && (
                              <FranchisesListView franchises={franchises as any} brandSlug={brandSlug} />

          )}

          {activeTab === 'requests' && (
            <FranchiseRequestsTab business={business} />
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Blockchain Contracts</h3>
              <div className="space-y-4">
                {mockContracts.map((contract) => (
                  <Card key={contract.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{getFranchiseName(contract.franchiseId)}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {contract.status}
                        </span>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Token ID</p>
                        <p className="font-mono">#{contract.tokenId}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total Shares</p>
                        <p>{contract.totalShares}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Sold Shares</p>
                        <p>{contract.selectedShares}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Created Date</p>
                        <p>{new Date(contract.createdDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Invoice History</h3>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <Card key={invoice.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          invoice.type === 'setup'
                            ? 'bg-blue-100 dark:bg-blue-900/20'
                            : 'bg-green-100 dark:bg-green-900/20'
                        }`}>
                          {invoice.type === 'setup' ? (
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Receipt className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{getFranchiseName(invoice.franchiseId)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.description}</p>
                          <p className="text-xs text-gray-500">{invoice.invoiceNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +{formatAmount(invoice.amount)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(invoice.date).toLocaleDateString()}
                          </p>
                          {invoice.status === 'paid' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Earnings History</h3>
              <div className="space-y-4">
                {mockEarnings.map((earning) => (
                  <Card key={earning.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${earning.status === 'received' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                          {earning.status === 'received' ? (
                            <ArrowDownRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{getFranchiseName(earning.franchiseId)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {earning.month} • Revenue share
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatAmount(earning.earnings)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {((earning.earnings / earning.totalInvestment) * 100).toFixed(1)}% ROI
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payout History</h3>
              <div className="space-y-4">
                {mockInvoices.filter(inv => inv.type === 'management').map((payout) => (
                  <Card key={payout.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{getFranchiseName(payout.franchiseId)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{payout.description}</p>
                          <p className="text-xs text-gray-500">{new Date(payout.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{formatAmount(payout.amount)}</p>
                        <div className="flex items-center space-x-2">
                          {payout.status === 'paid' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-xs text-gray-500">{payout.status}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Wallet Transactions</h3>
              <SolanaTransactions />
            </div>
          )}

          {activeTab === 'teams' && (
            <TeamsTab businessId={business._id} />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Brand Settings</h3>
                <button
                  onClick={() => setIsEditingSettings(!isEditingSettings)}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2  hover:bg-primary/90 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>{isEditingSettings ? 'Cancel' : 'Edit Settings'}</span>
                </button>
              </div>

              {/* General Settings */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">General Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Name</label>
                    <input
                      type="text"
                      value={brandSettings.general.name}
                      disabled={!isEditingSettings}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, name: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300  disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <input
                      type="url"
                      value={brandSettings.general.website}
                      disabled={!isEditingSettings}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, website: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300  disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={brandSettings.general.email}
                      disabled={!isEditingSettings}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, email: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300  disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={brandSettings.general.phone}
                      disabled={!isEditingSettings}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, phone: e.target.value }
                      }))}
                      className="w-full p-2 border border-gray-300  disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <textarea
                      value={brandSettings.general.address}
                      disabled={!isEditingSettings}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, address: e.target.value }
                      }))}
                      rows={3}
                      className="w-full p-2 border border-gray-300  disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={brandSettings.general.description}
                      disabled={!isEditingSettings}
                      onChange={(e) => setBrandSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, description: e.target.value }
                      }))}
                      rows={3}
                      className="w-full p-2 border border-gray-300  disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:border-gray-600 dark:bg-gray-900"
                    />
                  </div>
                </div>
              </Card>

              {/* Privacy Settings */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">Privacy Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-gray-500">Allow others to view your brand profile</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, publicProfile: !prev.privacy.publicProfile }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.privacy.publicProfile ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.privacy.publicProfile ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Earnings</p>
                      <p className="text-sm text-gray-500">Display earnings information publicly</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showEarnings: !prev.privacy.showEarnings }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.privacy.showEarnings ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.privacy.showEarnings ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Franchise Count</p>
                      <p className="text-sm text-gray-500">Display number of franchises</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, showFranchiseCount: !prev.privacy.showFranchiseCount }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.privacy.showFranchiseCount ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.privacy.showFranchiseCount ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Security Settings */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">Security Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.security.twoFactorEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, loginNotifications: !prev.security.loginNotifications }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.security.loginNotifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.security.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Access</p>
                      <p className="text-sm text-gray-500">Allow third-party API access</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, apiAccess: !prev.security.apiAccess }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.security.apiAccess ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.security.apiAccess ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="p-6">
                <h4 className="text-lg font-medium mb-4">Notification Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: !prev.notifications.emailNotifications }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.notifications.emailNotifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via SMS</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, smsNotifications: !prev.notifications.smsNotifications }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.notifications.smsNotifications ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.notifications.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-gray-500">Receive weekly performance reports</p>
                    </div>
                    <button
                      onClick={() => setBrandSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, weeklyReports: !prev.notifications.weeklyReports }
                      }))}
                      disabled={!isEditingSettings}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        brandSettings.notifications.weeklyReports ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      } disabled:opacity-50`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        brandSettings.notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </Card>

              {isEditingSettings && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditingSettings(false)}
                    className="px-4 py-2 border border-gray-300  hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingSettings(false);
                      // Here you would typically save to backend
                      alert('Settings saved successfully!');
                    }}
                    className="flex items-center space-x-2 bg-primary text-white px-4 py-2  hover:bg-primary/90 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
