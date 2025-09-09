"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useCallback, useState } from 'react';

export const useSolana = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);

  // Get SOL balance
  const getSOLBalance = useCallback(async (): Promise<number> => {
    if (!publicKey) return 0;
    
    try {
      const lamports = await connection.getBalance(publicKey);
      return lamports / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return 0;
    }
  }, [publicKey, connection]);

  // Send SOL to another address
  const sendSOL = useCallback(async (
    toAddress: string,
    amount: number
  ): Promise<{ success: boolean; signature?: string; error?: string }> => {
    if (!publicKey || !connected) {
      return { success: false, error: 'Wallet not connected' };
    }

    setLoading(true);
    try {
      // Additional validation
      if (!sendTransaction) {
        throw new Error('Send transaction function not available');
      }

      const toPubkey = new PublicKey(toAddress);
      // Ensure integer lamports
      const lamports = Math.round(amount * LAMPORTS_PER_SOL);

      // Get recent blockhash for better transaction reliability
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPubkey,
          lamports: lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation with proper error handling
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      return { success: true, signature };
    } catch (error) {
      console.error('Error sending SOL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction, connection, connected]);

  // Request SOL airdrop (devnet only)
  const requestAirdrop = useCallback(async (
    amount: number = 1
  ): Promise<{ success: boolean; signature?: string; error?: string }> => {
    if (!publicKey) {
      return { success: false, error: 'Wallet not connected' };
    }

    // Only allow airdrops on devnet/testnet
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
    if (network === 'mainnet-beta') {
      return { success: false, error: 'Airdrops not available on mainnet' };
    }

    setLoading(true);
    try {
      const signature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      return { success: true, signature };
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Airdrop failed'
      };
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  // Get Solana explorer URL
  const getExplorerUrl = useCallback((signature: string) => {
    const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
    const baseUrl = network === 'mainnet-beta' 
      ? 'https://explorer.solana.com' 
      : `https://explorer.solana.com?cluster=${network}`;
    return `${baseUrl}/tx/${signature}`;
  }, []);

  return {
    // Wallet state
    publicKey,
    connected,
    
    // Balance operations
    getSOLBalance,
    
    // Transaction operations
    sendSOL,
    requestAirdrop,
    
    // Utility functions
    getExplorerUrl,
    
    // Loading state
    loading,
  };
};
