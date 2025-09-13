'use client';

import React from 'react';
import FranchiseList from '@/components/franchise/FranchiseList';
import { Id } from '@/convex/_generated/dataModel';

interface ConvexUser {
  _id: string;
  email: string;
  isActivated?: boolean;
  stripeCardholderId?: string;
}

// Copied from FranchiseList.tsx, using Id<T> for _id fields
interface Business {
  _id: Id<'brands'>;
  name: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
}

interface Share {
  _id: Id<'shares'>;
  _creationTime: number;
  franchiseId: Id<'franchise'>;
  userId: Id<'users'>;
  userName: string;
  userImage: string;
  numberOfShares: number;
  purchaseDate: number;
  costPerShare: number;
}

interface Franchise {
  _id: Id<'franchise'>;
  brandId: Id<'brands'>;
  owner_id: Id<'users'>;
  locationAddress: string;
  building: string;
  carpetArea: number;
  costPerArea: number;
  totalInvestment: number;
  totalShares: number;
  selectedShares: number;
  createdAt: number;
  status: string;
}

interface FranchiseDetail {
  share: Share;
  franchise: Franchise | null;
  business: Business | null;
}

type FranchiseDetailsArray = FranchiseDetail[];

interface ProfileFranchiseClientProps {
  convexUser: ConvexUser;
  shares: Share[];
  franchiseDetails: FranchiseDetailsArray;
}

export default function ProfileFranchiseClient({ shares, franchiseDetails }: ProfileFranchiseClientProps) {

  // if (!convexUser.isActivated || !convexUser.stripeCardholderId) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
  //       <StripeCardholderFormWrapper />
  //       <p className="text-gray-600 dark:text-gray-400 text-center">
  //         Please activate your account to view your franchises.
  //       </p>
  //     </div>
  //   );
  // }

  if (!shares || shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">No Franchise Shares</h1>
        <p className="text-gray-600 dark:text-gray-400">You don&apos;t own any franchise shares yet.</p>
      </div>
    );
  }

  return <FranchiseList franchiseDetails={franchiseDetails} />;
} 