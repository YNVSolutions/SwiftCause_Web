import React from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { AmountSelectorProps } from '../types';

export const AmountSelector: React.FC<AmountSelectorProps> = ({
  amounts,
  selectedAmount,
  customAmount,
  currency,
  onSelectAmount,
  onCustomAmountChange,
}) => {
  // Format amount without decimals
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency).replace(/\.00$/, '');
  };

  const handleCustomFocus = () => {
    // Clear preset selection when focusing on custom input
    onSelectAmount(0);
  };

  const handleCustomChange = (value: string) => {
    onCustomAmountChange(value);
    // Clear preset selection when typing custom amount
    if (value) {
      onSelectAmount(0);
    }
  };

  const getCurrencySymbol = () => {
    if (currency === 'GBP') return '\u00a3';
    if (currency === 'EUR') return '\u20ac';
    return '$';
  };

  return (
    <div className="space-y-4 font-lexend">
      {/*
      {enableRecurring && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          role="radiogroup"
          aria-label="Donation frequency"
        >
          {frequencyOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={option.active}
                onClick={option.onSelect}
                className={`h-full rounded-lg border text-left transition-all p-3 flex flex-col gap-1 hover:shadow-md hover:-translate-y-0.5 ${
                  option.active
                    ? 'border-[rgba(15,23,42,0.08)] bg-gray-100/50 text-[#0A0A0A]'
                    : 'border-[rgba(15,23,42,0.08)] bg-white hover:border-[rgba(15,23,42,0.12)]'
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold text-sm">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
      */}

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-3">
        {amounts.slice(0, 3).map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => {
              onSelectAmount(amount);
              onCustomAmountChange('');
            }}
            className={`h-12 rounded-full font-semibold text-[17px] transition-all duration-150 ease-out border ${
              selectedAmount === amount
                ? 'bg-[#0E8F5A] text-white border-transparent shadow-[0_12px_32px_rgba(15,23,42,0.08)] scale-[1.02]'
                : 'bg-[#FFFBF7] text-[#0E8F5A] border-gray-200 hover:bg-gray-100/50 hover:border-gray-300 hover:brightness-[1.02]'
            }`}
          >
            {formatAmount(amount)}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] font-normal">
          {getCurrencySymbol()}
        </span>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          onFocus={handleCustomFocus}
          placeholder="Custom amount"
          className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-200 text-[17px] font-normal focus:outline-none focus:border-[#0E8F5A] focus:ring-1 focus:ring-[#0E8F5A]/20 transition-all duration-150 ease-out bg-[#FFFBF7]"
        />
      </div>

      {/*
      {enableRecurring && isRecurring && (
        <div className="rounded-lg bg-gray-100/50 px-3 py-2 flex items-center justify-center gap-2 text-[15px] border border-[rgba(15,23,42,0.08)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <span className="relative flex items-center justify-center w-8 h-8 shrink-0" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-gray-100/50" />
            <span className="absolute -inset-1 rounded-full border border-[rgba(15,23,42,0.08)]" />
            <Heart className="w-4 h-4 text-[#0E8F5A] relative" />
          </span>
          <span className="text-[#0E8F5A] font-medium">
            Your next {recurringLabel.toLowerCase()} donation is on {getNextBillingDate()}
          </span>
        </div>
      )}
      */}

      {/*
      {isRecurring && effectiveAmount > 0 && (
        <div className="rounded-xl bg-gray-100/50 border border-[rgba(15,23,42,0.08)] px-4 py-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-[#0E8F5A]">Cost preview</span>
            <span className="text-sm text-[#0E8F5A]">Est.</span>
          </div>
          <p className="text-lg font-bold text-[#0A0A0A] mt-1">
            {formatAmount(effectiveAmount)}/{recurringUnitLabel}
          </p>
          <p className="text-sm text-gray-600">
            Equals {formatAmount(annualAmount)} per year
          </p>
        </div>
      )}
      */}

      {/*
      {enableRecurring && isRecurring && (
        <p className="text-xs text-gray-600 text-center px-4">
          By enabling recurring donations, you agree to our subscription terms and can cancel anytime.
        </p>
      )}
      */}
    </div>
  );
};
