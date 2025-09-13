"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const NAV_TABS = [
  "Overview",
  "Budget",
  "Task",
  "Products",
  "Orders",
  "Files",
  "Team",
  "Summary",
];

function FranchiseHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Extract businessId and franchiseId from the pathname
  // Example: /business/123/franchise/456/overview
  const pathParts = pathname ? pathname.split("/") : [];
  const businessId = pathParts[2];
  const franchiseId = pathParts[4];
  const currentTab =
    pathParts.length > 0
      ? pathParts[pathParts.length - 1]?.toLowerCase() || "overview"
      : "overview";

  // Fetch franchise details
  const franchise = useQuery(api.franchise.getById, {
    franchiseId: franchiseId as Id<"franchise">,
  });

  const handleTabClick = (tab: string) => {
    const tabPath = tab.toLowerCase();
    router.push(`/business/${businessId}/franchise/${franchiseId}/${tabPath}`);
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div className="w-full">
        <div className="flex items-center px-6 py-4 border-b border-stone-200 dark:border-stone-700 justify-between">
          <Link href={`/business/${franchise?.brandId}/franchise`}>
            <div className="flex items-center">
              <MoveLeft className="mr-3" />
            </div>
          </Link>

          <div className="flex items-center">
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              {/* Avatars */}
              <div className="flex -space-x-2">
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src="/avatar/avatar-f-4.png" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src="/avatar/avatar-m-5.png" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src="/avatar/avatar-f-6.png" />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <Avatar className="w-8 h-8 border-2 border-white">
                  <AvatarImage src="/avatar/avatar-m-2.png" />
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold border-2 border-white">
                  5+
                </div>
              </div>
              <Link href={`/business/${businessId}/franchise/${franchiseId}`}>
                <Button variant={"outline"} className="ml-4 cursor-pointer">
                  View Franchise
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center p-6 justify-between gap-4">
          <div className="flex items-center">
            {franchise && (
              <div>
                <h1 className="text-2xl font-bold dark:text-white">
                  {franchise.building}
                </h1>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {franchise.locationAddress}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex gap-4 mt-4 md:mt-0 px-6">
          {NAV_TABS.map((tab) => {
            const tabPath = tab.toLowerCase();
            const isActive = currentTab === tabPath;
            return (
              <span
                key={tab}
                className={`cursor-pointer px-2 py-3 border-b-2 transition-colors duration-200 ${isActive ? "border-black font-semibold dark:border-white" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default FranchiseHeader;
