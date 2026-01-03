import React from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { KioskHeader } from '@/shared/components/KioskHeader';
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

  // Calculate progress
  const progress =
    campaign.goal > 0 ? Math.min(((campaign.raised || 0) / campaign.goal) * 100, 100) : 0;

  // Format amount without decimals
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency).replace(/\.00$/, '');
  };

  // Description to show below images (long description if available, else short)
  const belowImageDescription = campaign.longDescription || campaign.description;

  // Parse and render description safely (supports <br>, <hr>, and **bold**)
  const renderDescription = (text: string) => {
    // Split by <hr> first
    const hrParts = text.split(/<hr\s*\/?>/gi);

    return hrParts.map((hrPart, hrIndex) => {
      // Split each part by <br>
      const brParts = hrPart.split(/<br\s*\/?>/gi);

      const content = brParts.map((brPart, brIndex) => {
        // Handle **bold** syntax
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
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <KioskHeader title="Campaign Details" backText="Back" onBack={onBack} />

      {/* Large screens: Two-column layout */}
      <main className="hidden lg:flex w-5/6 mx-auto py-8 flex-1 overflow-y-auto">
        {/* 3:2 grid layout - full height */}
        <div className="grid grid-cols-5 gap-12 h-full w-full">
          {/* Left Column (3/5): Scrollable - Image Carousel + Long Description */}
          <div className="col-span-3 space-y-6 overflow-y-auto pr-2">
            {/* Image Carousel */}
            <div className="h-[450px] shrink-0">
              <ImageCarousel
                images={galleryImages}
                currentIndex={currentImageIndex}
                onIndexChange={onImageChange}
                fallbackImage={campaign.coverImageUrl}
              />
            </div>

            {/* Description below images */}
            <div className="prose prose-gray max-w-none pb-4">
              <div className="text-gray-600 text-lg leading-relaxed">
                {renderDescription(belowImageDescription)}
              </div>
            </div>
          </div>

          {/* Right Column (2/5): Fixed - Title + Description + Progress + Amounts + Video */}
          <div className="col-span-2 space-y-6">
            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-semibold text-[#0A0A0A] leading-tight">
              {campaign.title}
            </h1>

            {/* Short Description */}
            <p className="text-gray-500 text-base">{campaign.description}</p>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#0A0A0A]">
                  {formatAmount(campaign.raised || 0)} / {formatAmount(campaign.goal)}
                </span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#0A0A0A] h-2 rounded-full transition-all duration-300"
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
            <DonateButton disabled={!hasValidAmount} onClick={onDonate} />

            {/* Video Player */}
            {campaign.videoUrl && (
              <div className="pt-4">
                <VideoPlayer videoUrl={campaign.videoUrl} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Small screens: Single column with sticky donate controls */}
      <div className="lg:hidden flex flex-col flex-1">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Image Carousel */}
          <div className="h-64 sm:h-80 mb-6">
            <ImageCarousel
              images={galleryImages}
              currentIndex={currentImageIndex}
              onIndexChange={onImageChange}
              fallbackImage={campaign.coverImageUrl}
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0A0A0A] leading-tight mb-3">
            {campaign.title}
          </h1>

          {/* Short Description */}
          <p className="text-gray-500 text-sm sm:text-base mb-4">{campaign.description}</p>

          {/* Progress Section */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#0A0A0A]">
                {formatAmount(campaign.raised || 0)} / {formatAmount(campaign.goal)}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#0A0A0A] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Long Description */}
          <div className="prose prose-gray max-w-none mb-6">
            <div className="text-gray-600 text-base leading-relaxed">
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

        {/* Sticky donate controls at bottom */}
        <div className="shrink-0 bg-white border-t border-gray-200 px-4 py-4 space-y-4">
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
          <DonateButton disabled={!hasValidAmount} onClick={onDonate} />
        </div>
      </div>
    </div>
  );
};
