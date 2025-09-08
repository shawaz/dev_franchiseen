"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { CreditCard, Zap, Wallet, RefreshCw, PlusCircle, ArrowUpDown } from 'lucide-react';
import { useSolana } from '@/hooks/useSolana';
import { useModal } from '@/contexts/ModalContext';
import { formatSol } from '@/lib/coingecko';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { Button } from '../ui/button';
import MobileWalletConnect from './MobileWalletConnect';

// Extend Window interface for Phantom
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: any }>;
      };
    };
  }
}

interface SolanaWalletWithLocalCurrencyProps {
  onAddMoney?: () => void;
  className?: string;
  user?: {
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string;
  };
}

const SolanaWalletWithLocalCurrency: React.FC<SolanaWalletWithLocalCurrencyProps> = ({
  onAddMoney,
  className,
  user,
}) => {
  const { publicKey, connected, connect, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { getSOLBalance, requestAirdrop, loading: solanaLoading } = useSolana();
  const { openSendSOLModal } = useModal();

  // State
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  // Use global currency context
  const { selectedCurrency, convertFromSOL, formatAmount, refreshRates, loading: currencyLoading } = useGlobalCurrency();

  // Load SOL balance
  const refreshBalance = React.useCallback(async () => {
    if (connected && publicKey) {
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
    }
  }, [connected, publicKey, getSOLBalance]);

  // Load balance when wallet connects
  useEffect(() => {
    if (connected) {
      refreshBalance();
    } else {
      setBalance(0);
    }
  }, [connected, publicKey, refreshBalance]);

  // Handle airdrop
  const handleAirdrop = async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      await requestAirdrop(1); // Request 1 SOL
      await refreshBalance(); // Refresh balance after airdrop
    } catch (error) {
      console.error('Airdrop failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await Promise.all([refreshBalance(), refreshRates()]);
  };

  // Direct Phantom connection function
  const handleDirectConnect = async () => {
    setConnecting(true);
    try {
      // First try the wallet adapter
      if (connect) {
        await connect();
        return;
      }

      // Fallback to direct Phantom connection
      const phantomSolana = window.phantom?.solana;
      if (phantomSolana?.isPhantom) {
        await phantomSolana.connect({ onlyIfTrusted: false });
      } else {
        // Show wallet modal if Phantom not detected
        setVisible(true);
      }
    } catch (error) {
      console.error('Connection failed:', error);
      // Fallback to wallet modal
      setVisible(true);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div>
      {/* Business Header */}
      <section className="bg-white dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
        <div className="flex px-4 py-3 space-x-4 justify-between items-center">
          <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white font-semibold text-sm">
                    {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.firstName || 'User'}
                </h3>
                {connected && publicKey && (
                  <p className="text-xs font-mono">
                    {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <Button 
              size="sm"
            variant={"outline"} 
            className="text-sm "
            
            onClick={() => {
              if (publicKey) {
                navigator.clipboard.writeText(publicKey?.toString());
              }
              
            }}>
              Copy Address
            </Button>
        </div>
      </section>
      <div className={`bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden ${className}`}>
        {/* Header with Avatar and Controls */}
        <div className="p-3 sm:p-4">

          {/* Wallet Status */}
          {!connected ? (
            <div className="text-center py-4">
              <div className="bg-white/10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold mb-2">Connect Your Wallet</h4>
              <p className="text-yellow-100 text-xs mb-3">Connect your Phantom wallet to view your SOL balance</p>

              {/* Direct Connect Button */}
              <Button
                onClick={handleDirectConnect}
                disabled={connecting}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                {connecting ? 'Connecting...' : 'Connect Phantom Wallet'}
              </Button>

              <div className="mt-3 text-xs text-yellow-200">
                <p>Auto-detects Phantom wallet</p>
                <button
                  onClick={() => window.open('https://phantom.app/download', '_blank')}
                  className="text-yellow-100 hover:text-white underline mt-1"
                >
                  Don't have Phantom? Download here
                </button>
              </div>
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

              {/* Action Buttons - Compact */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onAddMoney || handleAirdrop}
                  disabled={loading || solanaLoading}
                  className="bg-white/20 text-white font-medium px-3 py-2 border border-white/30 hover:bg-white/30 transition flex items-center justify-center gap-1.5 text-xs disabled:opacity-50 "
                >
                  <ArrowUpDown className="h-3 w-3" />
                  {loading ? 'Loading...' : 'Deposit'}
                </button>

                <button
                  onClick={() => openSendSOLModal({
                    onSuccess: (signature) => {
                      console.log('SOL sent successfully:', signature);
                      refreshBalance();
                    }
                  })}
                  className="bg-white/20 text-white font-medium px-3 py-2 border border-white/30 hover:bg-white/30 transition flex items-center justify-center gap-1.5 text-xs "
                  disabled={!connected || balance === 0}
                >
                  <PlusCircle className="h-3 w-3" />
                  Buy
                </button>

                <button
                  onClick={() => openSendSOLModal({
                    onSuccess: (signature) => {
                      console.log('SOL sent successfully:', signature);
                      refreshBalance();
                    }
                  })}
                  className="bg-white/20 text-white font-medium px-3 py-2 border border-white/30 hover:bg-white/30 transition flex items-center justify-center gap-1.5 text-xs "
                  disabled={!connected || balance === 0}
                >
                  <CreditCard className="h-3 w-3" />
                  Transfer
                </button>
              </div>

              {/* Disconnect Option */}
              <div className="mt-3 text-center">
                <button
                  onClick={disconnect}
                  className="text-yellow-200 hover:text-white text-xs underline"
                >
                  Disconnect Wallet
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolanaWalletWithLocalCurrency;
