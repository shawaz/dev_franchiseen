import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";

// Helper function to generate slug from building name and location
function generateFranchiseSlug(building: string, locationAddress: string): string {
  const combined = `${building} ${locationAddress}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export const create = mutation({
  args: {
    businessId: v.id("businesses"),
    locationAddress: v.string(),
    building: v.string(),
    carpetArea: v.number(),
    costPerArea: v.number(),
    totalInvestment: v.number(),
    totalShares: v.number(),
    selectedShares: v.number(),
    slug: v.optional(v.string()),
  },
  returns: v.object({
    franchiseId: v.id("franchise"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!identity.email) {
      throw new Error("User email is required");
    }

    // Get or create user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate slug if not provided
    let slug = args.slug || generateFranchiseSlug(args.building, args.locationAddress);

    // Ensure slug is unique
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existingFranchise = await ctx.db
        .query("franchise")
        .filter((q) => q.eq(q.field("slug"), slug))
        .unique();

      if (!existingFranchise) break;

      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    const franchiseId = await ctx.db.insert("franchise", {
      ...args,
      slug: slug,
      selectedShares: 0,
      owner_id: user._id,
      createdAt: Date.now(),
      status: "Pending Approval",
    });

    // Remove automatic share allocation here. Shares will be allocated after payment.

    return { franchiseId, slug };
  },
});

export const getBySlug = query({
  args: {
    businessSlug: v.string(),
    franchiseSlug: v.string(),
  },
  handler: async (ctx, args) => {
    // First get business by slug
    const business = await ctx.db
      .query("businesses")
      .filter((q) => q.eq(q.field("slug"), args.businessSlug))
      .unique();

    if (!business) return null;

    // Then get franchise by slug within that business
    const franchise = await ctx.db
      .query("franchise")
      .filter((q) =>
        q.and(
          q.eq(q.field("businessId"), business._id),
          q.eq(q.field("slug"), args.franchiseSlug)
        )
      )
      .unique();

    return franchise;
  },
});

export const createInvoice = mutation({
  args: {
    franchiseId: v.id("franchise"),
    serviceFee: v.number(),
    gst: v.number(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!identity.email) {
      throw new Error("User email is required");
    }

    // Get or create user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const invoiceId = await ctx.db.insert("invoice", {
      ...args,
      userId: user._id,
      createdAt: Date.now(),
    });

    return invoiceId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("franchise").collect();
  },
});

export const getById = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.franchiseId);
  },
});

export const updateStatus = mutation({
  args: {
    franchiseId: v.id("franchise"),
    status: v.string(),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    // Get current franchise
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    // Update escrow stage when franchise status changes
    if (args.status !== franchise.status) {
      // Map franchise status to escrow stage
      let escrowStage = "pending_approval";
      switch (args.status) {
        case "Approved":
          escrowStage = "funding";
          break;
        case "Funding":
          escrowStage = "funding";
          break;
        case "Launching":
          escrowStage = "launching";
          break;
        case "Active":
          escrowStage = "active";
          break;
        default:
          escrowStage = "pending_approval";
      }

      // Update all escrow records for this franchise
      const escrowRecords = await ctx.db
        .query("escrow")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .collect();

      for (const escrow of escrowRecords) {
        if (escrow.status === "held") {
          await ctx.db.patch(escrow._id, {
            stage: escrowStage,
            adminNotes: args.adminNotes || `Status updated to ${args.status}`,
          });
        }
      }
    }

    // Handle special status transitions
    if (args.status === "Launching") {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      await ctx.db.patch(args.franchiseId, {
        status: args.status,
        launchStartDate: now,
        launchEndDate: now + thirtyDays,
      });
    } else {
      await ctx.db.patch(args.franchiseId, { status: args.status });
    }

    return true;
  },
});

export const getStatusCountsByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();

    // Count by status
    const counts = { Funding: 0, Launching: 0, Active: 0 };
    for (const franchise of franchises) {
      if (franchise.status === "Funding") counts.Funding++;
      else if (franchise.status === "Launching") counts.Launching++;
      else if (franchise.status === "Active") counts.Active++;
    }
    return counts;
  },
});

export const getTotalAvailableSharesByBusiness = query({
  args: { businessId: v.id("businesses") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
    let totalAvailable = 0;
    for (const franchise of franchises) {
      const available = (franchise.totalShares || 0) - (franchise.selectedShares || 0);
      totalAvailable += available;
    }
    return totalAvailable;
  },
});

export const getTotalSharesByBusiness = query({
  args: { businessId: v.id("businesses") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
    return franchises.reduce((sum, f) => sum + (f.totalShares || 0), 0);
  },
});

export const listInvoicesByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    // Get all franchises for the business
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
    const franchiseIds = franchises.map((f) => f._id);
    if (franchiseIds.length === 0) return [];
    // Get all invoices for these franchises
    const invoices = await ctx.db
      .query("invoice")
      .filter((q) => q.or(...franchiseIds.map(id => q.eq(q.field("franchiseId"), id))))
      .order("desc")
      .collect();
    return invoices;
  },
});

export const getAvailableSharesForCrowdfunding = query({
  args: { businessId: v.id("businesses") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .filter((q) => q.eq(q.field("status"), "Funding"))
      .collect();
    let totalAvailable = 0;
    for (const franchise of franchises) {
      const available = (franchise.totalShares || 0) - (franchise.selectedShares || 0);
      totalAvailable += available;
    }
    return totalAvailable;
  },
});

export const getTotalIssuedSharesByBusiness = query({
  args: { businessId: v.id("businesses") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const issuedStatuses = ["Funding", "Launching", "Active"];
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
    return franchises
      .filter((f) => issuedStatuses.includes(f.status))
      .reduce((sum, f) => sum + (f.selectedShares || 0), 0);
  },
});

export const getSharesStatsByBusiness = query({
  args: { businessId: v.id("businesses") },
  returns: v.object({
    totalShares: v.number(),
    issuedShares: v.number(),
  }),
  handler: async (ctx, args) => {
    const statuses = ["Funding", "Launching", "Active"];
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
    const filtered = franchises.filter((f) => statuses.includes(f.status));
    const totalShares = filtered.reduce((sum, f) => sum + (f.totalShares || 0), 0);
    const issuedShares = filtered.reduce((sum, f) => sum + (f.selectedShares || 0), 0);
    return { totalShares, issuedShares };
  },
});

export const updateSlug = mutation({
  args: {
    franchiseId: v.id("franchise"),
    newSlug: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Generate new slug if not provided
    let slug = args.newSlug || generateFranchiseSlug(franchise.building, franchise.locationAddress);

    // Ensure slug is unique
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existingFranchise = await ctx.db
        .query("franchise")
        .filter((q) =>
          q.and(
            q.eq(q.field("slug"), slug),
            q.neq(q.field("_id"), args.franchiseId)
          )
        )
        .unique();

      if (!existingFranchise) break;

      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    await ctx.db.patch(args.franchiseId, { slug });
    return slug;
  },
});

export const listByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .collect();
  },
});

// Get publicly visible franchises for a business (excludes Pending Approval, Rejected, and Approved)
export const getPublicFranchisesByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    // Only show franchises that are in funding stage or beyond
    // "Approved" status should not be public until it transitions to "Funding"
    const publicStatuses = ["Funding", "Launching", "Active", "Closed"];

    return await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .filter((q) => {
        // Only include franchises with public statuses (excludes Pending Approval, Approved, Rejected)
        return q.or(
          q.eq(q.field("status"), "Funding"),
          q.eq(q.field("status"), "Launching"),
          q.eq(q.field("status"), "Active"),
          q.eq(q.field("status"), "Closed")
        );
      })
      .collect();
  },
});

// Auto-transition approved franchises to funding status
export const transitionApprovedToFunding = mutation({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    // Only transition if currently approved
    if (franchise.status === "Approved") {
      await ctx.db.patch(args.franchiseId, {
        status: "Funding",
      });

      // Update escrow records to funding stage
      const escrowRecords = await ctx.db
        .query("escrow")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .filter((q) => q.eq(q.field("status"), "released"))
        .collect();

      for (const escrow of escrowRecords) {
        await ctx.db.patch(escrow._id, {
          stage: "funding",
          adminNotes: "Transitioned from Approved to Funding for public listing",
        });
      }

      return { success: true, newStatus: "Funding" };
    }

    return { success: false, currentStatus: franchise.status };
  },
});

// Get franchises by business with location data for map display
export const getLocationsByBusiness = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("businessId"), args.businessId))
      .filter((q) => q.neq(q.field("status"), "Rejected"))
      .collect();

    return franchises.map(franchise => ({
      _id: franchise._id,
      slug: franchise.slug,
      locationAddress: franchise.locationAddress,
      building: franchise.building,
      status: franchise.status,
      totalShares: franchise.totalShares,
      selectedShares: franchise.selectedShares,
      createdAt: franchise.createdAt,
    }));
  },
});

// Get pending franchise proposals for approval
export const getPendingByBusiness = query({
  args: {
    businessId: v.id("businesses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .filter((q) =>
        q.and(
          q.eq(q.field("businessId"), args.businessId),
          q.or(
            q.eq(q.field("status"), "Pending Approval"),
            q.eq(q.field("status"), "Under Review")
          )
        )
      )
      .collect();
  },
});

// Approve a franchise proposal and create token
export const approveFranchise = mutation({
  args: {
    franchiseId: v.id("franchise"),
    tokenMint: v.string(),
    transactionSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the franchise
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Get the business to verify ownership
    const business = await ctx.db.get(franchise.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user || business.owner_id !== user._id) {
      throw new Error("Not authorized to approve this franchise");
    }

    // Update franchise status and add token information
    // Directly set to "Funding" status for public visibility
    await ctx.db.patch(args.franchiseId, {
      status: "Funding", // Changed from "Approved" to "Funding" for immediate public visibility
      tokenMint: args.tokenMint,
      transactionSignature: args.transactionSignature,
      approvedAt: Date.now(),
      approvedBy: user._id,
    });

    // Update escrow records to funding stage and release funds to company
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "held"))
      .collect();

    for (const escrow of escrowRecords) {
      await ctx.db.patch(escrow._id, {
        stage: "funding",
        status: "released",
        releasedAt: Date.now(),
        processedBy: user._id,
        adminNotes: "Funds released upon franchise approval and transitioned to funding",
      });
    }

    return { success: true };
  },
});

// Reject a franchise proposal
export const rejectFranchise = mutation({
  args: {
    franchiseId: v.id("franchise"),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the franchise
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Get the business to verify ownership
    const business = await ctx.db.get(franchise.businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user || business.owner_id !== user._id) {
      throw new Error("Not authorized to reject this franchise");
    }

    // Update franchise status
    await ctx.db.patch(args.franchiseId, {
      status: "Rejected",
      rejectionReason: args.rejectionReason,
      rejectedAt: Date.now(),
      rejectedBy: user._id,
    });

    // Process refunds for all held escrow records
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "held"))
      .collect();

    for (const escrow of escrowRecords) {
      await ctx.db.patch(escrow._id, {
        status: "refunded",
        refundedAt: Date.now(),
        processedBy: user._id,
        adminNotes: `Refund processed due to franchise rejection: ${args.rejectionReason}`,
      });
    }

    return { success: true };
  },
});

// Check and update franchise funding status
export const checkFundingCompletion = mutation({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    // Calculate total investment from shares
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    const totalRaised = shares.reduce((sum, share) =>
      sum + (share.numberOfShares * share.costPerShare), 0
    );

    const fundingTarget = franchise.totalInvestment;
    const fundingPercentage = (totalRaised / fundingTarget) * 100;

    // If funding is complete (100% or more), move to launching
    if (fundingPercentage >= 100 && franchise.status === "Funding") {
      await ctx.db.patch(args.franchiseId, {
        status: "Launching",
        launchStartDate: Date.now(),
        launchEndDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Update escrow records to launching stage
      const escrowRecords = await ctx.db
        .query("escrow")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .filter((q) => q.eq(q.field("status"), "held"))
        .collect();

      for (const escrow of escrowRecords) {
        await ctx.db.patch(escrow._id, {
          stage: "launching",
          adminNotes: "Funding completed, moved to launching stage",
        });
      }

      return {
        success: true,
        statusChanged: true,
        newStatus: "Launching",
        fundingPercentage
      };
    }

    return {
      success: true,
      statusChanged: false,
      currentStatus: franchise.status,
      fundingPercentage
    };
  },
});

// Get franchise funding progress
export const getFundingProgress = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) return null;

    const shares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    const totalRaised = shares.reduce((sum, share) =>
      sum + (share.numberOfShares * share.costPerShare), 0
    );

    const fundingTarget = franchise.totalInvestment;
    const fundingPercentage = Math.min(100, (totalRaised / fundingTarget) * 100);

    // Check if funding period has expired (90 days)
    const fundingExpired = Date.now() > (franchise.createdAt + (90 * 24 * 60 * 60 * 1000));

    return {
      franchiseId: args.franchiseId,
      totalRaised,
      fundingTarget,
      fundingPercentage,
      fundingExpired,
      status: franchise.status,
      createdAt: franchise.createdAt,
      daysRemaining: Math.max(0, Math.ceil((franchise.createdAt + (90 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000))),
    };
  },
});

// Get detailed investment tracking for a franchise
export const getInvestmentTracking = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) return null;

    // Get all shares for this franchise
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    // Get all escrow records for this franchise
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    // Calculate investment metrics
    const totalShares = shares.reduce((sum, share) => sum + share.numberOfShares, 0);
    const totalInvested = shares.reduce((sum, share) => sum + (share.numberOfShares * share.costPerShare), 0);
    const uniqueInvestors = new Set(shares.map(share => share.userId)).size;

    const fundingTarget = franchise.totalInvestment;
    const fundingPercentage = (totalInvested / fundingTarget) * 100;
    const remainingAmount = Math.max(0, fundingTarget - totalInvested);
    const remainingShares = Math.max(0, franchise.totalShares - totalShares);

    // Calculate escrow metrics
    const totalEscrowAmount = escrowRecords.reduce((sum, escrow) => sum + escrow.amount, 0);
    const heldEscrowAmount = escrowRecords
      .filter(escrow => escrow.status === 'held')
      .reduce((sum, escrow) => sum + escrow.amount, 0);
    const releasedEscrowAmount = escrowRecords
      .filter(escrow => escrow.status === 'released')
      .reduce((sum, escrow) => sum + escrow.amount, 0);

    // Time-based metrics
    const now = Date.now();
    const daysActive = Math.floor((now - franchise.createdAt) / (24 * 60 * 60 * 1000));
    const daysRemaining = Math.max(0, Math.ceil((franchise.createdAt + (90 * 24 * 60 * 60 * 1000) - now) / (24 * 60 * 60 * 1000)));
    const dailyAverageInvestment = daysActive > 0 ? totalInvested / daysActive : 0;
    const projectedTotal = dailyAverageInvestment * 90;

    // Investment timeline (last 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentShares = shares.filter(share => share.purchaseDate >= thirtyDaysAgo);
    const recentInvestment = recentShares.reduce((sum, share) => sum + (share.numberOfShares * share.costPerShare), 0);

    // Top investors
    const investorTotals = shares.reduce((acc, share) => {
      const key = share.userId;
      if (!acc[key]) {
        acc[key] = {
          userId: share.userId,
          userName: share.userName,
          userImage: share.userImage,
          totalShares: 0,
          totalInvested: 0,
          shareCount: 0,
        };
      }
      acc[key].totalShares += share.numberOfShares;
      acc[key].totalInvested += share.numberOfShares * share.costPerShare;
      acc[key].shareCount += 1;
      return acc;
    }, {} as Record<string, any>);

    const topInvestors = Object.values(investorTotals)
      .sort((a: any, b: any) => b.totalInvested - a.totalInvested)
      .slice(0, 10);

    return {
      franchise: {
        _id: franchise._id,
        building: franchise.building,
        locationAddress: franchise.locationAddress,
        status: franchise.status,
        createdAt: franchise.createdAt,
        totalShares: franchise.totalShares,
        totalInvestment: franchise.totalInvestment,
      },
      investment: {
        totalShares,
        totalInvested,
        uniqueInvestors,
        fundingTarget,
        fundingPercentage,
        remainingAmount,
        remainingShares,
        isFullyFunded: fundingPercentage >= 100,
      },
      escrow: {
        totalEscrowAmount,
        heldEscrowAmount,
        releasedEscrowAmount,
        recordCount: escrowRecords.length,
      },
      timeline: {
        daysActive,
        daysRemaining,
        dailyAverageInvestment,
        projectedTotal,
        recentInvestment,
        isOnTrack: projectedTotal >= fundingTarget,
      },
      investors: {
        topInvestors,
        totalCount: uniqueInvestors,
      },
    };
  },
});

// Get investment summary for all franchises
export const getInvestmentSummary = query({
  args: {},
  handler: async (ctx) => {
    const franchises = await ctx.db.query("franchise").collect();
    const summaries = [];

    for (const franchise of franchises) {
      const shares = await ctx.db
        .query("shares")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .collect();

      const totalInvested = shares.reduce((sum, share) => sum + (share.numberOfShares * share.costPerShare), 0);
      const fundingPercentage = (totalInvested / franchise.totalInvestment) * 100;
      const uniqueInvestors = new Set(shares.map(share => share.userId)).size;

      const now = Date.now();
      const daysRemaining = Math.max(0, Math.ceil((franchise.createdAt + (90 * 24 * 60 * 60 * 1000) - now) / (24 * 60 * 60 * 1000)));

      summaries.push({
        franchiseId: franchise._id,
        building: franchise.building,
        locationAddress: franchise.locationAddress,
        status: franchise.status,
        totalInvestment: franchise.totalInvestment,
        totalInvested,
        fundingPercentage,
        uniqueInvestors,
        daysRemaining,
        isFullyFunded: fundingPercentage >= 100,
        isAtRisk: daysRemaining <= 7 && fundingPercentage < 100,
      });
    }

    return summaries.sort((a, b) => b.fundingPercentage - a.fundingPercentage);
  },
});

// Update franchise total investment (for fixing inflated values)
export const updateTotalInvestment = mutation({
  args: {
    franchiseId: v.id("franchise"),
    totalInvestment: v.number(),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    await ctx.db.patch(args.franchiseId, {
      totalInvestment: args.totalInvestment,
    });

    return { success: true, newValue: args.totalInvestment };
  },
});

// Trigger funding completion check when new investment is made
export const processNewInvestment = mutation({
  args: {
    franchiseId: v.id("franchise"),
    investmentAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    // Get current investment total
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    const totalInvested = shares.reduce((sum, share) => sum + (share.numberOfShares * share.costPerShare), 0);
    const fundingPercentage = (totalInvested / franchise.totalInvestment) * 100;

    // Check if funding goal is now met
    if (fundingPercentage >= 100 && franchise.status === "Funding") {
      // Move to launching status
      const now = Date.now();
      await ctx.db.patch(args.franchiseId, {
        status: "Launching",
        launchStartDate: now,
        launchEndDate: now + (30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Update escrow records
      const escrowRecords = await ctx.db
        .query("escrow")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .filter((q) => q.eq(q.field("status"), "held"))
        .collect();

      for (const escrow of escrowRecords) {
        await ctx.db.patch(escrow._id, {
          stage: "launching",
          adminNotes: `Funding completed (${fundingPercentage.toFixed(1)}%) - moved to launching`,
        });
      }

      return {
        success: true,
        statusChanged: true,
        newStatus: "Launching",
        fundingPercentage,
        message: "Funding goal achieved! Franchise moved to launching stage.",
      };
    }

    return {
      success: true,
      statusChanged: false,
      currentStatus: franchise.status,
      fundingPercentage,
      message: `Investment processed. ${fundingPercentage.toFixed(1)}% of funding goal achieved.`,
    };
  },
});