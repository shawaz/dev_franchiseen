import React from 'react';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { currentUser } from '@clerk/nextjs/server';
import ProfileDashboard from '@/components/profile/ProfileDashboard';

export default async function ProfilePage() {
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

  // Get user's franchise shares
  const shares = await fetchQuery(api.shares.getSharesByShareholder, {
    shareholderId: convexUser._id
  }).catch(() => []);

  // Get franchise details for each share
  const franchiseDetails = shares ? await Promise.all(
    shares.map(async (share) => {
      const franchise = await fetchQuery(api.franchise.getById, { franchiseId: share.franchiseId }).catch(() => null);
      const business = franchise ? await fetchQuery(api.brands.getById, { brandId: franchise.brandId }).catch(() => null) : null;
      return {
        share,
        franchise,
        business
      };
    })
  ) : [];

  // Serialize user data for client component
  const serializedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    emailAddresses: user.emailAddresses?.map((email: any) => ({
      emailAddress: email.emailAddress
    }))
  };

  return (
    <ProfileDashboard 
      user={serializedUser}
      convexUser={convexUser}
      franchiseDetails={franchiseDetails}
    />
  );
}