"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { CreditCard, Zap, Wallet, RefreshCw, ArrowUpDown, Banknote, Coins, CircleArrowOutDownLeftIcon, PlusCircle } from 'lucide-react';
import { useSolana } from '@/hooks/useSolana';
import { useModal } from '@/contexts/ModalContext';
import { formatSol } from '@/lib/coingecko';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Money } from 'iconsax-reactjs';



const WalletWithLocalCurrency: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { getSOLBalance, requestAirdrop, loading: solanaLoading } = useSolana();
  const { openSendSOLModal } = useModal();

  // State
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use global currency context
  const { selectedCurrency, convertFromSOL, formatAmount, refreshRates, loading: currencyLoading } = useGlobalCurrency();

  // Fetch balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey]);

  const fetchBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const solBalance = await getSOLBalance();
      setBalance(solBalance);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshRates();
    if (connected && publicKey) {
      await fetchBalance();
    }
  };

  const handleAirdrop = async () => {
    if (!publicKey) return;

    try {
      await requestAirdrop(1);
      // Refresh balance after airdrop
      setTimeout(() => fetchBalance(), 2000);
    } catch (error) {
      console.error('Airdrop failed:', error);
    }
  };

  const handleSendSOL = () => {
    if (connected && publicKey) {
      openSendSOLModal();
    }
  };

  return (
    <div >
    
    <div className={`bg-gradient-to-br border border-gray-200 dark:border-stone-700 from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden`}>
      {/* Header with Brand Logo and Controls */}
      <div className="p-3 sm:p-4">
        

        {/* Wallet Status */}
        {!connected ? (
          <div className="text-center py-4">
            <div className="bg-white/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold mb-2">Connect Your Wallet</h4>
            <p className="text-purple-100 text-xs mb-3">Connect your Phantom wallet to manage brand finances</p>
            <button
              onClick={() => setVisible(true)}
              className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition text-sm"
            >
              Connect Wallet
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
                onClick={handleAirdrop}
                disabled={solanaLoading}
                className="bg-white/20  border border-white/30 p-2 hover:bg-white/30 transition flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {solanaLoading ? 'Loading...' : 'SWAP'}
                </span>
              </button>

              <button
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

export default WalletWithLocalCurrency;
