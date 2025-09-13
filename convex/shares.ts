import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Allocate shares to an investor
export const allocateShares = mutation({
  args: {
    franchiseId: v.id("franchise"),
    brandId: v.id("brands"),
    investmentId: v.optional(v.id("investments")),
    approvalId: v.optional(v.id("approvals")),
    shareholderId: v.id("users"),
    shareholderWalletAddress: v.optional(v.string()),
    sharesAllocated: v.number(),
    sharePrice: v.number(),
    shareType: v.string(),
    vestingPeriod: v.optional(v.number()),
    transferRestrictions: v.optional(v.string()),
    tokenMint: v.optional(v.string()),
    tokenAccount: v.optional(v.string()),
    mintTransactionHash: v.optional(v.string()),
    allocationNotes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const shareId = `share_${now}_${Math.random().toString(36).substr(2, 9)}`;
    const totalValue = args.sharesAllocated * args.sharePrice;

    const shareData: any = {
      shareId,
      franchiseId: args.franchiseId,
      brandId: args.brandId,
      investmentId: args.investmentId,
      approvalId: args.approvalId,
      shareholderId: args.shareholderId,
      shareholderWalletAddress: args.shareholderWalletAddress,
      sharesAllocated: args.sharesAllocated,
      sharePrice: args.sharePrice,
      totalValue,
      shareType: args.shareType,
      status: "allocated",
      allocatedAt: now,
      vestingPeriod: args.vestingPeriod,
      isVested: args.vestingPeriod ? false : true, // If no vesting period, shares are immediately vested
      transferRestrictions: args.transferRestrictions,
      tokenMint: args.tokenMint,
      tokenAccount: args.tokenAccount,
      mintTransactionHash: args.mintTransactionHash,
      dividendsEarned: 0,
      allocationNotes: args.allocationNotes,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    };

    // If shares are immediately vested, set vestedAt
    if (!args.vestingPeriod) {
      shareData.vestedAt = now;
    }

    const dbShareId = await ctx.db.insert("shares", shareData);
    return { shareId: dbShareId, shareRef: shareId };
  },
});

// Update share status (vest, transfer, etc.)
export const updateShareStatus = mutation({
  args: {
    shareId: v.id("shares"),
    status: v.string(),
    isVested: v.optional(v.boolean()),
    tokenMint: v.optional(v.string()),
    tokenAccount: v.optional(v.string()),
    mintTransactionHash: v.optional(v.string()),
    allocationNotes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updateData: any = {
      status: args.status,
      updatedAt: now,
    };

    if (args.isVested !== undefined) {
      updateData.isVested = args.isVested;
      if (args.isVested) {
        updateData.vestedAt = now;
      }
    }

    if (args.tokenMint) updateData.tokenMint = args.tokenMint;
    if (args.tokenAccount) updateData.tokenAccount = args.tokenAccount;
    if (args.mintTransactionHash) updateData.mintTransactionHash = args.mintTransactionHash;
    if (args.allocationNotes) updateData.allocationNotes = args.allocationNotes;
    if (args.metadata) updateData.metadata = args.metadata;

    // Set timestamps based on status
    if (args.status === "transferred") {
      updateData.transferredAt = now;
    }

    await ctx.db.patch(args.shareId, updateData);
    return { success: true };
  },
});

// Get shares by franchise
export const getSharesByFranchise = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .order("desc")
      .collect();
  },
});

// Get shares by shareholder
export const getSharesByShareholder = query({
  args: { shareholderId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shares")
      .withIndex("by_shareholder", (q) => q.eq("shareholderId", args.shareholderId))
      .order("desc")
      .collect();
  },
});

// Get shares by brand
export const getSharesByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shares")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

// Get franchise share statistics
export const getFranchiseShareStats = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    const stats = {
      totalSharesAllocated: 0,
      totalShareValue: 0,
      vestedShares: 0,
      unvestedShares: 0,
      uniqueShareholders: new Set<string>(),
      sharesByType: {} as Record<string, number>,
      sharesByStatus: {} as Record<string, number>,
      averageSharePrice: 0,
      totalDividends: 0,
    };

    shares.forEach(share => {
      stats.totalSharesAllocated += share.sharesAllocated;
      stats.totalShareValue += share.totalValue;
      stats.totalDividends += share.dividendsEarned || 0;
      stats.uniqueShareholders.add(share.shareholderId);

      if (share.isVested) {
        stats.vestedShares += share.sharesAllocated;
      } else {
        stats.unvestedShares += share.sharesAllocated;
      }

      // Count by type
      if (!stats.sharesByType[share.shareType]) {
        stats.sharesByType[share.shareType] = 0;
      }
      stats.sharesByType[share.shareType] += share.sharesAllocated;

      // Count by status
      if (!stats.sharesByStatus[share.status]) {
        stats.sharesByStatus[share.status] = 0;
      }
      stats.sharesByStatus[share.status] += share.sharesAllocated;
    });

    if (stats.totalSharesAllocated > 0) {
      stats.averageSharePrice = stats.totalShareValue / stats.totalSharesAllocated;
    }

    return {
      ...stats,
      uniqueShareholderCount: stats.uniqueShareholders.size,
    };
  },
});

