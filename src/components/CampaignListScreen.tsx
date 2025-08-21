import React, { useState, useEffect } from 'react';
import { CampaignCard } from './shared/CampaignCard';
import { NavigationHeader } from './shared/NavigationHeader';
import { Campaign, KioskSession, Kiosk } from '../App';
import { Button } from './ui/button'; // Import Button component
import { RotateCcw, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons
import { updateKiosk } from '../api/firestoreService';

interface CampaignListScreenProps {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  isDetailedView: boolean;
  kioskSession?: KioskSession | null;
  onViewToggle: (value: boolean) => void;
  onSelectCampaign: (campaign: Campaign) => void;
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
  isDetailedView,
  kioskSession,
  onViewToggle,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <NavigationHeader title="Available Campaigns" />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationHeader
        title="Available Campaigns"
        campaignCount={campaigns.length}
        layoutMode={layoutMode} // Pass layoutMode to NavigationHeader
        onLayoutChange={handleLayoutChange} // Pass onLayoutChange to NavigationHeader
        rightContent={
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RotateCcw className="w-4 h-4 mr-2" /> Refresh Data
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        }
      />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Available</h3>
            <p className="text-gray-600">
              {kioskSession
                ? `No campaigns have been assigned to ${kioskSession.kioskName}. Please contact your administrator.`
                : 'No active campaigns are currently available.'}
            </p>
          </div>
        ) : (
          layoutMode === 'carousel' ? (
            <CampaignCarousel
              campaigns={campaigns}
              onSelectCampaign={onSelectCampaign}
              onViewDetails={onViewDetails}
              isDefaultCampaign={isDefaultCampaign}
              autoRotate={autoRotateCampaigns}
              rotationInterval={rotationInterval}
            />
          ) : (
            <div className={
              /* Container decides layout; default to grid/list based on isDetailedView */
              layoutMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6" : "grid grid-cols-1 gap-3 sm:gap-4"
            }>
              {campaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant={layoutMode === 'grid' ? 'detailed' : 'compact'}
                  onDonate={() => onSelectCampaign(campaign)}
                  onViewDetails={() => onViewDetails(campaign)}
                  isDefault={isDefaultCampaign(campaign.id)}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}

interface CampaignCarouselProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onViewDetails: (campaign: Campaign) => void;
  isDefaultCampaign: (campaignId: string) => boolean;
  autoRotate: boolean;
  rotationInterval: number;
}

const CampaignCarousel = ({
  campaigns,
  onSelectCampaign,
  onViewDetails,
  isDefaultCampaign,
  autoRotate,
  rotationInterval,
}: CampaignCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (autoRotate && campaigns.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % campaigns.length);
      }, rotationInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRotate, campaigns.length, rotationInterval]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % campaigns.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + campaigns.length) % campaigns.length
    );
  };

  if (campaigns.length === 0) {
    return null; // Or some placeholder
  }

  const currentCampaign = campaigns[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg aspect-video flex items-center justify-center p-4">
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {campaigns.map((campaign, index) => (
          <div key={campaign.id} className="w-full flex-shrink-0">
            <CampaignCard
              campaign={campaign}
              variant="detailed"
              onDonate={() => onSelectCampaign(campaign)}
              onViewDetails={() => onViewDetails(campaign)}
              isDefault={isDefaultCampaign(campaign.id)}
            />
          </div>
        ))}
      </div>

      {/* Navigation Dots (optional) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {campaigns.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
          />
        ))}
      </div>
    </div>
  );
};
