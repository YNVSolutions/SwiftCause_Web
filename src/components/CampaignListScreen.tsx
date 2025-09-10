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

  const [page, setPage] = useState(1);
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
            <Button onClick={handleRefresh} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-lg flex items-center gap-2">
              <RotateCcw className="w-4 h-4 mr-2" /> Refresh Data
            </Button>
            <Button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white shadow-md rounded-lg flex items-center gap-2">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        }
      />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 mt-4">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/80 rounded-xl shadow-md max-w-lg mx-auto text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        ) : (
          layoutMode === 'carousel' ? (
            <CampaignCarousel
              campaigns={campaigns}
              onSelectCampaign={onSelectCampaign}
              onViewDetails={onViewDetails}
              isDefaultCampaign={isDefaultCampaign}
              autoRotate={autoRotateCampaigns}
              rotationInterval={rotationInterval}
              kioskSession={kioskSession} 
            />
          ) : (
            <div className={
              /* Container decides layout; default to grid/list based on isDetailedView */
              layoutMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"
            }>
              {currentCampaigns.map(campaign => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  variant={layoutMode === 'grid' ? 'detailed' : 'compact'}
                  onDonate={() => onSelectCampaign(campaign)}
                  onViewDetails={() => onViewDetails(campaign)}
                  isDefault={isDefaultCampaign(campaign.id)}
                  organizationCurrency={kioskSession?.organizationCurrency}
                />
              ))}
            </div>
          )
        )}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-l-lg shadow-md disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-lg shadow-md disabled:opacity-50"
            >
              Next →
            </button>
          </div>
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
  kioskSession?: KioskSession | null;
}

const CampaignCarousel = ({
  campaigns,
  onSelectCampaign,
  onViewDetails,
  isDefaultCampaign,
  autoRotate,
  rotationInterval,
  kioskSession
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
          {campaigns.map((campaign, index) => (
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {campaigns.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 w-3 rounded-full transition-colors duration-300 ${index === currentIndex ? 'bg-indigo-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};
