/**
 * Franchise calculation utilities
 * Ensures consistent calculations across the application
 */

// Fixed share price in USDT
export const FIXED_USDT_PER_SHARE = 1;

/**
 * Calculate total shares based on total investment in USD
 * @param totalInvestmentUSD - Total investment amount in USD
 * @returns Number of total shares (rounded down to whole number)
 */
export function calculateTotalShares(totalInvestmentUSD: number): number {
  if (!totalInvestmentUSD || totalInvestmentUSD <= 0) {
    return 1; // Minimum 1 share
  }

  // Calculate shares based on USD amount at $1 per share
  return Math.max(1, Math.floor(totalInvestmentUSD / FIXED_USDT_PER_SHARE));
}

/**
 * Calculate available shares for investment
 * @param totalInvestmentUSD - Total investment amount in USD
 * @param soldShares - Number of shares already sold
 * @returns Number of available shares
 */
export function calculateAvailableShares(
  totalInvestmentUSD: number,
  soldShares: number = 0
): number {
  const totalShares = calculateTotalShares(totalInvestmentUSD);
  return Math.max(0, totalShares - soldShares);
}

/**
 * Calculate share price (should always be FIXED_USDT_PER_SHARE, but included for consistency)
 * @param totalInvestmentUSD - Total investment amount in USD
 * @param totalShares - Total number of shares (optional, will be calculated if not provided)
 * @returns Price per share in USD
 */
export function calculateSharePrice(totalInvestmentUSD: number, totalShares?: number): number {
  // Always return fixed price, but validate the calculation
  const calculatedShares = totalShares || calculateTotalShares(totalInvestmentUSD);
  const calculatedPrice = totalInvestmentUSD / calculatedShares;

  // If the calculated price is significantly different from fixed price, log a warning
  if (Math.abs(calculatedPrice - FIXED_USDT_PER_SHARE) > 0.01) {
    console.warn(`Share price mismatch: calculated ${calculatedPrice.toFixed(2)}, expected ${FIXED_USDT_PER_SHARE}`);
  }

  return FIXED_USDT_PER_SHARE;
}

/**
 * Validate and fix franchise data to ensure consistent calculations
 * @param franchiseData - Raw franchise data
 * @returns Fixed franchise data with correct calculations
 */
export function validateFranchiseData(franchiseData: {
  totalInvestment?: number;
  totalShares?: number;
  soldShares?: number;
  costPerShare?: number;
}) {
  const totalInvestmentUSD = franchiseData.totalInvestment || 0;
  const soldShares = franchiseData.soldShares || 0;

  return {
    ...franchiseData,
    totalInvestment: totalInvestmentUSD,
    totalShares: calculateTotalShares(totalInvestmentUSD),
    availableShares: calculateAvailableShares(totalInvestmentUSD, soldShares),
    sharePrice: FIXED_USDT_PER_SHARE,
    soldShares,
  };
}
