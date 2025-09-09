"use client";

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function WalletDebug() {
  const { connected, connecting, publicKey, wallet, wallets, select, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    if (!wallet) {
      setVisible(true);
    } else {
      wallet.adapter.connect();
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="font-bold mb-4">Wallet Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Connected:</strong> {connected ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Connecting:</strong> {connecting ? '🔄 Yes' : '⏸️ No'}
        </div>
        <div>
          <strong>Public Key:</strong> {publicKey ? publicKey.toString() : 'None'}
        </div>
        <div>
          <strong>Current Wallet:</strong> {wallet?.adapter?.name || 'None'}
        </div>
        <div>
          <strong>Available Wallets:</strong> {wallets.length}
          <ul className="ml-4 mt-1">
            {wallets.map((w) => (
              <li key={w.adapter.name} className="flex items-center gap-2">
                <span>{w.adapter.name}</span>
                <span className={w.readyState === 'Installed' ? 'text-green-600' : 'text-red-600'}>
                  ({w.readyState})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={handleConnect}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Connect Wallet
        </button>
        <button
          onClick={() => setVisible(true)}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Open Modal
        </button>
        {connected && (
          <button
            onClick={disconnect}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
