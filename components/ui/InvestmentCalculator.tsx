"use client";

import React from 'react';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/lib/coingecko';

interface InvestmentCalculatorProps {
  minSquareFootage: number;
  franchiseFee: number;
  setupCost: number;
  threeYearWorkingCapital: number;
  costPerSquareFoot: number;
  className?: string;
}

export function InvestmentCalculator({
  minSquareFootage,
  franchiseFee,
  setupCost,
  threeYearWorkingCapital,
  costPerSquareFoot,
  className = "",
}: InvestmentCalculatorProps) {
  const { selectedCurrency, convertToUSDT } = useGlobalCurrency();
  const currentCurrencyDetails = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];

  const spaceCost = minSquareFootage * costPerSquareFoot;
  const totalInvestment = franchiseFee + setupCost + threeYearWorkingCapital + spaceCost;

  const formatCurrency = (amount: number) => {
    return `${currentCurrencyDetails.symbol}${amount.toLocaleString()}`;
  };

  const isComplete = minSquareFootage > 0 && franchiseFee > 0 && setupCost > 0 && threeYearWorkingCapital > 0 && costPerSquareFoot > 0;

  if (!isComplete) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 ${className}`}>
        <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-3">
          Complete Financial Information
        </h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Please fill in all financial fields to see the minimum total investment calculation.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 ${className}`}>
      <h4 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-4">
        Minimum Total Investment: {formatCurrency(totalInvestment)}
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-700">
          <span className="text-sm text-green-700 dark:text-green-300">Franchise Fee:</span>
          <span className="font-medium text-green-800 dark:text-green-200">
            {formatCurrency(franchiseFee)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-700">
          <span className="text-sm text-green-700 dark:text-green-300">Setup Cost:</span>
          <span className="font-medium text-green-800 dark:text-green-200">
            {formatCurrency(setupCost)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-700">
          <span className="text-sm text-green-700 dark:text-green-300">Working Capital (3 years):</span>
          <span className="font-medium text-green-800 dark:text-green-200">
            {formatCurrency(threeYearWorkingCapital)}
          </span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-700">
          <span className="text-sm text-green-700 dark:text-green-300">
            Space Cost ({minSquareFootage.toLocaleString()} sq ft × {formatCurrency(costPerSquareFoot)}/sq ft):
          </span>
          <span className="font-medium text-green-800 dark:text-green-200">
            {formatCurrency(spaceCost)}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t-2 border-green-300 dark:border-green-600">
          <span className="text-lg font-semibold text-green-800 dark:text-green-200">Total Investment:</span>
          <span className="text-xl font-bold text-green-900 dark:text-green-100">
            {formatCurrency(totalInvestment)}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/40 rounded-md">
        <p className="text-xs text-green-700 dark:text-green-300">
          <strong>In USDT:</strong> ≈ USDT {convertToUSDT(totalInvestment).toFixed(2)}
        </p>
        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
          This calculation provides potential franchisees with a clear understanding of the total investment required.
        </p>
      </div>
    </div>
  );
}
