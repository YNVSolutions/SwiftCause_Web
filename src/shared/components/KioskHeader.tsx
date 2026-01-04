import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface KioskHeaderProps {
  title: string;
  backText?: string;
  onBack?: () => void;
  /** Optional subtext for hero variant */
  subtitle?: string;
  /** Visual style for the header */
  variant?: 'standard' | 'hero';
  /** Logo options for hero */
  logoSrc?: string;
  logoAlt?: string;
  brandPrimary?: string;
  brandAccent?: string;
  accentColor?: string;
  /** Optional right-side action (e.g., logout icon button) */
  actionButton?: React.ReactNode;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  title,
  backText = 'Back',
  onBack,
  subtitle,
  variant = 'standard',
  logoSrc = '/logo.png',
  logoAlt = 'SwiftCause',
  brandPrimary = 'Swift',
  brandAccent = 'Cause',
  accentColor = '#0DA573',
  actionButton,
}) => {
  if (variant === 'hero') {
    return (
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5/6 mx-auto px-6 lg:px-12 xl:px-16 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt={logoAlt} className="h-10 w-10" />
              <div className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
                <span>{brandPrimary}</span>
                <span style={{ color: accentColor }}>{brandAccent}</span>
              </div>
            </div>
            {actionButton ? (
              actionButton
            ) : (
              <div className="w-11 h-11" />
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-[#394150] mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </header>
    );
  }

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
