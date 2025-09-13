import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Franchise Industries Data
const FRANCHISE_INDUSTRIES = [
  { name: "Food & Beverage", slug: "food-beverage" },
  { name: "Retail", slug: "retail" },
  { name: "Health & Fitness", slug: "health-fitness" },
  { name: "Education & Training", slug: "education-training" },
  { name: "Business Services", slug: "business-services" },
  { name: "Personal Services", slug: "personal-services" },
  { name: "Home Services", slug: "home-services" },
  { name: "Automotive", slug: "automotive" },
  { name: "Technology", slug: "technology" },
  { name: "Real Estate", slug: "real-estate" }
];

// Franchise Categories Data (organized by industry)
const FRANCHISE_CATEGORIES = [
  // Food & Beverage Categories
  { name: "Fast Food", industry_slug: "food-beverage", slug: "fast-food" },
  { name: "Coffee & Tea", industry_slug: "food-beverage", slug: "coffee-tea" },
  { name: "Pizza", industry_slug: "food-beverage", slug: "pizza" },
  { name: "Ice Cream & Desserts", industry_slug: "food-beverage", slug: "ice-cream-desserts" },
  { name: "Healthy Food", industry_slug: "food-beverage", slug: "healthy-food" },
  { name: "Bakery", industry_slug: "food-beverage", slug: "bakery" },
  { name: "Casual Dining", industry_slug: "food-beverage", slug: "casual-dining" },
  
  // Retail Categories
  { name: "Clothing & Apparel", industry_slug: "retail", slug: "clothing-apparel" },
  { name: "Electronics", industry_slug: "retail", slug: "electronics" },
  { name: "Convenience Store", industry_slug: "retail", slug: "convenience-store" },
  { name: "Specialty Retail", industry_slug: "retail", slug: "specialty-retail" },
  { name: "Mobile & Accessories", industry_slug: "retail", slug: "mobile-accessories" },
  { name: "Beauty & Cosmetics", industry_slug: "retail", slug: "beauty-cosmetics" },
  
  // Health & Fitness Categories
  { name: "Gym & Fitness", industry_slug: "health-fitness", slug: "gym-fitness" },
  { name: "Yoga & Wellness", industry_slug: "health-fitness", slug: "yoga-wellness" },
  { name: "Medical Services", industry_slug: "health-fitness", slug: "medical-services" },
  { name: "Dental Care", industry_slug: "health-fitness", slug: "dental-care" },
  { name: "Spa & Massage", industry_slug: "health-fitness", slug: "spa-massage" },
  
  // Education & Training Categories
  { name: "Tutoring", industry_slug: "education-training", slug: "tutoring" },
  { name: "Language Learning", industry_slug: "education-training", slug: "language-learning" },
  { name: "Computer Training", industry_slug: "education-training", slug: "computer-training" },
  { name: "Early Childhood", industry_slug: "education-training", slug: "early-childhood" },
  { name: "Test Preparation", industry_slug: "education-training", slug: "test-preparation" },
  
  // Business Services Categories
  { name: "Accounting & Tax", industry_slug: "business-services", slug: "accounting-tax" },
  { name: "Marketing & Advertising", industry_slug: "business-services", slug: "marketing-advertising" },
  { name: "Printing & Shipping", industry_slug: "business-services", slug: "printing-shipping" },
  { name: "Consulting", industry_slug: "business-services", slug: "consulting" },
  { name: "Legal Services", industry_slug: "business-services", slug: "legal-services" },
  
  // Personal Services Categories
  { name: "Hair & Beauty", industry_slug: "personal-services", slug: "hair-beauty" },
  { name: "Dry Cleaning", industry_slug: "personal-services", slug: "dry-cleaning" },
  { name: "Pet Services", industry_slug: "personal-services", slug: "pet-services" },
  { name: "Photography", industry_slug: "personal-services", slug: "photography" },
  { name: "Travel Services", industry_slug: "personal-services", slug: "travel-services" },
  
  // Home Services Categories
  { name: "Cleaning Services", industry_slug: "home-services", slug: "cleaning-services" },
  { name: "Landscaping", industry_slug: "home-services", slug: "landscaping" },
  { name: "Home Repair", industry_slug: "home-services", slug: "home-repair" },
  { name: "Security Systems", industry_slug: "home-services", slug: "security-systems" },
  { name: "Pest Control", industry_slug: "home-services", slug: "pest-control" },
  
  // Automotive Categories
  { name: "Car Wash", industry_slug: "automotive", slug: "car-wash" },
  { name: "Auto Repair", industry_slug: "automotive", slug: "auto-repair" },
  { name: "Oil Change", industry_slug: "automotive", slug: "oil-change" },
  { name: "Car Rental", industry_slug: "automotive", slug: "car-rental" },
  { name: "Auto Parts", industry_slug: "automotive", slug: "auto-parts" },
  
  // Technology Categories
  { name: "IT Support", industry_slug: "technology", slug: "it-support" },
  { name: "Software Development", industry_slug: "technology", slug: "software-development" },
  { name: "Digital Marketing", industry_slug: "technology", slug: "digital-marketing" },
  { name: "Web Design", industry_slug: "technology", slug: "web-design" },
  { name: "Mobile Apps", industry_slug: "technology", slug: "mobile-apps" },
  
  // Real Estate Categories
  { name: "Property Management", industry_slug: "real-estate", slug: "property-management" },
  { name: "Real Estate Agency", industry_slug: "real-estate", slug: "real-estate-agency" },
  { name: "Home Inspection", industry_slug: "real-estate", slug: "home-inspection" },
  { name: "Mortgage Services", industry_slug: "real-estate", slug: "mortgage-services" },
  { name: "Commercial Real Estate", industry_slug: "real-estate", slug: "commercial-real-estate" }
];

