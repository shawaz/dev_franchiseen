"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FranchiseCard from "@/components/franchise/FranchiseCard";
import FranchisesListView from "@/components/franchise/FranchisesListView";
import { Calendar, DollarSign, HomeIcon, MapPin, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  businessId?: Id<"businesses">;
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
  const [activeTab, setActiveTab] = useState("fund");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => 'card');

  // Fetch all franchises from the database
  const allFranchises = useQuery(api.franchise.list, {});
  const allBusinesses = useQuery(api.businesses.listAll, {});

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "fund" | "launch" | "invest" | null;
    if (tab && ["fund", "launch", "invest"].includes(tab)) {
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

        <div className="sticky top-[60px] z-10 flex flex-col justify-between items-center md:flex-row gap-4 md:px-1 bg-white dark:bg-stone-800 md:border border-border">


            <div className="flex items-center w-full md:w-auto gap-2">
              <div className="inline-flex bg-white dark:bg-stone-800 md:dark:bg-stone-900 border md:border-none w-full md:w-auto p-1 gap-1">
                {["fund", "launch", "live"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-9 py-2 text-sm uppercase font-bold cursor-pointer w-full md:w-auto transition-colors ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-secondary-foreground/10"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              {/* <div className="inline-flex bg-secondary p-1 gap-1">
                {(["card","list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-5 py-2 text-sm uppercase font-bold cursor-pointer transition-colors ${
                      viewMode === mode ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary-foreground/10"
                    }`}
                  >
                    {mode === "card" ? "Card" : "List"}
                  </button>
                ))}
              </div> */}
            </div>
            <div className=" items-center gap-3 hidden md:flex">
              <h2 className=" font-semibold text-sm ml-2">RESULTS: 45,495 </h2>
              <Button variant={"outline"}>Filter Franchise</Button>
            </div>


      </div>
    );
  };

  // Render property listings based on active tab
  const renderTabContent = () => {
    // Show loading state if data is still loading
    const isLoading = allFranchises === undefined || allBusinesses === undefined;

    if (isLoading) {
      return <GridSkeleton count={12} columns={3} type="franchise" />;
    }

    // Convert database franchises to display format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const convertToDisplayFormat = (dbFranchises: any[], businesses: any[]) => {
      if (!dbFranchises || !businesses) return [];
      
      return dbFranchises.map((franchise) => {
        const business = businesses.find(b => b._id === franchise.businessId);
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
          businessId: franchise.businessId, // Add businessId for brand data
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
    
    // Filter by status/tab
    let currentProperties: Franchise[] = [];
    switch (activeTab) {
      case "fund":
        currentProperties = convertedFranchises.filter(f => f.type === "fund");
        break;
      case "launch":
        currentProperties = convertedFranchises.filter(f => f.type === "launch");
        break;
      case "live":
        currentProperties = convertedFranchises.filter(f => f.type === "live");
        break;
    }

    const filteredProperties = getFilteredProperties(currentProperties);

    return (
      <div className="py-6">
        {viewMode === 'list' ? (
          <FranchisesListView
            franchises={filteredProperties.map(f => ({
              _id: f._id.toString(),
              building: f.title,
              locationAddress: f.location,
              carpetArea: (f.size as number) || 0,
              totalInvestment: f.fundingGoal || f.totalBudget || 0,
              status: f.type === 'launch' ? 'Launching' : f.type === 'live' ? 'Active' : 'Funding',
              owner_id: '',
              costPerArea: f.price,
              selectedShares: Math.floor((f.fundingProgress || 0) / Math.max(1, f.price)),
              totalShares: 100,
              slug: f.franchiseSlug,
              costPerShare: f.price,
              brandSlug: f.brandSlug,
            }))}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((franchise) => (
                <FranchiseCard
                  key={franchise._id.toString()}
                  id={franchise._id.toString()}
                  type={activeTab as "fund" | "launch" | "live"}
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
                  businessId={franchise.businessId}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No properties found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchQuery
                    ? "Try a different search term"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            )}
          </div>
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