import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Escrow statuses
export const ESCROW_STATUS = {
  HELD: "held",
  RELEASED: "released", 
  REFUNDED: "refunded",
  EXPIRED: "expired"
} as const;

// Escrow stages (franchise lifecycle)
export const ESCROW_STAGE = {
  PENDING_APPROVAL: "pending_approval",
  FUNDING: "funding",
  LAUNCHING: "launching", 
  ACTIVE: "active"
} as const;

// Create escrow record for new payment
export const createEscrowRecord = mutation({
  args: {
    franchiseId: v.id("franchise"),
    userId: v.id("users"),
    businessId: v.id("businesses"),
    paymentSignature: v.string(),
    amount: v.number(), // SOL amount for blockchain payment
    amountUSD: v.number(), // USD amount for business logic
    currency: v.string(),
    shares: v.number(),
    userEmail: v.optional(v.string()),
    userWallet: v.string(),
    contractSignature: v.optional(v.string()),
    contractAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Calculate expiry date (90 days from now)
    const expiresAt = Date.now() + (90 * 24 * 60 * 60 * 1000);

    const escrowId = await ctx.db.insert("escrow", {
      franchiseId: args.franchiseId,
      userId: args.userId,
      businessId: args.businessId,
      paymentSignature: args.paymentSignature,
      amount: args.amount, // SOL amount
      amountUSD: args.amountUSD, // USD amount
      currency: args.currency,
      shares: args.shares,
      status: ESCROW_STATUS.HELD,
      stage: ESCROW_STAGE.PENDING_APPROVAL,
      createdAt: Date.now(),
      expiresAt,
      userEmail: args.userEmail,
      userWallet: args.userWallet,
      contractSignature: args.contractSignature,
      contractAddress: args.contractAddress,
      autoRefundEnabled: true,
      manualReleaseRequired: true,
    });

    return escrowId;
  },
});

// Get escrow records for a franchise
export const getEscrowByFranchise = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    // Get user details for each record
    const recordsWithUsers = await Promise.all(
      escrowRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const processedBy = record.processedBy ? await ctx.db.get(record.processedBy) : null;
        return {
          ...record,
          user,
          processedBy,
        };
      })
    );

    return recordsWithUsers;
  },
});

// Get escrow records for a user
export const getEscrowByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get franchise and business details for each record
    const recordsWithDetails = await Promise.all(
      escrowRecords.map(async (record) => {
        const franchise = await ctx.db.get(record.franchiseId);
        const business = await ctx.db.get(record.businessId);
        const processedBy = record.processedBy ? await ctx.db.get(record.processedBy) : null;
        return {
          ...record,
          franchise,
          business,
          processedBy,
        };
      })
    );

    return recordsWithDetails;
  },
});

// Get all escrow records (admin only)
export const getAllEscrowRecords = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    // Check admin access
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) throw new Error("User not found");

    // Check if user has admin access
    const hasAdminRole = user.roles?.some(role => 
      ['admin', 'platform_admin', 'super_admin'].includes(role)
    ) || false;

    const isSuper = identity.email === "shawaz@franchiseen.com";

    // TEMPORARILY ALLOW ALL AUTHENTICATED USERS FOR TESTING
    // TODO: Re-enable admin check after platform team functions are working
    // if (!hasAdminRole && !isSuper) {
    //   throw new Error("Admin access required");
    // }

    const escrowRecords = await ctx.db
      .query("escrow")
      .order("desc")
      .collect();

    // Get related details for each record
    const recordsWithDetails = await Promise.all(
      escrowRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const franchise = await ctx.db.get(record.franchiseId);
        const business = await ctx.db.get(record.businessId);
        const processedBy = record.processedBy ? await ctx.db.get(record.processedBy) : null;
        return {
          ...record,
          user,
          franchise,
          business,
          processedBy,
        };
      })
    );

    return recordsWithDetails;
  },
});

