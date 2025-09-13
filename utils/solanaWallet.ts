"use client";

import { Keypair } from '@solana/web3.js';

export interface SolanaWallet {
  publicKey: string;
}

/**
 * Generate a new Solana wallet (public key only for brand identification)
 */
export function generateSolanaWallet(): SolanaWallet {
  try {
    // Generate a random keypair
    const keypair = Keypair.generate();

    return {
      publicKey: keypair.publicKey.toString()
    };
  } catch (error) {
    console.error('Error generating Solana wallet:', error);
    throw new Error('Failed to generate Solana wallet');
  }
}



/**
 * Validate a Solana public key
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Solana addresses are base58 encoded and 32 bytes (44 characters)
    return address.length >= 32 && address.length <= 44;
  } catch {
    return false;
  }
}

/**
 * Generate a brand-specific wallet identifier
 */
export function generateBrandWalletId(brandSlug: string): string {
  return `brand_${brandSlug}_${Date.now()}`;
}
