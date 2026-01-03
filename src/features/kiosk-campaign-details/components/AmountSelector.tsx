import React from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { Heart, Calendar, CalendarClock, CalendarRange } from 'lucide-react';
import { AmountSelectorProps } from '../types';

export const AmountSelector: React.FC<AmountSelectorProps> = ({
  amounts,
  selectedAmount,
  customAmount,
  currency,
  enableRecurring,
  isRecurring,
  recurringInterval,
  onSelectAmount,
  onCustomAmountChange,
  onRecurringToggle,
  onRecurringIntervalChange,
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

  const recurringLabel =
    recurringInterval === 'monthly'
      ? 'Monthly'
      : recurringInterval === 'quarterly'
        ? 'Quarterly'
        : 'Yearly';

  const getCurrencySymbol = () => {
    if (currency === 'GBP') return '\u00a3';
    if (currency === 'EUR') return '\u20ac';
    return '$';
  };

  const getNextBillingDate = () => {
    const next = new Date();
    if (recurringInterval === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (recurringInterval === 'quarterly') {
      next.setMonth(next.getMonth() + 3);
    } else {
      next.setFullYear(next.getFullYear() + 1);
    }
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(next);
  };

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount || 0;
  const annualAmount =
    recurringInterval === 'monthly'
      ? effectiveAmount * 12
      : recurringInterval === 'quarterly'
        ? effectiveAmount * 4
        : effectiveAmount;

  return (
    <div className="space-y-4">
      {enableRecurring && (
        <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
          <div className="flex items-center justify-between gap-2" role="tablist" aria-label="Donation frequency">
            <button
              type="button"
              role="tab"
              aria-selected={!isRecurring}
              onClick={() => onRecurringToggle(false)}
              className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${
                !isRecurring
                  ? 'bg-[#159A6F] text-white shadow-sm'
                  : 'bg-transparent text-[#0A0A0A] hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                One-time
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isRecurring}
              onClick={() => onRecurringIntervalChange(recurringInterval)}
              className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-colors ${
                isRecurring
                  ? 'bg-[#159A6F] text-white shadow-sm'
                  : 'bg-transparent text-[#0A0A0A] hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center gap-2 justify-center">
                {recurringInterval === 'monthly' ? (
                  <CalendarClock className="w-4 h-4" aria-hidden="true" />
                ) : recurringInterval === 'quarterly' ? (
                  <CalendarRange className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                )}
                {recurringLabel}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Preset Amounts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amounts.slice(0, 3).map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => {
              onSelectAmount(amount);
              onCustomAmountChange('');
            }}
            className={`h-14 rounded-xl font-medium text-lg transition-colors duration-200 ${
              selectedAmount === amount
                ? 'bg-[#159A6F] text-white'
                : 'bg-[#E6FBF2] text-[#159A6F] hover:bg-[#d0f5e6]'
            }`}
          >
            {formatAmount(amount)}
          </button>
        ))}
      </div>

      {/* Custom Amount Input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
          {getCurrencySymbol()}
        </span>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => handleCustomChange(e.target.value)}
          onFocus={handleCustomFocus}
          placeholder="Custom amount"
          className="w-full h-14 pl-10 pr-4 rounded-xl border border-gray-200 text-lg focus:outline-none focus:border-[#159A6F] focus:ring-1 focus:ring-[#159A6F] transition-colors"
        />
      </div>

      {enableRecurring && (
        <div className="rounded-lg bg-gray-50/70 px-3 py-2 flex items-center justify-center gap-2 text-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <span className="relative flex items-center justify-center w-8 h-8 shrink-0" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-orange-50" />
            <span className="absolute -inset-1 rounded-full border border-orange-100" />
            <Heart className="w-4 h-4 text-[#f97316] relative" />
          </span>
          {isRecurring ? (
            <span className="text-[#f97316] font-medium">
              Your next {recurringLabel.toLowerCase()} donation is on {getNextBillingDate()}
            </span>
          ) : (
            <span className="text-[#f97316] font-medium">
              Multiply your impact. Make it {recurringLabel.toLowerCase()}!
            </span>
          )}
        </div>
      )}

      {isRecurring && effectiveAmount > 0 && (
        <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Cost preview</span>
            <span className="text-sm text-gray-500">Est.</span>
          </div>
          <p className="text-lg font-bold text-[#0A0A0A] mt-1">
            {formatAmount(effectiveAmount)}/{recurringLabel.toLowerCase()}
          </p>
          <p className="text-sm text-gray-600">
            Equals {formatAmount(annualAmount)} per year
          </p>
        </div>
      )}

      {enableRecurring && (
        <p className="text-xs text-gray-600 text-center px-4">
          By enabling recurring donations, you agree to our subscription terms and can cancel anytime.
        </p>
      )}
    </div>
  );
};
