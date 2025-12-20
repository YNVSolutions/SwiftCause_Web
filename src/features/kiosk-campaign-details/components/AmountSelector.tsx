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

  return (
    <div className="space-y-4">
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
          {currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$'}
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
    </div>
  );
};
