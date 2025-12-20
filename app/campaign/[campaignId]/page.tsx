'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/lib/auth-provider';
import { useState, useEffect, use } from 'react';
import { Campaign, GiftAidDetails } from '@/shared/types';
import { getCampaignById } from '@/shared/api/firestoreService';
import { CampaignDetailsContainer } from '@/features/kiosk-campaign-details';
import { GiftAidBoostScreen } from '@/views/campaigns/GiftAidBoostScreen';
import { GiftAidDetailsScreen } from '@/views/campaigns/GiftAidDetailsScreen';

export default function CampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentKioskSession } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGiftAidDetails, setShowGiftAidDetails] = useState(false);
  const [selectedGiftAidAmount, setSelectedGiftAidAmount] = useState<number | null>(null);

  // Unwrap the params Promise
  const { campaignId } = use(params);

  // Get URL params
  const initialAmount = searchParams?.get('amount')
    ? parseInt(searchParams.get('amount')!)
    : null;
  const showGiftAid = searchParams?.get('giftaid') === 'true';
  const isCustomAmount = searchParams?.get('custom') === 'true';
  const fromDetails = searchParams?.get('from') === 'details';

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;

      try {
        setLoading(true);
        setError(null);
        const campaignData = await getCampaignById(campaignId);

        if (campaignData) {
          setCampaign(campaignData as Campaign);
        } else {
          setError('Campaign not found');
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  // Set initial gift aid amount from URL
  useEffect(() => {
    if (showGiftAid && initialAmount) {
      setSelectedGiftAidAmount(initialAmount);
    } else if (showGiftAid && isCustomAmount) {
      // Custom amount mode - start with 0 or default
      setSelectedGiftAidAmount(0);
    }
  }, [showGiftAid, initialAmount, isCustomAmount]);

  // Back to campaign list
  const handleBackToList = () => {
    router.push('/campaigns');
  };

  // Back from gift aid screens - go to details if came from there, otherwise list
  const handleBackFromGiftAid = () => {
    if (fromDetails && initialAmount) {
      // Go back to details with amount pre-selected
      router.push(`/campaign/${campaignId}?preselect=${initialAmount}`);
    } else if (fromDetails) {
      // Go back to details without amount
      router.push(`/campaign/${campaignId}`);
    } else {
      // Came from list, go back to list
      router.push('/campaigns');
    }
  };

  // Donate from details screen - add from=details param
  const handleDonate = (_campaign: Campaign, amount: number) => {
    router.push(`/campaign/${campaignId}?amount=${amount}&giftaid=true&from=details`);
  };

  const handleAcceptGiftAid = (finalAmount: number) => {
    setSelectedGiftAidAmount(finalAmount);
    setShowGiftAidDetails(true);
  };

  const handleDeclineGiftAid = (finalAmount: number) => {
    const donation = {
      campaignId: campaign?.id,
      amount: finalAmount,
      isGiftAid: false,
      kioskId: currentKioskSession?.kioskId,
      donorName: '',
    };
    sessionStorage.setItem('donation', JSON.stringify(donation));
    router.push(`/payment/${campaignId}`);
  };

  const handleGiftAidDetailsSubmit = (details: GiftAidDetails) => {
    const donation = {
      campaignId: campaign?.id,
      amount: selectedGiftAidAmount,
      isGiftAid: true,
      giftAidDetails: details,
      kioskId: currentKioskSession?.kioskId,
      donorName: `${details.firstName} ${details.surname}`,
    };
    sessionStorage.setItem('donation', JSON.stringify(donation));
    sessionStorage.setItem('giftAidData', JSON.stringify(details));
    router.push(`/payment/${campaignId}`);
  };

  const handleBackFromGiftAidDetails = () => {
    setShowGiftAidDetails(false);
  };

  // Show Gift Aid Details screen
  if (showGiftAid && showGiftAidDetails && campaign && selectedGiftAidAmount) {
    return (
      <GiftAidDetailsScreen
        campaign={campaign}
        amount={selectedGiftAidAmount}
        onSubmit={handleGiftAidDetailsSubmit}
        onBack={handleBackFromGiftAidDetails}
        organizationCurrency={currentKioskSession?.organizationCurrency}
      />
    );
  }

  // Show Gift Aid Boost screen
  if (showGiftAid && campaign && (selectedGiftAidAmount !== null || isCustomAmount)) {
    return (
      <GiftAidBoostScreen
        campaign={campaign}
        amount={selectedGiftAidAmount || 0}
        isCustomAmount={isCustomAmount}
        onAcceptGiftAid={handleAcceptGiftAid}
        onDeclineGiftAid={handleDeclineGiftAid}
        onBack={handleBackFromGiftAid}
        organizationCurrency={currentKioskSession?.organizationCurrency}
      />
    );
  }

  // Get preselected amount for details screen (when coming back from gift aid)
  const preselectAmount = searchParams?.get('preselect')
    ? parseInt(searchParams.get('preselect')!)
    : null;

  // Show Campaign Details
  return (
    <CampaignDetailsContainer
      campaign={campaign}
      loading={loading}
      error={error}
      currency={currentKioskSession?.organizationCurrency || 'USD'}
      initialAmount={preselectAmount || initialAmount}
      onBack={handleBackToList}
      onDonate={handleDonate}
    />
  );
}
