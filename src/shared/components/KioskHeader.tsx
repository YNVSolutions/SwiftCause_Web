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
  /** Reduce hero header height */
  compact?: boolean;
  /** Increase hero header height */
  heroSize?: 'normal' | 'tall';
  /** Width for hero container */
  heroWidth?: 'normal' | 'wide';
  /** Logo options for hero */
  logoSrc?: string;
  logoAlt?: string;
  brandPrimary?: string;
  brandAccent?: string;
  accentColor?: string;
  /** Optional right-side action (e.g., logout icon button) */
  actionButton?: React.ReactNode;
  /** Position for action button in hero variant */
  actionPosition?: 'left' | 'right';
  /** Hide logo + brand in hero variant */
  hideBrand?: boolean;
  /** Title layout in hero variant */
  heroTitlePosition?: 'stacked' | 'inline';
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  title,
  backText = 'Back',
  onBack,
  subtitle,
  variant = 'standard',
  compact = false,
  heroSize = 'normal',
  heroWidth = 'normal',
  logoSrc = '/logo.png',
  logoAlt = 'SwiftCause',
  brandPrimary = 'Swift',
  brandAccent = 'Cause',
  actionButton,
  actionPosition = 'right',
  hideBrand = false,
  heroTitlePosition = 'stacked',
}) => {
  if (variant === 'hero') {
    const isInlineTitle = heroTitlePosition === 'inline';
    const hasTitle = Boolean(title);
    const hasSubtitle = Boolean(subtitle);
    return (
      <header className="bg-transparent">
        <style>{`
          .kiosk-hero-shell {
            position: relative;
            overflow: hidden;
            border-radius: 20px;
            border: 1px solid #DCFCE7;
            background: #FFFFFF;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
            animation: kioskHeroFloat 7s ease-in-out infinite;
          }
          .kiosk-hero-shell.compact .kiosk-hero-content {
            padding: 12px 16px;
          }
          .kiosk-hero-shell.compact .kiosk-hero-title {
            font-size: 2rem;
          }
          .kiosk-hero-shell.compact .kiosk-hero-subtitle {
            margin-top: 2px;
          }
          .kiosk-hero-shell.compact .kiosk-brand-title {
            font-size: 1.5rem;
          }
          .kiosk-hero-shell.compact .kiosk-logo-wrap {
            height: 40px;
            width: 40px;
            border-radius: 12px;
          }
          .kiosk-hero-shell.compact .kiosk-hero-story {
            margin-top: 6px;
            height: 16px;
          }
          .kiosk-hero-shell.tall .kiosk-hero-content {
            padding: 20px 20px;
          }
          .kiosk-hero-shell.inline-title .kiosk-hero-title {
            font-size: 2rem;
          }
          .kiosk-hero-shell.inline-title .kiosk-hero-subtitle {
            margin-top: 2px;
          }
          .kiosk-hero-border {
            position: absolute;
            inset: -2px;
            border-radius: 22px;
            padding: 2px;
            background: linear-gradient(
              120deg,
              rgba(20, 184, 166, 0.35),
              rgba(34, 197, 94, 0.7),
              rgba(14, 165, 233, 0.4),
              rgba(20, 184, 166, 0.35)
            );
            background-size: 200% 200%;
            opacity: 0.6;
            animation: kioskBorderGlow 5.5s ease-in-out infinite;
            pointer-events: none;
            -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.25));
          }
          .kiosk-hero-shell::before {
            content: "";
            position: absolute;
            right: -70px;
            top: -90px;
            width: 240px;
            height: 240px;
            background: radial-gradient(circle at center, rgba(34, 197, 94, 0.18) 0%, rgba(34, 197, 94, 0) 65%);
          }
          .kiosk-hero-shell::after {
            content: "";
            position: absolute;
            left: -60px;
            bottom: -80px;
            width: 220px;
            height: 220px;
            background: radial-gradient(circle at center, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%);
          }
          .kiosk-brand {
            display: inline-flex;
            align-items: center;
            gap: 12px;
          }
          .kiosk-logo-wrap {
            position: relative;
            height: 48px;
            width: 48px;
            border-radius: 14px;
            background: #FFFFFF;
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
            border: 1px solid #DCFCE7;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: kioskLogoFloat 5.5s ease-in-out infinite;
          }
          .kiosk-logo-wrap::after {
            content: "";
            position: absolute;
            inset: -6px;
            border-radius: 20px;
            border: 1px solid rgba(34, 197, 94, 0.25);
            opacity: 0;
            transform: scale(0.9);
            animation: kioskLogoPulse 4.5s ease-in-out infinite;
          }
          .kiosk-brand-title {
            font-weight: 700;
            letter-spacing: -0.02em;
            transition: transform 200ms ease;
            animation: kioskBrandFloat 6.5s ease-in-out infinite;
          }
          .kiosk-brand-title .kiosk-brand-gradient {
            background: linear-gradient(90deg, #14B8A6 0%, #22C55E 55%, #0EA5E9 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .kiosk-brand-title .brand-accent {
            display: inline-block;
            animation: kioskAccentGlow 4s ease-in-out infinite;
          }
          @keyframes kioskLogoFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes kioskLogoPulse {
            0%, 100% { opacity: 0; transform: scale(0.92); }
            50% { opacity: 1; transform: scale(1); }
          }
          @keyframes kioskAccentGlow {
            0%, 100% { filter: drop-shadow(0 0 0 rgba(22, 163, 74, 0)); }
            50% { filter: drop-shadow(0 6px 12px rgba(22, 163, 74, 0.35)); }
          }
          @keyframes kioskBrandFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-1px); }
          }
          .kiosk-hero-content {
            position: relative;
            z-index: 1;
          }
          .kiosk-hero-title {
            font-size: 2.4rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }
          .kiosk-hero-subtitle {
            font-size: 1rem;
            line-height: 1.5;
            margin-top: 4px;
            color: #394150;
            max-width: 640px;
          }
          .kiosk-hero-story {
            position: relative;
            margin-top: 8px;
            height: 18px;
            max-width: 360px;
          }
          .kiosk-story-spark {
            position: absolute;
            bottom: 0;
            width: 14px;
            height: 14px;
            border-radius: 999px;
            background: #22C55E;
            box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
            animation: kioskSparkPulse 2.8s ease-in-out infinite;
          }
          .kiosk-story-heart {
            position: absolute;
            bottom: 0;
            width: 18px;
            height: 18px;
            color: #22C55E;
            opacity: 0;
            animation: kioskHeartRise 5.2s ease-in-out infinite;
          }
          .kiosk-story-heart.second {
            left: 22%;
            animation-delay: 1.2s;
          }
          .kiosk-story-heart.third {
            left: 44%;
            animation-delay: 2.1s;
          }
          @keyframes kioskHeartRise {
            0% { opacity: 0; transform: translateY(8px) scale(0.85); }
            20% { opacity: 0.6; }
            50% { opacity: 1; transform: translateY(-12px) scale(1); }
            80% { opacity: 0.2; }
            100% { opacity: 0; transform: translateY(-24px) scale(0.9); }
          }
          @keyframes kioskSparkPulse {
            0%, 100% { transform: scale(0.85); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes kioskHeroFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes kioskBorderGlow {
            0%, 100% {
              background-position: 0% 50%;
              opacity: 0.5;
              filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.2));
            }
            50% {
              background-position: 100% 50%;
              opacity: 0.85;
              filter: drop-shadow(0 0 16px rgba(34, 197, 94, 0.35));
            }
          }
        `}</style>
        <div className={`${heroWidth === 'wide' ? 'max-w-[92%]' : 'max-w-5/6'} mx-auto px-6 lg:px-12 xl:px-16 py-3`}>
          <div className={`kiosk-hero-shell${compact ? ' compact' : ''}${heroSize === 'tall' ? ' tall' : ''}${isInlineTitle ? ' inline-title' : ''}`}>
            <div className="kiosk-hero-border" />
            <div className={`kiosk-hero-content ${compact ? '' : 'px-5 py-3 sm:px-6 sm:py-4'}`}>
              {isInlineTitle ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {actionPosition === 'left' && actionButton ? (
                      <div className="shrink-0">
                        {actionButton}
                      </div>
                    ) : null}
                    <div>
                      {hasTitle ? (
                        <h1 className="kiosk-hero-title text-transparent bg-clip-text bg-linear-to-r from-green-700 via-emerald-600 to-green-500">
                          <span className="kiosk-hero-title-text">{title}</span>
                        </h1>
                      ) : null}
                      {hasSubtitle ? <p className="kiosk-hero-subtitle">{subtitle}</p> : null}
                    </div>
                  </div>
                  {actionPosition === 'right' ? (
                    actionButton ? (
                      <div className="shrink-0">
                        {actionButton}
                      </div>
                    ) : (
                      <div className="w-11 h-11" />
                    )
                  ) : (
                    <div className="w-11 h-11" />
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4">
                    {actionPosition === 'left' && actionButton ? (
                      <div className="shrink-0 self-start sm:self-center">
                        {actionButton}
                      </div>
                    ) : null}
                    {!hideBrand ? (
                      <div className="kiosk-brand">
                        <div className="kiosk-logo-wrap">
                          <img src={logoSrc} alt={logoAlt} className="h-10 w-10" />
                        </div>
                        <div className="kiosk-brand-title text-2xl sm:text-3xl">
                          <span className="kiosk-brand-gradient">
                            {brandPrimary}
                            {brandAccent}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}
                    {actionPosition === 'right' ? (
                      actionButton ? (
                        <div className="shrink-0 self-start sm:self-center">
                          {actionButton}
                        </div>
                      ) : (
                        <div className="w-11 h-11" />
                      )
                    ) : (
                      <div className="w-11 h-11" />
                    )}
                  </div>
                  {(hasTitle || hasSubtitle) ? (
                    <div className={hasTitle ? 'mt-3' : 'mt-2'}>
                      {hasTitle ? (
                        <h1 className="kiosk-hero-title text-transparent bg-clip-text bg-linear-to-r from-green-700 via-emerald-600 to-green-500">
                          <span className="kiosk-hero-title-text">{title}</span>
                        </h1>
                      ) : null}
                      {hasSubtitle ? <p className="kiosk-hero-subtitle">{subtitle}</p> : null}
                    </div>
                  ) : null}
                  <div className="kiosk-hero-story" aria-hidden="true">
                    <div className="kiosk-story-spark" />
                    <svg className="kiosk-story-heart" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21s-6.7-4.1-9.2-7.6C.7 10.8 2 7.2 5.5 6.2c2-.6 3.7.2 4.9 1.6 1.2-1.4 2.9-2.2 4.9-1.6 3.5 1 4.8 4.6 2.7 7.2C18.7 16.9 12 21 12 21z" />
                    </svg>
                    <svg className="kiosk-story-heart second" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21s-6.7-4.1-9.2-7.6C.7 10.8 2 7.2 5.5 6.2c2-.6 3.7.2 4.9 1.6 1.2-1.4 2.9-2.2 4.9-1.6 3.5 1 4.8 4.6 2.7 7.2C18.7 16.9 12 21 12 21z" />
                    </svg>
                    <svg className="kiosk-story-heart third" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21s-6.7-4.1-9.2-7.6C.7 10.8 2 7.2 5.5 6.2c2-.6 3.7.2 4.9 1.6 1.2-1.4 2.9-2.2 4.9-1.6 3.5 1 4.8 4.6 2.7 7.2C18.7 16.9 12 21 12 21z" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="bg-white border-b border-gray-100 px-2 sm:px-4 py-2 sm:py-2 shrink-0">
      <div className="w-full sm:w-5/6 mx-auto flex items-center justify-between relative">
        {/* Left: Back button with text */}
        <div className="flex items-center z-10">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-[#0A0A0A]"
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
