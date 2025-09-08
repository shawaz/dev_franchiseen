/**
 * Franchise calculation utilities
 * Ensures consistent calculations across the application
 */

// Fixed share price in USDT
export const FIXED_USDT_PER_SHARE = 1;

/**
 * Calculate total shares based on total investment
 * @param totalInvestment - Total investment amount (in any currency)
 * @param exchangeRates - Exchange rates object (optional, for currency conversion)
 * @param fromCurrency - Source currency (optional, defaults to 'usdt')
 * @returns Number of total shares (rounded down to whole number)
 */
export function calculateTotalShares(
  totalInvestment: number,
  exchangeRates?: { [key: string]: number },
  fromCurrency: string = 'usdt'
): number {
  if (!totalInvestment || totalInvestment <= 0) {
    return 1; // Minimum 1 share
  }

  // Convert to USDT if needed
  let totalInvestmentUSDT = totalInvestment;
  if (exchangeRates && fromCurrency !== 'usdt') {
    const usdtRate = exchangeRates['usdt'] || 1;
    const fromRate = exchangeRates[fromCurrency] || 1;
    totalInvestmentUSDT = totalInvestment * (usdtRate / fromRate);
  }

  return Math.max(1, Math.floor(totalInvestmentUSDT / FIXED_USDT_PER_SHARE));
}

/**
 * Calculate available shares for investment
 * @param totalInvestment - Total investment amount (in any currency)
 * @param soldShares - Number of shares already sold
 * @param exchangeRates - Exchange rates object (optional, for currency conversion)
 * @param fromCurrency - Source currency (optional, defaults to 'usdt')
 * @returns Number of available shares
 */
export function calculateAvailableShares(
  totalInvestment: number,
  soldShares: number = 0,
  exchangeRates?: { [key: string]: number },
  fromCurrency: string = 'usdt'
): number {
  const totalShares = calculateTotalShares(totalInvestment, exchangeRates, fromCurrency);
  return Math.max(0, totalShares - soldShares);
}

/**
 * Calculate share price (should always be FIXED_USDT_PER_SHARE, but included for consistency)
 * @param totalInvestment - Total investment amount in USDT
 * @param totalShares - Total number of shares (optional, will be calculated if not provided)
 * @returns Price per share in USDT
 */
export function calculateSharePrice(totalInvestment: number, totalShares?: number): number {
  // Always return fixed price, but validate the calculation
  const calculatedShares = totalShares || calculateTotalShares(totalInvestment);
  const calculatedPrice = totalInvestment / calculatedShares;

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
  const totalInvestment = franchiseData.totalInvestment || 0;
  const soldShares = franchiseData.soldShares || 0;
  
  return {
    ...franchiseData,
    totalInvestment,
    totalShares: calculateTotalShares(totalInvestment),
    availableShares: calculateAvailableShares(totalInvestment, soldShares),
    sharePrice: FIXED_USDT_PER_SHARE,
    soldShares,
  };
}
