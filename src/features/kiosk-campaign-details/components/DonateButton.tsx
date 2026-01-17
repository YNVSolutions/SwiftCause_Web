import React from 'react';
import { DonateButtonProps } from '../types';

export const DonateButton: React.FC<DonateButtonProps> = ({ disabled, onClick, label = 'Donate' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-xl font-medium text-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200/70"
    >
      {label}
    </button>
  );
};
