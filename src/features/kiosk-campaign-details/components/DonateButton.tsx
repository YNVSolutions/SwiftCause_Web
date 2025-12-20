import React from 'react';
import { DonateButtonProps } from '../types';

export const DonateButton: React.FC<DonateButtonProps> = ({ disabled, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-14 rounded-xl font-medium text-lg text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: disabled ? '#9CA3AF' : '#159A6F' }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#128A62';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = '#159A6F';
      }}
    >
      Donate
    </button>
  );
};
