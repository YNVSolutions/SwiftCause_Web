import React, { useState, useEffect } from 'react';
import { CampaignCard } from './shared/CampaignCard';
import { NavigationHeader } from './shared/NavigationHeader';
import { Campaign, KioskSession } from '../App';
import { ApiClient } from '../utils/supabase/client';

interface CampaignListScreenProps {
  onSelectCampaign: (campaign: Campaign) => void;
  onViewDetails: (campaign: Campaign) => void;
  kioskSession?: KioskSession | null;
}

export function CampaignListScreen({ onSelectCampaign, onViewDetails, kioskSession }: CampaignListScreenProps) {
  const [isDetailedView, setIsDetailedView] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns from Supabase on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const result = await ApiClient.getCampaigns();
        setCampaigns(result.campaigns || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setError('Failed to load campaigns. Please try again.');
        // Fallback to mock data for demo
        setCampaigns(mockCampaigns);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Mock campaigns as fallback data
  const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Clean Water for All',
    description: 'Help provide clean drinking water to communities in need across developing nations.',
    goal: 50000,
    raised: 32500,
    image: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=400&h=300&fit=crop',
    category: 'Global Health',
    status: 'active',
    assignedKiosks: ['KIOSK-NYC-001', 'KIOSK-LA-003', 'KIOSK-CHI-004'],
    isGlobal: false,
    configuration: {
      predefinedAmounts: [25, 50, 100, 250, 500],
      allowCustomAmount: true,
      minCustomAmount: 1,
      maxCustomAmount: 10000,
      suggestedAmounts: [50, 100, 250],
      enableRecurring: true,
      recurringIntervals: ['monthly', 'quarterly'],
      defaultRecurringInterval: 'monthly',
      recurringDiscount: 5,
      displayStyle: 'grid',
      showProgressBar: true,
      showDonorCount: true,
      showRecentDonations: true,
      maxRecentDonations: 5,
      primaryCTAText: 'Help Provide Clean Water',
      secondaryCTAText: 'Learn More',
      urgencyMessage: 'Only 30 days left to reach our goal!',
      theme: 'default',
      requiredFields: ['email'],
      optionalFields: ['name', 'message'],
      enableAnonymousDonations: true,
      enableSocialSharing: true,
      shareMessage: 'Join me in providing clean water to communities in need!',
      enableDonorWall: true,
      enableComments: true
    }
  },
  {
    id: '2',
    title: 'Education for Every Child',
    description: 'Support education initiatives that give children access to quality learning materials and teachers.',
    goal: 75000,
    raised: 45300,
    image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
    category: 'Education',
    status: 'active',
    assignedKiosks: ['KIOSK-NYC-001', 'KIOSK-SF-002', 'KIOSK-CHI-004', 'KIOSK-MIA-005'],
    isGlobal: false,
    configuration: {
      predefinedAmounts: [50, 100, 200, 500, 1000],
      allowCustomAmount: true,
      minCustomAmount: 10,
      maxCustomAmount: 5000,
      suggestedAmounts: [100, 200, 500],
      enableRecurring: true,
      recurringIntervals: ['monthly', 'yearly'],
      defaultRecurringInterval: 'monthly',
      recurringDiscount: 10,
      displayStyle: 'grid',
      showProgressBar: true,
      showDonorCount: true,
      showRecentDonations: false,
      maxRecentDonations: 3,
      primaryCTAText: 'Fund Education',
      secondaryCTAText: 'See Impact',
      theme: 'vibrant',
      requiredFields: ['email', 'name'],
      optionalFields: ['phone'],
      enableAnonymousDonations: false,
      enableSocialSharing: true,
      enableDonorWall: true,
      enableComments: false
    }
  },
  {
    id: '3',
    title: 'Emergency Disaster Relief',
    description: 'Provide immediate assistance to families affected by natural disasters and emergencies.',
    goal: 100000,
    raised: 78900,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=300&fit=crop',
    category: 'Emergency Relief',
    status: 'active',
    assignedKiosks: ['KIOSK-NYC-001', 'KIOSK-LA-003', 'KIOSK-MIA-005'],
    isGlobal: false,
    configuration: {
      predefinedAmounts: [10, 25, 50, 100, 250, 500],
      allowCustomAmount: true,
      minCustomAmount: 5,
      maxCustomAmount: 25000,
      suggestedAmounts: [25, 50, 100],
      enableRecurring: false,
      recurringIntervals: ['monthly'],
      defaultRecurringInterval: 'monthly',
      displayStyle: 'list',
      showProgressBar: true,
      showDonorCount: true,
      showRecentDonations: true,
      maxRecentDonations: 10,
      primaryCTAText: 'Help Now',
      secondaryCTAText: 'Share',
      urgencyMessage: 'URGENT: Families need immediate help!',
      theme: 'minimal',
      requiredFields: ['email'],
      optionalFields: ['name', 'phone', 'message'],
      enableAnonymousDonations: true,
      enableSocialSharing: true,
      shareMessage: 'Help me support disaster relief efforts!',
      enableDonorWall: false,
      enableComments: true
    }
  },
  {
    id: '4',
    title: 'Global Emergency Fund',
    description: 'A worldwide emergency fund available across all locations for immediate crisis response.',
    goal: 500000,
    raised: 125000,
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
    category: 'Emergency Relief',
    status: 'active',
    isGlobal: true, // Shows on all kiosks
    configuration: {
      predefinedAmounts: [20, 50, 100, 200, 500],
      allowCustomAmount: true,
      minCustomAmount: 1,
      maxCustomAmount: 50000,
      suggestedAmounts: [50, 100, 200],
      enableRecurring: true,
      recurringIntervals: ['monthly', 'quarterly', 'yearly'],
      defaultRecurringInterval: 'monthly',
      displayStyle: 'grid',
      showProgressBar: true,
      showDonorCount: true,
      showRecentDonations: true,
      maxRecentDonations: 5,
      primaryCTAText: 'Donate to Emergency Fund',
      urgencyMessage: 'Always ready to help in crisis',
      theme: 'default',
      requiredFields: ['email'],
      optionalFields: ['name'],
      enableAnonymousDonations: true,
      enableSocialSharing: true,
      enableDonorWall: true,
      enableComments: false
    }
  }
];

  // Filter campaigns based on kiosk session
  const getAvailableCampaigns = () => {
    if (!kioskSession) {
      // If no kiosk session (admin mode), show all campaigns
      return campaigns;
    }

    // Get campaigns assigned to this kiosk or global campaigns
    const assignedCampaigns = campaigns.filter(campaign => 
      campaign.isGlobal || 
      (campaign.assignedKiosks && campaign.assignedKiosks.includes(kioskSession.kioskId))
    );

    // Apply kiosk settings
    const { maxCampaignsDisplay } = kioskSession.settings;
    if (maxCampaignsDisplay && assignedCampaigns.length > maxCampaignsDisplay) {
      return assignedCampaigns.slice(0, maxCampaignsDisplay);
    }

    return assignedCampaigns;
  };

  const availableCampaigns = getAvailableCampaigns();

  // Check if a campaign is the default/featured campaign for this kiosk
  const isDefaultCampaign = (campaignId: string) => {
    if (!kioskSession) return false;
    // For now, we'll consider the first assigned campaign as default
    // In a real app, this would be stored in kiosk settings
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
                : 'No active campaigns are currently available.'
              }
            </p>
          </div>
        ) : (
          <div className={
            kioskSession?.settings.displayMode === 'carousel' ? "space-y-4" :
            kioskSession?.settings.displayMode === 'list' || !isDetailedView ? "grid grid-cols-1 gap-3 sm:gap-4" :
            "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          }>
            {availableCampaigns.map((campaign) => (
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