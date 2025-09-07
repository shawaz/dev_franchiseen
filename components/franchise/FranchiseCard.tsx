"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalCurrency } from "@/contexts/GlobalCurrencyContext";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { calculateTotalShares, calculateAvailableShares, FIXED_AED_PER_SHARE } from "@/lib/franchise-calculations";


interface FranchiseCardProps {
  type: "fund" | "launch" | "live"; // Keep old tab names for compatibility
  title: string;
  location: string;
  price: number;
  image: string;
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: string | number;
  returnRate?: string | number;
  investorsCount?: number;
  fundingGoal?: number;
  fundingProgress?: number;
  // Launching specific props
  startDate?: string;
  endDate?: string;
  launchProgress?: number;
  // Outlets specific props
  currentBalance?: number;
  totalBudget?: number;
  activeOutlets?: number;
  id: string;
  brandSlug?: string;
  franchiseSlug?: string;
  // Business/Brand information
  businessId?: Id<"businesses">;
}

const FranchiseCard: React.FC<FranchiseCardProps> = ({
  type,
  title,
  location,
  price,
  image,
  rating,
  bedrooms,
  bathrooms,
  size,
  returnRate,
  investorsCount,
  fundingGoal,
  fundingProgress,
  startDate,
  endDate,
  launchProgress,
  currentBalance,
  totalBudget,
  activeOutlets,
  id,
  brandSlug,
  franchiseSlug,
  businessId,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const { formatAmount } = useGlobalCurrency();

  // Get business data from Convex
  const business = useQuery(
    api.businesses.getById,
    businessId ? { businessId } : "skip"
  );

  // Get dynamic franchise data based on franchise ID
  // Only treat as franchise ID if it looks like a Convex ID
  const franchiseId = id && id.length > 10 && !id.startsWith('fund-') && !id.startsWith('launch-') && !id.startsWith('live-')
    ? id as Id<"franchise">
    : null;

  // Get funding progress for "fund" type
  const fundingData = useQuery(
    api.franchise.getFundingProgress,
    type === "fund" && franchiseId ? { franchiseId } : "skip"
  );

  // Get investment tracking for detailed metrics
  const investmentData = useQuery(
    api.franchise.getInvestmentTracking,
    franchiseId ? { franchiseId } : "skip"
  );

  // Get FRC token data for "live" type
  const tokenData = useQuery(
    api.frcTokens.getFranchiseToken,
    type === "live" && franchiseId ? { franchiseId } : "skip"
  );

  // Get current user for share calculations
  const currentUser = useQuery(api.users.getCurrentUser, {});

  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const calculateLaunchProgress = () => {
    if (launchProgress !== undefined) return launchProgress;
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    return Math.round(((now - start) / (end - start)) * 100);
  };

  // Check if we're still loading dynamic data
  const isLoadingDynamicData = () => {
    if (type === "fund") return fundingData === undefined && franchiseId;
    if (type === "launch") return investmentData === undefined && franchiseId;
    if (type === "live") return (tokenData === undefined || investmentData === undefined) && franchiseId;
    return false;
  };

  // Calculate user's share value for live franchises
  const getUserShareValue = () => {
    if (!currentUser || !investmentData || !tokenData) return 0;

    // Find user's shares in the investment data
    const userInvestment = investmentData.investors?.topInvestors?.find(
      (investor: any) => investor.userId === currentUser._id
    );

    if (!userInvestment) return 0;

    // Calculate current value: shares * current token price
    return userInvestment.numberOfShares * (tokenData.tokenPrice || 10);
  };

  const renderCardContent = () => {
    switch (type) {
      case "fund":
        // Use dynamic funding data if available, fallback to props
        const dynamicFundingProgress = fundingData?.fundingPercentage || 0;
        const dynamicTotalRaised = fundingData?.totalRaised || fundingProgress || 0;
        const dynamicFundingTarget = fundingData?.fundingTarget || fundingGoal || price;
        const dynamicInvestorsCount = investmentData?.investors?.totalCount || investorsCount || 0;

        // Calculate correct total shares and available shares
        const totalInvestmentAmount = investmentData?.franchise?.totalInvestment || dynamicFundingTarget;
        const totalSharesAvailable = calculateTotalShares(totalInvestmentAmount);
        const soldShares = investmentData?.investment?.totalShares || 0;
        const availableShares = calculateAvailableShares(totalInvestmentAmount, soldShares);

        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(totalInvestmentAmount)}</p>
              <div className="text-sm text-green-600 font-medium">
                {dynamicFundingProgress.toFixed(1)}% Funded
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, dynamicFundingProgress)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{formatCurrency(dynamicTotalRaised)} raised</span>
                <span>{availableShares} shares left</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {totalSharesAvailable} total shares • AED {FIXED_AED_PER_SHARE}/share • {dynamicInvestorsCount} investors
            </div>
            {/* <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Funding
              </span>
            </div> */}
          </>
        );
      case "launch":
        // Use dynamic launch data from investment tracking
        const launchTotalInvestment = investmentData?.franchise?.totalInvestment || price;
        const launchFundingPercentage = investmentData?.investment?.fundingPercentage || 0;
        const progressPercent = calculateLaunchProgress();

        // Calculate correct total shares for launch phase
        const launchTotalShares = calculateTotalShares(launchTotalInvestment);
        const launchSoldShares = investmentData?.investment?.totalShares || 0;
        const launchInvestorsCount = investmentData?.investors?.totalCount || 0;

        // Calculate launch progress based on funding completion and time
        const launchProgressPercent = Math.min(100, (launchFundingPercentage + progressPercent) / 2);

        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(launchTotalInvestment)}</p>
              <div className="text-sm text-blue-600 font-medium">
                {launchProgressPercent.toFixed(1)}% Complete
              </div>
            </div>
            {(startDate && endDate) || investmentData ? (
              <div className="mt-2">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${launchProgressPercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs  mt-1">
                  {startDate && endDate ? (
                    <>
                      <span>Start: {formatDate(startDate)}</span>
                      <span>End: {formatDate(endDate)}</span>
                    </>
                  ) : (
                    <>
                      <span>Funded: {launchFundingPercentage.toFixed(1)}%</span>
                      <span>{launchSoldShares}/{launchTotalShares} shares</span>
                    </>
                  )}
                </div>
              </div>
            ) : null}
            <div className="mt-1 text-xs text-muted-foreground">
              {launchTotalShares} total shares • {launchInvestorsCount} investors • Fully funded
            </div>
            {/* <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Launching
              </span>
            </div> */}
          </>
        );
      case "live":
        // Use dynamic token data if available, fallback to props or calculated values
        const liveMonthlyRevenue = tokenData?.monthlyRevenue || 0;
        const liveMonthlyExpenses = tokenData?.monthlyExpenses || 0;
        const liveNetProfit = liveMonthlyRevenue - liveMonthlyExpenses;
        const liveTotalRevenue = tokenData?.totalRevenue || currentBalance || 150000;
        const liveTotalInvestment = investmentData?.franchise?.totalInvestment || totalBudget || 300000;

        // Calculate correct total shares for live franchise
        const liveTotalShares = calculateTotalShares(liveTotalInvestment);

        const liveTokenPrice = tokenData?.tokenPrice || FIXED_AED_PER_SHARE;
        const liveMarketCap = liveTotalShares * liveTokenPrice;

        // Calculate performance metrics
        const revenueProgress = Math.min(100, (liveTotalRevenue / liveTotalInvestment) * 100);
        const profitMargin = liveMonthlyRevenue > 0 ? (liveNetProfit / liveMonthlyRevenue) * 100 : 0;

        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(liveTotalInvestment)}</p>
              <div className="text-sm text-neutral-600 font-medium">
                {profitMargin > 0 ? `+${profitMargin.toFixed(1)}%` : `${profitMargin.toFixed(1)}%`} Profit
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-neutral-600 h-2 rounded-full">
                <div
                  className={`h-2 rounded-full ${profitMargin >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, revenueProgress)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Revenue: {formatCurrency(liveTotalRevenue)}</span>
                <span>My Value: {formatCurrency(getUserShareValue())}</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {liveTotalShares} total shares • {formatCurrency(liveTokenPrice)}/share • Market Cap: {formatCurrency(liveMarketCap)}
            </div>
            {/* Show monthly performance if available */}
            {liveMonthlyRevenue > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Monthly: {formatCurrency(liveMonthlyRevenue)} revenue, {formatCurrency(liveNetProfit)} profit
              </div>
            )}
            {/* <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Outlets
              </span>
            </div> */}
          </>
        );
    }
  };

  // Create a franchise object with all the props
  const franchise = {
    _id: id,
    name: title,
    title,
    location,
    price,
    images: [image],
    rating,
    bedrooms,
    bathrooms,
    size: size ? String(size) : undefined,
    status: type,
    // Add franchise-specific properties
    ...(type === "fund" && {
      returnRate,
      investorsCount,
      fundingGoal,
      fundingProgress,
      minimumInvestment: price,
    }),
    ...(type === "launch" && {
      startDate,
      endDate,
      launchProgress,
    }),
    ...(type === "live" && {
      currentBalance,
      totalBudget,
      activeOutlets,
    }),
  };

  // Determine the navigation path using brandSlug routing
  const getNavigationPath = () => {
    if (brandSlug && franchiseSlug) {
      return `/${brandSlug}/${franchiseSlug}`;
    }
    // Fallback to old routing if brandSlug or franchiseSlug is not available
    const baseId = id
      ? id.toString().replace(/^(fund-|launch-|live-)/, "")
      : "1";
    return `/franchise/${baseId}`;
  };

  // Use the franchise object to avoid unused variable warning
  console.log("Rendering franchise:", franchise.title);

  return (
    <>
      <div
        className="overflow-hidden  bg-background-light dark:bg-stone-800/50 bg-background/50 backdrop-blur  border border-border hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(getNavigationPath())}
      >
        <div className="relative">
          {image && !image.startsWith("blob:") ? (
            <Image
              src={image}
              alt={title}
              width={400}
              height={600}
              className="w-full h-65 object-cover"
              unoptimized={image.startsWith("https://images.unsplash.com")}
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Image not available</p>
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-background/80"
          >
            <Heart
              size={20}
              className={isFavorite ? "fill-destructive text-destructive" : ""}
            />
          </button>
        </div>
        <div className="p-4">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-3">
            {business?.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={business.name || title}
                width={46}
                height={46}
                className="w-9 h-9 object-cover"
              />
            ) : (
              <div className="">
               {/* Franchise Title and Location */}
                <h3 className="font-semibold truncate mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{location}</p>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{business?.name}</h3>
                <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>

          

          {isLoadingDynamicData() ? (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full animate-pulse"></div>
              <div className="flex justify-between text-xs">
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          ) : (
            renderCardContent()
          )}
        </div>
      </div>

      {/* Property details now shown on property page */}
    </>
  );
};

export default FranchiseCard;