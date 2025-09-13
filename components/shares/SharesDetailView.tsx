"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  DollarSign,
  FileText,
  ArrowUpRight,
  Calendar,
  Receipt,
  Wallet,
  Building2,
  ArrowDownRight,
  Clock,
  LinkIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

interface Business {
  _id: Id<"brands">;
  name: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
}

interface Share {
  _id: Id<"shares">;
  _creationTime: number;
  franchiseId: Id<"franchise">;
  userId: Id<"users">;
  userName: string;
  userImage: string;
  numberOfShares: number;
  purchaseDate: number;
  costPerShare: number;
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

interface SharesDetailViewProps {
  franchiseDetails: {
    share: Share;
    franchise: Franchise | null;
    business: Business | null;
  }[];
  userId: Id<"users">;
}

// Mock data for earnings, contracts, and invoices
const generateMockEarnings = (shares: Share[]) => {
  return shares.map((share, index) => ({
    id: share._id,
    franchiseId: share.franchiseId,
    month: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
    earnings: Math.floor(share.numberOfShares * share.costPerShare * 0.08 * (0.8 + Math.random() * 0.4)),
    dividendPerShare: Math.floor(share.costPerShare * 0.08 * (0.8 + Math.random() * 0.4)),
    totalShares: share.numberOfShares,
    status: Math.random() > 0.1 ? 'paid' : 'pending'
  }));
};

const generateMockContracts = (shares: Share[]) => {
  return shares.map((share) => ({
    id: share._id,
    franchiseId: share.franchiseId,
    contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
    tokenId: Math.floor(Math.random() * 10000),
    shareCount: share.numberOfShares,
    purchasePrice: share.costPerShare,
    purchaseDate: share.purchaseDate,
    status: 'active',
    blockchainNetwork: 'Solana',
    transactionHash: `${Math.random().toString(16).substr(2, 64)}`
  }));
};

const generateMockInvoices = (shares: Share[]) => {
  const invoices = [];
  for (const share of shares) {
    // Purchase invoice
    invoices.push({
      id: `inv-${share._id}-purchase`,
      franchiseId: share.franchiseId,
      type: 'purchase',
      amount: share.numberOfShares * share.costPerShare,
      date: share.purchaseDate,
      description: `Purchase of ${share.numberOfShares} shares`,
      status: 'paid',
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });
    
    // Monthly dividend invoices
    for (let i = 0; i < 3; i++) {
      const date = Date.now() - i * 30 * 24 * 60 * 60 * 1000;
      invoices.push({
        id: `inv-${share._id}-dividend-${i}`,
        franchiseId: share.franchiseId,
        type: 'dividend',
        amount: Math.floor(share.numberOfShares * share.costPerShare * 0.08 * (0.8 + Math.random() * 0.4)),
        date,
        description: `Monthly dividend payment`,
        status: i === 0 ? 'pending' : 'paid',
        invoiceNumber: `DIV-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });
    }
  }
  return invoices.sort((a, b) => b.date - a.date);
};

export default function SharesDetailView({ franchiseDetails }: SharesDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'contracts' | 'invoices'>('overview');
  
  // Use global currency context for formatting
  const { formatAmount } = useGlobalCurrency();

  const allShares = franchiseDetails.map(detail => detail.share);
  const mockEarnings = generateMockEarnings(allShares);
  const mockContracts = generateMockContracts(allShares);
  const mockInvoices = generateMockInvoices(allShares);

  // Calculate totals
  const totalInvestment = allShares.reduce((sum, share) => sum + (share.numberOfShares * share.costPerShare), 0);
  const totalShares = allShares.reduce((sum, share) => sum + share.numberOfShares, 0);
  const totalEarnings = mockEarnings.reduce((sum, earning) => sum + earning.earnings, 0);
  const monthlyEarnings = mockEarnings.filter(e => e.month === new Date().toISOString().slice(0, 7)).reduce((sum, earning) => sum + earning.earnings, 0);

  const getFranchiseName = (franchiseId: Id<"franchise">) => {
    const detail = franchiseDetails.find(d => d.franchise?._id === franchiseId);
    return detail?.business?.name || detail?.franchise?.building || 'Unknown Franchise';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'contracts', label: 'Contracts', icon: LinkIcon },
    { id: 'invoices', label: 'Invoices', icon: FileText }
  ];

  return (
    <div className="space-y-6 py-6 min-h-[60vh]">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
              <p className="text-2xl font-bold">{formatAmount(totalInvestment)}</p>
            </div>
            <Wallet className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Shares</p>
              <p className="text-2xl font-bold">{totalShares}</p>
            </div>
            <Building2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(totalEarnings)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(monthlyEarnings)}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
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
              <h3 className="text-lg font-semibold">Your Franchise Shares</h3>
              <div className="space-y-4">
                {franchiseDetails.map(({ share, franchise, business }) => (
                  <div key={share._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                        <Image
                          src={business?.logoUrl || "/default-logo.png"}
                          alt={business?.name || "Business Logo"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{business?.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{franchise?.building}</p>
                        <p className="text-xs text-gray-500">{franchise?.locationAddress}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{share.numberOfShares} shares</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatAmount(share.numberOfShares * share.costPerShare)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Earnings History</h3>
              <div className="space-y-4">
                {mockEarnings.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${earning.status === 'paid' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'}`}>
                        {earning.status === 'paid' ? (
                          <ArrowDownRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{getFranchiseName(earning.franchiseId)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {earning.month} • {earning.totalShares} shares
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatAmount(earning.earnings)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatAmount(earning.dividendPerShare)}/share
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Blockchain Contracts</h3>
              <div className="space-y-4">
                {mockContracts.map((contract) => (
                  <div key={contract.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{getFranchiseName(contract.franchiseId)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          contract.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
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
                        <p className="text-gray-600 dark:text-gray-400">Shares</p>
                        <p>{contract.shareCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Network</p>
                        <p>{contract.blockchainNetwork}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Purchase Date</p>
                        <p>{new Date(contract.purchaseDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 font-mono">
                        Contract: {contract.contractAddress.slice(0, 10)}...{contract.contractAddress.slice(-8)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Invoice History</h3>
              <div className="space-y-4">
                {mockInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        invoice.type === 'purchase' 
                          ? 'bg-blue-100 dark:bg-blue-900/20' 
                          : 'bg-green-100 dark:bg-green-900/20'
                      }`}>
                        {invoice.type === 'purchase' ? (
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
                      <p className={`font-semibold ${
                        invoice.type === 'dividend' ? 'text-green-600' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {invoice.type === 'dividend' ? '+' : ''}{formatAmount(invoice.amount)}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
