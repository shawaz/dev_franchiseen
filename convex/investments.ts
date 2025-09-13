import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create investment record
export const createInvestment = mutation({
  args: {
    franchiseId: v.id("franchise"),
    brandId: v.id("brands"),
    approvalId: v.optional(v.id("approvals")),
    investmentAmountUSD: v.number(),
    sharesPurchased: v.number(),
    pricePerShare: v.number(),
    transactionId: v.optional(v.id("transactions")),
    paymentMethod: v.string(),
    originalAmount: v.optional(v.number()),
    originalCurrency: v.optional(v.string()),
    exchangeRate: v.optional(v.number()),
    investorWalletAddress: v.optional(v.string()),
    fromWalletAddress: v.optional(v.string()),
    toWalletAddress: v.optional(v.string()),
    blockchainTxHash: v.optional(v.string()),
    platformCommission: v.number(),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const investorId = identity.subject as Id<"users">;
    const investmentId = `inv_${now}_${Math.random().toString(36).substr(2, 9)}`;

    const netInvestmentAmount = args.investmentAmountUSD - args.platformCommission;

    const investmentData = {
      investmentId,
      franchiseId: args.franchiseId,
      brandId: args.brandId,
      approvalId: args.approvalId,
      investorId,
      investorWalletAddress: args.investorWalletAddress,
      investmentAmountUSD: args.investmentAmountUSD,
      sharesPurchased: args.sharesPurchased,
      pricePerShare: args.pricePerShare,
      transactionId: args.transactionId,
      paymentMethod: args.paymentMethod,
      originalAmount: args.originalAmount,
      originalCurrency: args.originalCurrency,
      exchangeRate: args.exchangeRate,
      status: "pending",
      investedAt: now,
      blockchainTxHash: args.blockchainTxHash,
      fromWalletAddress: args.fromWalletAddress,
      toWalletAddress: args.toWalletAddress,
      platformCommission: args.platformCommission,
      netInvestmentAmount,
      notes: args.notes,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    };

    const dbInvestmentId = await ctx.db.insert("investments", investmentData);
    return { investmentId: dbInvestmentId, investmentRef: investmentId };
  },
});

// Update investment status
export const updateInvestmentStatus = mutation({
  args: {
    investmentId: v.id("investments"),
    status: v.string(),
    blockchainTxHash: v.optional(v.string()),
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updateData: any = {
      status: args.status,
      updatedAt: now,
    };

    if (args.blockchainTxHash) {
      updateData.blockchainTxHash = args.blockchainTxHash;
    }

    if (args.notes) {
      updateData.notes = args.notes;
    }

    if (args.metadata) {
      updateData.metadata = args.metadata;
    }

    // Set timestamps based on status
    if (args.status === "confirmed") {
      updateData.confirmedAt = now;
    } else if (args.status === "completed") {
      updateData.completedAt = now;
    }

    await ctx.db.patch(args.investmentId, updateData);
    return { success: true };
  },
});

// Get investments by franchise
export const getInvestmentsByFranchise = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .order("desc")
      .collect();
  },
});

// Get investments by brand
export const getInvestmentsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

// Get investments by investor
export const getInvestmentsByInvestor = query({
  args: { investorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_investor", (q) => q.eq("investorId", args.investorId))
      .order("desc")
      .collect();
  },
});

// Get investment statistics for a franchise
export const getFranchiseInvestmentStats = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    const stats = {
      totalInvestments: investments.length,
      totalAmountUSD: 0,
      totalShares: 0,
      completedInvestments: 0,
      completedAmountUSD: 0,
      pendingInvestments: 0,
      pendingAmountUSD: 0,
      totalCommission: 0,
      averageInvestment: 0,
      uniqueInvestors: new Set<string>(),
    };

    investments.forEach(investment => {
      stats.totalAmountUSD += investment.investmentAmountUSD;
      stats.totalShares += investment.sharesPurchased;
      stats.totalCommission += investment.platformCommission;
      stats.uniqueInvestors.add(investment.investorId);

      if (investment.status === "completed") {
        stats.completedInvestments++;
        stats.completedAmountUSD += investment.investmentAmountUSD;
      } else if (investment.status === "pending") {
        stats.pendingInvestments++;
        stats.pendingAmountUSD += investment.investmentAmountUSD;
      }
    });

    if (investments.length > 0) {
      stats.averageInvestment = stats.totalAmountUSD / investments.length;
    }

    return {
      ...stats,
      uniqueInvestorCount: stats.uniqueInvestors.size,
    };
  },
});

// Get investment statistics for a brand
export const getBrandInvestmentStats = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const investments = await ctx.db
      .query("investments")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    const stats = {
      totalInvestments: investments.length,
      totalAmountUSD: 0,
      totalShares: 0,
      completedInvestments: 0,
      completedAmountUSD: 0,
      totalCommission: 0,
      uniqueInvestors: new Set<string>(),
      franchiseCount: new Set<string>(),
    };

    investments.forEach(investment => {
      stats.totalAmountUSD += investment.investmentAmountUSD;
      stats.totalShares += investment.sharesPurchased;
      stats.totalCommission += investment.platformCommission;
      stats.uniqueInvestors.add(investment.investorId);
      stats.franchiseCount.add(investment.franchiseId);

      if (investment.status === "completed") {
        stats.completedInvestments++;
        stats.completedAmountUSD += investment.investmentAmountUSD;
      }
    });

    return {
      ...stats,
      uniqueInvestorCount: stats.uniqueInvestors.size,
      franchiseCount: stats.franchiseCount.size,
    };
  },
});
