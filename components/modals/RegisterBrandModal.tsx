"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Building, DollarSign, Globe, Users, Briefcase, MapPin, Wallet, Eye, EyeOff, Copy, RefreshCw, Upload, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Keypair } from '@solana/web3.js';

interface TypeformRegisterBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1: Brand Info
  brandName: string;
  brandSlug: string;
  brandLogo: string;
  industry: string;
  category: string;
  description: string;
  website: string;

  // Step 2: Countries & Legal Documents
  countries: string[];
  legalDocuments: {
    businessLicense: string;
    taxCertificate: string;
    incorporationCertificate: string;
    trademarkCertificate: string;
  };

  // Step 3: Franchise Investment
  costPerArea: number;
  minimumArea: number;
  totalInvestment: number;

  // Step 4: Support & Requirements (unchanged)
  supportProvided: string[];
  experienceRequired: boolean;
  minNetWorth: number;
  liquidCapital: number;
  franchiseFee: number;
  royaltyRate: number;
  marketingFee: number;

  // Wallet information
  walletAddress: string;
  privateKey: string;
  seedPhrase: string[];
  seedPhraseVerification: string[];
}

const TypeformRegisterBrandModal: React.FC<TypeformRegisterBrandModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    // Step 1: Brand Info
    brandName: '',
    brandSlug: '',
    brandLogo: '',
    industry: '',
    category: '',
    description: '',
    website: '',

    // Step 2: Countries & Legal Documents
    countries: [],
    legalDocuments: {
      businessLicense: '',
      taxCertificate: '',
      incorporationCertificate: '',
      trademarkCertificate: '',
    },

    // Step 3: Franchise Investment
    costPerArea: 100,
    minimumArea: 100,
    totalInvestment: 10000,

    // Step 4: Support & Requirements
    supportProvided: [],
    experienceRequired: false,
    minNetWorth: 150000,
    liquidCapital: 75000,
    franchiseFee: 25000,
    royaltyRate: 5,
    marketingFee: 2,

    // Wallet information
    walletAddress: '',
    privateKey: '',
    seedPhrase: [],
    seedPhraseVerification: [],
  });

  // Get industries and categories
  const industries = useQuery(api.industries.listIndustries, {}) || [];
  const categories = useQuery(
    api.categories.getByIndustry,
    formData.industry ? { industryId: formData.industry as Id<"industries"> } : "skip"
  ) || [];

  const createBusiness = useMutation(api.brands.create);

  // Wallet generation functions
  const generateSeedPhrase = (): string[] => {
    // Generate 12 random words for seed phrase
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
      'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien',
      'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always',
      'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
      'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety'
    ];

    const seedPhrase: string[] = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      seedPhrase.push(words[randomIndex]);
    }
    return seedPhrase;
  };

  const generateWalletFromSeed = (seedPhrase: string[]) => {
    try {
      // For demo purposes, generate a random keypair
      // In production, you'd derive from the actual seed phrase
      const keypair = Keypair.generate();
      return {
        publicKey: keypair.publicKey.toString(),
        privateKey: Array.from(keypair.secretKey).join(',')
      };
    } catch (error) {
      console.error('Error generating wallet:', error);
      return null;
    }
  };

  const steps = [
    {
      id: 'brand-info',
      title: 'Brand Information',
      subtitle: 'Brand logo, industry & category',
      icon: Building,
    },
    {
      id: 'countries-legal',
      title: 'Countries & Legal Documents',
      subtitle: 'Target markets and legal requirements',
      icon: Globe,
    },
    {
      id: 'franchise-investment',
      title: 'Franchise Investment',
      subtitle: 'Cost per area and investment calculation',
      icon: Calculator,
    },
    {
      id: 'support',
      title: 'Support & Requirements',
      subtitle: 'What you provide to franchisees',
      icon: Users,
    },
    {
      id: 'wallet',
      title: 'Jupiter Wallet Setup',
      subtitle: 'Create your business wallet',
      icon: Wallet,
    },
    {
      id: 'seed-verify',
      title: 'Verify Seed Phrase',
      subtitle: 'Confirm your seed phrase',
      icon: Check,
    },
  ];

  const supportOptions = [
    'Training Program',
    'Marketing Support',
    'Operations Manual',
    'Site Selection',
    'Equipment Sourcing',
    'Technology Systems',
    'Ongoing Support',
    'Financial Assistance',
  ];

  const countryOptions = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Japan', 'South Korea', 'Singapore', 'UAE', 'India', 'Brazil'
  ];

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when brand name changes
      if (field === 'brandName') {
        updated.brandSlug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const handleGenerateWallet = () => {
    const seedPhrase = generateSeedPhrase();
    const wallet = generateWalletFromSeed(seedPhrase);

    if (wallet) {
      setFormData(prev => ({
        ...prev,
        seedPhrase,
        walletAddress: wallet.publicKey,
        privateKey: wallet.privateKey,
        seedPhraseVerification: []
      }));
      toast.success('Wallet generated successfully!');
    } else {
      toast.error('Failed to generate wallet. Please try again.');
    }
  };

  const handleSeedPhraseVerification = (index: number, word: string) => {
    setFormData(prev => {
      const newVerification = [...prev.seedPhraseVerification];
      newVerification[index] = word;
      return {
        ...prev,
        seedPhraseVerification: newVerification
      };
    });
  };

  const isSeedPhraseValid = () => {
    if (formData.seedPhrase.length !== 12 || formData.seedPhraseVerification.length !== 3) {
      return false;
    }

    // Check 3 random words (indices 2, 5, 8)
    const indicesToCheck = [2, 5, 8];
    return indicesToCheck.every((index, verifyIndex) =>
      formData.seedPhraseVerification[verifyIndex] === formData.seedPhrase[index]
    );
  };

  // Calculate total investment based on cost per area and minimum area
  const calculateTotalInvestment = () => {
    return formData.costPerArea * formData.minimumArea;
  };

  // Update total investment when cost per area or minimum area changes
  useEffect(() => {
    const newTotal = calculateTotalInvestment();
    if (newTotal !== formData.totalInvestment) {
      setFormData(prev => ({
        ...prev,
        totalInvestment: newTotal
      }));
    }
  }, [formData.costPerArea, formData.minimumArea]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to register your brand');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBusiness({
        name: formData.brandName,
        slug: formData.brandSlug,
        logoUrl: '', // Will be added later
        industry_id: formData.industry,
        category_id: formData.category,
        costPerArea: formData.totalInvestment,
        min_area: 1000, // Default minimum area
        serviceable_countries: formData.countries,
        currency: 'AED', // Default currency
      });

      toast.success('Brand registered successfully!');
      onClose();
      router.push(`/${result.slug}/account`);
    } catch (error) {
      console.error('Error registering brand:', error);
      toast.error('Failed to register brand. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Brand Info
        return formData.brandName.trim() && formData.brandSlug.trim() && formData.industry && formData.category;
      case 1: // Countries & Legal Documents
        return formData.countries.length > 0;
      case 2: // Franchise Investment
        return formData.costPerArea > 0 && formData.minimumArea > 0;
      case 3: // Support
        return formData.supportProvided.length > 0;
      case 4: // Wallet
        return formData.walletAddress && formData.seedPhrase.length === 12;
      case 5: // Seed Verification
        return isSeedPhraseValid();
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="min-h-full bg-white dark:bg-stone-900">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-gray-200 dark:border-stone-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div>
                  {/* <h1 className="text-xl font-bold">Register Your Brand</h1> */}
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}: {steps[currentStep].subtitle}
                  </p>
                </div>
              </div>
              
             
            </div>
          </div>
           {/* Progress */}

              <div className="w-full bg-gray-200 dark:bg-stone-700 h-1">
        <div 
          className="bg-yellow-600 h-1 transition-all duration-300 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step Content */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    {/* Brand Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Logo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-stone-600 rounded-lg flex items-center justify-center">
                          {formData.brandLogo ? (
                            <img src={formData.brandLogo} alt="Brand Logo" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Upload className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <Button variant="outline" size="sm">
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 2MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Name *</label>
                      <Input
                        value={formData.brandName}
                        onChange={(e) => handleInputChange('brandName', e.target.value)}
                        placeholder="Enter your brand name"
                        className="text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Brand URL Slug *</label>
                      <Input
                        value={formData.brandSlug}
                        onChange={(e) => handleInputChange('brandSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="brand-url-slug"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This will be your brand's URL: franchiseen.com/{formData.brandSlug}
                      </p>
                    </div>

                    {/* Industry Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Industry *</label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800"
                      >
                        <option value="">Select Industry</option>
                        <option value="food-beverage">Food & Beverage</option>
                        <option value="retail">Retail</option>
                        <option value="services">Services</option>
                        <option value="health-fitness">Health & Fitness</option>
                        <option value="education">Education</option>
                        <option value="automotive">Automotive</option>
                        <option value="technology">Technology</option>
                        <option value="real-estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800"
                        disabled={!formData.industry}
                      >
                        <option value="">Select Category</option>
                        {formData.industry === 'food-beverage' && (
                          <>
                            <option value="restaurant">Restaurant</option>
                            <option value="cafe">Cafe</option>
                            <option value="fast-food">Fast Food</option>
                            <option value="bakery">Bakery</option>
                            <option value="juice-bar">Juice Bar</option>
                          </>
                        )}
                        {formData.industry === 'retail' && (
                          <>
                            <option value="clothing">Clothing</option>
                            <option value="electronics">Electronics</option>
                            <option value="convenience-store">Convenience Store</option>
                            <option value="specialty-retail">Specialty Retail</option>
                          </>
                        )}
                        {formData.industry === 'services' && (
                          <>
                            <option value="cleaning">Cleaning Services</option>
                            <option value="consulting">Consulting</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="personal-services">Personal Services</option>
                          </>
                        )}
                        {formData.industry === 'health-fitness' && (
                          <>
                            <option value="gym">Gym</option>
                            <option value="yoga-studio">Yoga Studio</option>
                            <option value="wellness">Wellness Center</option>
                          </>
                        )}
                        {!formData.industry && <option value="" disabled>Select an industry first</option>}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Description *</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your brand, what makes it unique, and why people should franchise with you..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Website (Optional)</label>
                      <Input
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourbrand.com"
                        type="url"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Countries Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Countries *</label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select the countries where you want to expand your franchise
                      </p>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-stone-600 rounded-lg p-3">
                        {[
                          'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France',
                          'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria',
                          'Sweden', 'Norway', 'Denmark', 'Finland', 'Japan', 'South Korea',
                          'Singapore', 'Hong Kong', 'UAE', 'Saudi Arabia', 'India', 'Brazil'
                        ].map((country) => (
                          <label key={country} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.countries.includes(country)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('countries', [...formData.countries, country]);
                                } else {
                                  handleInputChange('countries', formData.countries.filter(c => c !== country));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{country}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Legal Documents */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Legal Documents</label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload required legal documents for your franchise registration
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Business License</label>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Upload License
                            </Button>
                            {formData.legalDocuments.businessLicense && (
                              <span className="text-sm text-green-600">✓ Uploaded</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Tax Certificate</label>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Upload Certificate
                            </Button>
                            {formData.legalDocuments.taxCertificate && (
                              <span className="text-sm text-green-600">✓ Uploaded</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Incorporation Certificate</label>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Upload Certificate
                            </Button>
                            {formData.legalDocuments.incorporationCertificate && (
                              <span className="text-sm text-green-600">✓ Uploaded</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Trademark Certificate (Optional)</label>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Upload Certificate
                            </Button>
                            {formData.legalDocuments.trademarkCertificate && (
                              <span className="text-sm text-green-600">✓ Uploaded</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <Calculator className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                      <h3 className="text-lg font-semibold">Franchise Investment Calculation</h3>
                      <p className="text-sm text-muted-foreground">
                        Set your cost per area and minimum area requirements
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Cost Per Area (AED) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">AED</span>
                          <Input
                            type="number"
                            value={formData.costPerArea}
                            onChange={(e) => handleInputChange('costPerArea', parseInt(e.target.value) || 0)}
                            placeholder="100"
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Minimum Area (sq ft) *</label>
                        <Input
                          type="number"
                          value={formData.minimumArea}
                          onChange={(e) => handleInputChange('minimumArea', parseInt(e.target.value) || 0)}
                          placeholder="100"
                        />
                      </div>
                    </div>

                    {/* Investment Calculation Display */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                        Franchise Token Investment Calculation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Cost per sq ft:</span>
                          <span className="font-medium">${formData.costPerArea}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Minimum area:</span>
                          <span className="font-medium">{formData.minimumArea} sq ft</span>
                        </div>
                        <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Investment (3 years):</span>
                            <span className="text-blue-600 dark:text-blue-400">
                              ${formData.totalInvestment.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                          <strong>Note:</strong> This amount includes working capital, rent, salary, and maintenance for 3 years.
                          Franchisees will receive franchise tokens equivalent to this investment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-4">Support Provided to Franchisees *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {supportOptions.map((option) => (
                          <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-800">
                            <input
                              type="checkbox"
                              checked={formData.supportProvided.includes(option)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('supportProvided', [...formData.supportProvided, option]);
                                } else {
                                  handleInputChange('supportProvided', formData.supportProvided.filter(s => s !== option));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-4">Target Markets *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {countryOptions.map((country) => (
                          <label key={country} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-stone-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-800">
                            <input
                              type="checkbox"
                              checked={formData.countries.includes(country)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleInputChange('countries', [...formData.countries, country]);
                                } else {
                                  handleInputChange('countries', formData.countries.filter(c => c !== country));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{country}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Wallet className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                      <h3 className="text-xl font-semibold mb-2">Create Your Jupiter Wallet</h3>
                      <p className="text-muted-foreground mb-6">
                        Generate a secure wallet for your business transactions and franchise token management
                      </p>
                    </div>

                    {/* How It Works Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">How Jupiter Wallet Works</h4>
                      <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                          <div>
                            <strong>Secure Storage:</strong> Your wallet stores SOL (Solana) and franchise tokens securely on the blockchain
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                          <div>
                            <strong>Franchise Tokens:</strong> Issue tokens to franchisees representing their investment and ownership stake
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                          <div>
                            <strong>Revenue Distribution:</strong> Automatically distribute profits to token holders based on their stake
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                          <div>
                            <strong>Transparent Tracking:</strong> All transactions are recorded on the blockchain for complete transparency
                          </div>
                        </div>
                      </div>
                    </div>

                    {!formData.walletAddress ? (
                      <div className="text-center">
                        <Button
                          onClick={handleGenerateWallet}
                          className="flex items-center gap-2 mx-auto"
                          size="lg"
                        >
                          <RefreshCw className="h-5 w-5" />
                          Generate Wallet
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          This will create a new wallet with a unique seed phrase
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Wallet Generated Successfully!</h4>
                          <div className="space-y-2">
                            <div>
                              <label className="text-sm font-medium text-green-700 dark:text-green-300">Wallet Address:</label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 p-2 bg-white dark:bg-stone-800 rounded text-xs font-mono">
                                  {formData.walletAddress}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigator.clipboard.writeText(formData.walletAddress)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Your Seed Phrase</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                            Write down these 12 words in order. You'll need them to verify your wallet.
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {formData.seedPhrase.map((word, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-stone-800 rounded">
                                <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                                <span className="font-mono text-sm">{word}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Check className="h-16 w-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold mb-2">Verify Your Seed Phrase</h3>
                      <p className="text-muted-foreground mb-6">
                        Enter the requested words from your seed phrase to confirm you've saved it
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[2, 5, 8].map((wordIndex, verifyIndex) => (
                        <div key={wordIndex}>
                          <label className="block text-sm font-medium mb-2">
                            Word #{wordIndex + 1}
                          </label>
                          <Input
                            value={formData.seedPhraseVerification[verifyIndex] || ''}
                            onChange={(e) => handleSeedPhraseVerification(verifyIndex, e.target.value)}
                            placeholder={`Enter word #${wordIndex + 1}`}
                            className="font-mono"
                          />
                        </div>
                      ))}
                    </div>

                    {formData.seedPhraseVerification.length === 3 && (
                      <div className={`p-4 rounded-lg ${
                        isSeedPhraseValid()
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}>
                        <p className={`text-sm ${
                          isSeedPhraseValid()
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {isSeedPhraseValid()
                            ? '✓ Seed phrase verified successfully!'
                            : '✗ Incorrect words. Please check your seed phrase.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}


              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-stone-900 border-t border-gray-200 dark:border-stone-700 p-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? 'Registering...' : 'Register Brand'}
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypeformRegisterBrandModal;
