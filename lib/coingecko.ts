/**
 * CoinGecko API Service for SOL Price Data
 * 
 * This service fetches real-time SOL prices from CoinGecko API
 * and provides conversion utilities for local currencies.
 */

export interface SolPriceData {
  usdt: number;
  usd: number;
  eur: number;
  gbp: number;
  jpy: number;
  aud: number;
  cad: number;
  chf: number;
  cny: number;
  inr: number;
  aed: number;
  sar: number;
  sgd: number;
  hkd: number;
  krw: number;
  brl: number;
  mxn: number;
  rub: number;
  zar: number;
  try: number;
  nok: number;
  sek: number;
  dkk: number;
  pln: number;
  czk: number;
  huf: number;
}

export interface LocalCurrency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Supported local currencies for wallet display
export const SUPPORTED_CURRENCIES: LocalCurrency[] = [
  { code: 'usdt', name: 'Tether USD', symbol: 'USDT', flag: '₮' },
  { code: 'usd', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'eur', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'gbp', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'aed', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪' },
  { code: 'sar', name: 'Saudi Riyal', symbol: 'SAR', flag: '🇸🇦' },
  { code: 'inr', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'jpy', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'aud', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'cad', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'sgd', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'chf', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'cny', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

class CoinGeckoService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache: { data: SolPriceData | null; timestamp: number } = { data: null, timestamp: 0 };
  private cacheTimeout = 60000; // 1 minute cache

  /**
   * Fetch current SOL prices from CoinGecko API
   */
  async getSolPrices(): Promise<SolPriceData> {
    // Check cache first
    const now = Date.now();
    if (this.cache.data && (now - this.cache.timestamp) < this.cacheTimeout) {
      return this.cache.data;
    }

    try {
      // Exclude USDT from API call since CoinGecko doesn't support it as vs_currency
      // We'll calculate USDT from USD (since USDT ≈ USD)
      const currencies = SUPPORTED_CURRENCIES
        .filter(c => c.code !== 'usdt') // Remove USDT from API call
        .map(c => c.code)
        .join(',');

      console.log('Fetching SOL prices for currencies:', currencies);

      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=solana&vs_currencies=${currencies}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('CoinGecko API response:', data);

      const solPrices = data.solana;

      if (!solPrices) {
        throw new Error('No SOL price data in response');
      }

      // Add USDT price (same as USD since USDT ≈ USD)
      const enrichedPrices: SolPriceData = {
        usdt: solPrices.usd || 20, // Use USD price for USDT, fallback to 20
        ...solPrices
      };

      // Update cache
      this.cache = {
        data: enrichedPrices,
        timestamp: now,
      };

      console.log('Successfully fetched SOL prices:', enrichedPrices);
      return enrichedPrices;
    } catch (error) {
      console.error('Failed to fetch SOL prices from CoinGecko:', error);
      console.log('Using fallback prices instead');

      // Return fallback prices if API fails
      return this.getFallbackPrices();
    }
  }

  /**
   * Get fallback prices when API is unavailable
   */
  private getFallbackPrices(): SolPriceData {
    console.log('Using fallback SOL prices due to API failure');

    // These are SOL prices in each currency (1 SOL = X currency)
    // Realistic fallback rates based on recent market data
    const fallbackPrices: SolPriceData = {
      usdt: 20,   // 1 SOL ≈ 20 USDT (base rate)
      usd: 20,    // 1 SOL ≈ 20 USD (so 1 USDT ≈ 1 USD)
      eur: 18.5,  // 1 SOL ≈ 18.5 EUR (so 1 USDT ≈ 0.925 EUR)
      gbp: 16,    // 1 SOL ≈ 16 GBP (so 1 USDT ≈ 0.8 GBP)
      jpy: 3000,  // 1 SOL ≈ 3000 JPY (so 1 USDT ≈ 150 JPY)
      aud: 30,    // 1 SOL ≈ 30 AUD (so 1 USDT ≈ 1.5 AUD)
      cad: 27,    // 1 SOL ≈ 27 CAD (so 1 USDT ≈ 1.35 CAD)
      chf: 18,    // 1 SOL ≈ 18 CHF (so 1 USDT ≈ 0.9 CHF)
      cny: 145,   // 1 SOL ≈ 145 CNY (so 1 USDT ≈ 7.25 CNY)
      inr: 1800,  // 1 SOL ≈ 1800 INR (so 1 USDT ≈ 90 INR) - ACCURATE!
      aed: 73,    // 1 SOL ≈ 73 AED (so 1 USDT ≈ 3.65 AED)
      sar: 75,    // 1 SOL ≈ 75 SAR (so 1 USDT ≈ 3.75 SAR)
      sgd: 27,    // 1 SOL ≈ 27 SGD (so 1 USDT ≈ 1.35 SGD)
      hkd: 156,   // 1 SOL ≈ 156 HKD
      krw: 26000, // 1 SOL ≈ 26000 KRW
      brl: 120,   // 1 SOL ≈ 120 BRL
      mxn: 400,   // 1 SOL ≈ 400 MXN
      rub: 1800,  // 1 SOL ≈ 1800 RUB
      zar: 360,   // 1 SOL ≈ 360 ZAR
      try: 600,   // 1 SOL ≈ 600 TRY
      nok: 220,   // 1 SOL ≈ 220 NOK
      sek: 220,   // 1 SOL ≈ 220 SEK
      dkk: 140,   // 1 SOL ≈ 140 DKK
      pln: 80,    // 1 SOL ≈ 80 PLN
      czk: 460,   // 1 SOL ≈ 460 CZK
      huf: 7500,  // 1 SOL ≈ 7500 HUF
    };

    console.log('Fallback prices loaded:', fallbackPrices);
    return fallbackPrices;
  }

  /**
   * Convert SOL amount to local currency
   */
  async convertSolToLocal(solAmount: number, currencyCode: string): Promise<number> {
    const prices = await this.getSolPrices();
    const rate = prices[currencyCode as keyof SolPriceData];
    
    if (!rate) {
      throw new Error(`Unsupported currency: ${currencyCode}`);
    }

    return solAmount * rate;
  }

  /**
   * Convert local currency amount to SOL
   */
  async convertLocalToSol(localAmount: number, currencyCode: string): Promise<number> {
    const prices = await this.getSolPrices();
    const rate = prices[currencyCode as keyof SolPriceData];
    
    if (!rate) {
      throw new Error(`Unsupported currency: ${currencyCode}`);
    }

    return localAmount / rate;
  }

  /**
   * Format SOL amount with proper decimals
   */
  formatSol(amount: number): string {
    return `${amount.toFixed(4)} SOL`;
  }

  /**
   * Format local currency amount
   */
  formatLocalCurrency(amount: number, currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    if (!currency) {
      return `${amount.toFixed(2)} ${currencyCode.toUpperCase()}`;
    }

    // Special formatting for currencies without decimals
    if (currencyCode === 'jpy' || currencyCode === 'krw') {
      return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
    }

    return `${currency.symbol}${amount.toFixed(2)}`;
  }

  /**
   * Get user's local currency based on location
   */
  async detectLocalCurrency(): Promise<string> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Map country codes to currency codes
      const countryToCurrency: { [key: string]: string } = {
        'US': 'usd',
        'AE': 'aed',
        'SA': 'sar',
        'GB': 'gbp',
        'EU': 'eur',
        'DE': 'eur',
        'FR': 'eur',
        'IT': 'eur',
        'ES': 'eur',
        'NL': 'eur',
        'IN': 'inr',
        'JP': 'jpy',
        'AU': 'aud',
        'CA': 'cad',
        'SG': 'sgd',
        'CH': 'chf',
        'CN': 'cny',
      };

      const detectedCurrency = countryToCurrency[data.country_code];
      return detectedCurrency || 'usd'; // Default to USD
    } catch (error) {
      console.error('Failed to detect location:', error);
      return 'usd'; // Default to USD
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
  }
}

// Export singleton instance
export const coinGeckoService = new CoinGeckoService();

// Export utility functions
export const formatSol = (amount: number): string => coinGeckoService.formatSol(amount);
export const formatLocalCurrency = (amount: number, currencyCode: string): string => 
  coinGeckoService.formatLocalCurrency(amount, currencyCode);
