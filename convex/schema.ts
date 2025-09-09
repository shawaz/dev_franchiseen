import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    email: v.string(),
    // Link to Privy DID for authentication
    privyUserId: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.optional(v.number()),
    avatar: v.optional(v.string()),
    first_name: v.optional(v.string()),
    family_name: v.optional(v.string()),
    location: v.optional(v.string()),
    formatted_address: v.optional(v.string()),
    area: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    pincode: v.optional(v.string()),
    monthly_income: v.optional(v.string()),
    investment_budget: v.optional(v.string()),
    phone: v.optional(v.string()),
    stripeCardholderId: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    isActivated: v.optional(v.boolean()),
    // Verification fields
    verificationStatus: v.optional(v.string()), // "pending", "verified", "rejected"
    adminNotes: v.optional(v.string()),
    // Wallet fields
    walletAddress: v.optional(v.string()),
    seedPhraseVerified: v.optional(v.boolean()),
    // Document fields
    documents: v.optional(v.object({
      identityProof: v.optional(v.object({
        url: v.string(),
        status: v.string(), // "pending", "approved", "rejected"
        adminNotes: v.optional(v.string()),
        uploadedAt: v.number(),
      })),
      addressProof: v.optional(v.object({
        url: v.string(),
        status: v.string(),
        adminNotes: v.optional(v.string()),
        uploadedAt: v.number(),
      })),
      incomeProof: v.optional(v.object({
        url: v.string(),
        status: v.string(),
        adminNotes: v.optional(v.string()),
        uploadedAt: v.number(),
      })),
    })),
  })
    .index("by_email", ["email"]).index("by_privyUserId", ["privyUserId"]),
  industries: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),
  categories: defineTable({
    name: v.string(),
    industry_id: v.id("industries"),
    slug: v.string(),
  }).index("by_industry", ["industry_id"]).index("by_slug", ["slug"]),
  businesses: defineTable({
    name: v.string(),
    slug: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    owner_id: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    industry_id: v.optional(v.id("industries")),
    category_id: v.optional(v.id("categories")),
    costPerArea: v.optional(v.number()),
    min_area: v.optional(v.number()),
    serviceable_countries: v.optional(v.array(v.string())),
    currency: v.optional(v.string()),
    about: v.optional(v.string()),
    socialMedia: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    // Verification fields
    verificationStatus: v.optional(v.string()), // "pending", "verified", "rejected"
    adminNotes: v.optional(v.string()),
    // Document fields
    documents: v.optional(v.object({
      businessLicense: v.optional(v.object({
        url: v.string(),
        status: v.string(), // "pending", "approved", "rejected"
        adminNotes: v.optional(v.string()),
        uploadedAt: v.number(),
      })),
      taxCertificate: v.optional(v.object({
        url: v.string(),
        status: v.string(),
        adminNotes: v.optional(v.string()),
        uploadedAt: v.number(),
      })),
      ownershipProof: v.optional(v.object({
        url: v.string(),
        status: v.string(),
        adminNotes: v.optional(v.string()),
        uploadedAt: v.number(),
      })),
    })),
  }),
  franchise: defineTable({
    businessId: v.id("businesses"),
    owner_id: v.id("users"),
    slug: v.optional(v.string()),
    locationAddress: v.string(),
    building: v.string(),
    carpetArea: v.number(),
    costPerArea: v.number(), // USD per sqft
    totalInvestment: v.number(), // Total investment in USD
    totalShares: v.number(),
    selectedShares: v.number(),
    createdAt: v.number(),
    status: v.string(),
    launchStartDate: v.optional(v.number()),
    launchEndDate: v.optional(v.number()),
    // Approval fields
    tokenMint: v.optional(v.string()),
    transactionSignature: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    rejectedAt: v.optional(v.number()),
    rejectedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  }),
  invoice: defineTable({
    franchiseId: v.id("franchise"),
    userId: v.id("users"),
    serviceFee: v.number(),
    gst: v.number(),
    totalAmount: v.number(),
    createdAt: v.number(),
  }),
  shares: defineTable({
    franchiseId: v.id("franchise"),
    userId: v.id("users"),
    userName: v.string(),
    userImage: v.string(),
    numberOfShares: v.number(),
    purchaseDate: v.number(),
    costPerShare: v.number(), // USD per share (always $1)
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_user", ["userId"])
    .index("by_franchise_and_user", ["franchiseId", "userId"]),
  deals: defineTable({
    type: v.union(v.literal("direct_purchase"), v.literal("secondary_offer")),
    franchiseId: v.id("franchise"),
    buyerId: v.id("users"),
    buyerName: v.string(),
    buyerImage: v.string(),
    sellerId: v.optional(v.id("users")), // null for direct purchases
    sellerName: v.optional(v.string()),
    sellerImage: v.optional(v.string()),
    numberOfShares: v.number(),
    pricePerShare: v.number(),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // Team management tables
  teamInvitations: defineTable({
    businessId: v.id("businesses"),
    franchiseId: v.optional(v.id("franchise")),
    invitedEmail: v.string(),
    role: v.string(), // brand_manager, franchise_manager, franchise_cashier
    invitedBy: v.id("users"),
    status: v.string(), // pending, accepted, declined, cancelled, expired
    createdAt: v.number(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_business", ["businessId"])
    .index("by_business_email", ["businessId", "invitedEmail"])
    .index("by_email", ["invitedEmail"])
    .index("by_status", ["status"]),

  teamMembers: defineTable({
    businessId: v.id("businesses"),
    franchiseId: v.optional(v.id("franchise")),
    userId: v.id("users"),
    role: v.string(), // brand_manager, franchise_manager, franchise_cashier
    joinedAt: v.number(),
    invitedBy: v.id("users"),
    permissions: v.optional(v.array(v.string())),
  })
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_franchise", ["franchiseId"])
    .index("by_role", ["role"]),

  // Platform team management for Franchiseen internal team
  platformTeamMembers: defineTable({
    userId: v.id("users"),
    role: v.string(), // super_admin, platform_admin, department_manager, senior_specialist, specialist, team_member
    departments: v.array(v.string()), // ["home", "administration", "finances", "operations", "people", "marketing", "sales", "support", "software"]
    position: v.string(), // CTO, Developer, Marketing Manager, etc.
    joinedAt: v.number(),
    invitedBy: v.id("users"),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_active", ["isActive"]),

  platformTeamInvitations: defineTable({
    email: v.string(),
    role: v.string(),
    // Migration support: keep old department field optional for backward compatibility
    department: v.optional(v.string()),
    departments: v.optional(v.array(v.string())), // Multiple departments can be assigned during invitation
    position: v.string(),
    permissions: v.array(v.string()),
    invitedBy: v.id("users"),
    status: v.string(), // pending, accepted, declined, expired
    inviteToken: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
    message: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_token", ["inviteToken"])
    .index("by_status", ["status"])
    .index("by_invited_by", ["invitedBy"]),

  // Escrow system for secure payment processing
  escrow: defineTable({
    // Core identifiers
    franchiseId: v.id("franchise"),
    userId: v.id("users"),
    businessId: v.id("businesses"),

    // Payment details
    paymentSignature: v.string(), // Solana transaction signature
    amount: v.number(), // Amount in SOL (for blockchain payment only)
    amountUSD: v.optional(v.number()), // Amount in USD (for business logic) - optional for backward compatibility
    amountLocal: v.optional(v.number()), // Legacy field - Amount in local currency (deprecated)
    currency: v.string(), // "SOL", "USDC", etc.
    shares: v.number(), // Number of shares purchased

    // Escrow status and lifecycle
    status: v.string(), // "held", "released", "refunded", "expired"
    stage: v.string(), // "pending_approval", "funding", "launching", "active"

    // Timestamps
    createdAt: v.number(),
    expiresAt: v.number(), // 90 days from creation for funding stage
    releasedAt: v.optional(v.number()),
    refundedAt: v.optional(v.number()),

    // Transaction signatures for releases/refunds
    releaseSignature: v.optional(v.string()),
    refundSignature: v.optional(v.string()),

    // Admin actions
    processedBy: v.optional(v.id("users")), // Admin who processed release/refund
    adminNotes: v.optional(v.string()),
    refundReason: v.optional(v.string()), // Reason for refund

    // Blockchain contract details
    contractSignature: v.optional(v.string()),
    contractAddress: v.optional(v.string()),

    // User and wallet info
    userEmail: v.optional(v.string()),
    userWallet: v.string(),

    // Refund/release conditions
    autoRefundEnabled: v.boolean(), // Whether to auto-refund after expiry
    manualReleaseRequired: v.boolean(), // Whether manual admin approval is needed
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_status", ["status"])
    .index("by_stage", ["stage"])
    .index("by_payment_signature", ["paymentSignature"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_created_at", ["createdAt"])
    .index("by_franchise_user", ["franchiseId", "userId"]),

  // FRC Token System
  frcTokens: defineTable({
    franchiseId: v.id("franchise"),
    businessId: v.id("businesses"),
    tokenMint: v.string(), // Solana token mint address
    tokenSymbol: v.string(), // e.g., "FRC-STARBUCKS-NYC"
    tokenName: v.string(), // e.g., "Starbucks NYC Franchise Coin"
    totalSupply: v.number(),
    circulatingSupply: v.number(),
    reserveSupply: v.number(),

    // Financial metrics
    totalRevenue: v.number(),
    totalExpenses: v.number(),
    netProfit: v.number(),
    monthlyRevenue: v.number(),
    monthlyExpenses: v.number(),

    // Token economics
    tokenPrice: v.number(), // Current price per token
    marketCap: v.number(),
    lastPayoutAmount: v.number(),
    lastPayoutDate: v.optional(v.number()),
    nextPayoutDate: v.optional(v.number()),

    // Blockchain data
    contractAddress: v.optional(v.string()),
    creationSignature: v.string(),
    lastUpdateSignature: v.optional(v.string()),

    // Status and metadata
    status: v.string(), // "active", "paused", "closed"
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_business", ["businessId"])
    .index("by_token_mint", ["tokenMint"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // Financial Transactions (Income/Expense tracking)
  financialTransactions: defineTable({
    franchiseId: v.id("franchise"),
    businessId: v.id("businesses"),
    userId: v.id("users"), // Who recorded the transaction

    // Transaction details
    type: v.string(), // "income", "expense"
    category: v.string(), // "sales", "rent", "utilities", "supplies", etc.
    description: v.string(),
    amount: v.number(),
    currency: v.string(),

    // Date and timing
    transactionDate: v.number(), // When the transaction occurred
    recordedAt: v.number(), // When it was recorded in system

    // Verification and blockchain
    isVerified: v.boolean(),
    verificationMethod: v.optional(v.string()), // "receipt", "bank_statement", "blockchain"
    blockchainSignature: v.optional(v.string()),
    frcTokensIssued: v.optional(v.number()), // FRC tokens issued for this transaction

    // Supporting documents
    receiptUrl: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),

    // Approval workflow
    status: v.string(), // "pending", "approved", "rejected"
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),

    // Metadata
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_business", ["businessId"])
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_transaction_date", ["transactionDate"])
    .index("by_recorded_at", ["recordedAt"])
    .index("by_franchise_type", ["franchiseId", "type"])
    .index("by_franchise_date", ["franchiseId", "transactionDate"]),

  // FRC Token Holders and Distributions
  frcHolders: defineTable({
    franchiseId: v.id("franchise"),
    userId: v.id("users"),
    walletAddress: v.string(),

    // Token holdings
    tokenBalance: v.number(),
    totalEarned: v.number(), // Total FRC tokens earned
    totalRedeemed: v.number(), // Total FRC tokens redeemed

    // Earning sources
    investmentTokens: v.number(), // Tokens from initial investment
    performanceTokens: v.number(), // Tokens from franchise performance
    bonusTokens: v.number(), // Bonus tokens from promotions

    // Payout history
    totalPayouts: v.number(),
    lastPayoutAmount: v.number(),
    lastPayoutDate: v.optional(v.number()),

    // Status
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletAddress"])
    .index("by_franchise_user", ["franchiseId", "userId"])
    .index("by_active", ["isActive"]),
});
