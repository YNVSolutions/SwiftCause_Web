<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { CampaignCard } from '../../entities/campaign';
=======
import React, { useState } from 'react';
>>>>>>> main
import { NavigationHeader } from '../../shared/ui/NavigationHeader';
import { Campaign, KioskSession } from '../../shared/types';
import { Button } from '../../shared/ui/button';
import { ChevronLeft } from 'lucide-react';
import { updateKiosk } from '../../shared/api';
import { formatCurrency } from '../../shared/lib/currencyFormatter';

interface CampaignListScreenProps {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  isDetailedView: boolean;
  kioskSession?: KioskSession | null;
  onViewToggle: (value: boolean) => void;
  onSelectCampaign: (campaign: Campaign, amount?: number) => void;
  onViewDetails: (campaign: Campaign) => void;
  isDefaultCampaign: (campaignId: string) => boolean;
  onLogout: () => void;
  refreshCampaigns: () => Promise<void>;
  layoutMode: 'grid' | 'list' | 'carousel';
  autoRotateCampaigns: boolean;
  rotationInterval: number;
  refreshCurrentKioskSession: () => Promise<void>; // Added refreshCurrentKioskSession prop
}

export function CampaignListScreen({
  campaigns,
  loading,
  error,
  kioskSession,
  onSelectCampaign,
  onViewDetails,
  isDefaultCampaign,
  onLogout,
  refreshCampaigns,
  layoutMode,
  autoRotateCampaigns,
  rotationInterval,
  refreshCurrentKioskSession,
}: CampaignListScreenProps) {

  const [page, setPage] = useState(1);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const campaignsPerPage = 6;
  const totalPages = Math.ceil(campaigns.length / campaignsPerPage);

  const startIdx = (page - 1) * campaignsPerPage;
  const endIdx = startIdx + campaignsPerPage;
  const currentCampaigns = campaigns.slice(startIdx, endIdx);

  const handleRefresh = async () => {
    await refreshCampaigns();
    await refreshCurrentKioskSession();
  };

  const handleLayoutChange = async (newLayout: 'grid' | 'list' | 'carousel') => {
    if (kioskSession && kioskSession.kioskId) {
      try {
        await updateKiosk(kioskSession.kioskId, { settings: { ...kioskSession.settings, displayMode: newLayout } });
        await refreshCurrentKioskSession(); // Refresh kiosk session to get updated settings
      } catch (e) {
        console.error("Failed to update kiosk display mode:", e);
      }
    }
  };

  const handleSelectCampaign = async (campaign: Campaign, amount?: number) => {
    setIsLoadingPayment(true);
    // Add a small delay to show the loading state
    setTimeout(() => {
      onSelectCampaign(campaign, amount);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="text-gray-700 text-base sm:text-lg font-medium">Loading campaigns...</p>
          <p className="text-gray-500 text-sm">Fetching the latest assignments for this kiosk.</p>
        </div>
      </div>
    );
  }

  if (isLoadingPayment) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="p-2 opacity-50">
              <ChevronLeft className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Choose a cause</h1>
            <div className="w-10" />
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationHeader title="Available Campaigns" />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="p-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Choose a cause</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Available</h3>
            <p className="text-gray-500">
              {kioskSession
                ? `No campaigns have been assigned to ${kioskSession.kioskName}. Please contact your administrator.`
                : 'No active campaigns are currently available.'}
            </p>
          </div>
        ) : layoutMode === 'carousel' ? (
          <CampaignCarousel
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onViewDetails={onViewDetails}
            isDefaultCampaign={isDefaultCampaign}
            autoRotate={autoRotateCampaigns}
            rotationInterval={rotationInterval}
            kioskSession={kioskSession}
            isLoadingPayment={isLoadingPayment}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentCampaigns.map(campaign => (
              <div key={campaign.id} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                {/* Campaign Image */}
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img
                    src={campaign.coverImageUrl || '/campaign-fallback.svg'}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Progress Bar Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(((campaign.raised || 0) / campaign.goal) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">{campaign.description}</p>

                  {/* Donation Amount Buttons */}
                  <div className="space-y-3">
                    {/* Top 3 predefined amounts */}
                    <div className="grid grid-cols-3 gap-2">
                      {getTop3Amounts(campaign).map((amount, index) => (
                        <Button
                          key={index}
                          onClick={() => handleSelectCampaign(campaign, amount)}
                          disabled={isLoadingPayment}
                          className="h-10 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-xl border-0 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          💙 {formatCurrency(amount, kioskSession?.organizationCurrency || 'USD')}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Custom Amount Button */}
                    <Button
                      onClick={() => handleSelectCampaign(campaign)}
                      disabled={isLoadingPayment}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingPayment ? 'Loading...' : 'Custom Amount or Monthly'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              variant="outline"
              className="px-4 py-2 disabled:opacity-50"
            >
              ← Previous
            </Button>
            <span className="px-4 py-2 text-gray-600 flex items-center">
              {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              variant="outline"
              className="px-4 py-2 disabled:opacity-50"
            >
              Next →
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

interface CampaignCarouselProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign, amount?: number) => void;
  onViewDetails: (campaign: Campaign) => void;
  isDefaultCampaign: (campaignId: string) => boolean;
  autoRotate: boolean;
  rotationInterval: number;
  kioskSession?: KioskSession | null;
  isLoadingPayment: boolean;
}

// Helper function to get top 3 predefined amounts for a campaign
const getTop3Amounts = (campaign: Campaign): number[] => {
  const predefinedAmounts = campaign.configuration?.predefinedAmounts || [];
  // Sort amounts in ascending order and take the first 3
  const sortedAmounts = [...predefinedAmounts].sort((a, b) => a - b);
  // If less than 3 amounts, pad with default values
  const top3 = sortedAmounts.slice(0, 3);
  while (top3.length < 3) {
    const defaultAmounts = [10, 25, 50];
    const nextDefault = defaultAmounts[top3.length];
    if (!top3.includes(nextDefault)) {
      top3.push(nextDefault);
    } else {
      top3.push((top3[top3.length - 1] || 10) * 2);
    }
  }
  return top3;
};

const CampaignCarousel = ({
  campaigns,
  onSelectCampaign,
  onViewDetails,
  isDefaultCampaign,
  autoRotate,
  rotationInterval,
  kioskSession,
  isLoadingPayment
}: CampaignCarouselProps) => {
  if (campaigns.length === 0) {
    return null;
  }

<<<<<<< HEAD

  return (
    <div className="relative w-full overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 p-4">
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-md transition z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-md transition z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      <div className="w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="w-full flex-shrink-0 px-4">
              <div className="max-w-2xl mx-auto">
                <CampaignCard
                  campaign={campaign}
                  variant="detailed"
                  onDonate={() => onSelectCampaign(campaign)}
                  onViewDetails={() => onViewDetails(campaign)}
                  isDefault={isDefaultCampaign(campaign.id)}
                  organizationCurrency={kioskSession?.organizationCurrency}
                />
=======
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="space-y-8">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-2xl overflow-hidden shadow-lg">
            {/* Campaign Image */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={campaign.coverImageUrl || '/campaign-fallback.svg'}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              {/* Progress Bar Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div 
                    className="bg-white h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((campaign.raised || 0) / campaign.goal) * 100, 100)}%` 
                    }}
                  />
                </div>
>>>>>>> main
              </div>
            </div>

            {/* Campaign Info */}
            <div className="p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{campaign.title}</h2>
              <p className="text-gray-600 mb-8 text-lg">{campaign.description}</p>

              {/* Donation Amount Buttons */}
              <div className="space-y-4">
                {/* Top 3 predefined amounts */}
                <div className="grid grid-cols-3 gap-4">
                  {getTop3Amounts(campaign).map((amount, index) => (
                    <Button
                      key={index}
                      onClick={() => onSelectCampaign(campaign, amount)}
                      disabled={isLoadingPayment}
                      className="h-14 bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold rounded-xl border-0 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      💙 {formatCurrency(amount, kioskSession?.organizationCurrency || 'USD')}
                    </Button>
                  ))}
                </div>
                
                {/* Custom Amount Button */}
                <Button
                  onClick={() => onSelectCampaign(campaign)}
                  disabled={isLoadingPayment}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingPayment ? 'Loading...' : 'Custom Amount or Monthly'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
