"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Settings,
  CreditCard,
  Lock,
  ShieldCheck,
  Store,
  Wallet,
  LogOut,
  HeartHandshake,
  ReceiptText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useSolOnly } from "@/contexts/SolOnlyContext";
import { Card, CardContent } from "../ui/card";

function ProfileSideNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const { formatSol } = useSolOnly();
  const isActive = (path: string) => pathname === path;

  const userProfile = useQuery(api.myFunctions.getUserByEmail, {
    email: user?.primaryEmailAddress?.emailAddress || "",
  });

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-20">
        {/* Profile Brief */}
        <Card className="py-6 lg:border-b border-stone-200 dark:border-stone-700/50">
          <CardContent>
            <div className="relative rounded-full overflow-hidden h-16 w-16">
              <Image
                src={userProfile.avatar || "/logo/logo-2.svg"}
                alt="Profile"
                width={100}
                height={100}
                loading="lazy"
                className="object-cover rounded"
              />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {userProfile.email.split('@')[0]}
                </h1>
                <div className="flex items-center mt-1 dark:text-gray-400 text-gray-600">
                  {userProfile.email || "Email not set"}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Budget not set
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Menu */}
        <Card className="hidden lg:block lg:border-b border-stone-200 dark:border-stone-700/50 py-4">
          <h3 className="text-lg font-semibold px-6 pb-4">Dashboard</h3>
          <nav className="space-y-1">
            {/* <a href="/dashboard/overview" className="flex items-center text-gray-600 hover:text-primary hover:bg-stone-50 p-2 transition-colors">
              <PieChart className="h-5 w-5 mr-3" />
              Overview
            </a> */}
             <Link
              href="/profile/wallet"
              className={`flex items-center ${isActive("/profile/wallet") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <CreditCard className="h-5 w-5 mr-3" />
              Wallet
            </Link>
            <Link
              href="/profile/shares"
              className={`flex items-center ${isActive("/profile/franchise") ? "text-primary bg-stone/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <Store className="h-5 w-5 mr-3" />
              Shares
            </Link>
            <Link
              href="/profile/earnings"
              className={`flex items-center ${isActive("/profile/earnings") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <Wallet className="h-5 w-5 mr-3" />
              Earnings
            </Link>
            <Link
              href="/profile/contacts"
              className={`flex items-center ${isActive("/profile/deals") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <HeartHandshake className="h-5 w-5 mr-3" />
              Contracts
            </Link>
            <Link
              href="/profile/invoices"
              className={`flex items-center ${isActive("/profile/invoices") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <ReceiptText className="h-5 w-5 mr-3" />
              Invoice
            </Link>
          </nav>
        </Card>

        <Card className="hidden lg:block py-4">
          <h3 className="text-lg font-semibold px-6 pb-4">Settings</h3>
          <nav className="space-y-1">
            <Link
              href="/profile/edit-profile"
              className={`flex items-center ${isActive("/profile/edit-profile") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Edit Profile
            </Link>
            <Link
              href="/profile/security"
              className={`flex items-center ${isActive("/profile/security") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6 py-3 transition-colors`}
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              Security
            </Link>
            <Link
              href="/profile/notifications"
              className={`flex items-center ${isActive("/profile/notifications") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6  py-3 transition-colors`}
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </Link>
            <Link
              href="/profile/privacy"
              className={`flex items-center ${isActive("/profile/privacy") ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary dark:hover:text-primary dark:text-gray-400 dark:hover:bg-stone-700 hover:bg-stone-50 px-6  py-3 transition-colors`}
            >
              <Lock className="h-5 w-5 mr-3" />
              Privacy
            </Link>
            <Link
              href="/profile/delete-profile"
              className={`flex items-center ${isActive("/profile/delete-profile") ? "text-red-400 dark:text-red-300 bg-red-200" : "text-red-400"} hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 px-6 py-3 transition-colors`}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Link>
          </nav>
        </Card>
      </div>
    </div>
  );
}

export default ProfileSideNav;
