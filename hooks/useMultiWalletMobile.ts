"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface WalletConnectionState {
  isMobile: boolean;
  isConnecting: boolean;
  connectionMethod: 'browser' | 'app' | 'auto' | null;
  lastConnectionAttempt: string | null;
  supportedWallets: string[];
}

interface WalletInstallationInfo {
  isInstalled: boolean;
  deepLinkUrl?: string;
  storeUrl?: string;
  supportsDeepLink: boolean;
}

export const useMultiWalletMobile = () => {
  const { wallets, select, connect, connected, connecting, wallet } = useWallet();
  
  const [state, setState] = useState<WalletConnectionState>({
    isMobile: false,
    isConnecting: false,
    connectionMethod: null,
    lastConnectionAttempt: null,
    supportedWallets: []
  });

  // Detect mobile device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const supportedWallets = wallets
      .filter(w => w.readyState !== 'Unsupported')
      .map(w => w.adapter.name);
    
    setState(prev => ({
      ...prev,
      isMobile,
      supportedWallets
    }));
  }, [wallets]);

  // Check if specific wallet is installed
  const checkWalletInstallation = useCallback((walletName: string): WalletInstallationInfo => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let isInstalled = false;
    let deepLinkUrl = '';
    let storeUrl = '';
    
    const dappUrl = encodeURIComponent(window.location.origin);
    
    switch (walletName.toLowerCase()) {
      case 'phantom':
        isInstalled = !!(window as any).phantom?.solana?.isPhantom;
        if (isIOS) {
          deepLinkUrl = `phantom://v1/connect?dapp_encryption_public_key=&cluster=devnet&app_url=${dappUrl}`;
          storeUrl = 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977';
        } else if (isAndroid) {
          deepLinkUrl = `https://phantom.app/ul/v1/connect?dapp_encryption_public_key=&cluster=devnet&app_url=${dappUrl}`;
          storeUrl = 'https://play.google.com/store/apps/details?id=app.phantom';
        }
        break;
        
      case 'solflare':
        isInstalled = !!(window as any).solflare?.isSolflare;
        if (isIOS) {
          deepLinkUrl = `solflare://v1/connect?dapp_url=${dappUrl}`;
          storeUrl = 'https://apps.apple.com/app/solflare/id1580902717';
        } else if (isAndroid) {
          deepLinkUrl = `https://solflare.com/ul/v1/connect?dapp_url=${dappUrl}`;
          storeUrl = 'https://play.google.com/store/apps/details?id=com.solflare.mobile';
        }
        break;
        

        
      case 'coinbase wallet':
        isInstalled = !!(window as any).coinbaseSolana;
        if (isIOS) {
          storeUrl = 'https://apps.apple.com/app/coinbase-wallet/id1278383455';
        } else if (isAndroid) {
          storeUrl = 'https://play.google.com/store/apps/details?id=org.toshi';
        }
        break;
        
      case 'torus':
        isInstalled = !!(window as any).torus;
        // Torus doesn't have mobile deep links, it's web-based
        break;

      case 'ledger':
        isInstalled = false; // Hardware wallet, requires USB connection
        storeUrl = 'https://ledger.com';
        break;
    }
    
    return {
      isInstalled,
      deepLinkUrl: deepLinkUrl || undefined,
      storeUrl: storeUrl || undefined,
      supportsDeepLink: !!deepLinkUrl
    };
  }, []);

  // Enhanced mobile connection with better error handling
  const connectMobileWallet = useCallback(async (
    walletName: string,
    method: 'browser' | 'app' | 'auto' = 'auto'
  ) => {
    setState(prev => ({ ...prev, isConnecting: true, connectionMethod: method }));

    try {
      const walletInfo = checkWalletInstallation(walletName);
      
      // Store connection attempt
      const connectionAttempt = {
        timestamp: Date.now(),
        url: window.location.href,
        dappUrl: window.location.origin,
        action: 'connect',
        walletName: walletName.toLowerCase()
      };
      localStorage.setItem(`${walletName.toLowerCase()}_connection_attempt`, JSON.stringify(connectionAttempt));

      if (method === 'auto') {
        // Auto-detect best method
        if (state.isMobile) {
          method = walletInfo.isInstalled ? 'browser' : 'app';
        } else {
          method = 'browser';
        }
      }

      setState(prev => ({ ...prev, connectionMethod: method, lastConnectionAttempt: walletName }));

      if (method === 'browser' && walletInfo.isInstalled) {
        // Try browser-based connection first
        const targetWallet = wallets.find(w => w.adapter.name === walletName);
        if (targetWallet) {
          select(targetWallet.adapter.name);
          await new Promise(resolve => setTimeout(resolve, 100));
          await connect();
          return { success: true };
        }
      }

      if (method === 'app' && state.isMobile && walletInfo.supportsDeepLink) {
        // Use deep link to open wallet app
        if (walletInfo.deepLinkUrl) {
          window.location.href = walletInfo.deepLinkUrl;
          
          // Fallback to app store after delay
          setTimeout(() => {
            if (walletInfo.storeUrl && !document.hidden) {
              window.location.href = walletInfo.storeUrl;
            }
          }, 3000);
          
          return { success: true, requiresAppReturn: true };
        }
      }

      // Fallback to standard wallet adapter connection
      const targetWallet = wallets.find(w => w.adapter.name === walletName);
      if (targetWallet) {
        select(targetWallet.adapter.name);
        await new Promise(resolve => setTimeout(resolve, 100));
        await connect();
        return { success: true };
      }

      throw new Error(`Wallet ${walletName} not found or not supported`);

    } catch (error) {
      console.error(`Mobile wallet connection failed for ${walletName}:`, error);
      
      // Clean up connection attempt on error
      localStorage.removeItem(`${walletName.toLowerCase()}_connection_attempt`);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [state.isMobile, wallets, select, connect, checkWalletInstallation]);

  // Get connection instructions for a specific wallet
  const getConnectionInstructions = useCallback((walletName: string) => {
    const walletInfo = checkWalletInstallation(walletName);
    
    if (!state.isMobile) {
      return {
        title: `Connect ${walletName}`,
        description: `Click to connect your ${walletName} browser extension`,
        action: 'Connect',
        method: 'browser' as const
      };
    }

    if (walletInfo.isInstalled) {
      return {
        title: `Connect ${walletName}`,
        description: `${walletName} is installed. Click to connect.`,
        action: 'Connect',
        method: 'browser' as const
      };
    }

    if (walletInfo.supportsDeepLink) {
      return {
        title: `Open ${walletName} App`,
        description: `This will open the ${walletName} app to connect your wallet`,
        action: 'Open App',
        method: 'app' as const
      };
    }

    return {
      title: `Install ${walletName}`,
      description: `Download ${walletName} from your device's app store`,
      action: 'Get Wallet',
      method: 'app' as const,
      requiresInstall: true
    };
  }, [state.isMobile, checkWalletInstallation]);

  // Check if user is returning from wallet app
  const checkReturnFromWallet = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const walletNames = ['phantom', 'solflare', 'coinbase wallet', 'torus', 'ledger'];
    
    for (const walletName of walletNames) {
      const connectionAttempt = localStorage.getItem(`${walletName}_connection_attempt`);
      if (connectionAttempt) {
        try {
          const attempt = JSON.parse(connectionAttempt);
          const timeDiff = Date.now() - attempt.timestamp;

          // If less than 10 minutes ago, user might be returning from wallet app
          if (timeDiff < 10 * 60 * 1000 && attempt.action === 'connect') {
            return { walletName, attempt };
          }
        } catch (e) {
          localStorage.removeItem(`${walletName}_connection_attempt`);
        }
      }
    }

    return false;
  }, []);

  return {
    // State
    ...state,
    connected,
    connecting: connecting || state.isConnecting,
    wallet,
    
    // Methods
    connectMobileWallet,
    checkWalletInstallation,
    getConnectionInstructions,
    checkReturnFromWallet,
    
    // Utilities
    supportedWallets: state.supportedWallets
  };
};
