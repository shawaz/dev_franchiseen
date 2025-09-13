"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useModal } from "@/contexts/ModalContext";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import { useGlobalCurrency } from "@/contexts/GlobalCurrencyContext";
import Image from "next/image";
import Link from "next/link";

interface Franchise {
  _id: string;
  building: string;
  locationAddress: string;
  carpetArea: number;
  totalInvestment: number;
  status: string;
  owner_id: string;
  costPerArea: number;
  selectedShares: number;
  totalShares: number;
  launchStartDate?: string;
  launchEndDate?: string;
  costPerShare: number;
  slug?: string;
}

export default function BusinessPageClient({
  businessId,
  franchises,
  brandSlug,
}: {
  businessId: string;
  franchises: Franchise[];
  brandSlug: string;
}) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openTypeformRegisterBrandModal, openTypeformCreateFranchiseModal } = useModal();
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] =
    React.useState(false);
  const { formatAmount } = useGlobalCurrency();
  const { openSOLPaymentModal } = useModal();
  const business = useQuery(api.brands.getById, {
    brandId: businessId as Id<"brands">,
  });
  const [selectedStatus, setSelectedStatus] = React.useState<string>("Funding");
  const statusTabs = React.useMemo(() => {
    return [
      {
        label: "Funding",
        value: "Funding",
        count: franchises.filter((f) => f.status === "Funding").length,
      },
      {
        label: "Launching",
        value: "Launching",
        count: franchises.filter((f) => f.status === "Launching").length,
      },
      {
        label: "Active",
        value: "Active",
        count: franchises.filter((f) => f.status === "Active").length,
      },
      {
        label: "Closed",
        value: "Closed",
        count: franchises.filter((f) => f.status === "Closed").length,
      },
    ];
  }, [franchises]);

  // Map status to badge classes
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-500";
      case "Funding":
        return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-500";
      case "Launching":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-500";
      case "Active":
        return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-500";
      case "Closed":
        return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-500";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Progress bar logic based on status
  const getProgress = (franchise: Franchise) => {
    switch (franchise.status) {
      case "Approved": {
        // Approved franchises are ready for funding - show as 10% progress
        return { percent: 10, color: "bg-emerald-500" };
      }
      case "Funding": {
        const costPerShare = franchise.costPerShare || (franchise.totalInvestment / Math.max(1, franchise.totalShares));
        const totalRaised = (franchise.selectedShares || 0) * costPerShare;
        const percent = franchise.totalInvestment
          ? Math.min(
              100,
              Math.round((totalRaised / franchise.totalInvestment) * 100),
            )
          : 0;
        return { percent: Math.max(10, percent), color: "bg-yellow-500" };
      }
      case "Launching": {
        return { percent: 50, color: "bg-blue-500" };
      }
      case "Active":
        return { percent: 80, color: "bg-green-500" };
      case "Closed":
        return { percent: 0, color: "bg-red-500" };
      default:
        return { percent: 0, color: "bg-gray-300" };
    }
  };

  // Removed payment modal state management - now handled by centralized modal system

  return (
      <div className=" h-space-y-8 py-6">
        <section className="bg-white dark:bg-stone-800/50  border border-stone-200 dark:border-stone-700">
          <div className="flex px-4 py-4 space-x-4 justify-between">
            <div className="flex items-center space-x-4">
              <Image src={business?.logoUrl || "/logo/logo-2.svg"} alt="Business Logo" width={70} height={70} className="text-center" />
              <div className="flex flex-col ">
                <h1 className="text-xl font-bold  text-stone-900 dark:text-white">{business?.name}</h1>
                <p className="text-sm  text-stone-500 dark:text-stone-400">Brand Information</p>
                <p className="text-sm  text-stone-500 dark:text-stone-400">{business?.about || 'No description available'}</p>
              </div>
            </div>
            
          </div>
          <div className="flex items-center justify-center gap-2 px-4 pb-4">
              <button className="bg-stone-900 text-sm w-full text-white font-medium px-5 py-2 transition-colors hover:bg-stone-700">FOLLOWING</button>
              <button onClick={() => openTypeformCreateFranchiseModal(brandSlug)} className="bg-yellow-900 w-full text-sm text-white font-medium px-5 py-2 transition-colors hover:bg-yellow-600">START NEW</button>

            </div>

        </section>
        <section className="bg-white dark:bg-stone-800/50  border border-stone-200 dark:border-stone-700">
          <div className="">
            <div className="flex items-center px-4 py-4 justify-between">
              <nav className="flex gap-4 overflow-x-auto no-scrollbar">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    className={`px-4 py-2 flex items-center text-sm font-semibold border transition-colors duration-200 ${selectedStatus === tab.value ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white" : "bg-white dark:bg-stone-800 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"}`}
                    onClick={() => setSelectedStatus(tab.value)}
                  >
                    {tab.label}{" "}
                    <span className="inline ml-2 text-xs font-normal">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
              <div className="hidden md:flex items-center">
                <button
                  onClick={() => {
                    if (!isSignedIn) {
                      setIsEmailVerificationOpen(true);
                    } else {
                      openSOLPaymentModal({
                        franchiseData: {
                          name: business?.name || "",
                          logo: business?.logoUrl || "/logo/logo-2.svg",
                          address: "",
                          totalShares: 1000, // Default placeholder - this should be calculated based on actual franchise data
                          soldShares: 0,
                          costPerShare: business?.costPerArea || 0,
                          franchiseId: businessId as string,
                          totalInvestment: business?.costPerArea ? business.costPerArea * 100 : undefined, // Estimate based on 100 sq ft
                        }
                      });
                    }
                  }}
                  className="flex items-center justify-center w-full dark:bg-white dark:text-stone-800 text-sm font-semibold dark:hover:bg-stone-300 bg-stone-900 hover:bg-stone-700 cursor-pointer text-white py-2.5 px-4 transition-colors"
                >
                  Start New Franchise
                </button>
              </div>
            </div>
          </div>
          <div>
            {(() => {
              const filteredFranchises = (() => {
                if (selectedStatus === "Funding") {
                  // Only include "Funding" status - "Approved" should not be public until transitioned
                  return franchises.filter((f) => f.status === "Funding");
                } else {
                  return franchises.filter((f) => f.status === selectedStatus);
                }
              })();

              if (filteredFranchises.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-62 px-4 ">
                    <div className="bg-gray-100 dark:bg-stone-700 p-4 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      No Franchises Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      There are no franchises in the{" "}
                      {selectedStatus.toLowerCase()} status.
                    </p>
                  </div>
                );
              }

              return (
                <React.Fragment key="franchises-list">
                  {filteredFranchises.map((franchise) => (
                    <div
                      key={franchise._id}
                      className=" p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-stone-700/50 transition-colors duration-200"
                      onClick={() =>
                        router.push(
                          `/${brandSlug}/${franchise.slug || franchise._id}`,
                        )
                      }
                    >
                      {franchise.status && (
                        <div
                          className={`ml-2 absolute  md:hidden flex px-3 py-2 text-xs uppercase font-semibold ${getStatusBadge(franchise.status)}`}
                        >
                          {franchise.status}
                        </div>
                      )}
                      <Image
                        src="/images/1.svg"
                        alt="Franchisor"
                        layout="responsive"
                        width={140}
                        height={100}
                        className="rounded md:hidden block mr-4"
                      />
                      <div className="flex items-center space-x-4 z-0">
                        <div className="flex-grow w-full">
                          <div className="flex">
                            <Image
                              src="/images/1.svg"
                              alt="Franchisor"
                              width={140}
                              height={100}
                              className="rounded hidden md:block mr-4"
                            />

                            <div className="w-full">
                              <div className="flex items-center justify-between mb-2">
                                <h2 className="font-medium text-lg">
                                  {franchise.building}
                                </h2>
                                {franchise.status && (
                                  <span
                                    className={`ml-2 hidden md:flex px-4 py-2 text-sm font-semibold ${getStatusBadge(franchise.status)}`}
                                  >
                                    {franchise.status}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {franchise.locationAddress}
                                  </p>

                                  <div className="hidden md:flex items-center justify-between mt-2">
                                    <div className="hidden md:flex items-center space-x-2">
                                      <div className="text-sm dark:text-gray-400 text-gray-500">
                                        Share Price:{" "}
                                        {formatAmount(franchise.costPerShare)}
                                      </div>
                                      {/* <div className="text-sm font-semibold dark:text-gray-100 text-gray-900"></div> */}
                                      <div className="text-sm hidden md:block dark:text-gray-400 text-gray-500">
                                        •
                                      </div>
                                      <div className="text-sm dark:text-gray-400 text-gray-500">
                                        Area: {franchise.carpetArea} sq ft
                                      </div>
                                      {/* <div className="text-sm font-semibold dark:text-gray-100 text-gray-900"></div> */}
                                      <div className="text-sm hidden md:block dark:text-gray-400 text-gray-500">
                                        •
                                      </div>
                                      <div className="text-sm dark:text-gray-400 text-gray-500">
                                        Investment:{" "}
                                        {formatAmount(
                                          franchise.totalInvestment,
                                        )}
                                      </div>
                                      {/* <div className="text-sm font-semibold dark:text-gray-100 text-gray-900"></div> */}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            {/* Status-specific data above the progress bar */}
                            <div className="my-3 pt-2 border-t border-dashed border-gray-300 dark:border-stone-600">
                              <span className="font-semibold text-base text-stone-900 dark:text-white">
                                {(() => {
                                  switch (franchise.status) {
                                    case "Funding": {
                                      const costPerShare = franchise.costPerShare || (franchise.totalInvestment / Math.max(1, franchise.totalShares));
                                      const invested = (franchise.selectedShares || 0) * costPerShare;
                                      return (
                                        <div className="flex items-center justify-between">
                                          Invested: {formatAmount(invested)}{" "}
                                          <span className="font-bold">
                                            {" "}
                                            Goal:{" "}
                                            {formatAmount(
                                              franchise.totalInvestment,
                                            )}
                                          </span>
                                        </div>
                                      );
                                    }
                                    case "Launching": {
                                      return (
                                        <div className="flex items-center justify-between">
                                          Started:{" "}
                                          <span className="font-bold">
                                            Launching: 50%
                                          </span>
                                        </div>
                                      );
                                    }
                                    case "Active":
                                      return (
                                        <div className="flex items-center justify-between">
                                          Active:{" "}
                                          <span className="font-bold">
                                            Current Budget
                                          </span>{" "}
                                          /{" "}
                                          <span className="font-bold">
                                            Total Budget
                                          </span>
                                        </div>
                                      );
                                    case "Closed":
                                      return (
                                        <div>
                                          Closed:{" "}
                                          <span className="font-bold">
                                            Budget reached 0
                                          </span>
                                        </div>
                                      );
                                    default:
                                      return null;
                                  }
                                })()}
                              </span>
                            </div>
                            {(() => {
                              const { percent, color } = getProgress(franchise);
                              return (
                                <div className="w-full h-2 bg-gray-200 overflow-hidden mt-2">
                                  <div
                                    className={`h-full ${color} transition-all duration-500 ease-in-out`}
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
                </React.Fragment>
              );
            })()}
          </div>
          <div className="p-6 text-center w-full">
          <button
            onClick={() => router.push(`/business/franchise`)}
            className="items-center w-full text-center px-4 py-2 border border-stone-200 dark:border-stone-700 text-sm font-medium rounded-md text-primary hover:bg-primary cursor-pointer hover:text-stone-100 transition-colors duration-200"
          >
            Load More
          </button>
        </div>
        </section>
        {/* SOL Payment Modal is now handled by centralized ModalManager */}
        <EmailVerificationModal
          isOpen={isEmailVerificationOpen}
          onClose={() => setIsEmailVerificationOpen(false)}
        />
      </div>

  );
}
