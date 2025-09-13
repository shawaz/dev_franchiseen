import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Legacy function for backward compatibility
// Platform team functionality has been removed, but this function is kept
// to prevent runtime errors in components that still reference it
export const getCurrentPlatformUser = query({
  args: {},
  handler: async (ctx) => {
    // Platform team functionality has been removed
    // Return null to indicate no platform team user
    return null;
  },
});

// Legacy function for backward compatibility
// Platform team invitation functionality has been removed, but this function is kept
// to prevent runtime errors in components that still reference it
export const acceptPlatformInvitation = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Platform team functionality has been removed
    // Return success to prevent errors but don't actually do anything
    return { success: true, message: "Platform team functionality has been removed" };
  },
});
