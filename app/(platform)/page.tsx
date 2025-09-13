"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FranchiseLifecycleCard from "@/components/franchise/FranchiseLifecycleCard";
import { Button } from "@/components/ui/button";
import { GridSkeleton } from "@/components/skeletons/GridSkeleton";




export default function Home() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fund");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch only approved franchises from the database (fund stage and beyond)
  const allFranchises = useQuery(api.franchise.getApprovedFranchises, {});
  const allBusinesses = useQuery(api.brands.listAll, {});

  // Create a map of businesses for quick lookup
  const businessMap = new Map();
  if (allBusinesses) {
    allBusinesses.forEach(business => {
      businessMap.set(business._id, business);
    });
  }

  // Update active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams?.get("tab") as "fund" | "launch" | "invest" | null;
    if (tab && ["fund", "launch", "invest"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);



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
              <h2 className=" font-semibold text-sm ml-2">RESULTS: {allFranchises?.length}</h2>
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

    return (
      <div className="py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {allFranchises && allFranchises.length > 0 ? (
            allFranchises
              .filter(franchise => {
                // Filter by active tab (stage)
                switch (activeTab) {
                  case "fund":
                    return franchise.stage === "fund";
                  case "launch":
                    return franchise.stage === "launch";
                  case "live":
                    return franchise.stage === "live";
                  default:
                    return true;
                }
              })
              .filter(franchise => {
                // Filter by search query
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                const brand = businessMap.get(franchise.brandId);
                return (
                  franchise.building.toLowerCase().includes(query) ||
                  franchise.locationAddress.toLowerCase().includes(query) ||
                  (brand?.name.toLowerCase() || "").includes(query)
                );
              })
              .map((franchise) => {
                const brand = businessMap.get(franchise.brandId);
                if (!brand) return null;

                return (
                  <FranchiseLifecycleCard
                    key={franchise._id}
                    franchise={franchise}
                    brand={brand}
                    showInvestButton={true}
                  />
                );
              })
              .filter(Boolean)
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No franchises found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "Try a different search term"
                  : activeTab === "fund"
                    ? "No franchises are currently fundraising"
                    : activeTab === "launch"
                    ? "No franchises are currently launching"
                    : "No live franchises available"}
              </p>
            </div>
          )}
        </div>
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