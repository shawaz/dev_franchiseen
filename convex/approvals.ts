import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create approval record when franchise is submitted
export const createApproval = mutation({
  args: {
    franchiseId: v.id("franchise"),
    brandId: v.id("brands"),
    totalInvestmentUSD: v.number(),
    costPerAreaUSD: v.number(),
    carpetArea: v.number(),
    totalShares: v.number(),
    selectedShares: v.number(),
    sharePrice: v.number(),
    locationAddress: v.string(),
    building: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the Convex user record using the email from Clerk identity
    const email = identity.email;
    if (!email) {
      throw new Error("User email not found in identity");
    }

    const convexUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!convexUser) {
      throw new Error("User not found in Convex database");
    }

    const now = Date.now();
    const submittedBy = convexUser._id;

    const approvalData = {
      franchiseId: args.franchiseId,
      brandId: args.brandId,
      submittedBy,
      totalInvestmentUSD: args.totalInvestmentUSD,
      costPerAreaUSD: args.costPerAreaUSD,
      carpetArea: args.carpetArea,
      totalShares: args.totalShares,
      selectedShares: args.selectedShares,
      sharePrice: args.sharePrice,
      locationAddress: args.locationAddress,
      building: args.building,
      status: "pending",
      submittedAt: now,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    };

    const approvalId = await ctx.db.insert("approvals", approvalData);
    return approvalId;
  },
});

// Get all approvals (admin only)
export const getAllApprovals = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("approvals").collect();
  },
});

// Get approval by franchise ID
export const getApprovalByFranchise = query({
  args: { franchiseId: v.id("franchise") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("approvals")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .unique();
  },
});

// Get pending approvals by brand
export const getPendingApprovalsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("approvals")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// Get all approvals by brand
export const getApprovalsByBrand = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("approvals")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .order("desc")
      .collect();
  },
});

// Approve franchise
export const approveApproval = mutation({
  args: {
    approvalId: v.id("approvals"),
    tokenMint: v.optional(v.string()),
    transactionSignature: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the Convex user record using the email from Clerk identity
    const email = identity.email;
    if (!email) {
      throw new Error("User email not found in identity");
    }

    const convexUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!convexUser) {
      throw new Error("User not found in Convex database");
    }

    const now = Date.now();
    const approvedBy = convexUser._id;

    // Update approval record
    await ctx.db.patch(args.approvalId, {
      status: "approved",
      approvedAt: now,
      approvedBy,
      tokenMint: args.tokenMint,
      transactionSignature: args.transactionSignature,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Get the approval record to update the franchise
    const approval = await ctx.db.get(args.approvalId);
    if (approval) {
      // Update the franchise status and stage
      await ctx.db.patch(approval.franchiseId, {
        status: "Approved",
        stage: "fund", // Move to fund stage when approved
        approvedAt: now,
        approvedBy,
        tokenMint: args.tokenMint,
        transactionSignature: args.transactionSignature,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

// Reject franchise
export const rejectApproval = mutation({
  args: {
    approvalId: v.id("approvals"),
    rejectionReason: v.string(),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const rejectedBy = identity.subject as Id<"users">;

    // Update approval record
    await ctx.db.patch(args.approvalId, {
      status: "rejected",
      rejectedAt: now,
      rejectedBy,
      rejectionReason: args.rejectionReason,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });

    // Get the approval record to update the franchise
    const approval = await ctx.db.get(args.approvalId);
    if (approval) {
      // Update the franchise status
      await ctx.db.patch(approval.franchiseId, {
        status: "Rejected",
        rejectedAt: now,
        rejectedBy,
        rejectionReason: args.rejectionReason,
      });
    }

    return { success: true };
  },
});

// Get approval statistics
export const getApprovalStats = query({
  args: { brandId: v.optional(v.id("brands")) },
  handler: async (ctx, args) => {
    if (args.brandId) {
      const brandApprovals = await ctx.db
        .query("approvals")
        .withIndex("by_brand", (q) => q.eq("brandId", args.brandId!))
        .collect();

      return calculateStats(brandApprovals);
    }

    const allApprovals = await ctx.db.query("approvals").collect();
    return calculateStats(allApprovals);
  },
});



// Helper function to calculate stats
function calculateStats(approvals: any[]) {
  const stats = {
    total: approvals.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalInvestmentUSD: 0,
    averageInvestment: 0,
  };

  approvals.forEach(approval => {
    if (approval.status === "pending") stats.pending++;
    else if (approval.status === "approved") stats.approved++;
    else if (approval.status === "rejected") stats.rejected++;

    stats.totalInvestmentUSD += approval.totalInvestmentUSD;
  });

  if (approvals.length > 0) {
    stats.averageInvestment = stats.totalInvestmentUSD / approvals.length;
  }

  return stats;
}
