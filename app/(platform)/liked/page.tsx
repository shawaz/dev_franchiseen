"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FranchiseCard from "@/components/franchise/FranchiseCard";
import BusinessCard from "@/components/business/BusinessCard";
import { Calendar, DollarSign, HomeIcon, MapPin, Search, TrendingUp } from "lucide-react";
import { GridSkeleton } from "@/components/skeletons/GridSkeleton";


interface Franchise {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: string | number;
  squareFeet?: number;
  description?: string;
  type: "fund" | "launch" | "live";
  businessSlug?: string;
  brandSlug?: string;
  franchiseSlug?: string;
  brandId?: Id<"brands">;
  // funding specific properties
  availableFrom?: string;
  returnRate?: string | number;
  investorsCount?: number;
  fundingGoal?: number;
  fundingProgress?: number;
  minimumInvestment?: number;
  // launching specific properties
  yearBuilt?: number;
  startDate?: string;
  endDate?: string;
  launchProgress?: number;
  // outlets specific properties
  currentBalance?: number;
  totalBudget?: number;
  activeOutlets?: number;
  projectedAnnualYield?: number;
}

export default function Home() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("franchise");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all franchises from the database
  const allFranchises = useQuery(api.franchise.list, {});
  const allBusinesses = useQuery(api.brands.listAll, {});

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "franchise" | "brand" | null;
    if (tab && ["franchise", "brand"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Filter franchises based on search query
  const getFilteredProperties = (franchisesToFilter: Franchise[]) => {
    if (!searchQuery) return franchisesToFilter;
    const query = searchQuery.toLowerCase();
    return franchisesToFilter.filter(
      (franchise) =>
        franchise.title.toLowerCase().includes(query) ||
        franchise.location.toLowerCase().includes(query) ||
        (franchise.description?.toLowerCase() || "").includes(query),
    );
  };

  // Render search and filters for each tab
  
  const _renderSearchFilters = () => {
    return (

        <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border border-border">
          <div className="flex justify-center">
          <div className="inline-flex bg-secondary w-full p-1 gap-1">
            {["franchise", "brand"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-9 py-2 text-sm uppercase font-bold cursor-pointer w-full transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary-foreground/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
          <div className="flex-1 relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <input
              type="text"
              placeholder="Search location"
              className="w-full pl-10 pr-4 py-2  border border-input bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 relative">
                <TrendingUp
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <select className="w-full pl-10 pr-4 py-2  border border-input bg-background">
                  <option value="">Return Rate</option>
                  <option value="0-5">Up to 5%</option>
                  <option value="5-10">5% - 10%</option>
                  <option value="10+">10%+</option>
                </select>
              </div>

              <div className="flex-1 relative ">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <select className="w-full pl-10 pr-4 py-2  border border-input bg-background">
                  <option value="">Min Investment</option>
                  <option value="0-5000">Up to AED 5,000</option>
                  <option value="5000-10000">AED 5,000 - 10,000</option>
                  <option value="10000+">AED 10,000+</option>
                </select>
              </div>

        </div>
    );
  };

  // Render property listings based on active tab
  const renderTabContent = () => {
    // Show loading state if data is still loading
    const isLoading = allFranchises === undefined || allBusinesses === undefined;

    if (isLoading) {
      return <GridSkeleton count={8} columns={3} type={activeTab === "franchise" ? "franchise" : "business"} />;
    }

    // Convert database franchises to display format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertToDisplayFormat = (dbFranchises: any[], businesses: any[]) => {
      if (!dbFranchises || !businesses) return [];
      
      return dbFranchises.map((franchise) => {
        const business = businesses.find(b => b._id === franchise.brandId);
        const statusTypeMap: { [key: string]: "fund" | "launch" | "live" } = {
          "Funding": "fund",
          "Launching": "launch",
          "Active": "live",
          "Closed": "live"
        };

        // Extract area and country from locationAddress
        const formatLocation = (address: string) => {
          if (!address) return "Location";
          const parts = address.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            return `${parts[0]}, ${parts[parts.length - 1]}`; // First part (area) and last part (country)
          }
          return address;
        };

        return {
          _id: franchise._id,
          title: franchise.building || "Franchise Location",
          location: formatLocation(franchise.locationAddress || "Location"),
          price: franchise.costPerArea || 500,
          images: ["/images/1.svg"],
          rating: 4.5,
          size: franchise.carpetArea,
          type: statusTypeMap[franchise.status] || "fund",
          businessSlug: business?.slug || "business",
          brandSlug: business?.slug || "business",
          franchiseSlug: franchise.slug || franchise._id,
          businessId: franchise.brandId, // Use brandId instead of businessId
          // Funding specific
          returnRate: 8.5,
          investorsCount: Math.floor(Math.random() * 50) + 10,
          fundingGoal: franchise.totalInvestment,
          fundingProgress: (franchise.selectedShares || 0) * (franchise.costPerArea || 500),
          // Launching specific
          startDate: franchise.launchStartDate,
          endDate: franchise.launchEndDate,
          launchProgress: franchise.status === "Launching" ? 50 : 0,
          // Active/Live specific
          currentBalance: franchise.totalInvestment ? franchise.totalInvestment * 0.6 : 150000,
          totalBudget: franchise.totalInvestment || 300000,
          activeOutlets: 3,
          projectedAnnualYield: 10.5
        };
      });
    };
    
    const convertedFranchises = convertToDisplayFormat(allFranchises || [], allBusinesses || []);
    
    // Filter by tab type
    let currentProperties: Franchise[] = [];
    let uniqueBusinessesForCards: any[] = [];

    switch (activeTab) {
      case "franchise":
        // Show all franchises (individual franchise locations)
        currentProperties = convertedFranchises;
        break;
      case "brand":
        // Show unique brands/businesses (group by business)
        const uniqueBusinesses = new Map();
        convertedFranchises.forEach(franchise => {
          if (!uniqueBusinesses.has(franchise.businessSlug)) {
            uniqueBusinesses.set(franchise.businessSlug, franchise);
          }
        });
        currentProperties = Array.from(uniqueBusinesses.values());

        // Create business objects for BusinessCard
        uniqueBusinessesForCards = Array.from(uniqueBusinesses.values()).map(franchise => {
          const business = allBusinesses?.find(b => b.slug === franchise.businessSlug);
          return {
            id: business?._id || franchise._id,
            name: business?.name || franchise.title,
            logo_url: business?.logoUrl || "/logo/logo-2.svg",
            industry: "Business",
            category: "Franchise",
            costPerArea: franchise.price,
            min_area: franchise.size
          };
        });
        break;
    }

    const filteredProperties = getFilteredProperties(currentProperties);

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 py-6 gap-6">
        {activeTab === "brand" ? (
          // Render BusinessCard for brand tab
          uniqueBusinessesForCards.length > 0 ? (
            uniqueBusinessesForCards.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
              />
            ))
          ) : (
            <div className="text-center py-12 col-span-full">
              <h3 className="text-lg font-medium">No brands found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Try a different search term"
                  : "No liked brands yet"}
              </p>
            </div>
          )
        ) : (
          // Render FranchiseCard for franchise tab
          filteredProperties.length > 0 ? (
            filteredProperties.map((franchise) => (
              <FranchiseCard
                key={franchise._id.toString()}
                id={franchise._id.toString()}
                type={franchise.type}
                title={franchise.title}
                location={franchise.location || "Dubai, UAE"}
                price={franchise.price}
                image={
                  franchise.images && franchise.images.length > 0
                    ? franchise.images[0]
                    : ""
                }
                rating={franchise.rating || 4.5}
                bedrooms={franchise.bedrooms}
                bathrooms={franchise.bathrooms}
                size={franchise.squareFeet}
                returnRate={franchise.returnRate || 8}
                investorsCount={franchise.investorsCount || 42}
                fundingGoal={franchise.fundingGoal || 500000}
                fundingProgress={franchise.fundingProgress || 250000}
                startDate={franchise.startDate}
                endDate={franchise.endDate}
                launchProgress={franchise.launchProgress}
                currentBalance={franchise.currentBalance}
                totalBudget={franchise.totalBudget}
                activeOutlets={franchise.activeOutlets}
                brandSlug={franchise.brandSlug}
                franchiseSlug={franchise.franchiseSlug}
                businessId={franchise.brandId}
              />
            ))
          ) : (
            <div className="text-center py-12 col-span-full">
              <h3 className="text-lg font-medium">No franchises found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Try a different search term"
                  : "No liked franchises yet"}
              </p>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="py-6">
    
     {_renderSearchFilters()}

    {renderTabContent()}
    </div>
  );
}