#!/usr/bin/env node

/**
 * Fix Franchise Values Script
 * 
 * This script fixes the inflated SOL-based values in the database by converting them back to USD.
 * It identifies franchises with unrealistic values and corrects them.
 */

const { ConvexHttpClient } = require("convex/browser");

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL environment variable is not set");
  console.error("Please set it in your .env.local file");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Approximate SOL to USD rate used in the old system (adjust based on when data was created)
const APPROXIMATE_SOL_TO_USD = 150; // Adjust this based on historical SOL price

async function fixFranchiseValues() {
  console.log("🔧 Starting franchise value correction...");
  console.log(`📡 Connected to: ${CONVEX_URL}`);
  console.log("");
  
  try {
    // Get all franchises
    const franchises = await client.query("franchise:list", {});
    console.log(`📊 Found ${franchises.length} franchises to check`);
    
    let fixedCount = 0;
    
    for (const franchise of franchises) {
      const { _id, totalInvestment, building, locationAddress } = franchise;
      
      // Check if value seems inflated (over $1M is suspicious for most franchises)
      if (totalInvestment > 1000000) {
        console.log(`🔍 Checking franchise: ${building} at ${locationAddress}`);
        console.log(`   Current totalInvestment: $${totalInvestment.toLocaleString()}`);
        
        // Calculate corrected value (divide by approximate SOL rate)
        const correctedValue = Math.round(totalInvestment / APPROXIMATE_SOL_TO_USD);
        
        console.log(`   Corrected totalInvestment: $${correctedValue.toLocaleString()}`);
        
        // Update the franchise
        try {
          await client.mutation("franchise:updateTotalInvestment", {
            franchiseId: _id,
            totalInvestment: correctedValue
          });
          
          console.log(`   ✅ Updated successfully`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Failed to update: ${error.message}`);
        }
        
        console.log("");
      }
    }
    
    console.log(`🎉 Fixed ${fixedCount} franchises with inflated values`);
    console.log("✅ Franchise value correction completed!");
    
  } catch (error) {
    console.error("❌ Franchise value correction failed:", error);
    process.exit(1);
  }
}

// Run the fix
fixFranchiseValues();
