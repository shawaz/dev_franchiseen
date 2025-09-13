import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all users for admin
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .order("desc")
      .collect();
  },
});

// Get user by ID
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Create or update user
export const createOrUpdate = mutation({
  args: {
    email: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      // Update existing user
      const updateFields: any = {};
      if (args.avatar !== undefined) updateFields.avatar = args.avatar;
      if (args.phone !== undefined) updateFields.phone = args.phone;
      if (args.roles !== undefined) updateFields.roles = args.roles;

      if (Object.keys(updateFields).length > 0) {
        await ctx.db.patch(existingUser._id, updateFields);
      }
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        email: args.email,
        avatar: args.avatar,
        phone: args.phone,
        roles: args.roles || [],
      });
    }
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check if user can update this profile (either their own or admin)
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    const isOwnProfile = currentUser?._id === args.userId;
    const isAdmin = currentUser?.roles?.includes('admin') || false;

    if (!isOwnProfile && !isAdmin) {
      throw new Error("Not authorized to update this profile");
    }

    const updateFields: any = {};
    if (args.avatar !== undefined) updateFields.avatar = args.avatar;
    if (args.phone !== undefined) updateFields.phone = args.phone;

    if (Object.keys(updateFields).length > 0) {
      await ctx.db.patch(args.userId, updateFields);
    }

    return { success: true };
  },
});

// Update user roles (admin only)
export const updateRoles = mutation({
  args: {
    userId: v.id("users"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    const isAdmin = currentUser?.roles?.includes('admin') || identity.email === "shawaz@franchiseen.com";

    if (!isAdmin) {
      throw new Error("Not authorized to update user roles");
    }

    await ctx.db.patch(args.userId, { roles: args.roles });
    return { success: true };
  },
});

// Check if user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Super admin check
    if (identity.email === "shawaz@franchiseen.com") return true;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) return false;

    // Check if user has admin role
    const adminRoles = ['admin', 'platform_admin', 'super_admin'];
    return user.roles?.some(role => adminRoles.includes(role)) || false;
  },
});

// Check if current user has specific permission
export const hasPermission = query({
  args: { permission: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Super admin has all permissions
    if (identity.email === "shawaz@franchiseen.com") return true;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) return false;

    // Platform team member permissions removed

    // Check if user has the specific permission based on roles
    const adminRoles = ['admin', 'platform_admin', 'super_admin'];
    const hasAdminRole = user.roles?.some(role => adminRoles.includes(role)) || false;

    // For now, admin roles have all permissions
    // You can extend this logic to have more granular permissions
    return hasAdminRole;
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    const isAdmin = currentUser?.roles?.includes('admin') || identity.email === "shawaz@franchiseen.com";

    if (!isAdmin) {
      throw new Error("Not authorized to delete users");
    }

    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

// Check if current user has admin access
export const hasAdminAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    // Super admin always has access
    if (identity.email === "shawaz@franchiseen.com") return true;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    if (!user) return false;

    // Check if user has admin role
    const adminRoles = ['admin', 'platform_admin', 'super_admin'];
    return user.roles?.some(role => adminRoles.includes(role)) || false;
  },
});

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .first();
  },
});

// Upload document for user
export const uploadDocument = mutation({
  args: {
    userId: v.id("users"),
    documentType: v.string(),
    documentUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check if user can update this profile (either their own or admin)
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    const isOwnProfile = currentUser?._id === args.userId;
    const isAdmin = currentUser?.roles?.includes('admin') || false;

    if (!isOwnProfile && !isAdmin) {
      throw new Error("Not authorized to upload documents for this user");
    }

    // Update user's documents
    const documents = user.documents || {};
    documents[args.documentType] = args.documentUrl;

    await ctx.db.patch(args.userId, { documents });
    return { success: true };
  },
});

// Update user wallet information
export const updateWallet = mutation({
  args: {
    userId: v.id("users"),
    walletAddress: v.string(),
    seedPhrase: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Check if user can update this profile (either their own or admin)
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .unique();

    const isOwnProfile = currentUser?._id === args.userId;
    const isAdmin = currentUser?.roles?.includes('admin') || false;

    if (!isOwnProfile && !isAdmin) {
      throw new Error("Not authorized to update wallet for this user");
    }

    // Update user's wallet information
    await ctx.db.patch(args.userId, {
      walletAddress: args.walletAddress,
      seedPhrase: args.seedPhrase,
      walletVerified: true,
    });

    return { success: true };
  },
});

// Legacy function names for backward compatibility
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Create user (legacy function for backward compatibility)
export const createUser = mutation({
  args: {
    email: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Update avatar if provided
      if (args.avatar && existing.avatar !== args.avatar) {
        await ctx.db.patch(existing._id, { avatar: args.avatar });
      }
      return existing._id;
    }

    // Create new user with default roles and avatar
    let roles: string[] = ['user']; // Default role

    if (args.email === 'shawaz@franchiseen.com') {
      roles = ['super_admin'];
    } else if (args.email.endsWith('@franchiseen.com')) {
      roles = ['admin'];
    }

    // Generate default avatar if none provided
    const avatar = args.avatar || generateDefaultAvatar(args.email);

    const id = await ctx.db.insert("users", {
      email: args.email,
      avatar: avatar,
      roles: roles,
    });

    return id;
  },
});

// Helper function to generate default avatar
function generateDefaultAvatar(email: string): string {
  // Use a simple hash to determine avatar
  const hash = email.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  // Choose between male and female avatars
  const isMale = Math.abs(hash) % 2 === 0;
  const avatarCount = isMale ? 6 : 6; // We have 6 avatars for each gender
  const avatarNum = (Math.abs(hash) % avatarCount) + 1;
  const prefix = isMale ? 'avatar-m-' : 'avatar-f-';

  return `/avatar/${prefix}${avatarNum}.png`;
}
