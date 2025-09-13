"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useConnection } from '@solana/wallet-adapter-react';
import { CreditCard, Wallet, ArrowUpDown, PlusCircle, Copy } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import { formatSol } from '@/lib/coingecko';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';

import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface Business {
  _id: string;
  name: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
  walletAddress?: string;
  slug?: string; // Make slug optional to match Convex schema
}

interface BrandWalletWithLocalCurrencyProps {
  onAddMoney?: () => void;
  className?: string;
  business: Business;
  brandSlug?: string;
}

const BrandWalletWithLocalCurrency: React.FC<BrandWalletWithLocalCurrencyProps> = ({
  onAddMoney,
  className,
  business,
  brandSlug,
}) => {
  const { connection } = useConnection();
  const { openSendSOLModal } = useModal();

  // Get business data with wallet info
  const slug = brandSlug || business.slug;
  const businessData = useQuery(api.brands.getBySlug, slug ? { slug } : "skip");

  // Also try to get by ID as fallback
  const businessDataById = useQuery(api.brands.getById,
    business._id ? { brandId: business._id as Id<"brands"> } : "skip"
  );

  // Use the most recent data available
  const currentBusinessData = businessData || businessDataById;

  // Debug logging
  console.log('BrandWallet Debug:', {
    slug,
    businessData: businessData ? {
      name: businessData.name,
      walletAddress: businessData.walletAddress,
      hasWallet: !!businessData.walletAddress
    } : 'loading...',
    businessDataById: businessDataById ? {
      name: businessDataById.name,
      walletAddress: businessDataById.walletAddress,
      hasWallet: !!businessDataById.walletAddress
    } : 'loading...',
    currentBusinessData: currentBusinessData ? {
      name: currentBusinessData.name,
      walletAddress: currentBusinessData.walletAddress,
      hasWallet: !!currentBusinessData.walletAddress
    } : 'loading...',
    business: {
      name: business.name,
      slug: business.slug,
      _id: business._id
    }
  });

  // State
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use global currency context
  const { selectedCurrency, convertFromSOL, formatAmount, refreshRates } = useGlobalCurrency();

  // Fetch balance when business data loads
  useEffect(() => {
    if (currentBusinessData?.walletAddress) {
      fetchBalance();
    }
  }, [currentBusinessData?.walletAddress]);

  const fetchBalance = async () => {
    if (!currentBusinessData?.walletAddress) return;

    setLoading(true);
    try {
      const publicKey = new PublicKey(currentBusinessData.walletAddress);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setBalance(solBalance);
      setLastUpdated(new Date());
      console.log('✅ Balance fetched successfully:', { solBalance, walletAddress: currentBusinessData.walletAddress });
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    await refreshRates();
    if (currentBusinessData?.walletAddress) {
      await fetchBalance();
    } else {
      console.log('⚠️ No wallet address available for refresh');
    }
  };

  const copyWalletAddress = () => {
    if (currentBusinessData?.walletAddress) {
      navigator.clipboard.writeText(currentBusinessData.walletAddress);
      toast.success('Wallet address copied to clipboard!');
    }
  };

  const handleSendSOL = () => {
    if (currentBusinessData?.walletAddress) {
      openSendSOLModal();
    }
  };

  return (
    <div >
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
         <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="w-10 h-10 rounded overflow-hidden bg-white/20 flex items-center justify-center">
              {business?.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt="Brand Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white font-semibold text-sm">
                  {business?.name?.charAt(0) || 'B'}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-md">
                {business?.name || 'Brand'}
              </h3>
              {currentBusinessData?.walletAddress && (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono">
                    {currentBusinessData.walletAddress.slice(0, 4)}...{currentBusinessData.walletAddress.slice(-4)}
                  </p>
                  <button
                    onClick={copyWalletAddress}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

      </div>
    <div className={`bg-gradient-to-br border border-gray-200 dark:border-stone-700 from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden ${className}`}>
      {/* Header with Brand Logo and Controls */}
      <div className="p-3 sm:p-4">
        

        {/* Wallet Status */}
        {!currentBusinessData ? (
          <div className="text-center py-4">
            <div className="bg-white/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold mb-2">Loading Business Data</h4>
            <p className="text-purple-100 text-xs mb-3">Fetching your brand information...</p>
          </div>
        ) : !currentBusinessData.walletAddress ? (
          <div className="text-center py-4">
            <div className="bg-white/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold mb-2">No Brand Wallet</h4>
            <p className="text-purple-100 text-xs mb-3">This brand doesn't have a wallet yet. Please contact support.</p>
            <button
              onClick={handleRefresh}
              className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition text-sm"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          <>
            {/* Balance Display - Split Layout */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                {/* SOL Balance - Left */}
                <div>
                  <div className="text-purple-100 text-xs mb-1">SOL Balance</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {loading ? '...' : formatSol(balance)}
                  </div>
                  {lastUpdated && (
                    <div className="text-purple-200 text-xs mt-1">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {/* Local Currency Balance - Right */}
                <div className="text-right">
                  <div className="text-purple-100 text-xs mb-1">
                    {selectedCurrency.toUpperCase()} Balance
                  </div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {loading ? '...' : formatAmount(balance)}
                  </div>
                  <div className="text-purple-200 text-xs mt-1">
                    {convertFromSOL(1).toFixed(2)} {selectedCurrency.toUpperCase()}/SOL
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {loading ? 'Loading...' : 'REFRESH'}
                </span>
              </button>

              <button
                onClick={onAddMoney}
                className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex justify-center items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="text-xs font-medium">BUY</span>
              </button>

              <button
                onClick={handleSendSOL}
                className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex justify-center items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-medium">PAY</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default BrandWalletWithLocalCurrency;
