"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { 
  calculateCommission, 
  PLATFORM_COMMISSION_WALLET, 
  COMMISSION_RATE,
  formatSOL 
} from '@/utils/solanaTransactions';
import { ArrowRight, Wallet, DollarSign, Info } from 'lucide-react';

interface TransactionWithCommissionProps {
  fromUserId?: string;
  toUserId?: string;
  businessId?: string;
  franchiseId?: string;
}

export default function TransactionWithCommission({
  fromUserId,
  toUserId,
  businessId,
  franchiseId,
}: TransactionWithCommissionProps) {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [toWallet, setToWallet] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const createTransaction = useMutation(api.transactions.createTransaction);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 4 decimal places
    if (/^\d*\.?\d{0,4}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  const commission = amount ? calculateCommission(parseFloat(amount)) : null;

  const handleCreateTransaction = async () => {
    if (!amount || !description || !toWallet) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createTransaction({
        type: 'payment',
        amount: amountNum,
        currency: 'SOL',
        fromUserId: fromUserId as any,
        toUserId: toUserId as any,
        brandId: businessId as any,
        franchiseId: franchiseId as any,
        toWalletAddress: toWallet,
        description,
        metadata: {
          createdVia: 'TransactionWithCommission',
          timestamp: Date.now(),
        },
      });

      toast.success('Transaction created successfully!');
      console.log('Transaction result:', result);
      
      // Reset form
      setAmount('');
      setDescription('');
      setToWallet('');
      
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Failed to create transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Create Transaction with Commission
        </h3>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount (SOL) *
            </label>
            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.0000"
              className="font-mono"
            />
          </div>

          {/* Recipient Wallet */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Recipient Wallet Address *
            </label>
            <Input
              type="text"
              value={toWallet}
              onChange={(e) => setToWallet(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="font-mono text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
            />
          </div>

          {/* Commission Breakdown */}
          {commission && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Transaction Breakdown
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span className="font-mono">{formatSOL(commission.originalAmount)}</span>
                </div>
                
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Platform Commission ({COMMISSION_RATE * 100}%):</span>
                  <span className="font-mono">-{formatSOL(commission.commissionAmount)}</span>
                </div>
                
                <hr className="border-blue-200 dark:border-blue-700" />
                
                <div className="flex justify-between font-medium">
                  <span>Net Amount to Recipient:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">
                    {formatSOL(commission.netAmount)}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Platform Info */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Platform Commission Info
            </h4>
            <div className="text-sm space-y-1">
              <p><strong>Commission Rate:</strong> {COMMISSION_RATE * 100}%</p>
              <p><strong>Platform Wallet:</strong></p>
              <p className="font-mono text-xs break-all bg-white dark:bg-gray-900 p-2 rounded">
                {PLATFORM_COMMISSION_WALLET}
              </p>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleCreateTransaction}
            disabled={!amount || !description || !toWallet || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                Create Transaction
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
