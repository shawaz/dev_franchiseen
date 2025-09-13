import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Platform commission wallet address
const PLATFORM_COMMISSION_WALLET = "AWKkqeEFHsC8LqPcYAf1ivWkAwji2zZmiPWvpXacCNtn";
const COMMISSION_RATE = 0.02; // 2%

export const createTransaction = mutation({
  args: {
    type: v.string(), // "payment", "investment", "payout"
    amount: v.number(),
    currency: v.string(),
    fromUserId: v.optional(v.id("users")),
    toUserId: v.optional(v.id("users")),
    brandId: v.optional(v.id("brands")), // Updated from businessId to brandId
    franchiseId: v.optional(v.id("franchise")),
    fromWalletAddress: v.optional(v.string()),
    toWalletAddress: v.optional(v.string()),
    description: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const transactionId = `tx_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate commission (2% of transaction amount)
    const commissionAmount = args.amount * COMMISSION_RATE;
    const netAmount = args.amount - commissionAmount;

    // Create main transaction record
    const transactionData = {
      transactionId,
      type: args.type,
      status: "pending",
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      brandId: args.brandId, // Updated from businessId to brandId
      franchiseId: args.franchiseId,
      amount: args.amount,
      commissionAmount,
      netAmount,
      currency: args.currency,
      fromWalletAddress: args.fromWalletAddress,
      toWalletAddress: args.toWalletAddress,
      commissionWalletAddress: PLATFORM_COMMISSION_WALLET,
      description: args.description,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    };

    const transactionDbId = await ctx.db.insert("transactions", transactionData);

    // Note: Commission tracking is now handled within the transaction record itself
    // The commissionAmount and platformWallet are stored in the transaction

    return {
      transactionId: transactionDbId,
      commissionAmount,
      netAmount,
      platformWallet: PLATFORM_COMMISSION_WALLET,
    };
  },
});

export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.id("transactions"),
    status: v.string(), // "completed", "failed", "cancelled"
    blockchainTxHash: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.transactionId, {
      status: args.status,
      blockchainTxHash: args.blockchainTxHash,
      metadata: args.metadata,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getTransactionsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => 
        q.or(
          q.eq(q.field("fromUserId"), args.userId),
          q.eq(q.field("toUserId"), args.userId)
        )
      )
      .order("desc")
      .collect();

    return transactions;
  },
});

export const getTransactionsByBusiness = query({
  args: { businessId: v.id("brands") },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("brandId"), args.businessId))
      .order("desc")
      .collect();

    return transactions;
  },
});

export const getPlatformCommissionStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("transactions");

    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("createdAt"), args.startDate!));
    }

    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("createdAt"), args.endDate!));
    }

    const transactions = await query.collect();

    // Calculate commission totals from transaction records
    const stats = {
      totalCommissionEarned: 0,
      totalTransactionsProcessed: transactions.length,
      averageCommissionPerTransaction: 0,
      commissionByCurrency: {} as Record<string, number>,
      commissionByType: {} as Record<string, number>,
    };

    transactions.forEach(transaction => {
      stats.totalCommissionEarned += transaction.commissionAmount;

      // By currency
      if (!stats.commissionByCurrency[transaction.currency]) {
        stats.commissionByCurrency[transaction.currency] = 0;
      }
      stats.commissionByCurrency[transaction.currency] += transaction.commissionAmount;

      // By transaction type
      if (!stats.commissionByType[transaction.type]) {
        stats.commissionByType[transaction.type] = 0;
      }
      stats.commissionByType[transaction.type] += transaction.commissionAmount;
    });

    // Calculate average
    if (transactions.length > 0) {
      stats.averageCommissionPerTransaction = stats.totalCommissionEarned / transactions.length;
    }

    return stats;
  },
});
