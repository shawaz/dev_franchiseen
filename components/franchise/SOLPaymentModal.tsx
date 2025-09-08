"use client";

import React, { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, Globe } from 'lucide-react';
import Image from 'next/image';
import { coinGeckoService, SUPPORTED_CURRENCIES, formatLocalCurrency } from '@/lib/coingecko';
import { useUser } from '@clerk/nextjs';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { useSolana } from '@/hooks/useSolana';
import { useFranchiseProgram } from '@/hooks/useFranchiseProgram';
import { useTransactionWallet } from '@/hooks/useTransactionWallet';
import { calculateAvailableShares, FIXED_USDT_PER_SHARE } from '@/lib/franchise-calculations';

interface FranchiseData {
  name: string;
  logo: string;
  address: string;
  totalShares: number;
  soldShares: number;
  costPerShare: number;
  franchiseId: string;
  totalInvestment?: number; // Add optional totalInvestment for calculation
}

interface SOLPaymentModalProps {
  onClose: () => void;
  franchiseData: FranchiseData;
  businessSlug?: string;
  onPaymentSuccess?: (contractDetails: any) => void;
}

const SOLPaymentModal = ({ onClose, franchiseData, businessSlug, onPaymentSuccess }: SOLPaymentModalProps) => {
  const [selectedShares, setSelectedShares] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Local currency state
  const [localCurrency, setLocalCurrency] = useState<string>('usd');
  const [localPrice, setLocalPrice] = useState<number>(0);

  // Calculate correct available shares using utility function
  const availableShares = franchiseData.totalInvestment
    ? calculateAvailableShares(franchiseData.totalInvestment, franchiseData.soldShares)
    : Math.max(0, franchiseData.totalShares - franchiseData.soldShares);
  const { user } = useUser();
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { getSOLBalance, sendSOL } = useSolana();
  const { investInFranchise } = useFranchiseProgram();
  const { executeTransaction } = useTransactionWallet();

  // Pricing calculations (in SOL as base currency)
  const costPerShareSOL = franchiseData.costPerShare; // Assuming costPerShare is already in SOL
  const subTotalSOL = selectedShares * costPerShareSOL;
  const serviceFeeSOL = subTotalSOL * 0.15; // 15% service fee
  const vatSOL = subTotalSOL * 0.05; // 5% VAT
  const totalAmountSOL = subTotalSOL + serviceFeeSOL + vatSOL;

  // Convert SOL to local currency for display
  const totalAmountLocal = totalAmountSOL * localPrice;

  // Load SOL price in local currency
  const refreshPrice = React.useCallback(async () => {
    try {
      const prices = await coinGeckoService.getSolPrices();
      const price = prices[localCurrency as keyof typeof prices];
      setLocalPrice(price || 0);
    } catch (error) {
      console.error('Error fetching SOL price:', error);
    }
  }, [localCurrency]);

  // Auto-detect local currency on mount
  useEffect(() => {
    const detectAndSetCurrency = async () => {
      try {
        const detectedCurrency = await coinGeckoService.detectLocalCurrency();
        setLocalCurrency(detectedCurrency);
      } catch {
        console.log('Using default currency (USD)');
      }
    };

    detectAndSetCurrency();
  }, []);

  // Load price when currency changes
  useEffect(() => {
    refreshPrice();
  }, [localCurrency, refreshPrice]);

  // Load SOL balance when modal opens
  useEffect(() => {
    if (connected) {
      const loadBalance = async () => {
        const solBalance = await getSOLBalance();
        setBalance(solBalance);
      };
      loadBalance();
    }
  }, [connected, getSOLBalance]);

  const handleSOLPayment = async () => {
    if (balance < totalAmountSOL) {
      toast.error(`Insufficient SOL balance. You need ${totalAmountSOL.toFixed(4)} SOL but have ${balance.toFixed(4)} SOL`);
      return;
    }

    setIsLoading(true);

    try {
      // Use the new transaction wallet approach
      await executeTransaction(
        async () => {
          // Company wallet address (replace with actual address)
          const companyWalletAddress = process.env.NEXT_PUBLIC_COMPANY_WALLET_ADDRESS ||
            '11111111111111111111111111111112'; // Placeholder

          // Send SOL to company wallet
          const result = await sendSOL(companyWalletAddress, totalAmountSOL);

          if (!result.success || !result.signature) {
            throw new Error(result.error || 'Payment failed');
          }

          // Payment successful, now create blockchain contract
          toast.success('Payment successful! Creating blockchain contract...');

          try {
            // Create investment contract on blockchain
            if (businessSlug && investInFranchise) {
              const contractTx = await investInFranchise(
                businessSlug,
                franchiseData.franchiseId,
                selectedShares
              );

              if (contractTx) {
                const contractDetails = {
                  paymentSignature: result.signature,
                  contractSignature: contractTx,
                  userEmail: user?.emailAddresses?.[0]?.emailAddress,
                  userWallet: publicKey?.toString(),
                  franchiseId: franchiseData.franchiseId,
                  businessSlug,
                  shares: selectedShares,
                  amountLocal: totalAmountLocal,
                  amountSOL: totalAmountSOL,
                  timestamp: new Date().toISOString(),
                  contractAddress: `${businessSlug}-${franchiseData.franchiseId}`,
                };

                // Save to database
                await fetch('/api/record-sol-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(contractDetails)
                });

                toast.success(`Investment contract created! You own ${selectedShares} shares.`);
                onPaymentSuccess?.(contractDetails);
                return contractDetails;
              }
            } else {
              // Fallback: just record payment without blockchain contract
              const paymentDetails = {
                transactionSignature: result.signature,
                userEmail: user?.emailAddresses?.[0]?.emailAddress,
                userWallet: publicKey?.toString(),
                franchiseId: franchiseData.franchiseId,
                shares: selectedShares,
                amountLocal: totalAmountLocal,
                amountSOL: totalAmountSOL,
                timestamp: new Date().toISOString(),
              };

              console.log('Payment successful:', paymentDetails);
              toast.success(`Payment successful! You purchased ${selectedShares} shares.`);
              return paymentDetails;
            }
          } catch (contractError) {
            console.error('Contract creation failed:', contractError);
            toast.error('Payment successful but contract creation failed. Please contact support.');
            throw contractError;
          }
        },
        {
          action: 'payment',
          amount: totalAmountSOL,
          description: `Purchase ${selectedShares} shares in ${franchiseData.name || 'franchise'}`
        }
      );

      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      // Error handling is done in executeTransaction
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Purchase Shares</h2>
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="relative">
              <select
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value)}
                className="bg-stone-100 dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg px-2 py-1 text-xs text-stone-900 dark:text-white appearance-none cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-600 transition"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code} className="text-gray-900 dark:text-white">
                    {currency.flag} {currency.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <Globe className="absolute right-1 top-1/2 transform -translate-y-1/2 h-3 w-3 pointer-events-none text-stone-500" />
            </div>

            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Franchise Info */}
        <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Image
              src={franchiseData.logo}
              alt={franchiseData.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-white">{franchiseData.name}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {availableShares} shares available
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!connected ? (
          <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              Please connect your Phantom wallet to proceed with SOL payment.
            </p>
            <button
              onClick={() => setVisible(true)}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Wallet Connected</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-green-600 dark:text-green-400">
                {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
              </p>
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                {balance.toFixed(4)} SOL
              </p>
            </div>
          </div>
        )}

        {/* Share Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Number of Shares
            </label>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {availableShares} available
            </span>
          </div>
          <input
            type="number"
            min="1"
            max={availableShares}
            value={selectedShares}
            onChange={(e) => setSelectedShares(Math.max(1, Math.min(availableShares, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
            placeholder={`Max: ${availableShares}`}
          />
        </div>

        {/* Payment Summary */}
        <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
          <h4 className="font-semibold text-stone-900 dark:text-white mb-3">Payment Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">
                {selectedShares} shares × {costPerShareSOL.toFixed(4)} SOL
              </span>
              <span className="text-stone-900 dark:text-white">{subTotalSOL.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Service Fee (15%)</span>
              <span className="text-stone-900 dark:text-white">{serviceFeeSOL.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">VAT (5%)</span>
              <span className="text-stone-900 dark:text-white">{vatSOL.toFixed(4)} SOL</span>
            </div>
            <hr className="border-stone-300 dark:border-stone-600" />
            <div className="flex justify-between font-semibold text-purple-600 dark:text-purple-400">
              <span>Total (SOL)</span>
              <span>{totalAmountSOL.toFixed(4)} SOL</span>
            </div>
            {localPrice > 0 && (
              <div className="flex justify-between text-sm text-stone-500 dark:text-stone-400">
                <span>≈ {formatLocalCurrency(totalAmountLocal, localCurrency)}</span>
                <span>(1 SOL = {formatLocalCurrency(localPrice, localCurrency)})</span>
              </div>
            )}
          </div>
        </div>

        {/* Insufficient Balance Warning */}
        {connected && balance < totalAmountSOL && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-medium">Insufficient SOL Balance</p>
              <p>You need {totalAmountSOL.toFixed(4)} SOL but have {balance.toFixed(4)} SOL</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSOLPayment}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || selectedShares < 1 || balance < totalAmountSOL}
          >
            {isLoading ? 'Processing...' :
             !connected ? 'Connect Wallet & Pay' :
             `Pay ${totalAmountSOL.toFixed(4)} SOL`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOLPaymentModal;
