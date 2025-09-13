import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Admin functions for database management
 * These functions are used for database maintenance and should be used carefully
 */

// Get all documents from a specific table
export const getAllDocuments = query({
  args: { tableName: v.string() },
  handler: async (ctx, args) => {
    const { tableName } = args;
    
    // Validate table name to prevent injection
    const validTables = [
      "businesses",
      "franchise",
      "investments",
      "shareTransfers",
      "teamInvitations",
      "teamMembers",
      "auditLog",
      "agendaItems",
      "permissions",
      "franchiseOperations",
      "users",
      "industries",
      "categories"
    ];
    
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    // Get all documents from the table
    const documents = await ctx.db.query(tableName as any).collect();
    
    return documents;
  },
});

// Delete a specific document by ID
export const deleteDocument = mutation({
  args: { 
    tableName: v.string(),
    documentId: v.string()
  },
  handler: async (ctx, args) => {
    const { tableName, documentId } = args;
    
    // Validate table name to prevent injection
    const validTables = [
      "businesses",
      "franchise",
      "investments",
      "shareTransfers",
      "teamInvitations",
      "teamMembers",
      "auditLog",
      "agendaItems",
      "permissions",
      "franchiseOperations",
      "users",
      "industries",
      "categories"
    ];
    
    if (!validTables.includes(tableName)) {
      throw new Error(`Invalid table name: ${tableName}`);
    }
    
    // Delete the document
    await ctx.db.delete(documentId as any);
    
    return { success: true, deletedId: documentId };
  },
});

// Get database statistics
export const getDatabaseStats = query({
  args: {},
  handler: async (ctx) => {
    const stats: Record<string, number> = {};
    
    const tables = [
      "businesses",
      "franchise",
      "investments",
      "shareTransfers",
      "teamInvitations",
      "teamMembers",
      "auditLog",
      "agendaItems",
      "permissions",
      "franchiseOperations",
      "users",
      "industries",
      "categories"
    ];
    
    for (const tableName of tables) {
      try {
        const documents = await ctx.db.query(tableName as any).collect();
        stats[tableName] = documents.length;
      } catch (error) {
        stats[tableName] = 0;
      }
    }
    
    return stats;
  },
});
