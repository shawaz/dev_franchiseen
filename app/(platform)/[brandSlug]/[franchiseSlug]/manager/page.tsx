import React from 'react';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { currentUser } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { Doc } from '@/convex/_generated/dataModel';
import FranchiseManagerDashboard from '@/components/franchise/FranchiseManagerDashboard';

interface FranchiseManagerPageProps {
  params: Promise<{
    brandSlug: string;
    franchiseSlug: string;
  }>;
}

export default async function FranchiseManager({ params }: FranchiseManagerPageProps) {
  const resolvedParams = await params;
  const brandSlug = resolvedParams.brandSlug;
  const franchiseSlug = resolvedParams.franchiseSlug;

  // Get current user
  const user = await currentUser();
  if (!user?.emailAddresses?.[0]?.emailAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">No Profile Found</h1>
        <p className="text-gray-600 dark:text-gray-400">Please complete your profile setup to view your profile.</p>
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
        <h1 className="text-2xl font-semibold">No Profile Found</h1>
        <p className="text-gray-600 dark:text-gray-400">Please complete your profile setup to view your profile.</p>
      </div>
    );
  }

  // Get business by slug
  const business = await fetchQuery(api.brands.getBySlug, { slug: brandSlug });
  if (!business) return notFound();

  // Check if the current user is the owner of this business
  if (business.owner_id !== convexUser._id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You are not authorized to view this brand's owner dashboard.</p>
      </div>
    );
  }

  // Get all franchises for this business
  const allFranchises = await fetchQuery(api.franchise.list, {});
  const franchises = (allFranchises as Doc<"franchise">[]).filter(f => f.brandId === business._id);

  // Find the specific franchise for this slug
  const franchise = franchises.find(f => f.slug === franchiseSlug);

  if (!franchise) {
    return <div>Franchise not found</div>;
  }

  return (
    <FranchiseManagerDashboard
      business={business}
      franchise={franchise}
      brandSlug={brandSlug}
    />
  );
}