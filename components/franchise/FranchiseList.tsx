"use client";

import React, { useState } from "react";
import { Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { Card } from "../ui/card";

interface Business {
  _id: Id<"brands">;
  name: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
}

interface Share {
  _id: Id<"shares">;
  _creationTime: number;
  franchiseId: Id<"franchise">;
  userId: Id<"users">;
  userName: string;
  userImage: string;
  numberOfShares: number;
  purchaseDate: number;
  costPerShare: number;
}

interface Franchise {
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
  createdAt: number;
  status: string;
}

interface FranchiseListProps {
  franchiseDetails: {
    share: Share;
    franchise: Franchise | null;
    business: Business | null;
  }[];
}

export default function FranchiseList({
  franchiseDetails,
}: FranchiseListProps) {
  const router = useRouter();

  const statusTabs = [
    "Active",
    // "Pending Approval",
    "Launching",
    "Funding",
    "Closed",
  ];
  const [activeTab, setActiveTab] = useState("Active");

  // Filter franchises by status
  const filteredFranchiseDetails = franchiseDetails.filter(
    ({ franchise }) => franchise && franchise.status === activeTab,
  );

  // Progress bar logic based on status
  const getProgress = (franchise: Franchise) => {
    switch (franchise.status) {
      case "Pending Approval":
        return { percent: 0, color: "bg-blue-500" };
      case "Funding": {
        const totalRaised =
          (franchise.selectedShares || 0) * (franchise.costPerArea || 0);
        const percent = franchise.totalInvestment
          ? Math.min(
              100,
              Math.round((totalRaised / franchise.totalInvestment) * 100),
            )
          : 0;
        return { percent, color: "bg-yellow-500" };
      }
      case "Launching":
        return { percent: 50, color: "bg-blue-500" };
      case "Active":
        return { percent: 80, color: "bg-green-500" };
      case "Closed":
        return { percent: 0, color: "bg-red-500" };
      default:
        return { percent: 0, color: "bg-gray-300" };
    }
  };

  // Map status to badge classes
  // const getStatusBadge = (status: string) => {
  //   switch (status) {
  //     case "Pending Approval":
  //       return "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
  //     case "Funding":
  //       return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-500";
  //     case "Launching":
  //       return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-500";
  //     case "Active":
  //       return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-500";
  //     case "Closed":
  //       return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-500";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  return (
    <Card className="p-0 ">
      <div className=" flex flex-col px-6 py-4">
        <div className="flex items-center justify-between">
          <nav className="flex gap-2 overflow-x-auto">
            {statusTabs.map((tab) => (
              <span
                key={tab}
                className={`cursor-pointer px-5 py-1.5 border border-stone-200 dark:border-stone-700 transition-colors duration-200 text-sm font-semibold
                  ${
                    activeTab === tab
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                  }
                `}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </span>
            ))}
          </nav>
          <div className="md:flex hidden items-center ml-4">
            <Store className="mr-1" />
          </div>
        </div>
      </div>

      <div>
        {filteredFranchiseDetails.map(({ share, franchise, business }) => (
          <div
            key={share._id}
            className="border-t p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-700/50 transition-colors duration-200"
            onClick={() =>
              franchise && business &&
              router.push(
                `/${business._id}/${franchise._id}`,
              )
            }
          >
            <div className="flex items-center space-x-4">
              <div className="flex-grow">
                {/* {franchise?.status && (
                  <span
                    className={`absolute px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(franchise.status)}`}
                  >
                    {franchise.status}
                  </span>
                )} */}
                <Image
                  src="/images/1.svg"
                  alt="Franchisor"
                  layout="responsive"
                  width={140}
                  height={100}
                  className="rounded md:hidden block mb-4"
                />
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded mr-3 overflow-hidden relative">
                      <Image
                        src={business?.logoUrl || "/default-logo.png"}
                        alt={business?.name || "Business Logo"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-md"> {business?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {/* {business?.industry?.name} •{" "} */}
                        {business?.category?.name}{" "}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {franchise?.building}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  {" "}
                  {franchise?.locationAddress}
                </p>
                {/* <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm dark:text-gray-400 text-gray-500">
                      Your Shares:
                    </span>
                    <span className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                      {share.numberOfShares} shares
                    </span>
                    <span className="text-sm dark:text-gray-400 text-gray-500">
                      •
                    </span>
                    <span className="text-sm dark:text-gray-400 text-gray-500">
                      Your Investment:
                    </span>
                    <span className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                      {formatAmount(share.numberOfShares * share.costPerShare)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm dark:text-gray-400 text-gray-500">
                      Share Price:
                    </span>
                    <span className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                      {formatAmount(share.costPerShare)} / share
                    </span>
                    <span className="text-sm dark:text-gray-400 text-gray-500">
                      •
                    </span>
                    <span className="text-sm dark:text-gray-400 text-gray-500">
                      Monthly Earnings:
                    </span>
                    <span className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                      {formatAmount(share.numberOfShares * share.costPerShare)}
                    </span>
                  </div>
                </div> */}
                {/* <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm dark:text-gray-400 text-gray-500">Total Area:</span>
                    <span className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                      {franchise?.carpetArea} sq ft
                    </span>
                    <span className="text-sm dark:text-gray-400 text-gray-500">•</span>
                    <span className="text-sm dark:text-gray-400 text-gray-500">Total Investment:</span>
                    <span className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                      ₹{franchise?.totalInvestment.toLocaleString()}
                    </span>
                  </div>
                </div> */}
                <div className="mt-4">
                  {(() => {
                    if (!franchise) return null;
                    const { percent, color } = getProgress(franchise);
                    return (
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-2 ${color} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* <div className="p-6 text-center w-full">
        <button
          onClick={() => router.push(`/business/franchise`)}
          className="items-center w-full text-center px-4 py-2 border border-stone-200 dark:border-stone-700 text-sm font-medium rounded-md text-primary hover:bg-primary cursor-pointer hover:text-stone-100 transition-colors duration-200"
        >
          Explore More Franchises
        </button>
      </div> */}
    </Card>
  );
}
