"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Upload,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Select, { MultiValue, StylesConfig, SingleValue } from 'react-select';
import countryList from 'react-select-country-list';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/lib/coingecko';
import { useUser } from "@clerk/nextjs";

import CountryDocumentsTable from '@/components/CountryDocumentsTable';
import ImageCropModal from '@/components/ImageCropModal';
import { waitForUploadcare } from '@/utils/uploadcare-test';
import { RegisterFormSkeleton } from '@/components/skeletons/FormSkeleton';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ImageUploadGrid } from '@/components/ui/ImageUploadGrid';
import { ProductServiceForm } from '@/components/ui/ProductServiceForm';

import { InvestmentCalculator } from '@/components/ui/InvestmentCalculator';

interface UploadcareWindow extends Window {
  uploadcare: {
    fileFrom: (type: string, file: File, options?: { publicKey: string; signature: string; expire: string }) => Promise<{ cdnUrl: string }>;
  };
}

interface Category {
  _id: string;
  name: string;
  industry_id: string;
}

interface CountryOption { label: string; value: string; }
interface IndustryOption { label: string; value: string; }
interface CategoryOption { label: string; value: string; industry_id: string; }

interface ProductService {
  id: string;
  name: string;
  description: string;
  photo: File | null;
  photoUrl: string;
  baseCost: number;
  margin: number;
  sellingPrice: number;
}

interface CountrySettings {
  operationScope: 'anywhere' | 'specific';
  specificLocations: Array<{
    city: string;
    district?: string;
  }>;
  franchiseFeeOverride?: number;
  setupCostOverride?: number;
  workingCapitalOverride?: number;
}

