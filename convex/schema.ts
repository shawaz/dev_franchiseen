import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  users: defineTable({
    email: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    // Wallet information
    walletAddress: v.optional(v.string()),
    seedPhrase: v.optional(v.array(v.string())),
    walletVerified: v.optional(v.boolean()),
    // Documents
    documents: v.optional(v.record(v.string(), v.string())),
  })
    .index("by_email", ["email"])
    .index("by_wallet", ["walletAddress"]),
  industries: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),
  categories: defineTable({
    name: v.string(),
    industry_id: v.id("industries"),
    slug: v.string(),
  }).index("by_industry", ["industry_id"]).index("by_slug", ["slug"]),
  brands: defineTable({
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
    // Step 2: Financial Information
    franchiseFee: v.optional(v.number()),
    setupCost: v.optional(v.number()),
    threeYearWorkingCapital: v.optional(v.number()),
    costPerSqft: v.optional(v.number()),
    // Step 3: Country Settings
    countrySettings: v.optional(v.any()), // Country-specific settings and documents
    // Step 4: Outlet Images and Products
    outletImages: v.optional(v.array(v.string())), // Array of image URLs
    productsServices: v.optional(v.any()), // Array of products/services data
    // Solana Wallet Information
    walletAddress: v.optional(v.string()), // Brand's dedicated Solana wallet address
    walletId: v.optional(v.string()), // DEPRECATED: Will be removed in future migration
    walletCreatedAt: v.optional(v.number()), // Timestamp when wallet was created
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
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["owner_id"]),
  franchise: defineTable({
    brandId: v.id("brands"),
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
    // Lifecycle management fields
    stage: v.optional(v.union(v.literal("approval"), v.literal("fund"), v.literal("launch"), v.literal("live"), v.literal("closed"))),
    images: v.optional(v.array(v.string())),
    fundingGoal: v.optional(v.number()),
    currentFunding: v.optional(v.number()),
    investorCount: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_brand", ["brandId"])
    .index("by_owner", ["owner_id"])
    .index("by_status", ["status"])
    .index("by_stage", ["stage"])
    .index("by_stage_and_brand", ["stage", "brandId"])
    .index("by_brand_and_slug", ["brandId", "slug"]),



  // Team management tables
  teamInvitations: defineTable({
    brandId: v.id("brands"),
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
    .index("by_brand", ["brandId"])
    .index("by_brand_email", ["brandId", "invitedEmail"])
    .index("by_email", ["invitedEmail"])
    .index("by_status", ["status"]),

  teamMembers: defineTable({
    brandId: v.id("brands"),
    franchiseId: v.optional(v.id("franchise")),
    userId: v.id("users"),
    role: v.string(), // brand_manager, franchise_manager, franchise_cashier
    joinedAt: v.number(),
    invitedBy: v.id("users"),
    permissions: v.optional(v.array(v.string())),
  })
    .index("by_brand", ["brandId"])
    .index("by_user", ["userId"])
    .index("by_franchise", ["franchiseId"])
    .index("by_role", ["role"]),

  // Outlets Table - Store outlet/location data for brands
  outlets: defineTable({
    brandId: v.id("brands"), // Reference to the brand
    name: v.string(), // Outlet name/identifier
    address: v.string(), // Full address
    city: v.string(),
    state: v.string(),
    country: v.string(),
    zipCode: v.string(),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),

    // Outlet details
    squareFootage: v.number(),
    costPerSqft: v.number(),
    totalCost: v.number(),

    // Enhanced Images with metadata
    images: v.array(v.object({
      url: v.string(),
      caption: v.optional(v.string()),
      order: v.number(), // For ordering images
      type: v.optional(v.string()), // "interior", "exterior", "product", "menu", etc.
      uploadedAt: v.number(),
    })),

    // Status and metadata
    status: v.string(), // "active", "inactive", "pending"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brand", ["brandId"])
    .index("by_status", ["status"])
    .index("by_location", ["city", "state", "country"]),

  // Transactions Table - Track all platform transactions with commission
  transactions: defineTable({
    // Transaction basics
    transactionId: v.string(), // Unique transaction identifier
    type: v.string(), // "payment", "investment", "payout", "commission"
    status: v.string(), // "pending", "completed", "failed", "cancelled"

    // Parties involved
    fromUserId: v.optional(v.id("users")), // Sender (optional for system transactions)
    toUserId: v.optional(v.id("users")), // Receiver (optional for system transactions)
    brandId: v.optional(v.id("brands")), // Related brand (if applicable)
    franchiseId: v.optional(v.id("franchise")), // Related franchise (if applicable)

    // Financial details
    amount: v.number(), // Original transaction amount
    commissionAmount: v.number(), // 2% commission amount
    netAmount: v.number(), // Amount after commission deduction
    currency: v.string(), // "SOL", "USDT", etc.

    // Solana blockchain details
    fromWalletAddress: v.optional(v.string()),
    toWalletAddress: v.optional(v.string()),
    commissionWalletAddress: v.string(), // Platform commission wallet
    blockchainTxHash: v.optional(v.string()), // Solana transaction hash

    // Metadata
    description: v.string(),
    metadata: v.optional(v.any()), // Additional transaction data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_from", ["fromUserId"])
    .index("by_user_to", ["toUserId"])
    .index("by_brand", ["brandId"])
    .index("by_franchise", ["franchiseId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_date", ["createdAt"])
    .index("by_blockchain_tx", ["blockchainTxHash"]),

  // Products Table - Comprehensive product management
  products: defineTable({
    // Basic product information
    name: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    sku: v.optional(v.string()), // Stock Keeping Unit
    barcode: v.optional(v.string()),

    // Relationships
    brandId: v.id("brands"), // Which brand owns this product
    outletId: v.optional(v.id("outlets")), // Specific outlet (if outlet-specific)
    categoryId: v.optional(v.id("categories")), // Product category

    // Pricing
    price: v.number(),
    costPrice: v.optional(v.number()), // Cost to produce/buy
    currency: v.string(),
    discountPrice: v.optional(v.number()),
    discountPercentage: v.optional(v.number()),

    // Images and media
    images: v.array(v.object({
      url: v.string(),
      caption: v.optional(v.string()),
      order: v.number(),
      type: v.optional(v.string()), // "main", "gallery", "thumbnail"
      uploadedAt: v.number(),
    })),

    // Inventory management
    stockQuantity: v.optional(v.number()),
    lowStockThreshold: v.optional(v.number()),
    trackInventory: v.boolean(),
    allowBackorder: v.boolean(),

    // Product attributes
    weight: v.optional(v.number()),
    dimensions: v.optional(v.object({
      length: v.number(),
      width: v.number(),
      height: v.number(),
      unit: v.string(), // "cm", "in", etc.
    })),

    // Product variants (sizes, colors, etc.)
    variants: v.optional(v.array(v.object({
      name: v.string(), // "Size", "Color", etc.
      value: v.string(), // "Large", "Red", etc.
      price: v.optional(v.number()), // Price adjustment
      stockQuantity: v.optional(v.number()),
      sku: v.optional(v.string()),
    }))),

    // SEO and marketing
    tags: v.optional(v.array(v.string())),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),

    // Status and visibility
    status: v.string(), // "active", "inactive", "draft", "archived"
    isVisible: v.boolean(), // Show/hide from customers
    isFeatured: v.boolean(), // Featured product

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    .index("by_brand", ["brandId"])
    .index("by_outlet", ["outletId"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"])
    .index("by_featured", ["isFeatured"])
    .index("by_visibility", ["isVisible"])
    .index("by_sku", ["sku"])
    .index("by_price", ["price"]),

  // Approvals Table - Track franchise approval process with USD values
  approvals: defineTable({
    // Basic approval information
    franchiseId: v.id("franchise"), // Reference to the franchise being approved
    brandId: v.id("brands"), // Reference to the brand
    submittedBy: v.id("users"), // User who submitted for approval

    // Investment details captured at submission time (in USD)
    totalInvestmentUSD: v.number(), // Total investment amount in USD
    costPerAreaUSD: v.number(), // Cost per square foot in USD
    carpetArea: v.number(), // Area in square feet
    totalShares: v.number(), // Total shares available
    selectedShares: v.number(), // Shares selected by investor
    sharePrice: v.number(), // Price per share in USD

    // Location details
    locationAddress: v.string(),
    building: v.string(),

    // Approval status and workflow
    status: v.string(), // "pending", "approved", "rejected", "under_review"
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),

    // Approval/rejection details
    approvedBy: v.optional(v.id("users")),
    rejectedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
    adminNotes: v.optional(v.string()),

    // Blockchain integration
    tokenMint: v.optional(v.string()), // Solana token mint address
    transactionSignature: v.optional(v.string()), // Blockchain transaction signature

    // Metadata
    metadata: v.optional(v.any()), // Additional approval data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_brand", ["brandId"])
    .index("by_status", ["status"])
    .index("by_submitted_by", ["submittedBy"])
    .index("by_submitted_date", ["submittedAt"])
    .index("by_approved_by", ["approvedBy"]),

  // Investments Table - Track individual franchise investments
  investments: defineTable({
    // Investment identification
    investmentId: v.string(), // Unique investment identifier
    franchiseId: v.id("franchise"), // Reference to franchise
    brandId: v.id("brands"), // Reference to brand
    approvalId: v.optional(v.id("approvals")), // Reference to approval record

    // Investor information
    investorId: v.id("users"), // User making the investment
    investorWalletAddress: v.optional(v.string()), // Investor's wallet address

    // Investment amounts (all in USD for consistency)
    investmentAmountUSD: v.number(), // Amount invested in USD
    sharesPurchased: v.number(), // Number of shares purchased
    pricePerShare: v.number(), // Price per share at time of investment

    // Transaction details
    transactionId: v.optional(v.id("transactions")), // Reference to transaction record
    paymentMethod: v.string(), // "SOL", "USDT", "bank_transfer", etc.
    originalAmount: v.optional(v.number()), // Original amount in payment currency
    originalCurrency: v.optional(v.string()), // Original payment currency
    exchangeRate: v.optional(v.number()), // Exchange rate used for USD conversion

    // Investment status and timeline
    status: v.string(), // "pending", "confirmed", "completed", "failed", "refunded"
    investedAt: v.number(), // When investment was made
    confirmedAt: v.optional(v.number()), // When investment was confirmed
    completedAt: v.optional(v.number()), // When investment was fully processed

    // Blockchain details
    blockchainTxHash: v.optional(v.string()), // Blockchain transaction hash
    fromWalletAddress: v.optional(v.string()), // Source wallet
    toWalletAddress: v.optional(v.string()), // Destination wallet (brand wallet)

    // Commission and fees
    platformCommission: v.number(), // Platform commission amount (2%)
    netInvestmentAmount: v.number(), // Amount after commission deduction

    // Metadata and notes
    notes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_brand", ["brandId"])
    .index("by_investor", ["investorId"])
    .index("by_approval", ["approvalId"])
    .index("by_status", ["status"])
    .index("by_investment_date", ["investedAt"])
    .index("by_transaction", ["transactionId"]),

  // Shares Table - Track share allocations and remaining shares
  shares: defineTable({
    // Share identification
    shareId: v.string(), // Unique share identifier
    franchiseId: v.id("franchise"), // Reference to franchise
    brandId: v.id("brands"), // Reference to brand
    investmentId: v.optional(v.id("investments")), // Reference to investment record
    approvalId: v.optional(v.id("approvals")), // Reference to approval record

    // Share holder information
    shareholderId: v.id("users"), // User who owns the shares
    shareholderWalletAddress: v.optional(v.string()), // Shareholder's wallet address

    // Share details
    sharesAllocated: v.number(), // Number of shares allocated
    sharePrice: v.number(), // Price per share at allocation time
    totalValue: v.number(), // Total value of shares (sharesAllocated * sharePrice)

    // Share status and type
    shareType: v.string(), // "common", "preferred", "founder", etc.
    status: v.string(), // "allocated", "vested", "transferred", "cancelled"

    // Allocation timeline
    allocatedAt: v.number(), // When shares were allocated
    vestedAt: v.optional(v.number()), // When shares became vested
    transferredAt: v.optional(v.number()), // When shares were transferred

    // Vesting and restrictions
    vestingPeriod: v.optional(v.number()), // Vesting period in days
    isVested: v.boolean(), // Whether shares are vested
    transferRestrictions: v.optional(v.string()), // Any transfer restrictions

    // Blockchain integration
    tokenMint: v.optional(v.string()), // Solana token mint for shares
    tokenAccount: v.optional(v.string()), // Token account address
    mintTransactionHash: v.optional(v.string()), // Blockchain transaction for minting

    // Dividend and returns tracking
    dividendsEarned: v.optional(v.number()), // Total dividends earned
    lastDividendDate: v.optional(v.number()), // Last dividend payment date

    // Metadata and notes
    allocationNotes: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_franchise", ["franchiseId"])
    .index("by_brand", ["brandId"])
    .index("by_shareholder", ["shareholderId"])
    .index("by_investment", ["investmentId"])
    .index("by_approval", ["approvalId"])
    .index("by_status", ["status"])
    .index("by_share_type", ["shareType"])
    .index("by_allocation_date", ["allocatedAt"])
    .index("by_vesting_status", ["isVested"]),

});
