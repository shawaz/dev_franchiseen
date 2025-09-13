#!/usr/bin/env node

/**
 * Database Reset Script
 * 
 * This script clears all data from the Convex database to start fresh.
 * Run with: node scripts/reset-database.js
 */

const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// List of all tables to clear
const TABLES_TO_CLEAR = [
  "brands",
  "franchise",
  "investments",
  "escrow",
  "frcTokens",
  "shareTransfers",
  "teamInvitations",
  "teamMembers",
  "auditLog",
  "agendaItems",
  "permissions",
  "franchiseOperations"
];

async function clearTable(tableName) {
  try {
    console.log(`🗑️  Clearing table: ${tableName}`);
    
    // Get all documents from the table
    const documents = await client.query("admin:getAllDocuments", { tableName });
    
    if (documents.length === 0) {
      console.log(`   ✅ Table ${tableName} is already empty`);
      return;
    }
    
    console.log(`   📊 Found ${documents.length} documents in ${tableName}`);
    
    // Delete all documents
    for (const doc of documents) {
      await client.mutation("admin:deleteDocument", { 
        tableName, 
        documentId: doc._id 
      });
    }
    
    console.log(`   ✅ Cleared ${documents.length} documents from ${tableName}`);
    
  } catch (error) {
    console.error(`   ❌ Error clearing table ${tableName}:`, error.message);
  }
}

async function resetDatabase() {
  console.log("🚀 Starting database reset...");
  console.log(`📡 Connected to: ${CONVEX_URL}`);
  console.log("");
  
  try {
    // Clear all tables
    for (const tableName of TABLES_TO_CLEAR) {
      await clearTable(tableName);
    }
    
    console.log("");
    console.log("✅ Database reset completed successfully!");
    console.log("🎉 You can now register new businesses with USD-standardized pricing");
    
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
