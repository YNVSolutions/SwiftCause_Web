import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { ArrowLeft } from 'lucide-react';
import { CampaignDetailsPageProps } from '../types';
import {
  ImageCarousel,
  AmountSelector,
  DonateButton,
  VideoPlayer,
  LoadingState,
  ErrorState,
} from '../components';

/**
 * Pure presentational component for the Campaign Details page.
 * Two-column layout (3:2): Left (images + long description), Right (title + description + progress + amounts + video)
 */
export const CampaignDetailsPage: React.FC<CampaignDetailsPageProps> = ({
  state,
  currency,
  onBack,
  onSelectAmount,
  onCustomAmountChange,
  onRecurringToggle,
  onRecurringIntervalChange,
  onDonate,
  onImageChange,
}) => {
  const {
    campaign,
    loading,
    error,
    selectedAmount,
    customAmount,
    currentImageIndex,
    isRecurring,
    recurringInterval,
  } = state;

  // Ref for the donation panel to measure its height
  const donationPanelRef = useRef<HTMLDivElement>(null);
  const [donationPanelHeight, setDonationPanelHeight] = useState(350); // Default height

  // Measure donation panel height and update bottom spacing
  useEffect(() => {
    const measurePanelHeight = () => {
      if (donationPanelRef.current) {
        const height = donationPanelRef.current.offsetHeight;
        // Add some extra padding (20px) for better spacing
        setDonationPanelHeight(height + 20);
      }
    };

    // Measure initially
    measurePanelHeight();

    // Measure when content changes (recurring state, selected amounts, etc.)
    const observer = new ResizeObserver(measurePanelHeight);
    if (donationPanelRef.current) {
      observer.observe(donationPanelRef.current);
    }

    // Also measure on state changes that might affect height
    const timeoutId = setTimeout(measurePanelHeight, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [isRecurring, selectedAmount, customAmount, recurringInterval]); // Re-measure when these change

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  // No campaign
  if (!campaign) {
    return <ErrorState message="Campaign not found" onRetry={onBack} />;
  }

  // Get gallery images - use galleryImages first, then coverImageUrl as fallback
  const galleryImages =
    campaign.galleryImages && campaign.galleryImages.length > 0
      ? campaign.galleryImages
      : campaign.coverImageUrl
        ? [campaign.coverImageUrl]
        : [];

  // Get predefined amounts
  const predefinedAmounts = campaign.configuration?.predefinedAmounts || [10, 25, 100];
  const enableRecurring = campaign.configuration?.enableRecurring ?? false;
  const recurringIntervals = (campaign.configuration?.recurringIntervals?.length
    ? campaign.configuration.recurringIntervals
    : ['monthly', 'quarterly', 'yearly']) as ('monthly' | 'quarterly' | 'yearly')[];
  const fallbackImage = campaign.coverImageUrl || '/campaign-fallback.svg';

  // Calculate progress
  const progress =
    campaign.goal > 0 ? Math.min(((campaign.raised || 0) / campaign.goal) * 100, 100) : 0;

  // Format amount without decimals
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency).replace(/\.00$/, '');
  };

  // Description to show below images (long description if available, else short)
  const belowImageDescription = campaign.longDescription || campaign.description;

  // Parse and render description safely (supports HTML from SimpleRichEditor: <strong>, <em>, <hr>)
  const renderDescription = (text: string) => {
    if (!text) return null;

    // Clean and sanitize the HTML content
    const cleanHtml = text
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .trim();

    if (!cleanHtml) return null;

    // If it contains HTML tags, render as HTML
    if (/<[^>]+>/.test(cleanHtml)) {
      return (
        <div 
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    }

    // Fallback: Handle legacy format (**bold**, <br>, <hr>)
    const hrParts = text.split(/<hr\s*\/?>/gi);

    return hrParts.map((hrPart, hrIndex) => {
      const brParts = hrPart.split(/<br\s*\/?>/gi);

      const content = brParts.map((brPart, brIndex) => {
        const boldParts = brPart.split(/(\*\*.+?\*\*)/g);
        const rendered = boldParts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        return (
          <React.Fragment key={brIndex}>
            {brIndex > 0 && <br />}
            {rendered}
          </React.Fragment>
        );
      });

      return (
        <React.Fragment key={hrIndex}>
          {hrIndex > 0 && <hr className="my-4 border-gray-200" />}
          {content}
        </React.Fragment>
      );
    });
  };

  // Check if donate is enabled (has selected amount or custom amount)
  const hasValidAmount =
    (selectedAmount !== null && selectedAmount > 0) ||
    (customAmount && parseFloat(customAmount) > 0);

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-green-50 via-white to-emerald-50/70 relative">
      <style>{`
        .kiosk-progress-bar {
          background-size: 200% 100%;
          animation: kioskProgressFlow 3.5s ease-in-out infinite;
        }
        .kiosk-sidecard {
          position: relative;
          overflow: hidden;
        }
        .kiosk-sidecard::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(22, 163, 74, 0.05), rgba(14, 165, 233, 0.06), rgba(22, 163, 74, 0.03));
          background-size: 160% 160%;
          animation: kioskSideGlow 8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes kioskProgressFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes kioskSideGlow {
          0% { background-position: 0% 50%; opacity: 0.5; }
          50% { background-position: 100% 50%; opacity: 0.9; }
          100% { background-position: 0% 50%; opacity: 0.5; }
        }
        .rich-text-content strong {
          font-weight: bold;
        }
        .rich-text-content em {
          font-style: italic;
        }
        .rich-text-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 16px 0;
        }
        .rich-text-content p {
          margin: 0 0 8px 0;
        }
        .rich-text-content p:last-child {
          margin-bottom: 0;
        }
      `}</style>
      <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-70" />
      <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-60" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-green-50 blur-3xl opacity-90" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Fixed header at top - only visible on mobile */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30">
          <div className="w-full px-4 py-4 flex justify-center">
            <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-3 shadow-lg border border-gray-200/50 flex items-center gap-4">
              <button
                onClick={onBack}
                title="Back"
                aria-label="Back"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
              </button>
              <p className="text-base uppercase tracking-[0.15em] text-black font-bold">
                Campaign Details
              </p>
            </div>
          </div>
        </header>

        {/* Desktop header - normal flow */}
        <header className="hidden lg:block w-full pt-5">
          <div className="w-5/6 mx-auto px-4 lg:px-0">
            <div className="rounded-3xl px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  title="Back"
                  aria-label="Back"
                  className="flex items-center justify-center h-10 w-10 rounded-lg border border-green-200 bg-white/90 text-green-700 shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <ArrowLeft className="h-4.5 w-4.5" strokeWidth={2.4} />
                </button>
                <div className="flex-1 text-center">
                  <p className="text-base sm:text-lg uppercase tracking-[0.15em] text-black font-bold">
                    Campaign Details
                  </p>
                </div>
              </div>
              <div className="h-px bg-green-100 mt-4" />
            </div>
          </div>
        </header>

      {/* Large screens: Two-column layout */}
      <main className="hidden lg:flex w-5/6 mx-auto py-8 flex-1 overflow-y-auto">
        {/* 3:2 grid layout - full height */}
        <div className="grid grid-cols-5 gap-10 h-full w-full items-start">
          {/* Left Column (3/5): Scrollable - Image Carousel + Long Description */}
          <div className="col-span-3 space-y-6 overflow-y-auto pr-2">
            {/* Image Carousel */}
            <div className="h-[450px] shrink-0 rounded-3xl border border-green-100 bg-white/90 shadow-xl overflow-hidden">
              <ImageCarousel
                images={galleryImages}
                currentIndex={currentImageIndex}
                onIndexChange={onImageChange}
                fallbackImage={fallbackImage}
              />
            </div>

            {/* Description below images */}
            <div className="prose prose-gray max-w-none pb-4">
              <div className="rounded-3xl border border-green-100 bg-white/85 shadow-lg px-6 py-5 text-gray-600 text-lg leading-relaxed">
                {renderDescription(belowImageDescription)}
              </div>
            </div>
          </div>

          {/* Right Column (2/5): Fixed - Title + Description + Progress + Amounts + Video */}
          <div className="kiosk-sidecard col-span-2 space-y-6 rounded-3xl border border-green-100 bg-white/85 shadow-xl px-6 py-6 lg:sticky lg:top-0 h-fit">
          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-semibold text-[#0A0A0A] leading-tight">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="text-base text-gray-600 leading-relaxed">
              {campaign.description}
            </p>
          )}

            {/* Progress Section */}
            <div className="space-y-2 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#0A0A0A] font-medium">
                  {formatAmount(campaign.raised || 0)} / {formatAmount(campaign.goal)}
                </span>
                <span className="text-sm text-green-700 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2">
                <div
                  className="kiosk-progress-bar bg-linear-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Amount Selector */}
            <AmountSelector
              amounts={predefinedAmounts}
              selectedAmount={selectedAmount}
              customAmount={customAmount}
              currency={currency}
              enableRecurring={enableRecurring}
              recurringIntervals={recurringIntervals}
              isRecurring={isRecurring}
              recurringInterval={recurringInterval}
              onSelectAmount={onSelectAmount}
              onCustomAmountChange={onCustomAmountChange}
              onRecurringToggle={onRecurringToggle}
              onRecurringIntervalChange={onRecurringIntervalChange}
            />

            {/* Donate Button */}
            <DonateButton
              disabled={!hasValidAmount}
              onClick={onDonate}
              label="Donate"
            />

            {/* Video Player */}
            {campaign.videoUrl && (
              <div className="pt-2">
                <VideoPlayer videoUrl={campaign.videoUrl} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Small screens: Natural page scroll with fixed donate controls */}
      <div className="lg:hidden">
        {/* Main content - scrolls naturally with the page */}
        <div 
          className="px-4 pt-24" 
          style={{ paddingBottom: `${donationPanelHeight}px` }}
        >
          {/* Image Carousel */}
          <div className="h-64 sm:h-80 mb-6 rounded-3xl border border-green-100 bg-white/90 shadow-xl overflow-hidden">
            <ImageCarousel
              images={galleryImages}
              currentIndex={currentImageIndex}
              onIndexChange={onImageChange}
              fallbackImage={fallbackImage}
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0A0A0A] leading-tight mb-3">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="text-base text-gray-600 leading-relaxed mb-4">
              {campaign.description}
            </p>
          )}

          {/* Progress Section */}
          <div className="space-y-2 mb-6 rounded-2xl border border-green-100 bg-green-50/60 px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#0A0A0A] font-medium">
                {formatAmount(campaign.raised || 0)} / {formatAmount(campaign.goal)}
              </span>
              <span className="text-sm text-green-700 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-2">
              <div
                className="kiosk-progress-bar bg-linear-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Long Description */}
          <div className="prose prose-gray max-w-none mb-6">
            <div className="rounded-3xl border border-green-100 bg-white/85 shadow-lg px-5 py-4 text-gray-600 text-base leading-relaxed">
              {renderDescription(belowImageDescription)}
            </div>
          </div>

          {/* Video Player */}
          {campaign.videoUrl && (
            <div className="mb-6">
              <VideoPlayer videoUrl={campaign.videoUrl} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed donate controls - only visible on mobile, positioned relative to viewport */}
      <div 
        ref={donationPanelRef}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-green-100 px-4 py-4 space-y-4 shadow-[0_-8px_32px_rgba(15,23,42,0.12)]"
      >
        {/* Amount Selector */}
        <AmountSelector
          amounts={predefinedAmounts}
          selectedAmount={selectedAmount}
          customAmount={customAmount}
          currency={currency}
          enableRecurring={enableRecurring}
          recurringIntervals={recurringIntervals}
          isRecurring={isRecurring}
          recurringInterval={recurringInterval}
          onSelectAmount={onSelectAmount}
          onCustomAmountChange={onCustomAmountChange}
          onRecurringToggle={onRecurringToggle}
          onRecurringIntervalChange={onRecurringIntervalChange}
        />

        {/* Donate Button */}
        <DonateButton
          disabled={!hasValidAmount}
          onClick={onDonate}
          label="Donate"
        />
      </div>
      </div>
    </div>
  );
};
