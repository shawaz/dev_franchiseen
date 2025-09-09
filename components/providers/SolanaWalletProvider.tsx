"use client";

import React, { useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import multiple wallet adapters
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: React.ReactNode;
}

// Helper function to check if wallet is installed
const checkWalletInstalled = (walletName: string): boolean => {
  switch (walletName) {
    case 'phantom':
      return !!(window as any).phantom?.solana?.isPhantom;
    case 'solflare':
      return !!(window as any).solflare?.isSolflare;
    case 'coinbase wallet':
      return !!(window as any).coinbaseSolana;
    case 'torus':
      return !!(window as any).torus;
    case 'ledger':
      return false; // Hardware wallet, not browser-based
    default:
      return false;
  }
};

// Helper function to get wallet deep links
const getWalletDeepLink = (walletName: string): string | null => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const dappUrl = encodeURIComponent(window.location.origin);

  if (isIOS) {
    switch (walletName) {
      case 'phantom':
        return `phantom://v1/connect?dapp_encryption_public_key=&cluster=devnet&app_url=${dappUrl}`;
      case 'solflare':
        return `solflare://v1/connect?dapp_url=${dappUrl}`;
      case 'coinbase wallet':
        return `cbwallet://dapp?url=${dappUrl}`;
      default:
        return null;
    }
  } else if (isAndroid) {
    switch (walletName) {
      case 'phantom':
        return `https://phantom.app/ul/v1/connect?dapp_encryption_public_key=&cluster=devnet&app_url=${dappUrl}`;
      case 'solflare':
        return `https://solflare.com/ul/v1/connect?dapp_url=${dappUrl}`;
      case 'coinbase wallet':
        return `https://go.cb-w.com/dapp?cb_url=${dappUrl}`;
      default:
        return null;
    }
  }

  return null;
};

// Helper function to get wallet app store links
const getWalletStoreLink = (walletName: string): string | null => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    switch (walletName) {
      case 'phantom':
        return 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977';
      case 'solflare':
        return 'https://apps.apple.com/app/solflare/id1580902717';
      case 'coinbase wallet':
        return 'https://apps.apple.com/app/coinbase-wallet/id1278383455';
      default:
        return null;
    }
  } else {
    switch (walletName) {
      case 'phantom':
        return 'https://play.google.com/store/apps/details?id=app.phantom';
      case 'solflare':
        return 'https://play.google.com/store/apps/details?id=com.solflare.mobile';
      case 'coinbase wallet':
        return 'https://play.google.com/store/apps/details?id=org.toshi';
      default:
        return null;
    }
  }
};

export default function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  // Get network from environment variables
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork) || WalletAdapterNetwork.Devnet;

  // Get RPC endpoint from environment or use default
  const endpoint = useMemo(() => {
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  // Detect if we're on mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Configure wallets with proper mobile deep link support
  const wallets = useMemo(() => {
    const walletAdapters = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ];

    // Enhanced mobile deep linking for multiple wallets
    if (isMobile) {
      walletAdapters.forEach((adapter) => {
        const originalConnect = adapter.connect.bind(adapter);
        adapter.connect = async () => {
          try {
            const walletName = adapter.name.toLowerCase();

            // Check if wallet is installed
            const isWalletInstalled = checkWalletInstalled(walletName);

            if (!isWalletInstalled) {
              // Store connection attempt for when user returns
              localStorage.setItem(`${walletName}_connection_attempt`, JSON.stringify({
                timestamp: Date.now(),
                url: window.location.href,
                dappUrl: window.location.origin,
                action: 'connect',
                walletName: walletName
              }));

              // Use proper deep link based on wallet type
              const deepLink = getWalletDeepLink(walletName);
              if (deepLink) {
                window.location.href = deepLink;

                // Fallback to app store after a delay
                setTimeout(() => {
                  const storeLink = getWalletStoreLink(walletName);
                  if (storeLink) {
                    window.location.href = storeLink;
                  }
                }, 2500);

                return;
              }
            }

            // If wallet is available or no deep link needed, use normal connection
            return await originalConnect();
          } catch (error) {
            console.error(`${adapter.name} connection error:`, error);
            throw error;
          }
        };
      });
    }

    return walletAdapters;
  }, [isMobile]);

  // Handle wallet errors
  const onError = useCallback((error: WalletError) => {
    console.error('Wallet error:', error);

    // Handle specific mobile connection errors
    if (error.message?.includes('User rejected') && isMobile) {
      // User might have cancelled in wallet app, clear all connection attempts
      const walletNames = ['phantom', 'solflare', 'coinbase wallet', 'torus', 'ledger'];
      walletNames.forEach(name => {
        localStorage.removeItem(`${name}_connection_attempt`);
      });
    }
  }, [isMobile]);

  // Smart auto-connect logic - only when appropriate
  const shouldAutoConnect = useMemo(() => {
    if (typeof window === 'undefined') return false;

    // Check if user is returning from any wallet app for connection
    const walletNames = ['phantom', 'solflare', 'coinbase wallet', 'torus', 'ledger'];

    for (const walletName of walletNames) {
      const connectionAttempt = localStorage.getItem(`${walletName}_connection_attempt`);
      if (connectionAttempt) {
        try {
          const attempt = JSON.parse(connectionAttempt);
          const timeDiff = Date.now() - attempt.timestamp;

          // If less than 10 minutes ago and it's a connection attempt, try to auto-connect
          if (timeDiff < 10 * 60 * 1000 && attempt.action === 'connect') {
            return true;
          } else {
            // Clean up old attempts
            localStorage.removeItem(`${walletName}_connection_attempt`);
          }
        } catch (e) {
          localStorage.removeItem(`${walletName}_connection_attempt`);
        }
      }
    }

    // Check if user is returning from transaction flow
    const transactionContext = localStorage.getItem('wallet_transaction_context');
    if (transactionContext) {
      try {
        const context = JSON.parse(transactionContext);
        const timeDiff = Date.now() - context.timestamp;

        // If less than 10 minutes ago, try to auto-connect for transaction
        if (timeDiff < 10 * 60 * 1000) {
          return true;
        } else {
          localStorage.removeItem('wallet_transaction_context');
        }
      } catch (e) {
        localStorage.removeItem('wallet_transaction_context');
      }
    }

    // Check if wallet was previously connected (desktop only)
    if (!isMobile) {
      const wasConnected = localStorage.getItem('wallet_connected');
      if (wasConnected) {
        try {
          const connection = JSON.parse(wasConnected);
          const timeDiff = Date.now() - connection.timestamp;

          // If connected within last 24 hours, auto-connect
          return timeDiff < 24 * 60 * 60 * 1000;
        } catch (e) {
          localStorage.removeItem('wallet_connected');
        }
      }
    }

    return false;
  }, [isMobile]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={shouldAutoConnect}
        onError={onError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
