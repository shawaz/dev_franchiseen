"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Eye, 
  EyeOff,
  Wallet,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 2: Address Information
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  
  // Step 3: Document Upload
  documents: {
    identityProof?: File;
    addressProof?: File;
    incomeProof?: File;
  };
  
  // Step 4: Wallet Creation
  walletAddress: string;
  seedPhrase: string[];
  seedPhraseVerified: boolean;
}

// Add a type for the document upload status
interface DocumentUploadStatus {
  [key: string]: {
    status: 'idle' | 'uploading' | 'success' | 'error';
    progress?: number;
    url?: string;
    error?: string;
  };
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    documents: {},
    walletAddress: '',
    seedPhrase: [],
    seedPhraseVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhraseInput, setSeedPhraseInput] = useState<string[]>(Array(12).fill(''));
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentUploadStatus>({
    identityProof: { status: 'idle' },
    addressProof: { status: 'idle' },
    incomeProof: { status: 'idle' },
  });

  // Mutations
  const uploadDocument = useMutation(api.users.uploadDocument);
  const updateWallet = useMutation(api.users.updateWallet);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const totalSteps = 5;

  const generateSeedPhrase = () => {
    // Generate a 12-word seed phrase (simplified for demo)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual'
    ];
    
    const seedPhrase = Array.from({ length: 12 }, () => 
      words[Math.floor(Math.random() * words.length)]
    );
    
    setFormData(prev => ({ ...prev, seedPhrase }));
    return seedPhrase;
  };

  const generateWallet = () => {
    // Generate a mock Solana wallet address
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({ ...prev, walletAddress: address }));
    const seedPhrase = generateSeedPhrase();
    
    toast.success('Wallet created successfully!');
    return { address, seedPhrase };
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    if (!currentUserId) {
      toast.error('User not initialized');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you would upload the file to a storage service first
      // For now, we'll just use a mock URL
      const mockUrl = `https://storage.franchiseen.com/documents/${currentUserId}/${documentType}-${Date.now()}-${file.name}`;
      
      // Call the uploadDocument mutation
      const result = await uploadDocument({
        userId: currentUserId as Id<'users'>,
        documentType,
        documentUrl: mockUrl
      });
      
      if (result?.success) {
        setUploadedDocuments(prev => ({
          ...prev,
          [documentType]: {
            status: 'success' as const,
            url: mockUrl
          }
        }));
        
        toast.success(`${documentType} uploaded successfully!`);
      } else {
        throw new Error('Failed to save document reference');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload ${documentType}`);
    } finally {
      setLoading(false);
    }
  };

  const verifySeedPhrase = () => {
    const isCorrect = seedPhraseInput.every((word, index) => 
      word.toLowerCase().trim() === formData.seedPhrase[index]?.toLowerCase()
    );
    
    if (isCorrect) {
      setFormData(prev => ({ ...prev, seedPhraseVerified: true }));
      toast.success('Seed phrase verified successfully!');
      return true;
    } else {
      toast.error('Seed phrase verification failed. Please try again.');
      return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      toast.error('User not initialized');
      return;
    }

    if (!formData.seedPhraseVerified) {
      toast.error('Please verify your seed phrase first');
      return;
    }
    
    // Check if all required documents are uploaded
    const requiredDocuments = ['identityProof', 'addressProof', 'incomeProof'];
    const missingDocuments = requiredDocuments.filter(doc => !uploadedDocuments[doc]);
    
    if (missingDocuments.length > 0) {
      toast.error(`Please upload all required documents: ${missingDocuments.join(', ')}`);
      return;
    }
    
    setLoading(true);
    try {
      // Update wallet information
      const result = await updateWallet({
        userId: currentUserId as Id<'users'>,
        walletAddress: formData.walletAddress,
        seedPhrase: formData.seedPhrase
      });
      
      if (result?.success) {
        toast.success('Account created successfully! Please wait for admin verification.');
        onClose();
      } else {
        throw new Error('Failed to update wallet information');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 border-b">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Personal Information</h1>
                    <p className="text-muted-foreground">Tell us about yourself</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                        className="h-12"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Address Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Address Information</h1>
                    <p className="text-muted-foreground">Where are you located?</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Address</label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your full address"
                        className="h-12"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">City</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter your city"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">State</label>
                        <Input
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter your state"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Country</label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Enter your country"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">PIN Code</label>
                        <Input
                          value={formData.pincode}
                          onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="Enter your PIN code"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Document Upload</h1>
                    <p className="text-muted-foreground">Upload your verification documents</p>
                  </div>

                  <div className="space-y-6">
                    {/* Identity Proof */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Identity Proof</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a government-issued ID (Passport, Driver's License, etc.)
                      </p>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload('identityProof', file);
                          }}
                          className="hidden"
                          id="identity-upload"
                        />
                        <label htmlFor="identity-upload">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </span>
                          </Button>
                        </label>
                        {uploadedDocuments.identityProof && (
                          <span className="text-sm text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Address Proof */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Address Proof</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a utility bill, bank statement, or rental agreement
                      </p>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload('addressProof', file);
                          }}
                          className="hidden"
                          id="address-upload"
                        />
                        <label htmlFor="address-upload">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </span>
                          </Button>
                        </label>
                        {uploadedDocuments.addressProof && (
                          <span className="text-sm text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Income Proof */}
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Income Proof</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload salary slip, tax return, or bank statement
                      </p>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocumentUpload('incomeProof', file);
                          }}
                          className="hidden"
                          id="income-upload"
                        />
                        <label htmlFor="income-upload">
                          <Button variant="outline" className="cursor-pointer" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Document
                            </span>
                          </Button>
                        </label>
                        {uploadedDocuments.incomeProof && (
                          <span className="text-sm text-green-600 flex items-center">
                            <Check className="h-4 w-4 mr-1" />
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Wallet Creation */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Create Wallet</h1>
                    <p className="text-muted-foreground">Generate your Solana wallet</p>
                  </div>

                  <div className="space-y-6">
                    {!formData.walletAddress ? (
                      <div className="text-center space-y-4">
                        <Wallet className="h-16 w-16 mx-auto text-blue-600" />
                        <p className="text-muted-foreground">
                          Click the button below to generate a new Solana wallet
                        </p>
                        <Button onClick={generateWallet} className="bg-blue-600 hover:bg-blue-700">
                          <Wallet className="h-4 w-4 mr-2" />
                          Generate Wallet
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="font-medium text-green-800 mb-2">Wallet Created Successfully!</h3>
                          <div className="space-y-2">
                            <div>
                              <label className="text-sm font-medium text-green-700">Wallet Address:</label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-white p-2 rounded border flex-1 font-mono">
                                  {formData.walletAddress}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(formData.walletAddress)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-medium text-yellow-800 mb-2">Important: Save Your Seed Phrase</h3>
                              <p className="text-sm text-yellow-700 mb-3">
                                Your seed phrase is the only way to recover your wallet. Write it down and store it safely.
                              </p>
                              <div className="flex items-center gap-2 mb-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                                >
                                  {showSeedPhrase ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                  {showSeedPhrase ? 'Hide' : 'Show'} Seed Phrase
                                </Button>
                                {showSeedPhrase && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(formData.seedPhrase.join(' '))}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                )}
                              </div>
                              {showSeedPhrase && (
                                <div className="grid grid-cols-3 gap-2">
                                  {formData.seedPhrase.map((word, index) => (
                                    <div key={index} className="bg-white p-2 rounded border text-center">
                                      <span className="text-xs text-gray-500">{index + 1}.</span>
                                      <div className="font-mono text-sm">{word}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Seed Phrase Verification */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Verify Seed Phrase</h1>
                    <p className="text-muted-foreground">Enter your seed phrase to verify you've saved it</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, index) => (
                        <div key={index}>
                          <label className="text-xs text-gray-500 mb-1 block">{index + 1}.</label>
                          <Input
                            value={seedPhraseInput[index] || ''}
                            onChange={(e) => {
                              const newInput = [...seedPhraseInput];
                              newInput[index] = e.target.value;
                              setSeedPhraseInput(newInput);
                            }}
                            placeholder={`Word ${index + 1}`}
                            className="text-center"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={verifySeedPhrase}
                        disabled={seedPhraseInput.some(word => !word.trim())}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Verify Seed Phrase
                      </Button>
                    </div>

                    {formData.seedPhraseVerified && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-medium text-green-800">Seed Phrase Verified!</h3>
                        <p className="text-sm text-green-700">You can now complete your account creation.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