// Release escrow funds (admin action)
export const releaseEscrowFunds = mutation({
  args: {
    escrowId: v.id("escrow"),
    releaseSignature: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) throw new Error("Not authenticated");

    // Check admin access
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) throw new Error("User not found");

    const hasAdminRole = user.roles?.some(role => 
      ['admin', 'platform_admin', 'super_admin'].includes(role)
    ) || false;

    const isSuper = identity.email === "shawaz@franchiseen.com";

    // TEMPORARILY ALLOW ALL AUTHENTICATED USERS FOR TESTING
    // TODO: Re-enable admin check after platform team functions are working
    // if (!hasAdminRole && !isSuper) {
    //   throw new Error("Admin access required");
    // }

    // Get escrow record
    const escrow = await ctx.db.get(args.escrowId);
    if (!escrow) throw new Error("Escrow record not found");

    if (escrow.status !== ESCROW_STATUS.HELD) {
      throw new Error("Escrow funds already processed");
    }

    // Update escrow record
    await ctx.db.patch(args.escrowId, {
      status: ESCROW_STATUS.RELEASED,
      releasedAt: Date.now(),
      releaseSignature: args.releaseSignature,
      processedBy: user._id,
      adminNotes: args.adminNotes,
    });

    return { success: true };
  },
});

// Refund escrow funds (admin action or automatic)
export const refundEscrowFunds = mutation({
  args: {
    escrowId: v.id("escrow"),
    refundSignature: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
    isAutomatic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // For automatic refunds, no auth required (system action)
    if (!args.isAutomatic) {
      if (!identity?.email) throw new Error("Not authenticated");

      // Check admin access for manual refunds
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email as string))
        .unique();

      if (!user) throw new Error("User not found");

      const hasAdminRole = user.roles?.some(role => 
        ['admin', 'platform_admin', 'super_admin'].includes(role)
      ) || false;

      const isSuper = identity.email === "shawaz@franchiseen.com";

      // TEMPORARILY ALLOW ALL AUTHENTICATED USERS FOR TESTING
      // TODO: Re-enable admin check after platform team functions are working
      // if (!hasAdminRole && !isSuper) {
      //   throw new Error("Admin access required");
      // }
    }

    // Get escrow record
    const escrow = await ctx.db.get(args.escrowId);
    if (!escrow) throw new Error("Escrow record not found");

    if (escrow.status !== ESCROW_STATUS.HELD) {
      throw new Error("Escrow funds already processed");
    }

    // Get admin user for processing
    let processedBy: Id<"users"> | undefined = undefined;
    if (!args.isAutomatic && identity?.email) {
      const adminUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email as string))
        .unique();
      processedBy = adminUser?._id;
    }

    // Update escrow record
    await ctx.db.patch(args.escrowId, {
      status: ESCROW_STATUS.REFUNDED,
      refundedAt: Date.now(),
      refundSignature: args.refundSignature,
      processedBy: processedBy || undefined,
      adminNotes: args.adminNotes || (args.isAutomatic ? "Automatic refund after 90 days" : undefined),
    });

    return { success: true };
  },
});

// Get expired escrow records for automatic processing
export const getExpiredEscrowRecords = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredRecords = await ctx.db
      .query("escrow")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .filter((q) => q.eq(q.field("status"), ESCROW_STATUS.HELD))
      .filter((q) => q.eq(q.field("autoRefundEnabled"), true))
      .collect();

    return expiredRecords;
  },
});

// Update escrow stage (when franchise status changes)
export const updateEscrowStage = mutation({
  args: {
    franchiseId: v.id("franchise"),
    newStage: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get all escrow records for this franchise
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), ESCROW_STATUS.HELD))
      .collect();

    // Update stage for all held escrow records
    await Promise.all(
      escrowRecords.map(record => 
        ctx.db.patch(record._id, { stage: args.newStage })
      )
    );

    return { updated: escrowRecords.length };
  },
});

