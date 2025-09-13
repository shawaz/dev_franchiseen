import BusinessGrid from "@/components/business/BusinessGrid";
import { api } from "../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

// Import the Business type
import type { Business } from "@/components/business/BusinessGrid";
import FooterMobile from "@/components/FooterMobile";

export default async function Home() {
  // Fetch all brands from Convex
  const businesses = await fetchQuery(api.brands.list, {});
  // Map Convex data to BusinessGrid's expected type

  type Industry = {
    _id: string;
    name: string;
  };
  type Category = {
    _id: string;
    name: string;
    industry_id: string;
  };
  type BackendBusiness = {
    _id: string;
    name: string;
    logoUrl?: string;
    industry: Industry | null;
    category: Category | null;
    costPerArea?: number;
    min_area?: number;
    // Add other backend fields as needed
  };
  const initialBusinesses: Business[] = (businesses as unknown[]).map((b) => {
    const backend = b as BackendBusiness;
    return {
      id: backend._id,
      name: backend.name,
      logo_url: backend.logoUrl || "/logo/logo-2.svg",
      industry: backend.industry?.name || "Unknown",
      category: backend.category?.name || "Unknown",
      costPerArea: backend.costPerArea,
      min_area: backend.min_area,
    };
  });
  return (
    <div className="pt-[88px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BusinessGrid initialBusinesses={initialBusinesses} />
      </div>
      <FooterMobile />
    </div>
  );
}
