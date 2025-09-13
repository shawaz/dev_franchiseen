// Legacy functions for backward compatibility
// These functions are now implemented in users.ts but re-exported here
// to maintain compatibility with existing code

import { mutation } from "./_generated/server";
import { v } from "convex/values";

export { getUserByEmail, createUser } from "./users";

// Stub functions for onboarding system (KYC is now skipped)
export const createUserOnboardingProfile = mutation({
  args: {
    personalInfo: v.any(),
    kyc: v.any(),
    investment: v.any(),
    wallet: v.any(),
    userType: v.string(),
    completedAt: v.string(),
    accountStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // KYC is skipped - just return success
    console.log('Onboarding profile creation skipped - KYC not required');
    return { success: true, message: 'KYC verification skipped' };
  },
});

export const updateKYCStatus = mutation({
  args: {
    userId: v.id("users"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    // KYC is skipped - just return success
    console.log('KYC status update skipped - KYC not required');
    return { success: true, message: 'KYC verification skipped' };
  },
});

export const upsertProfile = mutation({
  args: {
    email: v.string(),
    gender: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    // This function is no longer needed with the simplified user schema
    // Just create/update the user with basic info
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existing) {
      // Update existing user with any provided info
      const updateFields: any = {};
      if (args.phone) updateFields.phone = args.phone;

      if (Object.keys(updateFields).length > 0) {
        await ctx.db.patch(existing._id, updateFields);
      }
      return existing._id;
    } else {
      // Create new user with simplified schema
      return await ctx.db.insert("users", {
        email: args.email,
        phone: args.phone || '',
        avatar: identity.pictureUrl,
        roles: args.email.endsWith('@franchiseen.com') ? ['admin'] : ['user'],
      });
    }
  },
});
