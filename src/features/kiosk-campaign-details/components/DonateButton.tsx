import React from 'react';
import { DonateButtonProps } from '../types';

export const DonateButton: React.FC<DonateButtonProps> = ({ disabled, onClick, label = 'Donate' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[52px] rounded-full font-semibold text-[17px] text-white transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed bg-[#0E8F5A] hover:brightness-[1.02] active:brightness-[0.98] shadow-[0_12px_32px_rgba(15,23,42,0.08)] font-lexend tracking-[0.01em]"
    >
      {label}
    </button>
  );
};
