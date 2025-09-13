import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Team member roles
export const TEAM_ROLES = {
  BRAND_OWNER: "brand_owner",
  BRAND_MANAGER: "brand_manager", 
  FRANCHISE_MANAGER: "franchise_manager",
  FRANCHISE_CASHIER: "franchise_cashier"
} as const;

export type TeamRole = typeof TEAM_ROLES[keyof typeof TEAM_ROLES];

// Create a team invitation
export const createInvitation = mutation({
  args: {
    brandId: v.id("brands"),
    franchiseId: v.optional(v.id("franchise")),
    invitedEmail: v.string(),
    role: v.string(),
    invitedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify the inviter has permission to invite for this brand
    const brand = await ctx.db.get(args.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Check if inviter is the brand owner
    if (brand.owner_id !== args.invitedBy) {
      throw new Error("Only brand owners can invite team members");
    }

    // Check if invitation already exists
    const existingInvitation = await ctx.db
      .query("teamInvitations")
      .withIndex("by_brand_email", (q) =>
        q.eq("brandId", args.brandId).eq("invitedEmail", args.invitedEmail)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvitation) {
      throw new Error("Invitation already sent to this email");
    }

    // Create the invitation
    const invitationId = await ctx.db.insert("teamInvitations", {
      brandId: args.brandId,
      franchiseId: args.franchiseId,
      invitedEmail: args.invitedEmail,
      role: args.role as TeamRole,
      invitedBy: args.invitedBy,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return invitationId;
  },
});

// Get team invitations for a brand
export const getBrandInvitations = query({
  args: { brandId: v.id("brands") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const invitations = await ctx.db
      .query("teamInvitations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.brandId))
      .collect();

    // Get inviter details
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy);
        return {
          ...invitation,
          inviterName: inviter?.email || "Unknown",
        };
      })
    );

    return invitationsWithDetails;
  },
});

// Legacy function for backward compatibility
export const getBusinessInvitations = query({
  args: { businessId: v.id("brands") }, // businessId now maps to brandId
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const invitations = await ctx.db
      .query("teamInvitations")
      .withIndex("by_brand", (q) => q.eq("brandId", args.businessId))
      .collect();

    // Get inviter details
    const invitationsWithDetails = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db.get(invitation.invitedBy);
        return {
          ...invitation,
          inviterName: inviter?.email || "Unknown",
        };
      })
    );

    return invitationsWithDetails;
  },
});

// Accept a team invitation
export const acceptInvitation = mutation({
  args: { invitationId: v.id("teamInvitations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error("Invitation has expired");
    }

    // Check if the current user's email matches the invitation
    if (identity.email !== invitation.invitedEmail) {
      throw new Error("This invitation is not for you");
    }

    // Get or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      // Create user if doesn't exist
      const userId = await ctx.db.insert("users", {
        email: identity.email!,
        avatar: identity.pictureUrl,
        roles: identity.email!.endsWith('@franchiseen.com') ? ['admin'] : ['user'],
      });
      user = await ctx.db.get(userId);
    }

    if (!user) {
      throw new Error("Failed to create user");
    }

    // Create team member record
    await ctx.db.insert("teamMembers", {
      brandId: invitation.brandId,
      franchiseId: invitation.franchiseId,
      userId: user._id,
      role: invitation.role,
      joinedAt: Date.now(),
      invitedBy: invitation.invitedBy,
    });

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get team members for a business
export const getBusinessTeamMembers = query({
  args: { businessId: v.id("brands") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_brand", (q) => q.eq("brandId", args.businessId))
      .collect();

    // Get user details for each team member
    const membersWithDetails = await Promise.all(
      teamMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        const franchise = member.franchiseId
          ? await ctx.db.get(member.franchiseId)
          : null;

        return {
          ...member,
          user: {
            name: user?.email || "Unknown",
            email: user?.email || "Unknown",
            avatar: user?.avatar,
          },
          franchise: franchise ? {
            name: franchise.locationAddress || "Unknown Location",
            slug: franchise.slug || "",
          } : null,
        };
      })
    );

    return membersWithDetails;
  },
});

// Remove team member
export const removeTeamMember = mutation({
  args: { teamMemberId: v.id("teamMembers") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const teamMember = await ctx.db.get(args.teamMemberId);
    if (!teamMember) {
      throw new Error("Team member not found");
    }

    // Verify the current user has permission to remove this team member
    const brand = await ctx.db.get(teamMember.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || brand.owner_id !== currentUser._id) {
      throw new Error("Only brand owners can remove team members");
    }

    await ctx.db.delete(args.teamMemberId);
    return { success: true };
  },
});

// Cancel invitation
export const cancelInvitation = mutation({
  args: { invitationId: v.id("teamInvitations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Verify the current user has permission to cancel this invitation
    const brand = await ctx.db.get(invitation.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!currentUser || brand.owner_id !== currentUser._id) {
      throw new Error("Only brand owners can cancel invitations");
    }

    await ctx.db.patch(args.invitationId, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    return { success: true };
  },
});
