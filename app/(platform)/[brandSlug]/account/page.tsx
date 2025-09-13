import React from 'react';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { currentUser } from '@clerk/nextjs/server';
import BrandOwnerDashboard from '@/components/profile/BrandOwnerDashboard';

interface AccountPageProps {
  params: Promise<{
    brandSlug: string;
  }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const resolvedParams = await params;
  const brandSlug = resolvedParams.brandSlug;

  const user = await currentUser();
  if (!user?.emailAddresses?.[0]?.emailAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">Please sign in to access your account.</p>
      </div>
    );
  }

  // Get user from Convex
  const convexUser = await fetchQuery(api.myFunctions.getUserByEmail, {
    email: user.emailAddresses[0].emailAddress
  });

  if (!convexUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">Please complete your profile setup.</p>
      </div>
    );
  }

  // Get business by slug
  const business = await fetchQuery(api.brands.getBySlug, { slug: brandSlug });
  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">Business Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400">The requested business could not be found.</p>
      </div>
    );
  }

  // Check if the current user is the owner of this business
  if (business.owner_id !== convexUser._id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You are not authorized to access this business account.</p>
      </div>
    );
  }

  // Get franchises for this business
  const franchises = await fetchQuery(api.franchise.listByBusiness, {
    businessId: business._id,
  });

  return (
    <BrandOwnerDashboard
      convexUser={convexUser}
      business={business}
      franchises={franchises}
      brandSlug={brandSlug}
    />
  );
}