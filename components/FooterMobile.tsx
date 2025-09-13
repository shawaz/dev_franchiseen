"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Bell,
  Compass,
  Heart,
  PlusSquare,
  User,
  UserCircle,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import EmailVerificationModal from "./EmailVerificationModal";
import { useModal } from "@/contexts/ModalContext";

function FooterMobile() {
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const { openTypeformRegisterBrandModal, openTypeformCreateFranchiseModal } = useModal();
  const pathname = usePathname();

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === "/profile") {
      // For profile, check if current path starts with /profile
      return pathname.startsWith("/profile");
    }
    return pathname === path;
  };

  // Function to get icon classes based on active state
  const getIconClasses = (path: string) => {
    const baseClasses = "cursor-pointer transition-colors duration-200";
    const activeClasses = "text-neutral-800 dark:text-neutral-200"; // Active state - primary color
    const inactiveClasses =
      "text-gray-600 dark:text-gray-400 hover:text-primary"; // Inactive state with hover

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="bg-white/50 dark:bg-stone-800/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden w-full fixed bottom-0  border-t border-stone-200 dark:border-stone-700">
      <SignedIn>
        <div className="justify-between max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link href={"/"}>
            <Compass className={getIconClasses("/")} color="currentColor" />
          </Link>
          <Link href={"/liked"}>
            <Heart className={getIconClasses("/liked")} />
          </Link>
          <button onClick={() => openTypeformCreateFranchiseModal()}>
            <PlusSquare
              className={getIconClasses("/create")}
              color="currentColor"
            />
          </button>
          <Link href={"/notify"}>
            <Bell className={getIconClasses("/notify")} />
          </Link>
          <Link href={"/account"}>
            <UserCircle className={getIconClasses("/account")} />
          </Link>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="px-4 pt-2 pb-2 ">
          <button
            onClick={() => setIsEmailVerificationOpen(true)}
            className="cursor-pointer uppercase w-full px-4 py-3 text-sm font-bold bg-neutral-800 hover:bg-yellow-700 text-stone-100 dark:bg-stone-200 border dark:text-stone-800 dark:hover:bg-stone-700 transition-colors duration-200"
            aria-label="Get Started"
          >
            GET STARTED
          </button>
        </div>

        <EmailVerificationModal
          isOpen={isEmailVerificationOpen}
          onClose={() => setIsEmailVerificationOpen(false)}
        />
      </SignedOut>


    </div>
  );
}

export default FooterMobile;
