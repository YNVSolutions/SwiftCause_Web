import React from 'react';
import { formatCurrency } from '@/shared/lib/currencyFormatter';
import { CampaignDetailsPageProps } from '../types';
import {
  CampaignDetailsHeader,
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
  onDonate,
  onImageChange,
}) => {
  const { campaign, loading, error, selectedAmount, customAmount, currentImageIndex } = state;

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
    <div className="min-h-screen bg-white">
      <CampaignDetailsHeader onBack={onBack} />

      {/* 5/6 width container centered */}
      <main className="w-5/6 mx-auto py-8">
        {/* 3:2 grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column (3/5): Image Carousel + Long Description */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Carousel */}
            <div className="h-80 lg:h-[450px]">
              <ImageCarousel
                images={galleryImages}
                currentIndex={currentImageIndex}
                onIndexChange={onImageChange}
                fallbackImage={campaign.coverImageUrl}
              />
            </div>

            {/* Description below images */}
            <div className="prose prose-gray max-w-none">
              <div className="text-gray-600 text-lg leading-relaxed">
                {renderDescription(belowImageDescription)}
              </div>
            </div>
          </div>

          {/* Right Column (2/5): Title + Description + Progress + Amounts + Video */}
          <div className="lg:col-span-2 space-y-6">
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
              onSelectAmount={onSelectAmount}
              onCustomAmountChange={onCustomAmountChange}
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
    </div>
  );
};
