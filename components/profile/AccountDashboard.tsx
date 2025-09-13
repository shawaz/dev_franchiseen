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
import { Card } from '@/components/ui/card';
import {
  Building2,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Wallet
} from 'lucide-react';
import SolanaWalletWithLocalCurrency from '@/components/wallet/SolanaWalletWithLocalCurrency';

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
  costPerShare: number;
  slug: string;
}

interface Business {
  _id: Id<"brands">;
  name: string;
  logoUrl?: string;
  industry?: { name: string } | null;
  category?: { name: string } | null;
  slug: string;
}

interface SerializedUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses?: {
    emailAddress: string;
  }[];
}

export default function AccountDashboard({
  user,
  convexUser,
  business,
  franchises,
  brandSlug,
}: {
  user: SerializedUser;
  convexUser: any;
  business: Business;
  franchises: Franchise[];
  brandSlug: string;
}) {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'franchises' | 'teams' | 'settings'>('franchises');
  const { formatAmount } = useGlobalCurrency();
  const { openSOLPaymentModal } = useModal();

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
      case "Funding":
        return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-500";
      case "Launching":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-500";
      case "Active":
        return "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-500";
      case "Closed":
        return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-500";
      default:
        return "bg-stone-100 text-stone-800";
    }
  };

  // Progress bar logic based on status
  const getProgress = (franchise: Franchise) => {
    switch (franchise.status) {
      case "Funding": {
        const totalRaised = (franchise.selectedShares || 0) * (franchise.costPerArea || 0);
        const percent = franchise.totalInvestment
          ? Math.min(100, Math.round((totalRaised / franchise.totalInvestment) * 100))
          : 0;
        return { percent, color: "bg-yellow-500" };
      }
      case "Launching": {
        return { percent: 50, color: "bg-blue-500" };
      }
      case "Active":
        return { percent: 80, color: "bg-green-500" };
      case "Closed":
        return { percent: 0, color: "bg-red-500" };
      default:
        return { percent: 0, color: "bg-stone-300" };
    }
  };

  const handleAddSOL = () => {
    alert('Add SOL clicked! You can get devnet SOL from the airdrop button or Solana faucet.');
  };

  const mainTabs = [
    { id: 'franchises', label: 'Franchises', icon: Building2 },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6 py-6">
      {/* Solana Wallet Card */}
      <SolanaWalletWithLocalCurrency
        onAddMoney={handleAddSOL}
        className="w-full"
        user={user}
      />

      {/* Main Navigation Tabs */}
      <Card className="p-0">
        <div className="border-b border-stone-200 dark:border-stone-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'franchises' && (
            <div className="space-y-6">
              {/* Franchise Status Tabs */}
              <div className="flex items-center justify-between">
                <nav className="flex gap-4 overflow-x-auto no-scrollbar">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.value}
                      className={`px-4 py-2 flex items-center text-sm font-semibold border transition-colors duration-200 ${
                        selectedStatus === tab.value 
                          ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900 border-stone-900 dark:border-white" 
                          : "bg-white dark:bg-stone-800 text-stone-900 dark:text-white border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700"
                      }`}
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
                            totalShares: 0,
                            soldShares: 0,
                            costPerShare: 0,
                            franchiseId: business._id as string,
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

              {/* Franchise List */}
              <div>
                {(() => {
                  const filteredFranchises = franchises.filter((f) => f.status === selectedStatus);

                  if (filteredFranchises.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="bg-stone-100 dark:bg-stone-700 p-4 mb-4">
                          <Building2 className="h-8 w-8 text-stone-400" />
                        </div>
                        <h3 className="text-lg font-medium text-stone-900 dark:text-white mb-1">
                          No Franchises Found
                        </h3>
                        <p className="text-stone-500 dark:text-stone-400">
                          There are no franchises in the {selectedStatus.toLowerCase()} status.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <React.Fragment key="franchises-list">
                      {filteredFranchises.map((franchise) => (
                        <div
                          key={franchise._id}
                          className="p-6 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors duration-200 border-b border-stone-100 dark:border-stone-700 last:border-b-0"
                          onClick={() =>
                            router.push(`/${brandSlug}/${franchise.slug}`)
                          }
                        >
                          {franchise.status && (
                            <div
                              className={`ml-2 absolute md:hidden flex px-3 py-2 text-xs uppercase font-semibold ${getStatusBadge(franchise.status)}`}
                            >
                              {franchise.status}
                            </div>
                          )}
                          <Image
                            src="/images/1.svg"
                            alt="Franchise"
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
                                  alt="Franchise"
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
                                      <p className="text-sm text-stone-500">
                                        {franchise.locationAddress}
                                      </p>

                                      <div className="hidden md:flex items-center justify-between mt-2">
                                        <div className="hidden md:flex items-center space-x-2">
                                          <div className="text-sm dark:text-stone-400 text-stone-500">
                                            Share Price: {formatAmount(franchise.costPerShare)}
                                          </div>
                                          <div className="text-sm hidden md:block dark:text-stone-400 text-stone-500">
                                            •
                                          </div>
                                          <div className="text-sm dark:text-stone-400 text-stone-500">
                                            Area: {franchise.carpetArea} sq ft
                                          </div>
                                          <div className="text-sm hidden md:block dark:text-stone-400 text-stone-500">
                                            •
                                          </div>
                                          <div className="text-sm dark:text-stone-400 text-stone-500">
                                            Investment: {formatAmount(franchise.totalInvestment)}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4">
                                <div className="my-3 pt-2 border-t border-dashed border-stone-300 dark:border-stone-600">
                                  <span className="font-semibold text-base text-stone-900 dark:text-white">
                                    {(() => {
                                      switch (franchise.status) {
                                        case "Funding": {
                                          const invested = (franchise.selectedShares || 0) * 500;
                                          return (
                                            <div className="flex items-center justify-between">
                                              Invested: {formatAmount(invested)}{" "}
                                              <span className="font-bold">
                                                Goal: {formatAmount(franchise.totalInvestment)}
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
                                    <div className="w-full h-2 bg-stone-200 overflow-hidden mt-2">
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
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Team Management</h3>
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-stone-400" />
                <h3 className="mt-2 text-sm font-medium text-stone-900 dark:text-white">No team members</h3>
                <p className="mt-1 text-sm text-stone-500">Get started by inviting team members to your organization.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                  >
                    <Users className="-ml-1 mr-2 h-5 w-5" />
                    Invite Team Members
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Account Settings</h3>
              
              {/* Profile Settings */}
              <Card className="p-6">
                <h4 className="text-md font-medium mb-4">Profile Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <h5 className="font-medium">{user.firstName} {user.lastName}</h5>
                      <p className="text-sm text-stone-500">{user.emailAddresses?.[0]?.emailAddress}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800">
                    Edit Profile
                  </button>
                </div>
              </Card>

              {/* Notification Settings */}
              <Card className="p-6">
                <h4 className="text-md font-medium mb-4">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-stone-500">Receive email updates about your franchises</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push notifications</p>
                      <p className="text-sm text-stone-500">Receive push notifications on your device</p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </Card>

              {/* Security Settings */}
              <Card className="p-6">
                <h4 className="text-md font-medium mb-4">Security</h4>
                <div className="space-y-4">
                  <button className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800">
                    Change Password
                  </button>
                  <button className="px-4 py-2 border border-stone-300 rounded-md text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-800">
                    Two-Factor Authentication
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

      <EmailVerificationModal
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
      />
    </div>
  );
}
