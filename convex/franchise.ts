import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all franchises
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("franchise").collect();
  },
});

// Get only approved franchises (fund stage and beyond) for public display
export const getApprovedFranchises = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("franchise")
      .withIndex("by_stage")
      .filter((q) =>
        q.or(
          q.eq(q.field("stage"), "fund"),
          q.eq(q.field("stage"), "launch"),
          q.eq(q.field("stage"), "live"),
          q.eq(q.field("stage"), "closed")
        )
      )
      .order("desc")
      .collect();
  },
});

// Get franchise by ID
export const getById = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.franchiseId);
  },
});

// Get franchise by slug
export const getBySlug = query({
  args: {
    brandSlug: v.string(),
    franchiseSlug: v.string()
  },
  handler: async (ctx, args) => {
    // First get the brand by slug
    const brand = await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", args.brandSlug))
      .unique();

    if (!brand) return null;

    // Then get the franchise by slug for this brand using the compound index
    // Use .first() instead of .unique() to handle potential duplicates gracefully
    return await ctx.db
      .query("franchise")
      .withIndex("by_brand_and_slug", (q) =>
        q.eq("brandId", brand._id).eq("slug", args.franchiseSlug)
      )
      .first();
  },
});

// Get public franchises by brand
export const getPublicFranchisesByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

// Get franchises by brand ID
export const getByBrandId = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

// List franchises by brand (alias for getByBrandId)
export const listByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();
  },
});

// Legacy function for backward compatibility
export const listByBusiness = query({
  args: { businessId: v.id("brands") }, // Note: businessId now maps to brandId
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.businessId))
      .collect();
  },
});

// Get franchise locations by business (for CreateFranchiseModal)
export const getLocationsByBusiness = query({
  args: { businessId: v.id("brands") },
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.businessId))
      .collect();

    // Return location data for each franchise
    return franchises.map(franchise => ({
      _id: franchise._id,
      locationAddress: franchise.locationAddress,
      building: franchise.building,
      carpetArea: franchise.carpetArea,
      status: franchise.status
    }));
  },
});

// Create franchise
export const create = mutation({
  args: {
    brandId: v.id("brands"),
    owner_id: v.id("users"),
    slug: v.optional(v.string()),
    locationAddress: v.string(),
    building: v.string(),
    carpetArea: v.number(),
    costPerArea: v.number(),
    totalInvestment: v.number(),
    totalShares: v.number(),
    selectedShares: v.number(),
    status: v.string(),
    // Lifecycle management fields
    stage: v.optional(v.union(v.literal("approval"), v.literal("fund"), v.literal("launch"), v.literal("live"), v.literal("closed"))),
    images: v.optional(v.array(v.string())),
    fundingGoal: v.optional(v.number()),
    currentFunding: v.optional(v.number()),
    investorCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("franchise", {
      ...args,
      createdAt: now,
      updatedAt: now,
      // Set default values for lifecycle fields
      stage: args.stage || "approval",
      currentFunding: args.currentFunding || 0,
      investorCount: args.investorCount || 0,
      fundingGoal: args.fundingGoal || args.totalInvestment,
    });
  },
});

// Update franchise stage
export const updateStage = mutation({
  args: {
    franchiseId: v.id("franchise"),
    stage: v.union(v.literal("approval"), v.literal("fund"), v.literal("launch"), v.literal("live"), v.literal("closed")),
    launchDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updateData: any = {
      stage: args.stage,
      updatedAt: now,
    };

    // Set launch date when moving to live stage
    if (args.stage === "live" && args.launchDate) {
      updateData.launchDate = args.launchDate;
    }

    return await ctx.db.patch(args.franchiseId, updateData);
  },
});

// Update franchise funding
export const updateFunding = mutation({
  args: {
    franchiseId: v.id("franchise"),
    currentFunding: v.number(),
    investorCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.franchiseId, {
      currentFunding: args.currentFunding,
      investorCount: args.investorCount,
      updatedAt: Date.now(),
    });
  },
});

// Update franchise
export const update = mutation({
  args: {
    franchiseId: v.id("franchise"),
    locationAddress: v.optional(v.string()),
    building: v.optional(v.string()),
    carpetArea: v.optional(v.number()),
    costPerArea: v.optional(v.number()),
    totalInvestment: v.optional(v.number()),
    totalShares: v.optional(v.number()),
    selectedShares: v.optional(v.number()),
    status: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { franchiseId, ...updateData } = args;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new Error("No valid fields to update");
    }

    await ctx.db.patch(franchiseId, cleanUpdateData);
    return { success: true };
  },
});

// Update total investment (for scripts)
export const updateTotalInvestment = mutation({
  args: {
    franchiseId: v.id("franchise"),
    totalInvestment: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.franchiseId, {
      totalInvestment: args.totalInvestment,
    });
    return { success: true };
  },
});

