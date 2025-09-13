import BusinessPageClient from './BusinessPageClient';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { notFound } from 'next/navigation';
import { Doc } from '@/convex/_generated/dataModel';

interface BusinessPageProps {
  params: Promise<{
    brandSlug: string;
  }>;
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const resolvedParams = await params;
  const brandSlug = resolvedParams.brandSlug;

  // Get brand by slug
  const business = await fetchQuery(api.brands.getBySlug, { slug: brandSlug });
  if (!business) return notFound();

  // Fetch only publicly visible franchises for this brand
  const franchises = await fetchQuery(api.franchise.getPublicFranchisesByBrand, {
    brandId: business._id
  }) as Doc<"franchise">[];

  return (
    <BusinessPageClient 
      businessId={business._id}
      brandSlug={brandSlug}
      franchises={franchises.map(f => ({
        _id: f._id,
        building: f.building,
        locationAddress: f.locationAddress,
        carpetArea: f.carpetArea,
        totalInvestment: f.totalInvestment,
        status: f.status,
        owner_id: f.owner_id,
        costPerArea: f.costPerArea,
        selectedShares: f.selectedShares,
        totalShares: f.totalShares,
        costPerShare: f.costPerArea * f.carpetArea / f.totalShares,
      }))}
    />
  );
} 