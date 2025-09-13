'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { Id } from '@/convex/_generated/dataModel'

interface ManageFranchiseButtonProps {
  businessId: Id<"brands">;
  franchiseId: Id<"franchise">;
  franchise: {
    owner_id: Id<"users">;
  } | null;
}

export default function ManageFranchiseButton({ businessId, franchiseId, franchise }: ManageFranchiseButtonProps) {
  const { user } = useUser();
  const convexUser = useQuery(api.myFunctions.getUserByEmail, { 
    email: user?.emailAddresses?.[0]?.emailAddress || '' 
  });

  // If no user is logged in, or no franchise data, or no convex user data, don't show the button
  if (!user || !franchise || !convexUser) return null;

  // Only show the button if the current user is the franchise owner
  if (convexUser._id !== franchise.owner_id) return null;

  return (
    <Link href={`/business/${businessId}/franchise/${franchiseId}/overview`}>
      <Button variant="outline" className='bg-dark text-stone-900 dark:bg-dark/80 ml-3 cursor-pointer dark:text-white'>
        Manage Franchise
      </Button>
    </Link>
  )
} 