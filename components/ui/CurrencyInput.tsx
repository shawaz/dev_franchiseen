"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { useGlobalCurrency } from '@/contexts/GlobalCurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/lib/coingecko';

interface CurrencyInputProps {
  id?: string;
  name?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showUSDTConversion?: boolean;
  min?: number;
  step?: number;
}

export function CurrencyInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  showUSDTConversion = true,
  min = 0.01,
  step = 0.01,
}: CurrencyInputProps) {
  const { selectedCurrency, convertToUSDT } = useGlobalCurrency();
  const currentCurrencyDetails = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) || SUPPORTED_CURRENCIES[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = inputValue === '' ? 0 : Number(inputValue);
    
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          {currentCurrencyDetails.symbol}
        </span>
        <Input
          type="number"
          id={id}
          name={name}
          value={value || ''}
          onChange={handleChange}
          className={`pl-12 pr-4 ${className}`}
          placeholder={placeholder || `Enter amount in ${currentCurrencyDetails.code.toUpperCase()}`}
          required={required}
          disabled={disabled}
          min={min}
          step={step}
        />
      </div>
      {showUSDTConversion && value > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ≈ USDT {convertToUSDT(value).toFixed(2)}
        </p>
      )}
    </div>
  );
}
