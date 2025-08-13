import React, { useState, useEffect } from 'react';
import { CampaignCard } from './shared/CampaignCard';
import { NavigationHeader } from './shared/NavigationHeader';
import { Campaign, KioskSession } from '../App';
import { useCampaigns } from '../hooks/useCampaigns';

interface CampaignListScreenProps {
  onSelectCampaign: (campaign: Campaign) => void;
  onViewDetails: (campaign: Campaign) => void;
  kioskSession?: KioskSession | null;
}

export function CampaignListScreen({ onSelectCampaign, onViewDetails, kioskSession }: CampaignListScreenProps) {
  const [isDetailedView, setIsDetailedView] = useState(true);
  const { campaigns: rawCampaigns, loading, error } = useCampaigns();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Map raw campaigns from hook into UI shape
  useEffect(() => {
    if (!rawCampaigns) return;
    const mapped = (rawCampaigns || []).map((data: any) => ({
      id: data.id,
      title: data.title,
      description: data.description,
      goal: data.goalAmount,
      raised: data.collectedAmount,
      image: data.coverImageUrl,
      category: data.tags?.[0] || 'General',
      status: data.status,
      assignedKiosks: data.assignedKiosks || [],
      isGlobal: data.isGlobal ?? true,
      configuration: (data.configuration || {}) as any
    }));
    setCampaigns(mapped);
  }, [rawCampaigns]);

  const mockCampaigns: Campaign[] = [];

  const getAvailableCampaigns = () => {
    if (!kioskSession) return campaigns;
    const assignedCampaigns = campaigns.filter(c =>
      c.isGlobal || (c.assignedKiosks && c.assignedKiosks.includes(kioskSession.kioskId))
    );
    const { maxCampaignsDisplay } = kioskSession.settings || { maxCampaignsDisplay: 6 };
    return maxCampaignsDisplay && assignedCampaigns.length > maxCampaignsDisplay
      ? assignedCampaigns.slice(0, maxCampaignsDisplay)
      : assignedCampaigns;
  };

  const availableCampaigns = getAvailableCampaigns();

  const isDefaultCampaign = (campaignId: string) => {
    if (!kioskSession) return false;
    return kioskSession.assignedCampaigns[0] === campaignId;
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
        campaignCount={availableCampaigns.length}
        showViewToggle={true}
        isDetailedView={isDetailedView}
        onViewToggle={setIsDetailedView}
      />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {availableCampaigns.length === 0 ? (
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
          <div className={
            kioskSession?.settings?.displayMode === 'carousel' ? "space-y-4" :
            kioskSession?.settings?.displayMode === 'list' || !isDetailedView ? "grid grid-cols-1 gap-3 sm:gap-4" :
            "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          }>
            {availableCampaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                variant={isDetailedView ? 'detailed' : 'compact'}
                onDonate={() => onSelectCampaign(campaign)}
                onViewDetails={() => onViewDetails(campaign)}
                isDefault={isDefaultCampaign(campaign.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