// Process expired funding campaigns and trigger refunds
export const processExpiredFunding = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const processedFranchises = [];

    // Find all franchises in funding stage that have expired (90 days)
    const expiredFranchises = await ctx.db
      .query("franchise")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("status"), "Funding"),
            q.eq(q.field("status"), "Approved")
          ),
          q.lt(q.field("createdAt"), now - (90 * 24 * 60 * 60 * 1000))
        )
      )
      .collect();

    for (const franchise of expiredFranchises) {
      // Check if funding target was met
      const shares = await ctx.db
        .query("shares")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .collect();

      const totalRaised = shares.reduce((sum, share) =>
        sum + (share.numberOfShares * share.costPerShare), 0
      );

      const fundingPercentage = (totalRaised / franchise.totalInvestment) * 100;

      if (fundingPercentage < 100) {
        // Funding failed - process refunds
        await ctx.db.patch(franchise._id, {
          status: "Closed",
          rejectionReason: "Funding period expired - target not met",
          rejectedAt: now,
        });

        // Process escrow refunds
        const escrowRecords = await ctx.db
          .query("escrow")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .filter((q) => q.eq(q.field("status"), "held"))
          .collect();

        for (const escrow of escrowRecords) {
          await ctx.db.patch(escrow._id, {
            status: "refunded",
            refundedAt: now,
            adminNotes: `Automatic refund - funding period expired (${fundingPercentage.toFixed(1)}% of target reached)`,
          });
        }

        processedFranchises.push({
          franchiseId: franchise._id,
          building: franchise.building,
          fundingPercentage,
          refundedAmount: escrowRecords.reduce((sum, escrow) => sum + escrow.amount, 0),
          refundCount: escrowRecords.length,
        });
      } else {
        // Funding succeeded - move to launching
        await ctx.db.patch(franchise._id, {
          status: "Launching",
          launchStartDate: now,
          launchEndDate: now + (30 * 24 * 60 * 60 * 1000),
        });

        // Update escrow records to launching stage
        const escrowRecords = await ctx.db
          .query("escrow")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .filter((q) => q.eq(q.field("status"), "held"))
          .collect();

        for (const escrow of escrowRecords) {
          await ctx.db.patch(escrow._id, {
            stage: "launching",
            adminNotes: `Funding completed (${fundingPercentage.toFixed(1)}% of target) - moved to launching`,
          });
        }

        processedFranchises.push({
          franchiseId: franchise._id,
          building: franchise.building,
          fundingPercentage,
          status: "moved_to_launching",
        });
      }
    }

    return {
      processedCount: processedFranchises.length,
      processedFranchises,
      timestamp: now,
    };
  },
});

// Get franchises approaching funding deadline (within 7 days)
export const getFranchisesNearingDeadline = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
    const eightyThreeDaysAgo = now - (83 * 24 * 60 * 60 * 1000);

    // Find franchises in funding stage that will expire within 7 days
    const nearingDeadline = await ctx.db
      .query("franchise")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("status"), "Funding"),
            q.eq(q.field("status"), "Approved")
          ),
          q.gt(q.field("createdAt"), ninetyDaysAgo),
          q.lt(q.field("createdAt"), eightyThreeDaysAgo)
        )
      )
      .collect();

    const franchisesWithProgress = [];

    for (const franchise of nearingDeadline) {
      const shares = await ctx.db
        .query("shares")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .collect();

      const totalRaised = shares.reduce((sum, share) =>
        sum + (share.numberOfShares * share.costPerShare), 0
      );

      const fundingPercentage = (totalRaised / franchise.totalInvestment) * 100;
      const daysRemaining = Math.max(0, Math.ceil((franchise.createdAt + (90 * 24 * 60 * 60 * 1000) - now) / (24 * 60 * 60 * 1000)));

      franchisesWithProgress.push({
        ...franchise,
        totalRaised,
        fundingPercentage,
        daysRemaining,
        isAtRisk: fundingPercentage < 100,
      });
    }

    return franchisesWithProgress;
  },
});

// Get funding statistics for all active campaigns
export const getFundingStatistics = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all active funding campaigns
    const activeFranchises = await ctx.db
      .query("franchise")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "Funding"),
          q.eq(q.field("status"), "Approved")
        )
      )
      .collect();

    let totalCampaigns = 0;
    let successfulCampaigns = 0;
    let atRiskCampaigns = 0;
    let expiredCampaigns = 0;
    let totalFundingTarget = 0;
    let totalFundingRaised = 0;

    for (const franchise of activeFranchises) {
      totalCampaigns++;
      totalFundingTarget += franchise.totalInvestment;

      const shares = await ctx.db
        .query("shares")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .collect();

      const totalRaised = shares.reduce((sum, share) =>
        sum + (share.numberOfShares * share.costPerShare), 0
      );

      totalFundingRaised += totalRaised;
      const fundingPercentage = (totalRaised / franchise.totalInvestment) * 100;
      const daysRemaining = Math.max(0, Math.ceil((franchise.createdAt + (90 * 24 * 60 * 60 * 1000) - now) / (24 * 60 * 60 * 1000)));

      if (daysRemaining === 0) {
        expiredCampaigns++;
      } else if (fundingPercentage >= 100) {
        successfulCampaigns++;
      } else if (daysRemaining <= 7) {
        atRiskCampaigns++;
      }
    }

    return {
      totalCampaigns,
      successfulCampaigns,
      atRiskCampaigns,
      expiredCampaigns,
      totalFundingTarget,
      totalFundingRaised,
      averageFundingPercentage: totalCampaigns > 0 ? (totalFundingRaised / totalFundingTarget) * 100 : 0,
    };
  },
});

