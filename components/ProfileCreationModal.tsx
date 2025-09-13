'use client'

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

const MALE_AVATARS = Array.from({ length: 5 }, (_, i) => `/avatar/avatar-m-${i + 1}.png`);
const FEMALE_AVATARS = Array.from({ length: 6 }, (_, i) => `/avatar/avatar-f-${i + 1}.png`);

declare global {
  interface Window {
    initGooglePlaces?: () => void;
  }
}

// Define the profile data type for the form
interface ProfileData {
  avatar: string;
  full_name: string;
  location: string;
  formatted_address: string;
  area: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  profession: string;
  annual_income: string;
  investment_budget: string;
  phone: string;
  email?: string;
}

const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({ isOpen, onClose, email }) => {
  const upsertProfile = useMutation(api.myFunctions.upsertProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileData, setProfileData] = useState<ProfileData>({
    avatar: MALE_AVATARS[0],
    full_name: '',
    location: '',
    formatted_address: '',
    area: '',
    district: '',
    state: '',
    country: '',
    pincode: '',
    profession: '',
    annual_income: '',
    investment_budget: '',
    phone: '',
    email: '',
  });
  const [showFemaleAvatars, setShowFemaleAvatars] = useState(false);

  useEffect(() => {
    // Initialize Google Places Autocomplete
    window.initGooglePlaces = () => {
      const input = document.getElementById('location') as HTMLInputElement;
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        let area = '', district = '', state = '', country = '', pincode = '';

        // Extract address components
        place.address_components?.forEach((component: google.maps.GeocoderAddressComponent) => {
          const types = component.types;
          if (types.includes('sublocality_level_1')) {
            area = component.long_name || '';
          }
          if (types.includes('sublocality_level_2')) {
            district = component.long_name || '';
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name || '';
          }
          if (types.includes('country')) {
            country = component.long_name || '';
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name || '';
          }
        });

        setProfileData(prev => ({
          ...prev,
          location: place.name || '',
          formatted_address: place.formatted_address || '',
          area: area || '',
          district: district || '',
          state: state || '',
          country: country || '',
          pincode: pincode || '',
        }));
      });
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call Convex mutation
      await upsertProfile({
        gender: 'male', // Default to male, you might want to add a gender selection in your form
        first_name: profileData.full_name.split(' ')[0] || '',
        family_name: profileData.full_name.split(' ').slice(1).join(' ') || '',
        monthly_income: profileData.annual_income ? (parseInt(profileData.annual_income) / 12).toString() : '0',
        location: profileData.location,
        formatted_address: profileData.formatted_address,
        area: profileData.area,
        district: profileData.district,
        state: profileData.state,
        country: profileData.country,
        pincode: profileData.pincode,
        investment_budget: profileData.investment_budget,
        phone: phoneNumber,
        email: email || '',
      });

      toast.success('Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setProfileData(prev => ({ ...prev, email: newEmail }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const requiredFields: (keyof ProfileData)[] = [
    'avatar',
    'full_name',
    'location',
    'profession',
    'annual_income',
    'investment_budget',
  ];
  const isFormComplete = requiredFields.every(field => !!profileData[field]);

  if (!isOpen) return null;

  return (
    <>

      <Dialog open={isOpen} onClose={isFormComplete ? onClose : () => {}} className="relative z-50" static={!isFormComplete}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <Dialog.Title className="text-xl font-semibold mb-4 text-gray-900">
              Complete Your Profile
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Avatar <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setShowFemaleAvatars(false)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${!showFemaleAvatars ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFemaleAvatars(true)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${showFemaleAvatars ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Female
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {(showFemaleAvatars ? FEMALE_AVATARS : MALE_AVATARS).map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setProfileData(prev => ({ ...prev, avatar }))}
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                        profileData.avatar === avatar ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={avatar}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={profileData.full_name}
                  onChange={handleInputChange('full_name')}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  value={profileData.location}
                  onChange={handleInputChange('location')}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Start typing your location..."
                  required
                />
              </div>

              {/* Profession */}
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Profession <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="profession"
                  value={profileData.profession}
                  onChange={handleInputChange('profession')}
                  className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              {/* Annual Income */}
              <div>
                <label htmlFor="annualIncome" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Annual Income <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="annualIncome"
                    value={profileData.annual_income}
                    onChange={handleInputChange('annual_income')}
                    className="w-full h-11 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>

              {/* Monthly Investment Budget */}
              <div>
                <label htmlFor="investmentBudget" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Monthly Franchise Investment Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="investmentBudget"
                    value={profileData.investment_budget}
                    onChange={handleInputChange('investment_budget')}
                    className="w-full h-11 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    min="0"
                    step="100"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormComplete}
                className="w-full h-11 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Profile...' : 'Complete Profile'}
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default ProfileCreationModal; 