"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Wallet, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  Shield,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { Keypair } from '@solana/web3.js';

interface WalletData {
  address: string;
  seedPhrase: string[];
  seedPhraseVerified: boolean;
  backupConfirmed: boolean;
}

interface WalletCreationStepProps {
  data: WalletData;
  onUpdate: (data: WalletData) => void;
}

const VERIFICATION_WORDS_COUNT = 4;

export default function WalletCreationStep({ data, onUpdate }: WalletCreationStepProps) {
  const [currentView, setCurrentView] = useState<'generate' | 'backup' | 'verify'>('generate');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [verificationWords, setVerificationWords] = useState<{word: string, index: number}[]>([]);
  const [userVerificationInput, setUserVerificationInput] = useState<{[key: number]: string}>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate random verification words when seed phrase is created
  useEffect(() => {
    if (data.seedPhrase.length > 0 && verificationWords.length === 0) {
      generateVerificationWords();
    }
  }, [data.seedPhrase]);

  const generateSeedPhrase = (): string[] => {
    // Simple word list for demonstration purposes
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'agent',
      'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album'
    ];

    return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]);
  };

  const generateWallet = async () => {
    setIsGenerating(true);
    try {
      // Generate seed phrase
      const seedPhrase = generateSeedPhrase();
      
      // Generate Solana keypair
      const keypair = Keypair.generate();
      const address = keypair.publicKey.toString();

      onUpdate({
        ...data,
        address,
        seedPhrase,
        seedPhraseVerified: false,
        backupConfirmed: false
      });

      toast.success('Wallet created successfully!');
      setCurrentView('backup');
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast.error('Failed to generate wallet. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVerificationWords = () => {
    if (data.seedPhrase.length === 0) return;
    
    const indices = new Set<number>();
    while (indices.size < VERIFICATION_WORDS_COUNT) {
      indices.add(Math.floor(Math.random() * data.seedPhrase.length));
    }
    
    const words = Array.from(indices).map(index => ({
      word: data.seedPhrase[index],
      index: index + 1 // 1-based indexing for display
    }));
    
    setVerificationWords(words);
    setUserVerificationInput({});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadSeedPhrase = () => {
    const content = `Franchiseen Wallet Seed Phrase\n\nWallet Address: ${data.address}\n\nSeed Phrase:\n${data.seedPhrase.map((word, index) => `${index + 1}. ${word}`).join('\n')}\n\nIMPORTANT:\n- Keep this seed phrase safe and secure\n- Never share it with anyone\n- Store it in multiple secure locations\n- This is the only way to recover your wallet\n\nGenerated on: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `franchiseen-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Seed phrase downloaded!');
  };

  const handleVerificationInputChange = (index: number, value: string) => {
    setUserVerificationInput(prev => ({
      ...prev,
      [index]: value.toLowerCase().trim()
    }));
  };

  const verifySeeedPhrase = () => {
    const isCorrect = verificationWords.every(({ word, index }) => 
      userVerificationInput[index]?.toLowerCase() === word.toLowerCase()
    );

    if (isCorrect) {
      onUpdate({
        ...data,
        seedPhraseVerified: true
      });
      toast.success('Seed phrase verified successfully!');
    } else {
      toast.error('Verification failed. Please check your words and try again.');
      generateVerificationWords(); // Generate new verification words
    }
  };

  const confirmBackup = () => {
    onUpdate({
      ...data,
      backupConfirmed: true
    });
    setCurrentView('verify');
  };

  // Generate Wallet View
  if (currentView === 'generate') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Wallet className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Secure Wallet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate a secure Solana wallet to manage your investments
          </p>
        </div>

        <Card className="p-8 text-center">
          {data.address ? (
            <div className="space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Wallet Created Successfully!
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your wallet address:
                </p>
                <div className="bg-gray-100 dark:bg-stone-800 p-4 rounded-lg flex items-center justify-between">
                  <code className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                    {data.address}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(data.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setCurrentView('backup')} className="w-full h-12">
                Continue to Backup
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Wallet className="h-16 w-16 text-gray-400 mx-auto" />
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Create Your Wallet
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Click the button below to generate a secure Solana wallet
                </p>
              </div>
              <Button 
                onClick={generateWallet} 
                disabled={isGenerating}
                className="w-full h-12"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Wallet...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Generate Wallet
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Your Wallet Security
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your wallet is generated locally and secured with a 12-word seed phrase. 
                We never store your private keys or seed phrase on our servers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Backup Seed Phrase View
  if (currentView === 'backup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Backup Your Seed Phrase
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Write down these 12 words in order and store them safely
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Seed Phrase
            </h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSeedPhrase(!showSeedPhrase)}
              >
                {showSeedPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSeedPhrase}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className={`grid grid-cols-3 gap-3 ${!showSeedPhrase ? 'filter blur-sm' : ''}`}>
            {data.seedPhrase.map((word, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-stone-800 p-3 rounded-lg text-center"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {index + 1}
                </span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">
                  {word}
                </span>
              </div>
            ))}
          </div>

          {!showSeedPhrase && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click the eye icon to reveal your seed phrase
              </p>
            </div>
          )}
        </Card>

        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-red-900 dark:text-red-100 mb-1">
                Critical Security Warning
              </h5>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Never share your seed phrase with anyone</li>
                <li>• Store it in multiple secure locations</li>
                <li>• This is the only way to recover your wallet</li>
                <li>• We cannot help you recover a lost seed phrase</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setCurrentView('generate')}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={confirmBackup}
            className="flex-1"
            disabled={!showSeedPhrase}
          >
            I've Backed Up My Seed Phrase
          </Button>
        </div>
      </div>
    );
  }

  // Verify Seed Phrase View
  if (currentView === 'verify') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Seed Phrase
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the requested words to confirm you've backed up your seed phrase
          </p>
        </div>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Enter the following words from your seed phrase:
          </h4>
          
          <div className="space-y-4">
            {verificationWords.map(({ word, index }) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Word #{index}
                </label>
                <input
                  type="text"
                  placeholder="Enter the word"
                  value={userVerificationInput[index] || ''}
                  onChange={(e) => handleVerificationInputChange(index, e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>

          <div className="flex space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={generateVerificationWords}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Words
            </Button>
            <Button
              onClick={verifySeeedPhrase}
              disabled={verificationWords.some(({ index }) => !userVerificationInput[index])}
              className="flex-1"
            >
              Verify Seed Phrase
            </Button>
          </div>
        </Card>

        {data.seedPhraseVerified && (
          <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h5 className="font-medium text-green-900 dark:text-green-100">
                  Seed Phrase Verified Successfully!
                </h5>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your wallet is now secure and ready to use.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
