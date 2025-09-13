import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { Keypair } from '@solana/web3.js';

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    industry_id: v.optional(v.string()),
    category_id: v.optional(v.string()),
    costPerArea: v.optional(v.number()),
    min_area: v.optional(v.number()),
    serviceable_countries: v.optional(v.array(v.string())),
    currency: v.optional(v.string()),
    // Step 2: Financial Information
    franchiseFee: v.optional(v.number()),
    setupCost: v.optional(v.number()),
    threeYearWorkingCapital: v.optional(v.number()),
    costPerSqft: v.optional(v.number()),
    // Step 3: Country Settings
    countrySettings: v.optional(v.any()), // Will store country-specific settings and documents
    // Step 4: Outlet Images and Products
    outletImages: v.optional(v.array(v.string())), // Array of image URLs
    productsServices: v.optional(v.any()), // Array of products/services data
    // Solana Wallet Information (optional - will be generated if not provided)
    walletAddress: v.optional(v.string()),
  },
  returns: v.object({
    brandId: v.id("brands"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    console.log('[convex] brands.create called with args:', args);
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (!identity.email) {
      throw new Error("User email is required");
    }

    const email = identity.email;

    // Get or create user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    let userId: Id<"users">;
    if (!user) {
      // Generate default avatar for new user
      const hash = email.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const isMale = Math.abs(hash) % 2 === 0;
      const avatarCount = isMale ? 6 : 6;
      const avatarNum = (Math.abs(hash) % avatarCount) + 1;
      const prefix = isMale ? 'avatar-m-' : 'avatar-f-';
      const avatar = `/avatar/${prefix}${avatarNum}.png`;

      userId = await ctx.db.insert("users", {
        email,
        avatar,
        roles: email.endsWith('@franchiseen.com') ? ['admin'] : ['user'],
      });
    } else {
      userId = user._id;
    }

    // Generate slug if not provided
    const slug = args.slug || generateSlug(args.name);
    
    // Check if slug already exists
    const existingBrand = await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    
    if (existingBrand) {
      throw new Error(`Brand with slug "${slug}" already exists`);
    }

    // Generate Solana wallet if not provided
    let walletAddress = args.walletAddress;
    if (!walletAddress) {
      // Generate a new Solana wallet
      const keypair = Keypair.generate();
      walletAddress = keypair.publicKey.toString();
    }

    const brandData = {
      name: args.name,
      slug,
      logoUrl: args.logoUrl,
      owner_id: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      industry_id: args.industry_id as Id<"industries"> | undefined,
      category_id: args.category_id as Id<"categories"> | undefined,
      costPerArea: args.costPerArea,
      min_area: args.min_area,
      serviceable_countries: args.serviceable_countries,
      currency: args.currency || 'USD',
      // Step 2: Financial Information
      franchiseFee: args.franchiseFee,
      setupCost: args.setupCost,
      threeYearWorkingCapital: args.threeYearWorkingCapital,
      costPerSqft: args.costPerSqft,
      // Step 3: Country Settings
      countrySettings: args.countrySettings,
      // Step 4: Outlet Images and Products
      outletImages: args.outletImages,
      productsServices: args.productsServices,
      // Solana Wallet Information
      walletAddress,
      walletCreatedAt: Date.now(),
      // Default verification status
      verificationStatus: 'pending',
    };

    console.log('[convex] Creating brand with data:', brandData);
    
    try {
      const brandId = await ctx.db.insert("brands", brandData);
      console.log('[convex] Brand created successfully with ID:', brandId);
      
      return {
        brandId,
        slug,
      };
    } catch (error) {
      console.error('[convex] Error creating brand:', error);
      throw new Error(`Failed to create brand: ${error}`);
    }
  },
});

// Get all brands
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brands").order("desc").collect();
  },
});

// Get brand by ID
export const getById = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.brandId);
  },
});

// Get brand by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

// Get brands by owner
export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_owner", (q) => q.eq("owner_id", args.ownerId))
      .collect();
  },
});

// List brands by owner (alias for getByOwner)
export const listByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_owner", (q) => q.eq("owner_id", args.ownerId))
      .collect();
  },
});

// Search brands by name
export const searchByName = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const brands = await ctx.db.query("brands").collect();
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(args.searchQuery.toLowerCase())
    );
  },
});

// List all brands (alias for list)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("brands").order("desc").collect();
  },
});

