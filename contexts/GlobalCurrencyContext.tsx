"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, coinGeckoService, formatLocalCurrency } from '@/lib/coingecko';

interface Currency {
  code: string;
  name: string;
  flag: string;
}

interface GlobalCurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  currencies: Currency[];
  exchangeRates: { [key: string]: number };
  formatAmount: (amount: number, currency?: string) => string;
  convertFromSOL: (solAmount: number, targetCurrency?: string) => number;
  convertFromUSDT: (usdtAmount: number, targetCurrency?: string) => number;
  convertToUSDT: (amount: number, fromCurrency?: string) => number;
  loading: boolean;
  refreshRates: () => Promise<void>;
}

const GlobalCurrencyContext = createContext<GlobalCurrencyContextType | undefined>(undefined);

export function GlobalCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('usd');
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Load saved currency preference
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedGlobalCurrency');
    if (savedCurrency) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference
  useEffect(() => {
    localStorage.setItem('selectedGlobalCurrency', selectedCurrency);
  }, [selectedCurrency]);

  // Fetch exchange rates
  const refreshRates = async () => {
    setLoading(true);
    try {
      console.log('Fetching exchange rates...');

      // Make a single API call to get all SOL prices
      const prices = await coinGeckoService.getSolPrices();
      console.log('Received SOL prices:', prices);

      // Convert to rates object
      const rates: { [key: string]: number } = {};

      for (const currency of SUPPORTED_CURRENCIES) {
        const price = prices[currency.code as keyof typeof prices];
        if (price && price > 0) {
          rates[currency.code] = price;
        } else {
          console.warn(`Missing or invalid price for ${currency.code}, using fallback`);
          // Use fallback rate for this specific currency
          const fallbackRates: { [key: string]: number } = {
            usdt: 20,   // 1 SOL = 20 USDT
            usd: 20,    // 1 SOL = 20 USD
            eur: 18.5,  // 1 SOL = 18.5 EUR
            gbp: 16,    // 1 SOL = 16 GBP
            jpy: 3000,  // 1 SOL = 3000 JPY
            aud: 30,    // 1 SOL = 30 AUD
            cad: 27,    // 1 SOL = 27 CAD
            chf: 18,    // 1 SOL = 18 CHF
            cny: 145,   // 1 SOL = 145 CNY
            inr: 1800,  // 1 SOL = 1800 INR (so 1 USDT = 90 INR)
            aed: 73,    // 1 SOL = 73 AED
            sar: 75,    // 1 SOL = 75 SAR
            sgd: 27,    // 1 SOL = 27 SGD
          };
          rates[currency.code] = fallbackRates[currency.code] || 100;
        }
      }

      console.log('Final exchange rates:', rates);
      setExchangeRates(rates);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial rate fetch
  useEffect(() => {
    refreshRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(refreshRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format amount in selected currency
  const formatAmount = (amount: number, currency?: string) => {
    const targetCurrency = currency || selectedCurrency;
    const rate = exchangeRates[targetCurrency] || 1;
    const convertedAmount = amount * rate;
    
    return formatLocalCurrency(convertedAmount, targetCurrency);
  };

  // Convert SOL amount to target currency
  const convertFromSOL = (solAmount: number, targetCurrency?: string) => {
    const currency = targetCurrency || selectedCurrency;
    const rate = exchangeRates[currency] || 1;
    return solAmount * rate;
  };

  // Direct USDT exchange rates (1 USDT = X local currency)
  const getUSDTExchangeRates = () => {
    return {
      usdt: 1,      // 1 USDT = 1 USDT
      usd: 1,       // 1 USDT = 1 USD (approximately)
      eur: 0.925,   // 1 USDT = 0.925 EUR
      gbp: 0.80,    // 1 USDT = 0.80 GBP
      jpy: 150,     // 1 USDT = 150 JPY
      aud: 1.50,    // 1 USDT = 1.50 AUD
      cad: 1.35,    // 1 USDT = 1.35 CAD
      chf: 0.90,    // 1 USDT = 0.90 CHF
      cny: 7.25,    // 1 USDT = 7.25 CNY
      inr: 90,      // 1 USDT = 90 INR
      aed: 3.65,    // 1 USDT = 3.65 AED
      sar: 3.75,    // 1 USDT = 3.75 SAR
      sgd: 1.35,    // 1 USDT = 1.35 SGD
    };
  };

  // Convert between USDT and other currencies
  const convertFromUSDT = (usdtAmount: number, targetCurrency?: string) => {
    const currency = targetCurrency || selectedCurrency;
    if (currency === 'usdt') return usdtAmount;

    const usdtRates = getUSDTExchangeRates();
    const rate = usdtRates[currency as keyof typeof usdtRates] || 1;

    // Direct conversion: USDT amount × exchange rate
    return usdtAmount * rate;
  };

  // Convert from any currency to USDT
  const convertToUSDT = (amount: number, fromCurrency?: string) => {
    const currency = fromCurrency || selectedCurrency;
    if (currency === 'usdt') return amount;

    const usdtRates = getUSDTExchangeRates();
    const rate = usdtRates[currency as keyof typeof usdtRates] || 1;

    // Direct conversion: Local amount ÷ exchange rate
    return amount / rate;
  };

  const value: GlobalCurrencyContextType = {
    selectedCurrency,
    setSelectedCurrency,
    currencies: SUPPORTED_CURRENCIES,
    exchangeRates,
    formatAmount,
    convertFromSOL,
    convertFromUSDT,
    convertToUSDT,
    loading,
    refreshRates,
  };

  return (
    <GlobalCurrencyContext.Provider value={value}>
      {children}
    </GlobalCurrencyContext.Provider>
  );
}

export function useGlobalCurrency() {
  const context = useContext(GlobalCurrencyContext);
  if (context === undefined) {
    throw new Error('useGlobalCurrency must be used within a GlobalCurrencyProvider');
  }
  return context;
}
