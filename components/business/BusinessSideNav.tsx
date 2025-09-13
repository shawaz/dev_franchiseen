"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, CreditCard, Settings, Store, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
// Removed modal import - not needed in this component
import BusinessCard from "./BusinessCard";

interface BusinessSideNavProps {
  businessId: string;
}

function BusinessSideNav({ businessId }: BusinessSideNavProps) {
  const pathname = usePathname();

  const { user } = useUser();
  const createUser = useMutation(api.myFunctions.createUser);
  const [convexUserId, setConvexUserId] = useState<string | null>(null);

  const business = useQuery(api.brands.getById, {
    brandId: businessId as Id<"brands">,
  });

  // Get business slug for routing
  const businessSlug = business?.slug;

  React.useEffect(() => {
    async function fetchConvexUserId() {
      if (user?.primaryEmailAddress?.emailAddress) {
        const id = await createUser({
          email: user.primaryEmailAddress.emailAddress,
        });
        setConvexUserId(id);
      }
    }
    fetchConvexUserId();
  }, [user, createUser]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-22">
        {business && (
          <BusinessCard
            business={{
              id: String(business._id),
              name: business.name || "",
              logo_url: business.logoUrl || "/logo/logo-2.svg",
              industry:
                business.industry_id ||
                "No industry",
              category:
                business.category_id ||
                "No category",
              costPerArea: business.costPerArea,
              min_area: business.min_area,
            }}
          />
        )}

        {/* Dashboard Menu */}
        {business?.owner_id === convexUserId && (
          <section className="bg-white dark:bg-stone-800/50 p-6 shadow-sm border-t border-stone-200 dark:border-stone-700/30">
            <h3 className="text-lg font-semibold mb-4">Owner Dashboard</h3>
            <nav className="space-y-2">
              <Link
                href={businessSlug ? `/${businessSlug}/franchise` : `/business/${businessId}/franchise`}
                className={`flex items-center ${isActive(`/${businessSlug}/franchise`) || isActive(`/business/${businessId}/franchise`) ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary hover:bg-stone-50 dark:hover:bg-stone-700 dark:text-white p-2 rounded-lg transition-colors`}
              >
                <Store className="h-5 w-5 mr-3" />
                Franchise
              </Link>
              <Link
                href={businessSlug ? `/${businessSlug}/approvals` : `/business/${businessId}/approvals`}
                className={`flex items-center ${isActive(`/${businessSlug}/approvals`) || isActive(`/business/${businessId}/approvals`) ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary hover:bg-stone-50 dark:hover:bg-stone-700 dark:text-white p-2 rounded-lg transition-colors`}
              >
                <CheckCircle className="h-5 w-5 mr-3" />
                Approvals
              </Link>
              <Link
                href={businessSlug ? `/${businessSlug}/earnings` : `/business/${businessId}/earnings`}
                className={`flex items-center ${isActive(`/${businessSlug}/earnings`) || isActive(`/business/${businessId}/earnings`) ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary hover:bg-stone-50 dark:hover:bg-stone-700 dark:text-white p-2 rounded-lg transition-colors`}
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Earnings
              </Link>
              <Link
                href={businessSlug ? `/${businessSlug}/wallet` : `/business/${businessId}/wallet`}
                className={`flex items-center ${isActive(`/${businessSlug}/wallet`) || isActive(`/business/${businessId}/wallet`) ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary hover:bg-stone-50 dark:hover:bg-stone-700 dark:text-white p-2 rounded-lg transition-colors`}
              >
                <Wallet className="h-5 w-5 mr-3" />
                Wallet
              </Link>

              <Link
                href={businessSlug ? `/${businessSlug}/edit-business` : `/business/${businessId}/edit-business`}
                className={`flex items-center ${isActive(`/${businessSlug}/edit-business`) || isActive(`/business/${businessId}/edit-business`) ? "text-primary bg-primary/5" : "text-gray-600"} hover:text-primary hover:bg-stone-50 dark:hover:bg-stone-700 dark:text-white p-2 rounded-lg transition-colors`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Edit Business
              </Link>
            </nav>
          </section>
        )}

        {/* Settings Menu */}
        {/* {business?.owner_id === convexUserId && (
        <section className="bg-white dark:bg-stone-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <nav className="space-y-2">
            <Link 
              href={`/business/edit`}
              className={`flex items-center ${isActive(`/business/edit`) ? 'text-primary bg-primary/5' : 'text-gray-600'} hover:text-primary hover:bg-stone-50 p-2 rounded-lg transition-colors`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Edit Business
            </Link>
            <Link 
              href={`/business/security`}
              className={`flex items-center ${isActive(`/business/security`) ? 'text-primary bg-primary/5' : 'text-gray-600'} hover:text-primary hover:bg-stone-50 p-2 rounded-lg transition-colors`}
            >
              <ShieldCheck className="h-5 w-5 mr-3" />
              Security
            </Link>
            <Link 
              href={`/business/notifications`}
              className={`flex items-center ${isActive(`/business/notifications`) ? 'text-primary bg-primary/5' : 'text-gray-600'} hover:text-primary hover:bg-stone-50 p-2 rounded-lg transition-colors`}
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </Link>
            <Link 
              href={`/business/privacy`}
              className={`flex items-center ${isActive(`/business/privacy`) ? 'text-primary bg-primary/5' : 'text-gray-600'} hover:text-primary hover:bg-stone-50 p-2 rounded-lg transition-colors`}
            >
              <Lock className="h-5 w-5 mr-3" />
              Privacy
            </Link>
          </nav>
        </section>
        )} */}

        {/* SOL Payment Modal is now handled by centralized ModalManager */}
      </div>
    </div>
  );
}

export default BusinessSideNav;