// Delete franchise
export const deleteFranchise = mutation({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.franchiseId);
    return { success: true };
  },
});

// Get funding progress (mock implementation)
export const getFundingProgress = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) return null;

    // Mock funding progress calculation
    const fundingProgress = Math.min(
      (franchise.selectedShares / franchise.totalShares) * 100,
      100
    );

    return {
      franchiseId: args.franchiseId,
      totalShares: franchise.totalShares,
      selectedShares: franchise.selectedShares,
      fundingProgress,
      totalInvestment: franchise.totalInvestment,
      raisedAmount: (franchise.totalInvestment * fundingProgress) / 100,
      remainingAmount: franchise.totalInvestment - ((franchise.totalInvestment * fundingProgress) / 100),
    };
  },
});

// Get investment tracking (mock implementation)
export const getInvestmentTracking = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) return null;

    // Mock investment tracking data
    return {
      franchiseId: args.franchiseId,
      totalInvestment: franchise.totalInvestment,
      totalShares: franchise.totalShares,
      selectedShares: franchise.selectedShares,
      uniqueInvestors: Math.floor(franchise.selectedShares / 10) + 1,
      averageInvestment: franchise.totalInvestment / Math.max(franchise.selectedShares, 1),
      recentInvestment: franchise.totalInvestment * 0.1, // Mock 10% recent
      investmentGrowth: 15.5, // Mock growth percentage
    };
  },
});

// Get investment summary for all franchises
export const getInvestmentSummary = query({
  args: {},
  handler: async (ctx) => {
    const franchises = await ctx.db.query("franchise").collect();

    return franchises.map(franchise => {
      const totalInvestment = franchise.totalInvestment || 0;
      const currentFunding = franchise.currentFunding || 0;
      const fundingGoal = franchise.fundingGoal || 0;
      const fundingProgress = (currentFunding / Math.max(fundingGoal, 1)) * 100;

      return {
        franchiseId: franchise._id,
        name: franchise.building || "Unnamed Franchise",
        slug: franchise.slug || "",
        totalInvestment,
        totalInvested: currentFunding, // Alias for currentFunding
        currentFunding,
        investorCount: franchise.investorCount || 0,
        uniqueInvestors: franchise.investorCount || 0, // Alias for investorCount
        fundingGoal,
        fundingProgress,
        fundingPercentage: fundingProgress, // Alias for fundingProgress
        stage: franchise.stage || "approval",
        lastUpdated: franchise.updatedAt || franchise._creationTime,
        locationAddress: franchise.locationAddress || "",
        building: franchise.building || "N/A",
        status: franchise.stage || "approval",
        daysRemaining: 90, // Default to 90 days for funding period
        isFullyFunded: fundingProgress >= 100,
        isAtRisk: fundingProgress < 25 && franchise.stage !== "approval",
      };
    });
  },
});

// Get status counts by business/brand
export const getStatusCountsByBusiness = query({
  args: { businessId: v.id("brands") },
  handler: async (ctx, args) => {
    const franchises = await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.businessId))
      .collect();

    const statusCounts = {
      Funding: 0,
      Launching: 0,
      Active: 0,
      Closed: 0,
    };

    franchises.forEach(franchise => {
      if (franchise.status in statusCounts) {
        statusCounts[franchise.status as keyof typeof statusCounts]++;
      }
    });

    return statusCounts;
  },
});

// Get pending franchises by business (for approval tab)
export const getPendingByBusiness = query({
  args: { businessId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchise")
      .withIndex("by_brand", (q) => q.eq("brandId", args.businessId))
      .filter((q) => q.eq(q.field("status"), "Funding"))
      .collect();
  },
});

// Approve franchise
export const approveFranchise = mutation({
  args: {
    franchiseId: v.id("franchise"),
    approvedBy: v.optional(v.id("users")),
    tokenMint: v.optional(v.string()),
    transactionSignature: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const currentUserId = identity?.subject as Id<"users"> | undefined;

    await ctx.db.patch(args.franchiseId, {
      status: "Launching",
      approvedAt: Date.now(),
      approvedBy: args.approvedBy || currentUserId,
      tokenMint: args.tokenMint,
      transactionSignature: args.transactionSignature,
    });
    return { success: true };
  },
});

// Reject franchise
export const rejectFranchise = mutation({
  args: {
    franchiseId: v.id("franchise"),
    rejectedBy: v.optional(v.id("users")),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const currentUserId = identity?.subject as Id<"users"> | undefined;

    await ctx.db.patch(args.franchiseId, {
      status: "Rejected",
      rejectedAt: Date.now(),
      rejectedBy: args.rejectedBy || currentUserId,
      rejectionReason: args.rejectionReason,
    });
    return { success: true };
  },
});
