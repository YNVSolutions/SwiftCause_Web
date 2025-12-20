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
    <div className="bg-white border-b border-gray-100 px-4 py-4 shrink-0">
      <div className="w-5/6 mx-auto flex items-center justify-between relative">
        {/* Left: Back button with text */}
        <div className="flex items-center z-10">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors text-[#0A0A0A]"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{backText}</span>
            </button>
          ) : (
            <div className="w-20" />
          )}
        </div>

        {/* Center: Title */}
        <h1 className="text-xl font-semibold text-[#0A0A0A] absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>

        {/* Right: Spacer for balance */}
        <div className="w-20" />
      </div>
    </div>
  );
};
