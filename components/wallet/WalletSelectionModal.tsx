"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMultiWalletMobile } from '@/hooks/useMultiWalletMobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Wallet, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Wallet metadata with descriptions and properties
const WALLET_METADATA = {
  'Phantom': {
    description: 'A friendly Solana wallet built for DeFi & NFTs',
    website: 'https://phantom.app',
    mobile: true,
    popular: true,
    color: '#AB9FF2'
  },
  'Solflare': {
    description: 'Solflare is a secure, powerful, and easy to use wallet',
    website: 'https://solflare.com',
    mobile: true,
    popular: true,
    color: '#FC8D4D'
  },
  'Coinbase Wallet': {
    description: 'Coinbase Wallet extension',
    website: 'https://wallet.coinbase.com',
    mobile: true,
    popular: true,
    color: '#0052FF'
  },
  'Torus': {
    description: 'Open-source wallet infrastructure',
    website: 'https://tor.us',
    mobile: false,
    popular: false,
    color: '#0364FF'
  },
  'Ledger': {
    description: 'Hardware wallet support',
    website: 'https://ledger.com',
    mobile: false,
    popular: false,
    color: '#000000'
  }
};

// Component to render wallet icon with fallback
const WalletIcon: React.FC<{ walletName: string; size?: number }> = ({ walletName, size = 32 }) => {
  const metadata = WALLET_METADATA[walletName as keyof typeof WALLET_METADATA];
  const [imageError, setImageError] = useState(false);

  // Generate initials from wallet name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (imageError || !metadata) {
    return (
      <div
        className="flex items-center justify-center rounded-lg text-white font-semibold text-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: metadata?.color || '#6B7280'
        }}
      >
        {getInitials(walletName)}
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{ width: size, height: size, backgroundColor: metadata.color }}
    >
      <span className="text-white font-semibold text-sm">
        {getInitials(walletName)}
      </span>
    </div>
  );
};

const WalletSelectionModal: React.FC<WalletSelectionModalProps> = ({ isOpen, onClose }) => {
  const { wallets, connected, wallet } = useWallet();
  const {
    isMobile,
    connecting,
    connectMobileWallet,
    getConnectionInstructions,
    checkWalletInstallation
  } = useMultiWalletMobile();

  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  useEffect(() => {
    if (connected) {
      onClose();
    }
  }, [connected, onClose]);

  const handleWalletSelect = async (walletName: string) => {
    try {
      setConnectingWallet(walletName);

      const result = await connectMobileWallet(walletName, 'auto');

      if (!result.success && result.error) {
        console.error(`Failed to connect to ${walletName}:`, result.error);
        // Could show a toast notification here
      }

      // If requiresAppReturn is true, the user was redirected to the wallet app
      // The modal will close when they return and connection is established

    } catch (error) {
      console.error(`Failed to connect to ${walletName}:`, error);
    } finally {
      // Only clear connecting state if we're not waiting for app return
      setConnectingWallet(null);
    }
  };

  // Filter and sort wallets
  const availableWallets = wallets
    .filter(w => w.readyState !== 'Unsupported')
    .sort((a, b) => {
      const aMetadata = WALLET_METADATA[a.adapter.name as keyof typeof WALLET_METADATA];
      const bMetadata = WALLET_METADATA[b.adapter.name as keyof typeof WALLET_METADATA];
      
      // Sort by: popular first, then mobile-friendly, then alphabetical
      if (aMetadata?.popular && !bMetadata?.popular) return -1;
      if (!aMetadata?.popular && bMetadata?.popular) return 1;
      if (aMetadata?.mobile && !bMetadata?.mobile) return -1;
      if (!aMetadata?.mobile && bMetadata?.mobile) return 1;
      
      return a.adapter.name.localeCompare(b.adapter.name);
    });

  const getWalletStatus = (walletName: string) => {
    if (connected && wallet?.adapter.name === walletName) {
      return 'connected';
    }
    if (connecting && connectingWallet === walletName) {
      return 'connecting';
    }
    return 'disconnected';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Connect';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose a wallet to connect to this app
          </p>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {availableWallets.map((walletOption) => {
            const walletName = walletOption.adapter.name;
            const metadata = WALLET_METADATA[walletName as keyof typeof WALLET_METADATA];
            const status = getWalletStatus(walletName);
            const isDisabled = connecting && connectingWallet !== walletName;

            const walletInstallInfo = checkWalletInstallation(walletName);
            const instructions = getConnectionInstructions(walletName);

            return (
              <Card key={walletName} className="p-0 overflow-hidden">
                <Button
                  variant="ghost"
                  className="w-full h-auto p-4 justify-start hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  onClick={() => handleWalletSelect(walletName)}
                  disabled={isDisabled || status === 'connected'}
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* Wallet Icon */}
                    <WalletIcon walletName={walletName} size={40} />

                    {/* Wallet Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{walletName}</h3>
                        {metadata?.popular && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            Popular
                          </span>
                        )}
                        {!metadata?.mobile && isMobile && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                            Desktop Only
                          </span>
                        )}
                        {!walletInstallInfo.isInstalled && isMobile && (
                          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                            Not Installed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {instructions.description}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium">
                        {status === 'connected' ? 'Connected' :
                         status === 'connecting' ? 'Connecting...' :
                         instructions.action}
                      </span>
                    </div>
                  </div>
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Don't have a wallet?
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {isMobile 
                  ? "Download a wallet app from your device's app store to get started."
                  : "Install a browser extension or download a wallet app to get started."
                }
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://phantom.app', '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Phantom
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://solflare.com', '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get Solflare
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectionModal;
