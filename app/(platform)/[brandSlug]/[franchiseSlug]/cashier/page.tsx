import React from 'react';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { currentUser } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { Doc } from '@/convex/_generated/dataModel';
import CashierDashboard from '@/components/profile/CashierDashboard';

interface CashierPageProps {
  params: Promise<{
    brandSlug: string;
    franchiseSlug: string;
  }>;
}

export default async function CashierPage({ params }: CashierPageProps) {
  const resolvedParams = await params;
  const brandSlug = resolvedParams.brandSlug;
  const franchiseSlug = resolvedParams.franchiseSlug;

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

  // Get the specific franchise by slug
  const allFranchises = await fetchQuery(api.franchise.list, {});
  const franchise = (allFranchises as Doc<"franchise">[]).find(f =>
    f.brandId === business._id && f.slug === franchiseSlug
  );

  if (!franchise) return notFound();

  // Check if the current user has access to this franchise (owner or staff)
  if (business.owner_id !== convexUser._id) {
    // TODO: Add franchise staff access check here
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You are not authorized to access this franchise's cashier system.</p>
      </div>
    );
  }

  return (
    <CashierDashboard
      convexUser={convexUser}
      business={business}
      franchise={franchise}
      brandSlug={brandSlug}
    />
  );
}