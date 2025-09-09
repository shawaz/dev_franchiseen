"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Plus,
  ChevronDown,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSolana } from '@/hooks/useSolana';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import WalletSelectionModal from './WalletSelectionModal';

interface MultiWalletCardProps {
  onAddMoney?: () => void;
  className?: string;
  user?: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
  };
}

const MultiWalletCard: React.FC<MultiWalletCardProps> = ({ 
  onAddMoney, 
  className = "",
  user 
}) => {
  const { 
    connected, 
    connecting, 
    disconnect, 
    publicKey, 
    wallet 
  } = useWallet();
  
  const { 
    getSOLBalance, 
    requestAirdrop, 
    getExplorerUrl, 
    loading: solanaLoading 
  } = useSolana();
  
  const { formatAmount, selectedCurrency } = useGlobalCurrency();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [airdropLoading, setAirdropLoading] = useState(false);

  // Fetch balance when connected
  const fetchBalance = useCallback(async () => {
    if (!connected || !publicKey) return;
    
    setBalanceLoading(true);
    try {
      const solBalance = await getSOLBalance();
      setBalance(solBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  }, [connected, publicKey, getSOLBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!connected) return;
    
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [connected, fetchBalance]);

  const handleCopyAddress = async () => {
    if (!publicKey) return;
    
    try {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleAirdrop = async () => {
    if (!connected) return;
    
    setAirdropLoading(true);
    try {
      const result = await requestAirdrop(1);
      if (result.success) {
        // Refresh balance after successful airdrop
        setTimeout(fetchBalance, 2000);
      } else {
        console.error('Airdrop failed:', result.error);
      }
    } catch (error) {
      console.error('Airdrop error:', error);
    } finally {
      setAirdropLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setBalance(0);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getWalletDisplayName = () => {
    return wallet?.adapter.name || 'Unknown Wallet';
  };

  // Convert SOL to local currency (approximate)
  const formatCurrencyAmount = (solAmount: number) => {
    // This is a simplified conversion - in a real app you'd want to fetch actual SOL price
    const solPriceUSD = 100; // Placeholder - should be fetched from an API
    const usdAmount = solAmount * solPriceUSD;
    
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: selectedCurrency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdAmount);
  };

  return (
    <>
      <Card className={`bg-gradient-to-br from-stone-700 to-yellow-600 text-white ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Solana Wallet</h3>
                <p className="text-yellow-100 text-sm">
                  {connected ? getWalletDisplayName() : 'Not Connected'}
                </p>
              </div>
            </div>
            
            {connected && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchBalance}
                  disabled={balanceLoading}
                  className="text-white hover:bg-white/10"
                >
                  <RefreshCw className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Wallet Status */}
          {!connected ? (
            <div className="text-center py-8">
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Connect Your Wallet</h4>
              <p className="text-yellow-100 text-sm mb-6">
                Connect your Solana wallet to manage your investments and view your balance
              </p>
              <Button
                onClick={() => setShowWalletModal(true)}
                disabled={connecting}
                className="bg-white text-stone-700 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-50 transition"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Balance Display */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold mb-1">
                    {balanceLoading ? (
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
                    ) : (
                      `${balance.toFixed(4)} SOL`
                    )}
                  </div>
                  <div className="text-yellow-100 text-sm">
                    ≈ {formatCurrencyAmount(balance)}
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-6">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-yellow-100 mb-1">Wallet Address</p>
                      <p className="font-mono text-sm">
                        {publicKey ? formatAddress(publicKey.toString()) : ''}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyAddress}
                        className="text-white hover:bg-white/10 p-2"
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => publicKey && window.open(getExplorerUrl(publicKey.toString()), '_blank')}
                        className="text-white hover:bg-white/10 p-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={onAddMoney || handleAirdrop}
                  disabled={airdropLoading || solanaLoading}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-white border-0"
                >
                  {airdropLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {onAddMoney ? 'Add Money' : 'Get Devnet SOL'}
                </Button>
                
                <Button
                  onClick={() => setShowWalletModal(true)}
                  variant="outline"
                  className="border-yellow-300/30 text-white hover:bg-yellow-500/10"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Switch Wallet
                </Button>
              </div>

              {/* Network Info */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-xs text-yellow-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Connected to Solana Devnet</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </>
  );
};

export default MultiWalletCard;
