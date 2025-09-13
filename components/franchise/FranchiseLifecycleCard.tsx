"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalCurrency } from "@/contexts/GlobalCurrencyContext";
import { Id } from "@/convex/_generated/dataModel";

interface FranchiseData {
  _id: Id<"franchise">;
  brandId: Id<"brands">;
  owner_id: Id<"users">;
  locationAddress: string;
  building: string;
  carpetArea: number;
  costPerArea: number;
  totalInvestment: number;
  totalShares: number;
  selectedShares: number;
  status: string;
  slug?: string;
  createdAt: number;
  // Additional fields for lifecycle management
  stage?: 'approval' | 'fund' | 'launch' | 'live' | 'closed';
  approvedAt?: number;
  launchDate?: number;
  images?: string[];
  fundingGoal?: number;
  currentFunding?: number;
  investorCount?: number;
}

interface Brand {
  _id: Id<"brands">;
  name: string;
  slug?: string;
  logoUrl?: string;
  industry?: { name: string } | null;
}

interface FranchiseLifecycleCardProps {
  franchise: FranchiseData;
  brand: Brand;
  showInvestButton?: boolean;
}

const FranchiseLifecycleCard: React.FC<FranchiseLifecycleCardProps> = ({
  franchise,
  brand,
  showInvestButton = true,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();
  const { formatAmount } = useGlobalCurrency();

  // Calculate correct investment values with $1.00 per share
  const SHARE_PRICE = 1.00; // Fixed $1.00 per share
  const baseInvestment = franchise.selectedShares * SHARE_PRICE;
  const transactionFee = baseInvestment * 0.02; // 2% transaction fee
  const totalInvestment = baseInvestment + transactionFee;
  const fundingProgress = franchise.currentFunding ? (franchise.currentFunding / totalInvestment) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const currentStage = franchise.stage || 'fund'; // Default to fund stage

  // Get primary franchise image
  const primaryImage = franchise.images?.[0] || brand.logoUrl || '/placeholder-franchise.jpg';

  const renderCardContent = () => {
    switch (currentStage) {
      case "fund":
        // Calculate funding metrics
        const availableShares = franchise.selectedShares;
        const totalRaisedAmount = franchise.currentFunding || 0;
        const dynamicInvestorsCount = franchise.investorCount || 0;

        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(totalInvestment)}</p>
              <div className="text-sm text-green-600 font-medium">
                {fundingProgress.toFixed(1)}% Funded
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, fundingProgress)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>{formatCurrency(totalRaisedAmount)} raised</span>
                <span>{availableShares} shares left</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {franchise.selectedShares} total shares • {formatAmount(SHARE_PRICE)}/share • {dynamicInvestorsCount} investors
            </div>
          </>
        );
      case "launch":
        const launchProgressPercent = 75; // Default launch progress

        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(totalInvestment)}</p>
              <div className="text-sm text-blue-600 font-medium">
                {launchProgressPercent.toFixed(1)}% Complete
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${launchProgressPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Funded: 100%</span>
                <span>{franchise.selectedShares} shares</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {franchise.selectedShares} total shares • {franchise.investorCount || 0} investors • Fully funded
            </div>
          </>
        );
      case "live":
        const liveMonthlyRevenue = 25000; // Default values
        const liveMonthlyExpenses = 18000;
        const liveNetProfit = liveMonthlyRevenue - liveMonthlyExpenses;
        const profitMargin = (liveNetProfit / liveMonthlyRevenue) * 100;
        const revenueProgress = 85; // Default progress

        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(totalInvestment)}</p>
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
                <span>Revenue: {formatCurrency(liveMonthlyRevenue * 12)}</span>
                <span>My Value: {formatCurrency(SHARE_PRICE * 100)}</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {franchise.selectedShares} total shares • {formatCurrency(SHARE_PRICE)}/share • Market Cap: {formatCurrency(franchise.selectedShares * SHARE_PRICE)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Monthly: {formatCurrency(liveMonthlyRevenue)} revenue, {formatCurrency(liveNetProfit)} profit
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="flex justify-between items-center mt-2">
              <p className="font-semibold">{formatCurrency(totalInvestment)}</p>
              <div className="text-sm text-gray-600 font-medium">
                {currentStage === 'approval' ? 'Pending' : 'Closed'}
              </div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {franchise.selectedShares} total shares • {formatAmount(SHARE_PRICE)}/share
            </div>
          </>
        );
    }
  };

  // Determine the navigation path
  const getNavigationPath = () => {
    if (brand.slug && franchise.slug) {
      return `/${brand.slug}/${franchise.slug}`;
    }
    return `/franchise/${franchise._id}`;
  };

  return (
    <>
      <div
        className="overflow-hidden bg-background-light dark:bg-stone-800/50 bg-background/50 backdrop-blur border border-border hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => router.push(getNavigationPath())}
      >
        <div className="relative">
          {primaryImage && !primaryImage.startsWith("blob:") ? (
            <Image
              src={primaryImage}
              alt={`${brand.name} - ${franchise.building}`}
              width={400}
              height={600}
              className="w-full h-65 object-cover"
              unoptimized={primaryImage.startsWith("https://images.unsplash.com")}
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
            {brand.logoUrl ? (
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                width={46}
                height={46}
                className="w-9 h-9 object-cover"
              />
            ) : (
              <div className="">
                {/* Franchise Title and Location */}
                <h3 className="font-semibold truncate mb-1">{franchise.building}</h3>
                <p className="text-sm text-muted-foreground mb-3">{franchise.locationAddress}</p>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{brand.name}</h3>
              <p className="text-sm text-muted-foreground">{franchise.locationAddress}</p>
            </div>
          </div>

          {renderCardContent()}
        </div>
      </div>
    </>
  );
};

export default FranchiseLifecycleCard;