/**
 * Clear all database tables and set up fresh franchise industries and categories
 * WARNING: This will delete ALL data in the database
 */
export const setupFranchiseDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting database setup...");
    
    // Step 1: Clear all existing data
    console.log("Clearing existing data...");
    
    // Get all documents from each table and delete them
    const tables = [
      "users", "businesses", "franchise", "invoice", "shares", 
      "deals", "teamInvitations", "teamMembers", "industries", "categories"
    ];
    
    for (const tableName of tables) {
      try {
        const documents = await ctx.db.query(tableName as any).collect();
        console.log(`Deleting ${documents.length} documents from ${tableName}`);
        
        for (const doc of documents) {
          await ctx.db.delete(doc._id);
        }
      } catch (error) {
        console.log(`Table ${tableName} might not exist or is empty:`, error);
      }
    }
    
    console.log("All existing data cleared.");
    
    // Step 2: Insert franchise industries
    console.log("Inserting franchise industries...");
    const industryMap = new Map();
    
    for (const industry of FRANCHISE_INDUSTRIES) {
      const industryId = await ctx.db.insert("industries", {
        name: industry.name,
        slug: industry.slug
      });
      industryMap.set(industry.slug, industryId);
      console.log(`Inserted industry: ${industry.name}`);
    }
    
    // Step 3: Insert franchise categories
    console.log("Inserting franchise categories...");
    
    for (const category of FRANCHISE_CATEGORIES) {
      const industryId = industryMap.get(category.industry_slug);
      if (industryId) {
        await ctx.db.insert("categories", {
          name: category.name,
          industry_id: industryId,
          slug: category.slug
        });
        console.log(`Inserted category: ${category.name} (${category.industry_slug})`);
      } else {
        console.error(`Industry not found for category: ${category.name}`);
      }
    }
    
    console.log("Database setup completed successfully!");
    
    return {
      success: true,
      message: "Database cleared and franchise industries/categories set up successfully",
      stats: {
        industries: FRANCHISE_INDUSTRIES.length,
        categories: FRANCHISE_CATEGORIES.length
      }
    };
  }
});

/**
 * Get setup status and statistics
 */
export const getSetupStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const industries = await ctx.db.query("industries").collect();
    const categories = await ctx.db.query("categories").collect();
    const businesses = await ctx.db.query("brands").collect();
    const franchises = await ctx.db.query("franchise").collect();
    const users = await ctx.db.query("users").collect();
    
    return {
      industries: industries.length,
      categories: categories.length,
      businesses: businesses.length,
      franchises: franchises.length,
      users: users.length,
      isEmpty: industries.length === 0 && categories.length === 0 && businesses.length === 0
    };
  }
});
