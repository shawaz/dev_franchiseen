"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { generateSolanaWallet, type SolanaWallet } from '@/utils/solanaWallet';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function RegisterSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wallet, setWallet] = useState<SolanaWallet | null>(null);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [businessSlug, setBusinessSlug] = useState<string>('');
  const [businessId, setBusinessId] = useState<string>('');

  const updateWallet = useMutation(api.brands.updateWallet);
  const createOutlet = useMutation(api.brands.createOutlet);

  useEffect(() => {
    // Get business info from URL params
    const slug = searchParams.get('slug');
    const id = searchParams.get('brandId');

    if (!slug || !id) {
      router.push('/register');
      return;
    }

    setBusinessSlug(slug);
    setBusinessId(id);

    // Auto-generate wallet on page load with the actual values
    generateWalletWithParams(id, slug);
  }, [searchParams, router]);

  const generateWalletWithParams = async (businessId: string, businessSlug: string) => {
    console.log('🔧 Starting wallet generation...', { businessId, businessSlug });
    setIsGeneratingWallet(true);
    try {
      const newWallet = generateSolanaWallet();
      console.log('✅ Wallet generated:', { publicKey: newWallet.publicKey });
      setWallet(newWallet);

      // Update the business with the wallet address
      if (businessId) {
        console.log('🔄 Updating business with wallet address...');
        const result = await updateWallet({
          brandId: businessId as Id<"brands">,
          walletAddress: newWallet.publicKey,
        });
        console.log('✅ Wallet update result:', result);
      } else {
        console.error('❌ No businessId available for wallet update');
      }

      toast.success('Brand wallet created successfully!');
    } catch (error) {
      console.error('❌ Error generating wallet:', error);
      toast.error('Failed to generate wallet. Please try again.');
    } finally {
      setIsGeneratingWallet(false);
    }
  };

  const generateWallet = async () => {
    if (!businessId || !businessSlug) {
      console.error('❌ Missing businessId or businessSlug');
      return;
    }
    await generateWalletWithParams(businessId, businessSlug);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const proceedToDashboard = () => {
    router.push(`/${businessSlug}/account`);
  };

  if (isGeneratingWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Creating your brand wallet...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we generate your secure Solana wallet
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Brand Registered Successfully! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your brand <span className="font-semibold text-yellow-600">{businessSlug}</span> has been created with a dedicated Solana wallet
          </p>
        </motion.div>

        {/* Wallet Information */}
        {wallet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Your Brand's Solana Wallet
                </CardTitle>
                <CardDescription>
                  This wallet is dedicated to your brand and will be used for all blockchain transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono break-all">
                      {wallet.publicKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(wallet.publicKey, 'Wallet address')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    ℹ️ Brand Wallet Information
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• This wallet is dedicated to your brand</li>
                    <li>• Use it for all blockchain transactions</li>
                    <li>• The address is publicly visible</li>
                    <li>• You can receive payments to this address</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            onClick={proceedToDashboard}
            className="bg-yellow-600 text-white hover:bg-yellow-700 px-8 py-3 text-lg"
          >
            Continue to Brand Dashboard
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
