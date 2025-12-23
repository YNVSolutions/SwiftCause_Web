import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface KioskHeaderProps {
  title: string;
  backText?: string;
  onBack?: () => void;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  title,
  backText = 'Back',
  onBack,
}) => {
  return (
    <div className="bg-white border-b border-gray-100 px-2 sm:px-4 py-3 sm:py-4 shrink-0">
      <div className="w-full sm:w-5/6 mx-auto flex items-center justify-between relative">
        {/* Left: Back button with text */}
        <div className="flex items-center z-10">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-[#0A0A0A]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">{backText}</span>
            </button>
          ) : (
            <div className="w-8 sm:w-20" />
          )}
        </div>

        {/* Center: Title */}
        <h1 className="text-base sm:text-xl font-semibold text-[#0A0A0A] absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          {title}
        </h1>

        {/* Right: Spacer for balance */}
        <div className="w-8 sm:w-20" />
      </div>
    </div>
  );
};