// Get remaining shares for a franchise
export const getRemainingShares = query({
  args: { 
    franchiseId: v.id("franchise"),
    totalShares: v.number(),
  },
  handler: async (ctx, args) => {
    const allocatedShares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const totalAllocated = allocatedShares.reduce((sum, share) => sum + share.sharesAllocated, 0);
    const remaining = args.totalShares - totalAllocated;

    return {
      totalShares: args.totalShares,
      allocatedShares: totalAllocated,
      remainingShares: Math.max(0, remaining),
      allocationPercentage: (totalAllocated / args.totalShares) * 100,
    };
  },
});

// Get franchisees by franchise (shareholders with user details)
export const getFranchiseesByFranchise = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    // Get all shares for this franchise
    const shares = await ctx.db
      .query("shares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    // Group shares by shareholder
    const shareholderMap = new Map();

    for (const share of shares) {
      const shareholderId = share.shareholderId;
      if (shareholderMap.has(shareholderId)) {
        shareholderMap.get(shareholderId).numberOfShares += share.sharesAllocated;
        shareholderMap.get(shareholderId).totalValue += share.totalValue;
      } else {
        shareholderMap.set(shareholderId, {
          _id: shareholderId,
          shareholderId,
          numberOfShares: share.sharesAllocated,
          totalValue: share.totalValue,
          shareType: share.shareType,
          status: share.status,
          isVested: share.isVested,
          allocatedAt: share.allocatedAt,
        });
      }
    }

    // Get user details for each shareholder
    const franchisees = [];
    for (const [shareholderId, shareData] of shareholderMap) {
      try {
        // Query users table specifically to get proper typing
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), shareholderId))
          .first();

        if (user && user.email) {
          // Extract name from email if no name fields available
          const emailName = user.email.split('@')[0];
          const nameParts = emailName.split('.');
          const firstName = nameParts[0] || emailName;
          const lastName = nameParts[1] || '';

          franchisees.push({
            ...shareData,
            user: {
              _id: user._id,
              first_name: firstName,
              family_name: lastName,
              avatar: user.avatar || '/default-avatar.png',
              email: user.email,
            }
          });
        }
      } catch (error) {
        // Skip if user not found or invalid ID
        console.log(`User not found for shareholderId: ${shareholderId}`);
      }
    }

    // Sort by number of shares (descending)
    return franchisees.sort((a, b) => b.numberOfShares - a.numberOfShares);
  },
});

// Process vesting for shares (can be called periodically)
export const processVesting = mutation({
  args: { franchiseId: v.optional(v.id("franchise")) },
  handler: async (ctx, args) => {
    const now = Date.now();

    let shares;
    if (args.franchiseId) {
      shares = await ctx.db
        .query("shares")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId!))
        .filter((q) => q.and(
          q.eq(q.field("isVested"), false),
          q.neq(q.field("vestingPeriod"), undefined)
        ))
        .collect();
    } else {
      shares = await ctx.db
        .query("shares")
        .filter((q) => q.and(
          q.eq(q.field("isVested"), false),
          q.neq(q.field("vestingPeriod"), undefined)
        ))
        .collect();
    }

    const vestedShares = [];

    for (const share of shares) {
      if (share.vestingPeriod && share.allocatedAt) {
        const vestingEndDate = share.allocatedAt + (share.vestingPeriod * 24 * 60 * 60 * 1000);

        if (now >= vestingEndDate) {
          await ctx.db.patch(share._id, {
            isVested: true,
            vestedAt: now,
            status: "vested",
            updatedAt: now,
          });
          vestedShares.push(share._id);
        }
      }
    }

    return {
      processedShares: vestedShares.length,
      vestedShareIds: vestedShares,
    };
  },
});
