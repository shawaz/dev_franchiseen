"use client";

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Platform commission wallet address
export const PLATFORM_COMMISSION_WALLET = "AWKkqeEFHsC8LqPcYAf1ivWkAwji2zZmiPWvpXacCNtn";
export const COMMISSION_RATE = 0.02; // 2%

export interface TransactionWithCommission {
  originalAmount: number; // in SOL
  commissionAmount: number; // in SOL
  netAmount: number; // in SOL
  platformWallet: string;
}

export interface SolanaTransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  commission: TransactionWithCommission;
}

/**
 * Calculate commission for a transaction
 */
export function calculateCommission(amount: number): TransactionWithCommission {
  const commissionAmount = amount * COMMISSION_RATE;
  const netAmount = amount - commissionAmount;
  
  return {
    originalAmount: amount,
    commissionAmount,
    netAmount,
    platformWallet: PLATFORM_COMMISSION_WALLET,
  };
}

/**
 * Create a Solana transaction with automatic commission deduction
 * This creates a transaction that sends the net amount to the recipient
 * and the commission to the platform wallet
 */
export async function createTransactionWithCommission(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number, // in SOL
  recentBlockhash: string
): Promise<Transaction> {
  const commission = calculateCommission(amount);
  
  // Convert SOL to lamports
  const netLamports = Math.floor(commission.netAmount * LAMPORTS_PER_SOL);
  const commissionLamports = Math.floor(commission.commissionAmount * LAMPORTS_PER_SOL);
  
  const transaction = new Transaction({
    recentBlockhash,
    feePayer: fromPubkey,
  });

  // Add instruction to send net amount to recipient
  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: netLamports,
    })
  );

  // Add instruction to send commission to platform wallet
  const platformPubkey = new PublicKey(PLATFORM_COMMISSION_WALLET);
  transaction.add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: platformPubkey,
      lamports: commissionLamports,
    })
  );

  return transaction;
}

/**
 * Validate wallet addresses
 */
export function validateWalletAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get transaction fee estimate
 */
export async function getTransactionFee(
  connection: Connection,
  transaction: Transaction
): Promise<number> {
  try {
    const fee = await connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );
    return fee?.value || 5000; // Default fallback fee in lamports
  } catch (error) {
    console.error('Error getting transaction fee:', error);
    return 5000; // Default fallback fee in lamports
  }
}

/**
 * Check if wallet has sufficient balance for transaction + commission + fees
 */
export async function checkSufficientBalance(
  connection: Connection,
  walletAddress: string,
  amount: number // in SOL
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    
    // Required amount includes original amount + estimated transaction fees
    const estimatedFees = 0.001; // ~0.001 SOL for transaction fees
    const required = amount + estimatedFees;
    
    return {
      sufficient: balanceInSol >= required,
      balance: balanceInSol,
      required,
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    return {
      sufficient: false,
      balance: 0,
      required: amount,
    };
  }
}

/**
 * Format SOL amount for display
 */
export function formatSOL(amount: number, decimals: number = 4): string {
  return amount.toFixed(decimals) + ' SOL';
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSOL(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Get platform commission info
 */
export function getPlatformCommissionInfo() {
  return {
    walletAddress: PLATFORM_COMMISSION_WALLET,
    commissionRate: COMMISSION_RATE,
    commissionPercentage: `${COMMISSION_RATE * 100}%`,
  };
}