interface FormData {
  name: string;
  slug: string;
  logoUrl: string;
  industry_id: string;
  category_id: string;
  costPerShare: number; // Fixed at 1 USDT per share (internal calculation)
  costPerSqft: number; // Cost per square foot in local currency
  min_area: number;
  serviceable_countries: string[];
  currency: string;
  companyDocuments: File[];
  franchiseStartingBudget: number; // Changed from minTotalInvestment
  website: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  about: string;
  countryDocuments: {
    [countryCode: string]: {
      panCard: { file: File | null; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
      registrationCertificate: { file: File | null; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
      franchiseCertificate: { file: File | null; status: 'pending' | 'uploaded' | 'verified' | 'rejected' };
    }
  };
  // New Step 2: Financial Information
  minSquareFootage: number;
  franchiseFee: number;
  setupCost: number;
  threeYearWorkingCapital: number;
  costPerSquareFootOverride: boolean;
  // New Step 3: Enhanced Location Settings
  countrySettings: {
    [countryCode: string]: CountrySettings;
  };
  // New Step 4: Demo Franchise
  outletImages: Array<{
    id: string;
    file: File;
    url: string;
    order: number;
  }>;
  productsServices: ProductService[];
}

// Select styles for react-select with stone and yellow theme
const makeSelectStyles = <T, IsMulti extends boolean = false>(): StylesConfig<T, IsMulti> => ({
  control: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(245 245 244)', // stone-100
    borderColor: 'rgb(168 162 158)', // stone-400
    color: 'rgb(41 37 36)', // stone-800
    minHeight: '44px',
    '&:hover': {
      borderColor: 'rgb(202 138 4)', // yellow-600
    },
    '&:focus-within': {
      borderColor: 'rgb(202 138 4)', // yellow-600
      boxShadow: '0 0 0 1px rgb(202 138 4)',
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(245 245 244)', // stone-100
    border: '1px solid rgb(168 162 158)', // stone-400
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'rgb(202 138 4)' // yellow-600
      : state.isFocused
        ? 'rgb(231 229 228)' // stone-200
        : 'rgb(245 245 244)', // stone-100
    color: state.isSelected ? 'white' : 'rgb(41 37 36)', // stone-800
    '&:hover': {
      backgroundColor: 'rgb(231 229 228)', // stone-200
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'rgb(41 37 36)', // stone-800
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'rgb(231 229 228)', // stone-200
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'rgb(41 37 36)', // stone-800
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'rgb(120 113 108)', // stone-500
  }),
});

const selectStylesCountry = makeSelectStyles<CountryOption, true>();
const selectStylesIndustry = makeSelectStyles<IndustryOption, false>();
const selectStylesCategory = makeSelectStyles<CategoryOption, false>();

export default function RegisterBrandPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { selectedCurrency, currencies, exchangeRates, convertFromUSDT, convertToUSDT } = useGlobalCurrency();

  // Get current currency info with symbol
  const currentCurrency = currencies.find((c: { code: string }) => c.code === selectedCurrency) || currencies[0];
  const currentCurrencyDetails = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];
  const createBusiness = useMutation(api.brands.create);
  const createOutlet = useMutation(api.brands.createOutlet);
  const getUploadSignature = useAction(api.uploadcare.getUploadSignature);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countryOptions = countryList().getData();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    logoUrl: '',
    industry_id: '',
    category_id: '',
    costPerShare: 1, // Fixed at 1 USDT per share (internal)
    costPerSqft: 0, // User must enter cost per sqft in local currency
    min_area: 0, // User must enter minimum area
    serviceable_countries: [],
    currency: 'USD', // Default to USD
    companyDocuments: [],
    franchiseStartingBudget: 0,
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
    },
    about: '',
    countryDocuments: {},
    // New Step 2: Financial Information
    minSquareFootage: 0,
    franchiseFee: 0,
    setupCost: 0,
    threeYearWorkingCapital: 0,
    costPerSquareFootOverride: false,
    // New Step 3: Enhanced Location Settings
    countrySettings: {},
    // New Step 4: Demo Franchise
    outletImages: [],
    productsServices: [],
  });

  const industries = useQuery(api.industries.listIndustries, {}) || [];
  const categories = useQuery(
    api.categories.getByIndustry,
    selectedIndustry ? { industryId: selectedIndustry as any } : 'skip'
  ) as Category[] || [];
  // Slug availability check
  const existingWithSlug = useQuery(
    api.brands.getBySlug,
    formData.slug?.trim() ? { slug: formData.slug.trim() } : 'skip'
  );
  const isSlugTaken = !!existingWithSlug;

  const industryOptions: IndustryOption[] = industries.map((i: { _id: string; name: string }) => ({ label: i.name, value: i._id }));
  const categoryOptions: CategoryOption[] = categories.map((c: Category) => ({ label: c.name, value: c._id, industry_id: c.industry_id }));

  // Show loading skeleton while data is loading
  if (!isLoaded || industries === undefined) {
    return <RegisterFormSkeleton />;
  }



  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for original image
        toast.error('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Store the selected file and show crop modal
      setSelectedImageFile(file);
      setShowCropModal(true);
    }
  };

  // Handle cropped image from modal
  const handleCropComplete = (croppedImageFile: File) => {
    setLogoFile(croppedImageFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedImageFile);
    setSelectedImageFile(null);
  };

  // Handle crop modal close
  const handleCropModalClose = () => {
    setShowCropModal(false);
    setSelectedImageFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    // Clean up any object URLs from outlet images
    formData.outletImages.forEach(image => {
      URL.revokeObjectURL(image.url);
    });

    // Clean up any object URLs from product photos
    formData.productsServices.forEach(product => {
      if (product.photoUrl) {
        URL.revokeObjectURL(product.photoUrl);
      }
    });

    setFormData({
      name: '',
      slug: '',
      logoUrl: '',
      industry_id: '',
      category_id: '',
      costPerShare: 1, // Fixed at 1 USDT per share (internal)
      costPerSqft: 0, // User must enter cost per sqft
      min_area: 0, // User must enter minimum area
      serviceable_countries: [],
      currency: currentCurrency.code,
      companyDocuments: [],
      franchiseStartingBudget: 0,
      website: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
      },
      about: '',
      countryDocuments: {},
      // New Step 2: Financial Information
      minSquareFootage: 0,
      franchiseFee: 0,
      setupCost: 0,
      threeYearWorkingCapital: 0,
      costPerSquareFootOverride: false,
      // New Step 3: Enhanced Location Settings
      countrySettings: {},
      // New Step 4: Demo Franchise
      outletImages: [],
      productsServices: [],
    });
    setLogoFile(null);
    setLogoPreview(null);
    setShowCropModal(false);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      let processedValue: string | number = value;

      // Handle number fields
      if (name === 'costPerShare' || name === 'costPerSqft' || name === 'min_area') {
        // Convert to number, but handle empty strings gracefully
        processedValue = value === '' ? 0 : Number(value);
        // Ensure we don't get NaN
        if (isNaN(processedValue as number)) {
          processedValue = 0;
        }
      }

      const newData = {
        ...prev,
        [name]: processedValue,
      };

      // Auto-generate slug when business name changes (only if slug is empty or was auto-generated)
      if (name === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name))) {
        newData.slug = generateSlug(value);
      }

      // Calculate franchise starting budget and shares when cost per sqft or min area changes
      if (name === 'costPerSqft' || name === 'min_area') {
        const costPerSqftLocal = name === 'costPerSqft' ? (processedValue as number) : prev.costPerSqft;
        const minArea = name === 'min_area' ? (processedValue as number) : prev.min_area;

        if (costPerSqftLocal > 0 && minArea > 0) {
          // Calculate minimum budget based on area and cost per sqft in local currency
          // Cost per share is fixed at 1 USDT, but we work in local currency
          const totalInvestmentLocal = minArea * costPerSqftLocal; // Total investment in local currency
          const franchiseStartingBudget = totalInvestmentLocal; // Same as total investment in local currency

          newData.franchiseStartingBudget = franchiseStartingBudget;
        }
      }

      return newData;
    });
  };

  const handleCountryChange = (selected: MultiValue<CountryOption>) => {
    const selectedCountries = Array.from(new Set(selected.map((opt) => opt.value)));

    // Initialize country documents for new countries
    const newCountryDocuments = { ...formData.countryDocuments };
    const newCountrySettings = { ...formData.countrySettings };

    selectedCountries.forEach(countryCode => {
      if (!newCountryDocuments[countryCode]) {
        newCountryDocuments[countryCode] = {
          panCard: { file: null, status: 'pending' },
          registrationCertificate: { file: null, status: 'pending' },
          franchiseCertificate: { file: null, status: 'pending' },
        };
      }

      if (!newCountrySettings[countryCode]) {
        newCountrySettings[countryCode] = {
          operationScope: 'anywhere',
          specificLocations: [],
          franchiseFeeOverride: undefined,
          setupCostOverride: undefined,
          workingCapitalOverride: undefined,
        };
      }
    });

    // Remove documents and settings for unselected countries
    Object.keys(newCountryDocuments).forEach(countryCode => {
      if (!selectedCountries.includes(countryCode)) {
        delete newCountryDocuments[countryCode];
        delete newCountrySettings[countryCode];
      }
    });

    setFormData(prev => ({
      ...prev,
      serviceable_countries: selectedCountries,
      countryDocuments: newCountryDocuments,
      countrySettings: newCountrySettings
    }));
  };

  const handleIndustryChange = (selected: SingleValue<IndustryOption>) => {
    setSelectedIndustry(selected?.value || '');
    setFormData(prev => ({
      ...prev,
      industry_id: selected?.value || '',
      category_id: '' // Reset category when industry changes
    }));
  };

  const handleCategoryChange = (selected: SingleValue<CategoryOption>) => {
    setFormData(prev => ({
      ...prev,
      category_id: selected?.value || ''
    }));
  };

  // Handle social media input changes
  const handleSocialMediaChange = (platform: keyof FormData['socialMedia'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  // Handle country document upload
  const handleCountryDocumentChange = (countryCode: string, documentType: 'panCard' | 'registrationCertificate' | 'franchiseCertificate', file: File | null) => {
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (file && !file.type.includes('pdf') && !file.type.includes('image')) {
      toast.error('Please upload PDF or image files only');
      return;
    }

    setFormData(prev => ({
      ...prev,
      countryDocuments: {
        ...prev.countryDocuments,
        [countryCode]: {
          ...prev.countryDocuments[countryCode],
          [documentType]: {
            file,
            status: file ? 'uploaded' : 'pending'
          }
        }
      }
    }));
  };



  // Step navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step validation
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        const step1Valid = !!(formData.name.trim() && formData.slug.trim() && formData.industry_id && formData.category_id && logoFile && formData.about.trim() && !isSlugTaken);
        console.log('Step 1 validation:', {
          step1Valid,
          name: !!formData.name.trim(),
          slug: !!formData.slug.trim(),
          industry_id: !!formData.industry_id,
          category_id: !!formData.category_id,
          logoFile: !!logoFile,
          about: !!formData.about.trim(),
          isSlugTaken
        });
        return step1Valid;
      case 2:
        const step2Valid = !!(formData.minSquareFootage > 0 && formData.franchiseFee > 0 && formData.setupCost > 0 && formData.threeYearWorkingCapital > 0);
        console.log('Step 2 validation:', {
          step2Valid,
          minSquareFootage: formData.minSquareFootage,
          franchiseFee: formData.franchiseFee,
          setupCost: formData.setupCost,
          threeYearWorkingCapital: formData.threeYearWorkingCapital
        });
        return step2Valid;
      case 3:
        const hasAllCountryDocs = formData.serviceable_countries.every(country => {
          const countryDoc = formData.countryDocuments[country];
          return countryDoc?.registrationCertificate?.file !== null;
        });
        const step3Valid = !!(formData.serviceable_countries.length > 0 && hasAllCountryDocs);
        console.log('Step 3 validation:', {
          step3Valid,
          countriesCount: formData.serviceable_countries.length,
          countries: formData.serviceable_countries,
          hasAllCountryDocs,
          countryDocuments: Object.keys(formData.countryDocuments)
        });
        return step3Valid;
      case 4:
        const hasMinImages = formData.outletImages.length >= 3; // Reduced from 6 to 3 for easier testing
        const hasMinProducts = formData.productsServices.length >= 1; // Reduced from 3 to 1 for easier testing
        const allProductsValid = formData.productsServices.every(product => {
          const isValid = product.name.trim() &&
            product.description.trim() &&
            product.photo &&
            product.baseCost > 0 &&
            product.margin >= 0;

          // Debug each product individually
          if (!isValid) {
            console.log('Invalid product found:', {
              id: product.id,
              name: product.name,
              nameValid: !!product.name.trim(),
              description: product.description,
              descriptionValid: !!product.description.trim(),
              photo: product.photo,
              photoValid: !!product.photo,
              baseCost: product.baseCost,
              baseCostValid: product.baseCost > 0,
              margin: product.margin,
              marginValid: product.margin >= 0
            });
          }

          return isValid;
        });

        // Debug logging
        console.log('Step 4 validation:', {
          hasMinImages,
          hasMinProducts,
          allProductsValid,
          outletImagesCount: formData.outletImages.length,
          productsCount: formData.productsServices.length,
          products: formData.productsServices.map(p => ({
            name: p.name,
            description: p.description,
            hasPhoto: !!p.photo,
            baseCost: p.baseCost,
            margin: p.margin
          })),
          finalResult: hasMinImages && hasMinProducts && allProductsValid
        });

        return hasMinImages && hasMinProducts && allProductsValid;
      default:
        return false;
    }
  };

  // Prevent form submission on Enter key unless on final step
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && currentStep < 4) {
      e.preventDefault();
      // If on a valid step, move to next step instead
      if (isStepValid(currentStep)) {
        nextStep();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Current step:', currentStep);
    console.log('Is signed in:', isSignedIn);
    console.log('Step 4 valid:', isStepValid(4));

    // Only allow submission on step 4
    if (currentStep !== 4) {
      console.log('Form submission blocked - not on step 4');
      return;
    }

    if (!isSignedIn) {
      console.log('Form submission blocked - not signed in');
      toast.error('Please sign in to create a business');
      return;
    }

    // Validate all fields with debugging
    console.log('Starting field validation...');

    if (!formData.name.trim()) {
      console.log('Validation failed: Business name missing');
      toast.error('Business name is required');
      return;
    }
    if (!formData.slug.trim()) {
      console.log('Validation failed: Slug missing');
      toast.error('Business URL slug is required');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      console.log('Validation failed: Invalid slug format:', formData.slug);
      toast.error('URL slug can only contain lowercase letters, numbers, and hyphens');
      return;
    }
    if (!logoFile) {
      console.log('Validation failed: Logo file missing');
      toast.error('Business logo is required');
      return;
    }
    if (!formData.industry_id) {
      console.log('Validation failed: Industry missing');
      toast.error('Industry is required');
      return;
    }
    if (!formData.category_id) {
      console.log('Validation failed: Category missing');
      toast.error('Category is required');
      return;
    }
    if (formData.costPerSqft <= 0) {
      console.log('Validation failed: Cost per sqft invalid:', formData.costPerSqft);
      toast.error('Cost per sqft must be greater than 0');
      return;
    }
    if (formData.minSquareFootage <= 0) {
      console.log('Validation failed: Min square footage invalid:', formData.minSquareFootage);
      toast.error('Minimum square footage must be greater than 0');
      return;
    }
    if (formData.serviceable_countries.length === 0) {
      toast.error('At least one country must be selected');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Register] Proceeding to logo upload. hasLogoFile:', !!logoFile);
      // Upload logo to Uploadcare
      let logoUrl = '';
      if (logoFile) {
        try {
          // Wait for Uploadcare to be ready
          const isUploadcareReady = await waitForUploadcare(5000);
          if (!isUploadcareReady) {
            throw new Error('Uploadcare script failed to load. Please refresh the page and try again.');
          }

          const { publicKey, signature, expire } = await getUploadSignature();
          console.log('[Register] Received upload signature:', {
            publicKey,
            expire,
            hasSignature: !!signature,
            expireType: typeof expire
          });

          const uploadcareWindow = window as unknown as UploadcareWindow;
          console.log('[Register] Checking Uploadcare availability:', {
            hasUploadcare: !!uploadcareWindow.uploadcare,
            windowKeys: Object.keys(window).filter(k => k.includes('upload')),
            uploadcareType: typeof uploadcareWindow.uploadcare
          });

          if (!uploadcareWindow.uploadcare) {
            console.error('[Register] Uploadcare not available. Window object keys:', Object.keys(window).slice(0, 20));
            throw new Error('Uploadcare widget is not loaded. Please refresh the page and try again.');
          }

          console.log('[Register] Uploading file with credentials:', {
            fileName: logoFile.name,
            fileSize: logoFile.size,
            fileType: logoFile.type,
            publicKey,
            expire
          });

          const file = await uploadcareWindow.uploadcare.fileFrom('object', logoFile, {
            publicKey,
            signature,
            expire,
          });

          logoUrl = file.cdnUrl;
          console.log('[Register] Logo uploaded successfully:', logoUrl);
        } catch (uploadError) {
          console.error('[Register] Logo upload failed:', uploadError);
          if (uploadError instanceof Error) {
            console.error('[Register] Error details:', uploadError.message, uploadError.stack);
          }
          throw new Error(`Failed to upload logo: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}. Please try again.`);
        }
      }

      console.log('[Register] Calling Convex mutation: businesses.create');
      // Convert cost per sqft to USD for consistent storage
      const costPerSqftInUSD = convertToUSDT(Number(formData.costPerSqft), selectedCurrency);

      console.log('[Register] Converting cost to USD:', {
        originalCost: formData.costPerSqft,
        originalCurrency: selectedCurrency,
        costInUSD: costPerSqftInUSD
      });

      console.log('[Register] Calling Convex mutation: businesses.create');

      // Debug: Log all form data being sent
      console.log('[Register] Form data being sent to Convex:', {
        outletImagesCount: formData.outletImages.length,
        productsServicesCount: formData.productsServices.length,
        countrySettingsKeys: Object.keys(formData.countrySettings),
        franchiseFee: formData.franchiseFee,
        setupCost: formData.setupCost,
        threeYearWorkingCapital: formData.threeYearWorkingCapital
      });

      const result = await createBusiness({
        name: formData.name,
        slug: formData.slug,
        logoUrl,
        industry_id: formData.industry_id,
        category_id: formData.category_id,
        costPerArea: costPerSqftInUSD, // Save cost per sqft in USD (standardized)
        min_area: Number(formData.minSquareFootage),
        serviceable_countries: formData.serviceable_countries,
        currency: 'USD', // Always store in USD for consistency
        // Step 2: Financial Information
        franchiseFee: formData.franchiseFee,
        setupCost: formData.setupCost,
        threeYearWorkingCapital: formData.threeYearWorkingCapital,
        costPerSqft: formData.costPerSqft,
        // Step 3: Country Settings
        countrySettings: formData.countrySettings,
        // Step 4: Outlet Images and Products
        outletImages: formData.outletImages.map(img => img.url).filter(Boolean), // Extract URLs
        productsServices: formData.productsServices.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          photoUrl: product.photoUrl,
          baseCost: product.baseCost,
          margin: product.margin,
          sellingPrice: product.sellingPrice
        }))
      });
      console.log('[Register] Convex mutation result received');

      // Create demo outlet data
      console.log('[Register] Creating demo outlet...');
      try {
        await createOutlet({
          brandId: result.brandId,
          name: `${formData.name} - Main Outlet`,
          address: "123 Demo Street, Business District, Demo City, Demo State, United States 12345",
          images: formData.outletImages.map(img => img.url).filter(Boolean),
        });
        console.log('[Register] Demo outlet created successfully');
      } catch (outletError) {
        console.error('[Register] Failed to create demo outlet:', outletError);
        // Don't fail the entire registration if outlet creation fails
      }

      toast.success('Brand registered successfully!');
      resetForm();

      // Navigate to success page with wallet generation
      router.push(`/register/success?slug=${result.slug}&brandId=${result.brandId}`);
    } catch (err) {
      console.error('Form submission error:', err);
      toast.error(
        err === 'upload'
          ? 'Image upload failed. Please try again.'
          : err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'An unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto dark:bg-stone-800/50 bg-white text-foreground my-6 dark:text-foreground border">
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 justify-between pr-6 border-b">
        
        <p className="text-lg font-semibold pl-6">{
              currentStep === 1 ? 'Brand Information' :
              currentStep === 2 ? 'Financial Information' :
              currentStep === 3 ? 'Location Settings' :
              'Demo Franchise'
            }
          </p>
          <p className="text-xs text-muted-foreground">Step {currentStep} of 4</p>


      

      </header>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className=""
        >
          <form id="register-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8">

            {/* Step 1: Brand Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-muted/30  p-6 space-y-6">

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Brand Logo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600  flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={80}
                            height={80}
                            className="object-cover "
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-600 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Choose Logo
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Name and Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Brand Name<span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full h-11 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Enter brand name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Brand URL Slug <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                          /
                        </span>
                        <Input
                          type="text"
                          id="slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          className={`w-full h-11 pl-8 pr-4 bg-white dark:bg-stone-700 border  focus:ring-2 focus:ring-primary focus:border-primary ${isSlugTaken ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-stone-600'}`}
                          placeholder="brand-name-slug"
                          required
                          pattern="[a-z0-9-]+"
                          title="Only lowercase letters, numbers, and hyphens allowed"
                        />
                        {formData.slug.trim().length > 0 && (
                          isSlugTaken ? (
                            <p className="mt-1 text-xs text-red-600">This slug is already taken. Please choose another.</p>
                          ) : (
                            <p className="mt-1 text-xs text-green-600">This slug is available.</p>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* About Brand */}
                  <div>
                    <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      About This Brand <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="about"
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary p-3 resize-none"
                      placeholder="Describe your brand, its mission, values, and what makes it unique..."
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be shown to potential franchisees
                    </p>
                  </div>

                  {/* Industry and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Industry <span className="text-yellow-600">*</span>
                      </label>
                      <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg border border-stone-300 dark:border-stone-600">
                        <Select<IndustryOption, false>
                          name="industry_id"
                          options={industryOptions}
                          className="basic-single"
                          classNamePrefix="select"
                          onChange={handleIndustryChange}
                          value={industryOptions.find((opt) => opt.value === formData.industry_id)}
                          styles={selectStylesIndustry}
                          placeholder="Select industry..."
                          isClearable
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Category <span className="text-yellow-600">*</span>
                      </label>
                      <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg border border-stone-300 dark:border-stone-600">
                        <Select<CategoryOption, false>
                          name="category_id"
                          options={categoryOptions}
                          className="basic-single"
                          onChange={handleCategoryChange}
                          value={categoryOptions.find((opt) => opt.value === formData.category_id)}
                          styles={selectStylesCategory}
                          placeholder="Select category..."
                          isClearable
                          classNamePrefix="select"
                          required
                          isDisabled={!formData.industry_id || categoryOptions.length === 0}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Website and Social Media */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website URL
                      </label>
                      <Input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full h-11 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="https://www.yourbrand.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Facebook
                        </label>
                        <Input
                          type="url"
                          id="facebook"
                          value={formData.socialMedia.facebook}
                          onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                          className="w-full h-11 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="https://facebook.com/yourbrand"
                        />
                      </div>

                      <div>
                        <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter
                        </label>
                        <Input
                          type="url"
                          id="twitter"
                          value={formData.socialMedia.twitter}
                          onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                          className="w-full h-11 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="https://twitter.com/yourbrand"
                        />
                      </div>

                      <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Instagram
                        </label>
                        <Input
                          type="url"
                          id="instagram"
                          value={formData.socialMedia.instagram}
                          onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                          className="w-full h-11 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="https://instagram.com/yourbrand"
                        />
                      </div>

                      <div>
                        <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          LinkedIn
                        </label>
                        <Input
                          type="url"
                          id="linkedin"
                          value={formData.socialMedia.linkedin}
                          onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                          className="w-full h-11 bg-white dark:bg-stone-700 border border-gray-300 dark:border-stone-600  focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="https://linkedin.com/company/yourbrand"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Financial Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-muted/30 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Min Square Footage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min Square Footage <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        value={formData.minSquareFootage || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, minSquareFootage: Number(e.target.value) || 0 }))}
                        placeholder="Enter minimum space required"
                        required
                        min={1}
                        className="w-full h-11"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Minimum space required for franchise operation
                      </p>
                    </div>

                    {/* Franchise Fee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Franchise Fee <span className="text-red-500">*</span>
                      </label>
                      <CurrencyInput
                        value={formData.franchiseFee}
                        onChange={(value) => setFormData(prev => ({ ...prev, franchiseFee: value }))}
                        placeholder="Enter one-time franchise fee"
                        required
                        showUSDTConversion={true}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        One-time fee to join the franchise network
                      </p>
                    </div>

                    {/* Setup Cost */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Setup Cost <span className="text-red-500">*</span>
                      </label>
                      <CurrencyInput
                        value={formData.setupCost}
                        onChange={(value) => setFormData(prev => ({ ...prev, setupCost: value }))}
                        placeholder="Enter initial setup costs"
                        required
                        showUSDTConversion={true}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Initial equipment and setup costs
                      </p>
                    </div>

                    {/* 3 Year Working Capital */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        3 Year Working Capital <span className="text-red-500">*</span>
                      </label>
                      <CurrencyInput
                        value={formData.threeYearWorkingCapital}
                        onChange={(value) => {
                          setFormData(prev => ({
                            ...prev,
                            threeYearWorkingCapital: value,
                            // Auto-update cost per sqft if not overridden
                            costPerSqft: !prev.costPerSquareFootOverride && prev.minSquareFootage > 0
                              ? (prev.franchiseFee + prev.setupCost + value) / prev.minSquareFootage
                              : prev.costPerSqft
                          }));
                        }}
                        placeholder="Enter 3-year working capital"
                        required
                        showUSDTConversion={true}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Estimated rent, maintenance, and salary costs for 3 years
                      </p>
                    </div>
                  </div>

                  {/* Cost Per Square Foot */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cost Per Square Foot
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.costPerSquareFootOverride}
                          onChange={(e) => setFormData(prev => ({ ...prev, costPerSquareFootOverride: e.target.checked }))}
                          className="rounded"
                        />
                        Manual Override
                      </label>
                    </div>
                    <CurrencyInput
                      value={formData.costPerSqft}
                      onChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          costPerSqft: value,
                          // Auto-adjust working capital if overriding cost per sqft
                          threeYearWorkingCapital: prev.costPerSquareFootOverride && prev.minSquareFootage > 0
                            ? (value * prev.minSquareFootage) - prev.franchiseFee - prev.setupCost
                            : prev.threeYearWorkingCapital
                        }));
                      }}
                      placeholder="Cost per square foot"
                      disabled={!formData.costPerSquareFootOverride}
                      showUSDTConversion={false}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.costPerSquareFootOverride
                        ? "Manually set cost per square foot (working capital will be adjusted)"
                        : "Auto-calculated as total costs ÷ minimum sqft"
                      }
                    </p>
                  </div>

                  {/* Investment Calculator */}
                  <InvestmentCalculator
                    minSquareFootage={formData.minSquareFootage}
                    franchiseFee={formData.franchiseFee}
                    setupCost={formData.setupCost}
                    threeYearWorkingCapital={formData.threeYearWorkingCapital}
                    costPerSquareFoot={formData.costPerSqft}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Location Settings (renamed from Step 2) */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-stone-50 dark:bg-stone-800 p-6 space-y-6 border border-stone-300 dark:border-stone-600 rounded-lg">

                  {/* Countries */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                      Countries Registered <span className="text-yellow-600">*</span>
                    </label>
                    <div className="bg-stone-100 dark:bg-stone-700 p-3 rounded-lg border border-stone-300 dark:border-stone-600">
                      <Select<CountryOption, true>
                        isMulti
                        name="serviceable_countries"
                        options={countryOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleCountryChange}
                        value={countryOptions.filter((opt) => formData.serviceable_countries.includes(opt.value))}
                        styles={selectStylesCountry}
                        placeholder="Select countries..."
                        required
                      />
                    </div>
                  </div>

                  {/* Country Documents and Settings */}
                  {formData.serviceable_countries.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Country Settings & Documents <span className="text-yellow-600">*</span>
                      </label>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                        Configure operation settings and upload registration certificate for each selected country
                      </p>

                      <div className="space-y-6">
                        {formData.serviceable_countries.map((countryCode) => {
                          const countryName = countryOptions.find(c => c.value === countryCode)?.label || countryCode;
                          const countryDoc = formData.countryDocuments[countryCode];
                          const countrySettings = formData.countrySettings[countryCode] || {
                            operationScope: 'anywhere' as const,
                            specificLocations: [],
                            franchiseFeeOverride: undefined,
                            setupCostOverride: undefined,
                            workingCapitalOverride: undefined,
                          };

                          return (
                            <div key={countryCode} className="bg-stone-100 dark:bg-stone-700 p-6 rounded-lg border border-stone-300 dark:border-stone-600">
                              <h4 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-4">
                                {countryName}
                              </h4>

                              {/* Registration Certificate Upload */}
                              <div className="mb-6">
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                                  Registration Certificate <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      handleCountryDocumentChange(countryCode, 'registrationCertificate', file);
                                    }}
                                    className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                  />
                                  {countryDoc?.registrationCertificate?.file && (
                                    <span className="text-sm text-green-600">✓ Uploaded</span>
                                  )}
                                </div>
                              </div>

                              {/* Operation Scope */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                                  Operation Scope
                                </label>
                                <div className="space-y-2">
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`scope-${countryCode}`}
                                      value="anywhere"
                                      checked={countrySettings.operationScope === 'anywhere'}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({
                                            ...prev,
                                            countrySettings: {
                                              ...prev.countrySettings,
                                              [countryCode]: {
                                                ...countrySettings,
                                                operationScope: 'anywhere',
                                                specificLocations: []
                                              }
                                            }
                                          }));
                                        }
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm">Available anywhere in {countryName}</span>
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`scope-${countryCode}`}
                                      value="specific"
                                      checked={countrySettings.operationScope === 'specific'}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setFormData(prev => ({
                                            ...prev,
                                            countrySettings: {
                                              ...prev.countrySettings,
                                              [countryCode]: {
                                                ...countrySettings,
                                                operationScope: 'specific'
                                              }
                                            }
                                          }));
                                        }
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm">Specific locations only</span>
                                  </label>
                                </div>
                              </div>

                              {/* Location Input for specific locations */}
                              {countrySettings.operationScope === 'specific' && (
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                                    Specific Locations
                                  </label>
                                  <textarea
                                    value={countrySettings.specificLocations.map(loc => loc.city + (loc.district ? `, ${loc.district}` : '')).join('\n')}
                                    onChange={(e) => {
                                      const locations = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                                        const parts = line.split(',').map(p => p.trim());
                                        return {
                                          city: parts[0] || '',
                                          district: parts[1] || undefined
                                        };
                                      });
                                      setFormData(prev => ({
                                        ...prev,
                                        countrySettings: {
                                          ...prev.countrySettings,
                                          [countryCode]: {
                                            ...countrySettings,
                                            specificLocations: locations
                                          }
                                        }
                                      }));
                                    }}
                                    placeholder={`Enter cities/locations in ${countryName}, one per line\nExample:\nNew York, NY\nLos Angeles, CA`}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-stone-700 dark:text-stone-100"
                                  />
                                </div>
                              )}

                              {/* Country-specific fee overrides */}
                              <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                                  Fee Overrides (Optional)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">
                                      Franchise Fee Override
                                    </label>
                                    <CurrencyInput
                                      value={countrySettings.franchiseFeeOverride || 0}
                                      onChange={(value) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          countrySettings: {
                                            ...prev.countrySettings,
                                            [countryCode]: {
                                              ...countrySettings,
                                              franchiseFeeOverride: value > 0 ? value : undefined
                                            }
                                          }
                                        }));
                                      }}
                                      placeholder="Use default fee"
                                      showUSDTConversion={false}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">
                                      Setup Cost Override
                                    </label>
                                    <CurrencyInput
                                      value={countrySettings.setupCostOverride || 0}
                                      onChange={(value) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          countrySettings: {
                                            ...prev.countrySettings,
                                            [countryCode]: {
                                              ...countrySettings,
                                              setupCostOverride: value > 0 ? value : undefined
                                            }
                                          }
                                        }));
                                      }}
                                      placeholder="Use default cost"
                                      showUSDTConversion={false}
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs text-stone-600 dark:text-stone-400 mb-1">
                                      Working Capital Override
                                    </label>
                                    <CurrencyInput
                                      value={countrySettings.workingCapitalOverride || 0}
                                      onChange={(value) => {
                                        setFormData(prev => ({
                                          ...prev,
                                          countrySettings: {
                                            ...prev.countrySettings,
                                            [countryCode]: {
                                              ...countrySettings,
                                              workingCapitalOverride: value > 0 ? value : undefined
                                            }
                                          }
                                        }));
                                      }}
                                      placeholder="Use default capital"
                                      showUSDTConversion={false}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}



            {/* Step 4: Demo Franchise */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-muted/30 p-6 space-y-8">
                  {/* Outlet Images */}
                  <ImageUploadGrid
                    images={formData.outletImages}
                    onChange={(images) => setFormData(prev => ({ ...prev, outletImages: images }))}
                    maxImages={20}
                    minImages={3}
                    title="Outlet Images"
                    description="Upload images of your franchise outlets to showcase the brand experience"
                  />

                  {/* Products & Services */}
                  <ProductServiceForm
                    products={formData.productsServices}
                    onChange={(products) => setFormData(prev => ({ ...prev, productsServices: products }))}
                    minProducts={1}
                    title="Products & Services"
                    description="Add your key products or services to showcase to potential franchisees"
                  />
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 justify-between p-6 border-t">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2 bg-yellow-600 text-white hover:bg-yellow-700 justify-end"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading || !isStepValid(4)}
                    className="bg-yellow-600 text-white hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!isStepValid(4) ? 'Complete required fields' : isLoading ? 'Submitting…' : ''}
                  >
                    {isLoading ? 'Creating Brand...' : 'Register Brand'}
                  </Button>
                </div>
              )}
            </div>



          </form>
        </motion.div>

        {/* Image Crop Modal */}
        {showCropModal && selectedImageFile && (
          <ImageCropModal
            isOpen={showCropModal}
            onClose={handleCropModalClose}
            onCropComplete={handleCropComplete}
            imageFile={selectedImageFile}
          />
        )}
    </div>
  );
}