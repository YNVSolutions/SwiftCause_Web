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
  recurringIntervals = ['monthly', 'quarterly', 'yearly'],
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

  const recurringUnitLabel =
    recurringInterval === 'monthly'
      ? 'month'
      : recurringInterval === 'quarterly'
        ? 'quarter'
        : 'year';

  const defaultOrder: Array<'monthly' | 'quarterly' | 'yearly'> = ['monthly', 'quarterly', 'yearly'];
  const normalizedIntervals =
    recurringIntervals && recurringIntervals.length > 0
      ? recurringIntervals
      : defaultOrder;
  const availableIntervals = defaultOrder.filter(
    (interval) => normalizedIntervals.includes(interval) || interval === 'yearly'
  );

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

  const frequencyOptions = [
    {
      key: 'one-time',
      label: 'One-time',
      sublabel: 'Give once',
      icon: Calendar,
      active: !isRecurring,
      onSelect: () => {
        onRecurringToggle(false);
      }
    },
    ...availableIntervals.map((interval) => ({
      key: interval,
      label:
        interval === 'monthly'
          ? 'Monthly'
          : interval === 'quarterly'
            ? 'Quarterly'
            : 'Yearly',
      icon:
        interval === 'monthly'
          ? CalendarClock
          : interval === 'quarterly'
            ? CalendarRange
            : Calendar,
      active: isRecurring && recurringInterval === interval,
      onSelect: () => {
        onRecurringToggle(true);
        onRecurringIntervalChange(interval);
      }
    }))
  ];

  return (
    <div className="space-y-4">
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
                    ? 'border-green-500 bg-green-50 text-[#0A0A0A]'
                    : 'border-green-200 bg-white hover:border-green-400'
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
            className={`h-14 rounded-xl font-medium text-lg transition-colors duration-200 border ${
              selectedAmount === amount
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent'
                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
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
          className="w-full h-14 pl-10 pr-4 rounded-xl border border-green-200 text-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-300 transition-colors bg-white/90"
        />
      </div>

      {enableRecurring && isRecurring && (
        <div className="rounded-lg bg-green-50/70 px-3 py-2 flex items-center justify-center gap-2 text-[15px] border border-green-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <span className="relative flex items-center justify-center w-8 h-8 shrink-0" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-green-100" />
            <span className="absolute -inset-1 rounded-full border border-green-200" />
            <Heart className="w-4 h-4 text-green-600 relative" />
          </span>
          <span className="text-green-700 font-medium">
            Your next {recurringLabel.toLowerCase()} donation is on {getNextBillingDate()}
          </span>
        </div>
      )}

      {isRecurring && effectiveAmount > 0 && (
        <div className="rounded-xl bg-green-50/70 border border-green-200 px-4 py-3 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-green-800">Cost preview</span>
            <span className="text-sm text-green-700">Est.</span>
          </div>
          <p className="text-lg font-bold text-[#0A0A0A] mt-1">
            {formatAmount(effectiveAmount)}/{recurringUnitLabel}
          </p>
          <p className="text-sm text-gray-600">
            Equals {formatAmount(annualAmount)} per year
          </p>
        </div>
      )}

      {enableRecurring && isRecurring && (
        <p className="text-xs text-gray-600 text-center px-4">
          By enabling recurring donations, you agree to our subscription terms and can cancel anytime.
        </p>
      )}
    </div>
  );
};