// Process manual refund for a specific franchise
export const processManualRefund = mutation({
  args: {
    franchiseId: v.id("franchise"),
    reason: v.string(),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) throw new Error("User not found");

    // Get franchise
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) throw new Error("Franchise not found");

    // Get all held escrow records for this franchise
    const escrowRecords = await ctx.db
      .query("escrow")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "held"))
      .collect();

    if (escrowRecords.length === 0) {
      throw new Error("No held escrow funds found for this franchise");
    }

    const now = Date.now();
    let totalRefunded = 0;
    let refundCount = 0;

    // Process refunds for all held escrow records
    for (const escrow of escrowRecords) {
      await ctx.db.patch(escrow._id, {
        status: "refunded",
        stage: "refunded",
        refundedAt: now,
        refundReason: args.reason,
        adminNotes: args.adminNotes || `Manual refund processed by admin: ${args.reason}`,
        processedBy: user._id,
      });

      totalRefunded += escrow.amount;
      refundCount++;
    }

    // Update franchise status if not already rejected
    if (franchise.status !== "Rejected") {
      await ctx.db.patch(args.franchiseId, {
        status: "Rejected",
        rejectedAt: now,
        rejectionReason: args.reason,
      });
    }

    return {
      success: true,
      refundsProcessed: refundCount,
      totalRefundAmount: totalRefunded,
      message: `Processed ${refundCount} refunds totaling $${totalRefunded.toFixed(2)}`,
    };
  },
});

// Get refund statistics and history
export const getRefundStatistics = query({
  args: {
    period: v.optional(v.string()), // "week", "month", "quarter", "year", "all"
  },
  handler: async (ctx, args) => {
    const period = args.period || "month";
    let startDate = 0;

    const now = Date.now();
    switch (period) {
      case "week":
        startDate = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = now - (90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = now - (365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = 0;
    }

    // Get all refunded escrow records within the period
    const refundedEscrows = await ctx.db
      .query("escrow")
      .withIndex("by_status", (q) => q.eq("status", "refunded"))
      .filter((q) => q.gte(q.field("refundedAt"), startDate))
      .collect();

    // Calculate statistics
    const totalRefunds = refundedEscrows.length;
    const totalRefundAmount = refundedEscrows.reduce((sum, escrow) => sum + escrow.amount, 0);
    const averageRefundAmount = totalRefunds > 0 ? totalRefundAmount / totalRefunds : 0;

    // Group by reason
    const refundsByReason = refundedEscrows.reduce((acc, escrow) => {
      const reason = escrow.refundReason || "Automatic refund due to expiry";
      if (!acc[reason]) {
        acc[reason] = { count: 0, amount: 0 };
      }
      acc[reason].count++;
      acc[reason].amount += escrow.amount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return {
      period,
      startDate,
      endDate: now,
      statistics: {
        totalRefunds,
        totalRefundAmount,
        averageRefundAmount,
      },
      refundsByReason,
    };
  },
});

// Get pending refunds that need manual processing
export const getPendingRefunds = query({
  args: {},
  handler: async (ctx) => {
    // Get franchises that are rejected but still have held escrow funds
    const rejectedFranchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("status"), "Rejected"))
      .collect();

    const pendingRefunds = [];

    for (const franchise of rejectedFranchises) {
      const heldEscrows = await ctx.db
        .query("escrow")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .filter((q) => q.eq(q.field("status"), "held"))
        .collect();

      if (heldEscrows.length > 0) {
        const totalAmount = heldEscrows.reduce((sum, escrow) => sum + escrow.amount, 0);
        const investorCount = new Set(heldEscrows.map(e => e.userId)).size;

        pendingRefunds.push({
          franchise: {
            _id: franchise._id,
            building: franchise.building,
            locationAddress: franchise.locationAddress,
            status: franchise.status,
            rejectedAt: franchise.rejectedAt,
            rejectionReason: franchise.rejectionReason,
          },
          escrowRecords: heldEscrows.length,
          totalAmount,
          investorCount,
          oldestEscrow: Math.min(...heldEscrows.map(e => e.createdAt)),
        });
      }
    }

    return pendingRefunds.sort((a, b) => a.oldestEscrow - b.oldestEscrow);
  },
});
