"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Check, MapPin, Building, Search, Wallet, Calculator, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useFranchiseProgram } from '@/hooks/useFranchiseProgram';
import { coinGeckoService } from '@/lib/coingecko';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

import { useSolana } from '@/hooks/useSolana';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import WalletWithLocalCurrency from '../wallet/WalletWithLocalCurrency';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';


interface TypeformCreateFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandSlug?: string; // If provided, skip step 1 and use this business
}

interface Business {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
  walletAddress?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
  costPerArea?: number;
  currency?: string; // Currency the business was registered in
  min_area?: number;
}

interface FormData {
  selectedBusiness: Business | null;
  location: {
    address: string;
    lat: number;
    lng: number;
  } | null;
  locationDetails: {
    franchiseSlug: string;
    buildingName: string;
    doorNumber: string;
    sqft: string;
    costPerArea: string;
    isOwned: boolean;
    landlordNumber: string;
    landlordEmail: string;
    userNumber: string;
    userEmail: string;
  };
  investment: {
    selectedShares: number;
    totalShares: number;
    sharePrice: number;
  };
}

// Declare global Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

const TypeformCreateFranchiseModal: React.FC<TypeformCreateFranchiseModalProps> = ({ isOpen, onClose, brandSlug }) => {
  const [currentStep, setCurrentStep] = useState(brandSlug ? 2 : 1); // Skip step 1 if brandSlug provided
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [contractDetails, setContractDetails] = useState<any>(null);

  // Map related state
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [conflictingLocation, setConflictingLocation] = useState<boolean>(false);

  // Brand wallet balance state
  const [brandWalletBalance, setBrandWalletBalance] = useState<number>(0);
  const [brandWalletLoading, setBrandWalletLoading] = useState<boolean>(false);

  const { connected, publicKey, connecting, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const { createFranchise, investInFranchise, connected: programConnected } = useFranchiseProgram();
  const { selectedCurrency, exchangeRates } = useGlobalCurrency();
  const { connection } = useConnection();
  const { sendSOL, getSOLBalance } = useSolana();

  // Helper function to convert USD to current user's currency (no SOL involved)
  const convertUSDToCurrentCurrency = (amountUSD: number) => {
    if (!amountUSD) return 0;
    if (selectedCurrency === 'usd') return amountUSD;

    const usdRate = exchangeRates['usd'] || 1;
    const targetRate = exchangeRates[selectedCurrency] || 1;

    return amountUSD * (targetRate / usdRate);
  };

  // Helper function to convert current currency to USD (no SOL involved)
  const convertCurrentCurrencyToUSD = (amount: number) => {
    if (!amount) return 0;
    if (selectedCurrency === 'usd') return amount;

    const usdRate = exchangeRates['usd'] || 1;
    const targetRate = exchangeRates[selectedCurrency] || 1;

    return amount * (usdRate / targetRate);
  };

  // Debug wallet connection state
  useEffect(() => {
    console.log('Wallet connection state:', {
      connected,
      connecting,
      publicKey: publicKey?.toString(),
      wallet: wallet?.adapter?.name,
      programConnected
    });
  }, [connected, connecting, publicKey, wallet, programConnected]);

  // Helper function to format currency amounts correctly
  const formatCurrencyAmount = (amount: number) => {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: selectedCurrency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to convert business cost to current user's currency
  const convertBusinessCostToCurrentCurrency = (business: Business) => {
    if (!business?.costPerArea) return 0;

    // Business cost is stored in USD, convert to current user's currency
    const costInLocal = convertUSDToCurrentCurrency(business.costPerArea);

    console.log('Converted business cost:', {
      original: business.costPerArea,
      costInLocal,
      selectedCurrency
    });

    return costInLocal;
  };

  // Fetch brand wallet balance
  const fetchBrandWalletBalance = async (walletAddress: string) => {
    if (!walletAddress) return;

    setBrandWalletLoading(true);
    try {
      const publicKey = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKey);
      const solBalance = lamports / LAMPORTS_PER_SOL;
      setBrandWalletBalance(solBalance);
    } catch (error) {
      console.error('Error fetching brand wallet balance:', error);
      setBrandWalletBalance(0);
    } finally {
      setBrandWalletLoading(false);
    }
  };

  // Convex mutations
  const createFranchiseInDB = useMutation(api.franchise.create);
  const createTransaction = useMutation(api.transactions.createTransaction);
  const createApproval = useMutation(api.approvals.createApproval);

  // Get all businesses for selection
  const businesses = useQuery(api.brands.listAll, {}) || [];

  // Get current user
  const currentUser = useQuery(api.users.getCurrentUser, {});

  // Get specific business if brandSlug provided
  const specificBusiness = useQuery(
    api.brands.getBySlug,
    brandSlug ? { slug: brandSlug } : "skip"
  );

  const [formData, setFormData] = useState<FormData>({
    selectedBusiness: null,
    location: null,
    locationDetails: {
      franchiseSlug: '',
      buildingName: '',
      doorNumber: '',
      sqft: '',
      costPerArea: '',
      isOwned: false,
      landlordNumber: '',
      landlordEmail: '',
      userNumber: '',
      userEmail: ''
    },
    investment: {
      selectedShares: 100,
      totalShares: 1000,
      sharePrice: 5.75
    }
  });

  // Update user contact info when currentUser loads
  useEffect(() => {
    if (currentUser && (!formData.locationDetails.userEmail || !formData.locationDetails.userNumber)) {
      setFormData(prev => ({
        ...prev,
        locationDetails: {
          ...prev.locationDetails,
          userEmail: prev.locationDetails.userEmail || currentUser.email || '',
          userNumber: prev.locationDetails.userNumber || currentUser.phone || '',
        }
      }));
    }
  }, [currentUser]);

  // Get existing franchise locations for the selected business
  const existingFranchiseLocations = useQuery(
    api.franchise.getLocationsByBusiness,
    formData.selectedBusiness ? { businessId: formData.selectedBusiness._id } : "skip"
  );

  // Auto-select business if brandSlug provided
  useEffect(() => {
    if (specificBusiness && brandSlug) {
      setFormData(prev => ({
        ...prev,
        selectedBusiness: specificBusiness
      }));
    }
  }, [specificBusiness, brandSlug]);

  // Fetch brand wallet balance when business is selected
  useEffect(() => {
    if (formData.selectedBusiness?.walletAddress) {
      fetchBrandWalletBalance(formData.selectedBusiness.walletAddress);
    }
  }, [formData.selectedBusiness?.walletAddress]);

  // Initialize Google Maps when step 2 is reached
  useEffect(() => {
    if (currentStep === 2 && formData.selectedBusiness) {
      // Add delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mapRef.current) {
          initializeGoogleMaps();
        } else {
          console.log('Map ref not ready, retrying...');
          // Retry after another delay
          const retryTimer = setTimeout(() => {
            if (mapRef.current) {
              initializeGoogleMaps();
            } else {
              console.error('Map ref still not available after retry');
            }
          }, 500);
          return () => clearTimeout(retryTimer);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep, formData.selectedBusiness]);

  // existingFranchiseLocations is used directly in the component

  const initializeGoogleMaps = () => {
    if (!mapRef.current) {
      console.error('Map ref not available');
      return;
    }

    // Check if the map container is visible
    const mapContainer = mapRef.current;
    const rect = mapContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error('Map container is not visible or has no dimensions');
      return;
    }

    if (!window.google) {
      // Load Google Maps script if not already loaded
      console.log('Loading Google Maps script...');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error('Google Maps API key is not configured');
        toast.error('Google Maps API key is not configured. Please check your environment variables.');
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('Google Maps script already loading, waiting...');
        // Wait for existing script to load
        existingScript.addEventListener('load', () => {
          console.log('Google Maps script loaded via existing script');
          setTimeout(initMap, 100); // Small delay to ensure Google Maps is fully initialized
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
      script.async = true;
      script.defer = true;

      // Create global callback
      (window as any).initGoogleMapsCallback = () => {
        console.log('Google Maps script loaded successfully via callback');
        setTimeout(initMap, 100); // Small delay to ensure Google Maps is fully initialized
        delete (window as any).initGoogleMapsCallback; // Clean up
      };

      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        toast.error('Failed to load Google Maps. Please check your API key and internet connection.');
        delete (window as any).initGoogleMapsCallback; // Clean up
      };

      document.head.appendChild(script);
    } else {
      console.log('Google Maps already loaded, initializing map...');
      setTimeout(initMap, 100); // Small delay to ensure DOM is ready
    }
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) {
      console.error('Map initialization failed: mapRef or google not available');
      return;
    }

    try {
      const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai default

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setMap(mapInstance);
      console.log('Google Maps initialized successfully');

      // Initialize Places service
      if (window.google.maps.places) {
        console.log('Places service available');
      } else {
        console.error('Google Places API not available');
        toast.error('Google Places service not available. Please refresh the page.');
      }

      // Add click listener to map
      mapInstance.addListener('click', (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          handleLocationSelect(lat, lng);
        }
      });

      // Add existing franchise markers
      if (existingFranchiseLocations) {
        addExistingFranchiseMarkers(mapInstance);
      }
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      toast.error('Failed to initialize Google Maps. Please try again.');
    }
  };

  const addExistingFranchiseMarkers = async (mapInstance: any) => {
    if (!existingFranchiseLocations || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();

    for (const franchise of existingFranchiseLocations) {
      try {
        const result = await geocoder.geocode({ address: franchise.locationAddress });
        if (result.results[0]) {
          const location = result.results[0].geometry.location;

          new window.google.maps.Marker({
            position: location,
            map: mapInstance,
            title: `${formData.selectedBusiness?.name} - ${franchise.building}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
                  <circle cx="12" cy="9" r="2.5" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            }
          });
        }
      } catch (error) {
        console.error('Error geocoding franchise location:', error);
      }
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    if (!map || !window.google) return;

    // Remove existing marker
    if (marker) {
      marker.setMap(null);
    }

    // Check for conflicts with existing franchises
    const isConflicting = await checkLocationConflict(lat, lng);
    setConflictingLocation(isConflicting);

    // Add new marker
    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: map,
      title: 'Selected Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${isConflicting ? '#EF4444' : '#10B981'}"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
      }
    });

    setMarker(newMarker);

    // Reverse geocoding to get address
    const geocoder = new window.google.maps.Geocoder();
    try {
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        setFormData(prev => ({
          ...prev,
          location: { address, lat, lng }
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setFormData(prev => ({
        ...prev,
        location: { address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng }
      }));
    }
  };

  const checkLocationConflict = async (lat: number, lng: number): Promise<boolean> => {
    if (!existingFranchiseLocations || !window.google) return false;

    const geocoder = new window.google.maps.Geocoder();
    const minDistance = 1000; // 1km minimum distance

    for (const franchise of existingFranchiseLocations) {
      try {
        const result = await geocoder.geocode({ address: franchise.locationAddress });
        if (result.results[0]) {
          const existingLocation = result.results[0].geometry.location;
          const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(lat, lng),
            existingLocation
          );

          if (distance < minDistance) {
            return true; // Conflict found
          }
        }
      } catch (error) {
        console.error('Error checking location conflict:', error);
      }
    }

    return false;
  };

  const handleMapSearch = async () => {
    if (!map || !window.google || !mapSearchQuery.trim()) return;

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      query: mapSearchQuery,
      fields: ['name', 'geometry', 'formatted_address'],
    };

    service.textSearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]) {
        const place = results[0];
        const location = place.geometry.location;

        map.setCenter(location);
        map.setZoom(15);

        const lat = location.lat();
        const lng = location.lng();
        handleLocationSelect(lat, lng);
      }
    });
  };

  const totalSteps = 4; // Steps: 1(Business), 2(Location), 3(Details), 4(Project Investment & Purchase). After payment, show confirmation (Step 6 UI without navigation).
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // handleSubmit function removed as it's not used in the component

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectBusiness = (business: Business) => {
    // Generate franchise slug based on business slug and existing franchise count
    const generateFranchiseSlug = async () => {
      const businessSlug = business.slug || business.name.toLowerCase().replace(/\s+/g, '-');
      const existingCount = existingFranchiseLocations?.length || 0;
      return `${businessSlug}-${existingCount + 1}`;
    };

    generateFranchiseSlug().then(slug => {
      setFormData(prev => ({
        ...prev,
        selectedBusiness: business,
        locationDetails: {
          ...prev.locationDetails,
          costPerArea: business.costPerArea?.toString() || '',
          franchiseSlug: slug
        }
      }));
    });
  };

  // Remove unused selectLocation function

  const updateLocationDetails = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      locationDetails: {
        ...prev.locationDetails,
        [field]: value
      }
    }));

    // Save user contact info when they update their phone or email
    if ((field === 'userNumber' || field === 'userEmail') && typeof value === 'string' && value.trim()) {
      const updateData: { phone?: string; email?: string } = {};
      if (field === 'userNumber') updateData.phone = value;
      if (field === 'userEmail') updateData.email = value;

      // Note: User contact update functionality removed
    }
  };

  const updateInvestment = (selectedShares: number) => {
    setFormData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        selectedShares
      }
    }));
  };

  // In-step Solana payment using SlideButton
  const [solBalance, setSolBalance] = useState<number>(0);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const bal = await getSOLBalance();
        setSolBalance(bal);
      } catch (e) {
        setSolBalance(0);
      }
    };
    if (currentStep === 4 && connected) {
      void loadBalance();
    }
  }, [currentStep, connected, getSOLBalance]);

  const handleSlidePay = async (): Promise<"success" | "error"> => {
    const selectedShares = formData.investment.selectedShares;
    const sharePrice = calculateSharePrice();
    const totalAmountSOL = selectedShares * sharePrice * 1.2; // platform fee + tax

    // Check wallet connection first
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      setVisible(true);
      return "error";
    }

    // Additional wallet validation
    if (!wallet || !wallet.adapter) {
      toast.error('Wallet adapter not available');
      return "error";
    }

    if (!programConnected) {
      toast.error('Blockchain program not available. Please check your connection and try again.');
      return 'error';
    }

    if (!formData.selectedBusiness) {
      toast.error('Please select a business');
      return 'error';
    }

    // Validate required fields
    if (!formData.locationDetails.franchiseSlug || !formData.locationDetails.buildingName || !formData.locationDetails.sqft) {
      toast.error('Please complete all required fields');
      return 'error';
    }

    // Validate cost per area
    const costPerArea = parseFloat(formData.locationDetails.costPerArea) || formData.selectedBusiness!.costPerArea || 0;
    if (!costPerArea || costPerArea <= 0) {
      toast.error('Cost per area must be set by the business owner');
      return 'error';
    }

    if (solBalance < totalAmountSOL) {
      toast.error(`Insufficient SOL balance: need ${totalAmountSOL.toFixed(4)} SOL, have ${solBalance.toFixed(4)} SOL`);
      return 'error';
    }

    setLoading(true);
    try {
      // Step 1: Send payment directly to brand wallet
      const brandWalletAddress = formData.selectedBusiness!.walletAddress;
      if (!brandWalletAddress) {
        throw new Error('Brand wallet address not found. Please contact support.');
      }

      const pay = await sendSOL(brandWalletAddress, totalAmountSOL);
      if (!pay.success || !pay.signature) {
        throw new Error(pay.error || 'Payment failed');
      }

      toast.success('Payment successful! Funds sent to brand wallet. Creating franchise...');

          // Step 2: Create franchise on blockchain
          const businessSlug = formData.selectedBusiness!.slug || formData.selectedBusiness!.name.toLowerCase().replace(/\s+/g, '-');
          const franchiseId = formData.locationDetails.franchiseSlug;
          const costPerArea = parseFloat(formData.locationDetails.costPerArea) || formData.selectedBusiness!.costPerArea || 0;

          let createTx = null;
          let investTx = null;

          if (createFranchise && investInFranchise) {
            try {
              createTx = await createFranchise(
                businessSlug,
                franchiseId,
                formData.location?.address || '',
                formData.locationDetails.buildingName,
                parseFloat(formData.locationDetails.sqft),
                costPerArea,
                calculateTotalShares()
              );

              if (!createTx) {
                console.warn('Failed to create franchise on blockchain, continuing with database-only creation');
                toast.warning('Blockchain integration unavailable, creating franchise in database only');
              } else {
                toast.success('Franchise created on blockchain! Creating database records...');
              }

              toast.success('Franchise created! Creating investment contract...');

              // Step 3: Invest in the franchise
              investTx = await investInFranchise(businessSlug, franchiseId, selectedShares);
            } catch (blockchainError) {
              console.error('Blockchain operation failed:', blockchainError);
              toast.error('Blockchain operation failed, but payment was successful. Please contact support.');
              // Continue with database save even if blockchain fails
            }
          } else {
            console.warn('Blockchain functions not available, skipping blockchain operations');
            toast.warning('Blockchain features not available, saving to database only');
          }

          toast.success('Investment contract created! Saving to database...');

          // Step 4: Save franchise to Convex database
          let savedFranchiseId = null;
          try {
            // Calculate USD values for database storage
            const totalInvestmentLocal = calculateTotalInvestment();
            const totalInvestmentUSD = convertCurrentCurrencyToUSD(totalInvestmentLocal);
            const costPerAreaUSD = formData.selectedBusiness?.costPerArea || convertCurrentCurrencyToUSD(parseFloat(formData.locationDetails.costPerArea) || 0);



            // Calculate corrected investment with fixed $1.00 per share
            const sharePrice = 1.00;
            const baseInvestment = selectedShares * sharePrice; // selectedShares × $1.00
            const transactionFee = baseInvestment * 0.02; // 2% transaction fee
            const correctedTotalInvestmentUSD = baseInvestment + transactionFee;

            const franchiseData = await createFranchiseInDB({
              brandId: formData.selectedBusiness!._id,
              owner_id: currentUser!._id,
              locationAddress: formData.location?.address || '',
              building: formData.locationDetails.buildingName,
              carpetArea: parseFloat(formData.locationDetails.sqft),
              costPerArea: costPerAreaUSD, // Store USD value
              totalInvestment: correctedTotalInvestmentUSD, // Store corrected USD value ($1/share + fee)
              totalShares: calculateTotalShares(),
              selectedShares: selectedShares,
              status: "Pending Approval", // Default status
              stage: "approval", // Set initial stage as approval
              slug: franchiseId,
              images: [], // Outlet images to be added later
            });

            savedFranchiseId = franchiseData;
            console.log('Franchise saved to database:', franchiseData);

            // Create approval record with USD values
            console.log('Creating approval with data:', {
              franchiseId: franchiseData,
              brandId: formData.selectedBusiness!._id,
              totalInvestmentUSD,
              costPerAreaUSD,
              carpetArea: parseFloat(formData.locationDetails.sqft),
              totalShares: calculateTotalShares(),
              selectedShares: selectedShares,
              sharePrice,
              locationAddress: formData.location?.address || '',
              building: formData.locationDetails.buildingName,
            });

            const approvalData = await createApproval({
              franchiseId: franchiseData,
              brandId: formData.selectedBusiness!._id,
              totalInvestmentUSD: correctedTotalInvestmentUSD, // Use corrected total with $1/share + fee
              costPerAreaUSD,
              carpetArea: parseFloat(formData.locationDetails.sqft),
              totalShares: calculateTotalShares(),
              selectedShares: selectedShares,
              sharePrice, // Fixed $1.00 per share
              locationAddress: formData.location?.address || '',
              building: formData.locationDetails.buildingName,
              metadata: {
                originalCurrency: selectedCurrency,
                originalTotalInvestment: totalInvestmentLocal,
                exchangeRate: exchangeRates[selectedCurrency] || 1,
                submissionTimestamp: Date.now(),
                baseInvestment, // selectedShares × $1.00
                transactionFee, // 2% fee
                correctedCalculation: true
              },
            });

            console.log('Approval record created successfully:', approvalData);
          } catch (error) {
            console.error('Failed to save franchise to database:', error);
            toast.error('Failed to save franchise data, but blockchain contracts are created');
          }

          // Step 5: Create transaction record for payment tracking
          if (savedFranchiseId && currentUser) {
            try {
              if (!currentUser?._id || !currentUser?.email || !pay.signature) {
                throw new Error('User not authenticated or payment failed');
              }

              const transactionResult = await createTransaction({
                type: "investment",
                amount: totalAmountSOL,
                currency: "SOL",
                fromUserId: currentUser._id,
                toUserId: undefined, // Brand owner will be determined by brandId
                brandId: formData.selectedBusiness!._id,
                franchiseId: savedFranchiseId,
                fromWalletAddress: publicKey?.toString() || '',
                toWalletAddress: brandWalletAddress,
                description: `Franchise investment for ${formData.selectedBusiness!.name} - ${formData.locationDetails.buildingName}`,
                metadata: {
                  shares: selectedShares,
                  costPerShare: FIXED_USDT_PER_SHARE * 1.2,
                  totalInvestmentUSD: selectedShares * FIXED_USDT_PER_SHARE * 1.2,
                  contractSignature: investTx || undefined,
                  contractAddress: `${businessSlug}-${franchiseId}`,
                  blockchainTxHash: pay.signature,
                },
              });

              console.log('Transaction created:', transactionResult);
              toast.success('Payment completed! Transaction recorded. Franchise pending approval.');
            } catch (transactionError) {
              console.error('Failed to create transaction record:', transactionError);
              toast.error('Payment successful but transaction record failed. Please contact support.');
            }
          }

          const details = {
            paymentSignature: pay.signature,
            createFranchiseSignature: createTx,
            contractSignature: investTx || '',
            userEmail: undefined,
            userWallet: undefined,
            franchiseId,
            businessSlug,
            shares: selectedShares,
            amountLocal: convertUSDToCurrentCurrency(selectedShares * FIXED_USDT_PER_SHARE * 1.2), // Convert USD to local currency
            amountSOL: totalAmountSOL,
            timestamp: new Date().toISOString(),
            contractAddress: `${businessSlug}-${franchiseId}`,
          };

          try {
            await fetch('/api/record-sol-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(details),
            });
          } catch (error) {
            console.error('Failed to record payment:', error);
          }

          setContractDetails(details);
          setCurrentStep(6);

      toast.success(`Investment successful! You now own ${selectedShares} shares.`);
      return 'success';
    } catch (e) {
      console.error('Payment/contract creation failed:', e);
      toast.error('Failed to complete franchise creation. Please try again.');
      return 'error';
    } finally {
      setLoading(false);
    }
  };

  // Step 4 rules: USDT 1 per share, min 5% investment
  const FIXED_USDT_PER_SHARE = 1;

  const calculateTotalInvestment = () => {
    const area = parseFloat(formData.locationDetails.sqft) || 0;

    // Convert business cost to current currency if available
    let costPerAreaLocal = 0;
    if (formData.selectedBusiness?.costPerArea) {
      costPerAreaLocal = convertBusinessCostToCurrentCurrency(formData.selectedBusiness);
    } else {
      // Fallback to form data (already in current currency)
      costPerAreaLocal = parseFloat(formData.locationDetails.costPerArea) || 0;
    }

    // Calculate in current user's currency
    const totalInvestmentLocal = area * costPerAreaLocal;

    console.log('calculateTotalInvestment:', {
      area,
      costPerAreaLocal,
      totalInvestmentLocal,
      businessCostPerAreaUSD: formData.selectedBusiness?.costPerArea,
      currentCurrency: selectedCurrency
    });

    return totalInvestmentLocal;
  };

  // Total number of shares is totalInvestment converted to USDT / USDT 1
  const calculateTotalShares = () => {
    const totalInvestmentLocal = calculateTotalInvestment();
    // Convert local currency to USD for share calculation
    const totalInvestmentUSD = convertCurrentCurrencyToUSD(totalInvestmentLocal);
    const totalShares = Math.floor(totalInvestmentUSD / FIXED_USDT_PER_SHARE);
    return totalShares;
  };

  // Share price in SOL: USDT 1 converted to SOL using current USDT/SOL rate
  const [usdtPerSol, setUsdtPerSol] = useState<number>(0);
  useEffect(() => {
    const loadSolRate = async () => {
      try {
        const prices = await coinGeckoService.getSolPrices();
        // Use USD as proxy for USDT since they're approximately equal
        setUsdtPerSol(prices.usdt || prices.usd || 0);
      } catch {
        setUsdtPerSol(0);
      }
    };
    void loadSolRate();
  }, []);

  const calculateSharePrice = () => {
    if (!usdtPerSol || usdtPerSol <= 0) return 0;
    // USDT 1 per share -> convert to SOL
    return FIXED_USDT_PER_SHARE / usdtPerSol;
  };

  // Ensure formData investment totals adhere to rules when step 4 loads
  useEffect(() => {
    if (currentStep !== 4) return;
    if (!usdtPerSol || usdtPerSol <= 0) return; // Wait for SOL price to load

    const totalShares = calculateTotalShares();
    const minShares = Math.max(1, Math.ceil(totalShares * 0.05));

    console.log('Updating investment data:', {
      totalShares,
      minShares,
      currentSelectedShares: formData.investment.selectedShares,
      sharePrice: calculateSharePrice(),
      totalInvestment: calculateTotalInvestment()
    });

    setFormData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        totalShares,
        selectedShares: Math.min(totalShares, Math.max(minShares, prev.investment.selectedShares || minShares)),
        sharePrice: calculateSharePrice(),
      },
    }));
  }, [currentStep, formData.locationDetails.sqft, formData.locationDetails.costPerArea, usdtPerSol]);

  // Filter businesses based on search query
  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
    // Note: Category and industry filtering removed as they're not directly available
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.selectedBusiness !== null;
      case 2:
        return formData.location !== null && !conflictingLocation;
      case 3:
        const { doorNumber, sqft, isOwned, landlordNumber, landlordEmail, userNumber, userEmail, franchiseSlug, buildingName } = formData.locationDetails;
        const basicFields = doorNumber && sqft && franchiseSlug && buildingName && formData.locationDetails.costPerArea;
        if (isOwned) {
          return basicFields && userNumber && userEmail;
        } else {
          return basicFields && landlordNumber && landlordEmail;
        }
      case 4:
        return true;
      case 5:
        return connected;
      case 6:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-stone-900 z-50 flex flex-col">
      {/* Header - Hide navigation on step 6 */}
      {currentStep !== 6 && (
        <>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-stone-700">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="text-sm text-muted-foreground">
                {currentStep === 1 && (
                    <p className="text-muted-foreground">Select a business</p>
                )}
                {currentStep === 2 && (
                    <p className="text-muted-foreground">Choose location</p>
                )}
                {currentStep === 3 && (
                    <p className="text-muted-foreground">Enter location details</p>
                )}
                {currentStep === 4 && (
                    <p className="text-muted-foreground">Project investment summary</p>
                )}
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-stone-700 h-1">
            <div
              className="bg-yellow-600 h-1 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {/* Step 6 Header - Special header for confirmation */}
      {currentStep === 6 && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-stone-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="text-muted-foreground">Payment confirmation</p>
              Transaction completed successfully
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Business */}
          {currentStep === 1 && !brandSlug && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="p-6 pb-4 border-b border-gray-200 dark:border-stone-700">

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 p-6 pt-4 overflow-hidden flex flex-col">

              {/* Business List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredBusinesses.map((business) => (
                  <button
                    key={business._id}
                    onClick={() => selectBusiness(business)}
                    className={`w-full p-4 border-2 text-left transition-all ${
                      formData.selectedBusiness?._id === business._id
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                        : 'border-gray-200 dark:border-stone-700 hover:border-gray-300 dark:hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16  overflow-hidden bg-gray-100 dark:bg-stone-700 flex-shrink-0">
                        <Image
                          src={business.logoUrl || "/logo/logo-2.svg"}
                          alt={business.name}
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg">{business.name}</h3>
                          {formData.selectedBusiness?._id === business._id && (
                            <Check className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-base text-muted-foreground mb-1">
                          Brand
                        </p>
                         <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          {business.costPerArea && (
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                {(() => {
                                  const displayCost = convertBusinessCostToCurrentCurrency(business);
                                  
                                  return (
                                    <div className="space-y-1">
                                      <div className="font-medium">
                                        {formatCurrencyAmount(displayCost)}/sq ft
                                        <span className="ml-1 text-xs text-muted-foreground">
                                          ({selectedCurrency.toUpperCase()})
                                        </span>
                                      </div>
                                      {/* <div className="text-xs text-muted-foreground">
                                        ≈ {businessCost.toFixed(2)} USD
                                      </div> */}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                          {business.min_area && (
                            <div className="flex items-center gap-2">
                              <span>Min: {business.min_area} sq ft</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredBusinesses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No businesses found matching your search</p>
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Location */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 dark:border-stone-700">

                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for a location..."
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      className="pl-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleMapSearch()}
                    />
                  </div>
                  <Button onClick={handleMapSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Google Maps Container */}
              <div className="flex-1 relative">
                <div ref={mapRef} className="w-full h-full" />

                {/* Center Map Pin */}
                {map && !formData.location && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <MapPin className="h-8 w-8 text-stone-600 drop-shadow-lg" />
                  </div>
                )}

                {/* Select Location Button */}
                {map && !formData.location && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button
                      onClick={() => {
                        const center = map.getCenter();
                        if (center) {
                          handleLocationSelect(center.lat(), center.lng());
                        }
                      }}
                      className="bg-stone-600 hover:bg-stone-700 text-white shadow-lg"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Select This Location
                    </Button>
                  </div>
                )}

                {/* Loading overlay */}
                {!map && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-stone-800">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                      <p className="text-sm text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                )}

                {/* Selected Location Info */}
                {formData.location && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-stone-800 rounded-lg p-4 shadow-lg border">
                    <div className="flex items-start gap-3">
                      <MapPin className={`h-5 w-5 flex-shrink-0 mt-0.5 ${conflictingLocation ? 'text-red-600' : 'text-green-600'}`} />
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {conflictingLocation ? 'Location Unavailable' : 'Selected Location'}
                        </h4>
                        <p className="text-sm text-muted-foreground">{formData.location.address}</p>
                        {conflictingLocation && (
                          <p className="text-sm text-red-600 mt-1">
                            <AlertTriangle className="h-4 w-4 inline mr-1" />
                            Too close to existing franchise (min 1km required)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!conflictingLocation && <Check className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        <Button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, location: null }));
                            if (marker) {
                              marker.setMap(null);
                              setMarker(null);
                            }
                            setConflictingLocation(false);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Location Details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >

              <div className="space-y-6">
                {/* Franchise Details */}
                <div className="space-y-4">
                  {/* <div>
                    <label className="text-sm font-medium mb-2 block">Franchise Slug</label>
                    <div className="h-12 px-3 py-2 bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-md flex items-center text-lg">
                      {formData.locationDetails.franchiseSlug || 'Auto-generated after business selection'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-generated based on business name and location count
                    </p>
                  </div> */}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Building Name</label>
                    <Input
                      value={formData.locationDetails.buildingName}
                      onChange={(e) => updateLocationDetails('buildingName', e.target.value)}
                      placeholder="e.g., New Place Mall"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Door Number</label>
                    <Input
                      value={formData.locationDetails.doorNumber}
                      onChange={(e) => updateLocationDetails('doorNumber', e.target.value)}
                      placeholder="e.g., C707"
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Square Feet
                      {formData.selectedBusiness?.min_area && (
                        <span className="text-xs text-gray-500 ml-1">
                          (Min: {formData.selectedBusiness.min_area} sq ft)
                        </span>
                      )}
                    </label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.locationDetails.sqft}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        updateLocationDetails('sqft', value);
                      }}
                      placeholder={`e.g., ${formData.selectedBusiness?.min_area || 1500}`}
                      className={`h-12 text-lg ${
                        formData.selectedBusiness?.min_area &&
                        formData.locationDetails.sqft &&
                        parseInt(formData.locationDetails.sqft) < formData.selectedBusiness.min_area
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }`}
                      min={formData.selectedBusiness?.min_area || 1}
                    />
                    {formData.selectedBusiness?.min_area &&
                     formData.locationDetails.sqft &&
                     parseInt(formData.locationDetails.sqft) < formData.selectedBusiness.min_area && (
                      <p className="text-xs text-red-500 mt-1">
                        Minimum area required: {formData.selectedBusiness.min_area} sq ft
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost per Sq Ft</label>
                    <div className="h-12 px-3 py-2 bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 flex items-center text-lg">
                      {formData.selectedBusiness?.costPerArea ? (() => {
                        const convertedCost = convertBusinessCostToCurrentCurrency(formData.selectedBusiness);
                        return `${formatCurrencyAmount(convertedCost)}`;
                        // return `${formatCurrencyAmount(convertedCost)} (≈ USD ${usdEquivalent.toFixed(2)})`;
                      })() : 'Not set by brand owner'}
                    </div>
                    {/* <p className="text-xs text-muted-foreground mt-1">
                      This rate is configured by the brand owner in their account settings
                    </p> */}
                  </div>
                </div>

                {/* Investment Calculation */}
                {formData.locationDetails.sqft && formData.selectedBusiness?.costPerArea && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800  p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Investment Calculation</h3>
                    </div>
                    <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                      Total Investment: {formatCurrencyAmount(calculateTotalInvestment())}
                      {/* <span className="text-sm ml-2">(≈ USD ${convertCurrentCurrencyToUSD(calculateTotalInvestment()).toFixed(2)})</span> */}
                    </div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      {formData.locationDetails.sqft} sq ft × {(() => {
                        if (formData.selectedBusiness?.costPerArea) {
                          const convertedCost = convertBusinessCostToCurrentCurrency(formData.selectedBusiness);
                          return formatCurrencyAmount(convertedCost);
                        }
                        return formatCurrencyAmount(0);
                      })()} per sq ft
                    </p>
                  </div>
                )}

                {/* Warning if no cost per area set */}
                {formData.locationDetails.sqft && !formData.selectedBusiness?.costPerArea && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800  p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium text-orange-800 dark:text-orange-200">Cost Per Area Not Set</h4>
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          The brand owner needs to set the cost per square foot in their account settings before you can proceed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ownership Toggle */}
                <div className="bg-gray-50 dark:bg-stone-800  p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Property Ownership</h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.locationDetails.isOwned ? 'You own this property' : 'You rent this property'}
                      </p>
                    </div>
                    <Switch
                      checked={formData.locationDetails.isOwned}
                      onCheckedChange={(checked) => updateLocationDetails('isOwned', checked)}
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  {formData.locationDetails.isOwned ? (
                    <>
                      <h3 className="font-medium text-lg">Your Contact Information</h3>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Phone Number</label>
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={formData.locationDetails.userNumber}
                          onChange={(e) => updateLocationDetails('userNumber', e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="h-12 text-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Email</label>
                        <Input
                          type="email"
                          value={formData.locationDetails.userEmail}
                          onChange={(e) => updateLocationDetails('userEmail', e.target.value)}
                          placeholder="your.email@example.com"
                          className="h-12 text-lg"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-medium text-lg">Landlord Contact Information</h3>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Landlord Phone Number</label>
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={formData.locationDetails.landlordNumber}
                          onChange={(e) => updateLocationDetails('landlordNumber', e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="h-12 text-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Landlord Email</label>
                        <Input
                          type="email"
                          value={formData.locationDetails.landlordEmail}
                          onChange={(e) => updateLocationDetails('landlordEmail', e.target.value)}
                          placeholder="landlord@example.com"
                          className="h-12 text-lg"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Project Investment Summary */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              {/* Wallet Status */}
              <WalletWithLocalCurrency />


              
               {/* Investment Summary - Inline */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 dark:text-white">My Investment Summary</h2>

                {/* Share Selection */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Shares
                    </label>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {calculateTotalShares()} available
                    </div>
                  </div>

                  {/* Slider for share selection */}
                  <div className="space-y-3">
                    <Slider
                      value={[formData.investment.selectedShares]}
                      onValueChange={(value) => updateInvestment(value[0])}
                      max={calculateTotalShares()}
                      min={Math.max(1, Math.ceil(calculateTotalShares() * 0.05))}
                      step={1}
                      className="w-full"
                    />

                    {/* Current selection display */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Selected: {formData.investment.selectedShares} shares
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Min: {Math.max(1, Math.ceil(calculateTotalShares() * 0.05))} (5%)
                      </span>
                    </div>
                  </div>

                  {/* Number input as backup */}
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={Math.max(1, Math.ceil(calculateTotalShares() * 0.05))}
                      max={calculateTotalShares()}
                      value={formData.investment.selectedShares}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value) || 0;
                        const availableShares = calculateTotalShares();
                        const minShares = Math.max(1, Math.ceil(availableShares * 0.05));
                        const clamped = Math.max(minShares, Math.min(availableShares, raw));
                        updateInvestment(clamped);
                      }}
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Price per share: {formatCurrencyAmount(convertUSDToCurrentCurrency(1))} (≈ USD 1.00)
                    </div>
                  </div>
                </div>

                {/* Your Ownership */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">Your Ownership</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-700 dark:text-blue-300 font-semibold">
                        {((formData.investment.selectedShares / calculateTotalShares()) * 100).toFixed(2)}%
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">Ownership</div>
                    </div>
                    <div>
                      <div className="text-blue-700 dark:text-blue-300 font-semibold">
                        {formData.investment.selectedShares}
                      </div>
                      <div className="text-blue-600 dark:text-blue-400">Shares</div>
                    </div>
                  </div>
                </div>

               

                
              </div>
               {/* Investment Breakdown */}
                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-lg my-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Investment Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formData.investment.selectedShares} shares × {formatCurrencyAmount(convertUSDToCurrentCurrency(1))}
                      </span>
                      <span className="dark:text-white">{formatCurrencyAmount(formData.investment.selectedShares * convertUSDToCurrentCurrency(1))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee (2%)</span>
                      <span className="dark:text-white">{formatCurrencyAmount(formData.investment.selectedShares * convertUSDToCurrentCurrency(1) * 0.02)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                      <span className="dark:text-white">{formatCurrencyAmount(formData.investment.selectedShares * convertUSDToCurrentCurrency(1) * 0.18)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="dark:text-white">Total Amount</span>
                        <span className="text-green-600 dark:text-green-400">{formatCurrencyAmount(formData.investment.selectedShares * convertUSDToCurrentCurrency(1) * 1.2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details Summary */}
              <div className="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Business:</span>
                    <span className="font-medium">{formData.selectedBusiness?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="font-medium">{formData.location?.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Building:</span>
                    <span className="font-medium">{formData.locationDetails.buildingName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Area:</span>
                    <span className="font-medium">{formData.locationDetails.sqft} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cost per sq ft:</span>
                    <span className="font-medium">
                      {(() => {
                        let costPerArea = 0;
                        let costPerAreaUSD = 0;
                        if (formData.selectedBusiness?.costPerArea) {
                          const businessCurrency = formData.selectedBusiness.currency || 'USD';
                          costPerArea = convertBusinessCostToCurrentCurrency(formData.selectedBusiness);
                          costPerAreaUSD = businessCurrency.toLowerCase() === 'usd'
                            ? formData.selectedBusiness.costPerArea
                            : formData.selectedBusiness.costPerArea; // Business cost is already in USD
                        } else {
                          const inputCost = parseFloat(formData.locationDetails.costPerArea) || 0;
                          costPerArea = inputCost;
                          costPerAreaUSD = convertCurrentCurrencyToUSD(inputCost);
                        }
                        return (
                          <>
                            {formatCurrencyAmount(costPerArea)}
                            <span className="text-xs ml-1">(≈ USD ${costPerAreaUSD.toFixed(2)})</span>
                          </>
                        );
                      })()}
                    </span>
                  </div>
                  <div className="border-t border-stone-200 dark:border-stone-600 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Project Investment:</span>
                      <span className="text-xl font-bold text-green-600">{formatCurrencyAmount(calculateTotalInvestment())}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Important Information */}
              <div className="bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-800 p-4 rounded-lg">
                <h4 className="font-medium text-stone-800 dark:text-stone-200 mb-2">Important Information</h4>
                <div className="text-sm text-stone-600 dark:text-stone-400 space-y-2">
                  <p>• Your franchise proposal will be submitted for brand owner approval</p>
                  <p>• Investment funds will be sent directly to the brand wallet</p>
                  <p>• Transaction will be recorded with 2% platform commission</p>
                  <p>• Upon approval, franchise tokens will be created and distributed</p>
                  <p>• Monthly profit sharing begins after franchise launch</p>
                </div>
              </div>

              

             
            </motion.div>
          )}


          {currentStep === 6 && contractDetails && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              {/* Contract Success Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Investment Successful!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your blockchain contract has been created successfully
                </p>
              </div>

              {/* Contract Details Card */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold">Investment Contract</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Shares Purchased:</span>
                    <p className="font-semibold text-lg">{contractDetails.shares}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Investment:</span>
                    <p className="font-semibold text-lg text-green-600">
                      {formatCurrencyAmount(contractDetails.amountLocal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">SOL Amount:</span>
                    <p className="font-semibold">{contractDetails.amountSOL.toFixed(4)} SOL</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ownership:</span>
                    <p className="font-semibold">
                      {((contractDetails.shares / formData.investment.totalShares) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Transaction Signatures */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Payment Transaction:
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1 flex items-center justify-between">
                      <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                        {contractDetails.paymentSignature}
                      </code>
                      <button
                        onClick={() => window.open(`https://explorer.solana.com/tx/${contractDetails.paymentSignature}?cluster=devnet`, '_blank')}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {contractDetails.createFranchiseSignature && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Franchise Creation:
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1 flex items-center justify-between">
                        <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                          {contractDetails.createFranchiseSignature}
                        </code>
                        <button
                          onClick={() => window.open(`https://explorer.solana.com/tx/${contractDetails.createFranchiseSignature}?cluster=devnet`, '_blank')}
                          className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Investment Contract:
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 mt-1 flex items-center justify-between">
                      <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                        {contractDetails.contractSignature}
                      </code>
                      <button
                        onClick={() => window.open(`https://explorer.solana.com/tx/${contractDetails.contractSignature}?cluster=devnet`, '_blank')}
                        className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const businessSlug = formData.selectedBusiness?.slug || formData.selectedBusiness?.name?.toLowerCase().replace(/\s+/g, '-');
                    const franchiseSlug = formData.locationDetails.franchiseSlug;
                    if (businessSlug && franchiseSlug) {
                      window.location.href = `/${businessSlug}/${franchiseSlug}/manager`;
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  className="flex-1"
                >
                  View Franchise Dashboard
                </Button>
                <Button onClick={() => window.location.href = '/'} variant="outline" className="flex-1">
                  Go Home
                </Button>
              </div>
            </motion.div>
          )}



        </AnimatePresence>
      </div>

      {/* Footer */}
      {currentStep <= totalSteps && (
        <div className="p-6 border-t border-gray-200 dark:border-stone-700">
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          ) : currentStep === 4 ? (
            <div className="flex items-center justify-between">
              {/* Left side - Payment totals */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount: {formatCurrencyAmount(formData.investment.selectedShares * convertUSDToCurrentCurrency(1) * 1.2)}
                </div>
                <div className="text-lg font-semibold">
                  Pay: {(formData.investment.selectedShares * calculateSharePrice() * 1.2).toFixed(4)} SOL
                </div>
                {/* Brand wallet balance */}
                <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Brand Wallet: {brandWalletLoading ? '...' : `${brandWalletBalance.toFixed(4)} SOL`}
                </div>
              </div>

              {/* Right side - Payment button */}
              <div className="flex items-center gap-3">
                {connected ? (
                  <Button
                    onClick={async () => {
                      const result = await handleSlidePay();
                      if (result === 'success') {
                        // Payment successful, handleSlidePay already handles the success flow
                      }
                    }}
                    disabled={loading || solBalance < (formData.investment.selectedShares * calculateSharePrice() * 1.2)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      console.log('Footer connect wallet button clicked');
                      console.log('Wallet modal setVisible:', setVisible);
                      setVisible(true);
                    }}
                    variant="outline"
                    className="px-6 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}




    </div>
  );
};

export default TypeformCreateFranchiseModal;