// Update wallet information
export const updateWallet = mutation({
  args: {
    brandId: v.id("brands"),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.brandId, {
      walletAddress: args.walletAddress,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Create outlet (placeholder - may need to be moved to outlets table)
export const createOutlet = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.string(),
    address: v.string(),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // This might need to be implemented in a separate outlets table
    // For now, just return success
    return { success: true, outletId: "placeholder" };
  },
});

// Get current user's brands
export const getCurrentUserBrands = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("brands")
      .withIndex("by_owner", (q) => q.eq("owner_id", user._id))
      .collect();
  },
});

// Update brand
export const update = mutation({
  args: {
    brandId: v.id("brands"),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    industry_id: v.optional(v.string()),
    category_id: v.optional(v.string()),
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
    countrySettings: v.optional(v.any()),
    // Step 4: Outlet Images and Products
    outletImages: v.optional(v.array(v.string())),
    productsServices: v.optional(v.any()),
    // Social Media
    socialMedia: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { brandId, ...updateData } = args;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdateData).length === 0) {
      throw new Error("No valid fields to update");
    }

    // Add updated timestamp
    cleanUpdateData.updatedAt = Date.now();

    // Update slug if name is being updated
    if (cleanUpdateData.name) {
      cleanUpdateData.slug = generateSlug(cleanUpdateData.name as string);
    }

    await ctx.db.patch(brandId, cleanUpdateData);
    return { success: true };
  },
});

// Delete brand
export const deleteBrand = mutation({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if brand exists
    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error("Brand not found");

    // Check all franchises are closed
    const franchises = await ctx.db
      .query("franchise")
      .filter((q) => q.eq(q.field("brandId"), args.brandId))
      .collect();
    const allClosed = franchises.every(f => f.status === "Closed");
    if (!allClosed) {
      throw new Error("All franchises must be closed before deleting the brand.");
    }
    await ctx.db.delete(args.brandId);
    return true;
  },
});

// Admin function to update brand verification status
export const updateVerificationStatus = mutation({
  args: {
    brandId: v.id("brands"),
    verificationStatus: v.string(), // "pending", "verified", "rejected"
    status: v.optional(v.string()), // "active", "inactive"
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // TODO: Add admin role check here
    // For now, we'll allow any authenticated user (should be restricted to admins)

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error("Brand not found");

    const updateFields: any = {
      verificationStatus: args.verificationStatus,
      updatedAt: Date.now(),
    };

    if (args.status) {
      updateFields.status = args.status;
    }

    if (args.adminNotes) {
      updateFields.adminNotes = args.adminNotes;
    }

    // If verified, set default status to active
    if (args.verificationStatus === "verified" && !args.status) {
      updateFields.status = "active";
    }

    await ctx.db.patch(args.brandId, updateFields);
    return true;
  },
});

// Update document verification status
export const updateDocumentStatus = mutation({
  args: {
    brandId: v.id("brands"),
    documentType: v.string(), // "businessLicense", "taxCertificate", "ownershipProof"
    status: v.string(), // "pending", "approved", "rejected"
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error("Brand not found");

    const documents = brand.documents || {};
    const document = documents[args.documentType as keyof typeof documents];

    if (!document) throw new Error("Document not found");

    const updatedDocument = {
      ...document,
      status: args.status,
      adminNotes: args.adminNotes,
    };

    const updatedDocuments = {
      ...documents,
      [args.documentType]: updatedDocument,
    };

    // Check if all documents are approved
    const allDocuments = Object.values(updatedDocuments);
    const allApproved = allDocuments.length >= 3 && allDocuments.every(doc => doc?.status === 'approved');

    const updateFields: any = {
      documents: updatedDocuments,
      updatedAt: Date.now(),
    };

    // If all documents are approved, update verification status
    if (allApproved) {
      updateFields.verificationStatus = 'verified';
    }

    await ctx.db.patch(args.brandId, updateFields);
    return true;
  },
});

// Upload brand document
export const uploadDocument = mutation({
  args: {
    brandId: v.id("brands"),
    documentType: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const brand = await ctx.db.get(args.brandId);
    if (!brand) throw new Error("Brand not found");

    // Check if user owns the brand
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user || String(user._id) !== String(brand.owner_id)) {
      throw new Error("Not authorized");
    }

    const documents = brand.documents || {};
    const newDocument = {
      url: args.url,
      status: 'pending',
      uploadedAt: Date.now(),
    };

    const updatedDocuments = {
      ...documents,
      [args.documentType]: newDocument,
    };

    await ctx.db.patch(args.brandId, {
      documents: updatedDocuments,
      updatedAt: Date.now(),
    });

    return true;
  },
});
