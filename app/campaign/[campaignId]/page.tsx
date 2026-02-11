'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/lib/auth-provider';
import { useState, useEffect, use } from 'react';
import { Campaign, GiftAidDetails } from '@/shared/types';
import { getCampaignById } from '@/shared/api/firestoreService';
import { isCampaignActiveForKioskDonation } from '@/shared/lib/campaignStatus';
import { CampaignDetailsContainer } from '@/features/kiosk-campaign-details';
import { GiftAidPage } from '@/features/kiosk-gift-aid';
import { KioskLoading } from '@/shared/ui/KioskLoading';

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

  // Unwrap the params Promise
  const { campaignId } = use(params);

  // Get URL params
  const initialAmount = searchParams?.get('amount')
    ? parseInt(searchParams.get('amount')!)
    : null;
  const showGiftAid = searchParams?.get('giftaid') === 'true';
  const isCustomAmount = searchParams?.get('custom') === 'true';
  const isRecurringSelection = searchParams?.get('recurring') === 'true';
  const recurringIntervalParam =
    (searchParams?.get('interval') as 'monthly' | 'quarterly' | 'yearly') ||
    campaign?.configuration?.defaultRecurringInterval ||
    'monthly';
  const fromDetails = searchParams?.get('from') === 'details';

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;

      try {
        setLoading(true);
        setError(null);
        const campaignData = await getCampaignById(campaignId);

        if (campaignData) {
          if (!isCampaignActiveForKioskDonation(campaignData as Campaign)) {
            setError('This campaign is not active for donations right now.');
            setCampaign(null);
            return;
          }
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

  // Back to campaign list
  const handleBackToList = () => {
    router.push('/campaigns');
  };

  // Back from gift aid - go to details if came from there, otherwise list
  const handleBackFromGiftAid = () => {
    if (fromDetails && initialAmount) {
      router.push(`/campaign/${campaignId}?preselect=${initialAmount}`);
    } else if (fromDetails) {
      router.push(`/campaign/${campaignId}`);
    } else {
      router.push('/campaigns');
    }
  };

  // Donate from details screen - check giftAidEnabled before routing
  const handleDonate = (
    _campaign: Campaign,
    amount: number,
    options: { isRecurring: boolean; recurringInterval: 'monthly' | 'quarterly' | 'yearly' }
  ) => {
    const recurringQuery = options.isRecurring ? `&recurring=true&interval=${options.recurringInterval}` : '';
    
    // Check if Gift Aid is enabled for this campaign
    if (_campaign.configuration.giftAidEnabled) {
      // Route to Gift Aid flow
      router.push(`/campaign/${campaignId}?amount=${amount}&giftaid=true&from=details${recurringQuery}`);
    } else {
      // Skip Gift Aid and go directly to payment
      const amountPence = Math.round(amount * 100);
      const donation = {
        campaignId: _campaign.id,
        amount: amountPence,
        isGiftAid: false,
        giftAidAccepted: false, // Explicitly set to false when disabled
        isRecurring: options.isRecurring,
        recurringInterval: options.isRecurring ? options.recurringInterval : undefined,
        kioskId: currentKioskSession?.kioskId,
        donorName: '',
      };
      sessionStorage.setItem('donation', JSON.stringify(donation));
      sessionStorage.setItem('paymentBackPath', `/campaign/${campaignId}`);
      router.push(`/payment/${campaignId}`);
    }
  };

  // Gift Aid accepted - save details and go to payment
  const handleAcceptGiftAid = (details: GiftAidDetails) => {
    const donation = {
      campaignId: campaign?.id,
      amount: details.donationAmount,
      isGiftAid: true,
      giftAidAccepted: true, // Explicitly set to true when accepted
      isRecurring: isRecurringSelection,
      recurringInterval: isRecurringSelection ? recurringIntervalParam : undefined,
      giftAidDetails: details,
      kioskId: currentKioskSession?.kioskId,
      donorName: `${details.firstName} ${details.surname}`,
    };
    sessionStorage.setItem('donation', JSON.stringify(donation));
    sessionStorage.setItem('giftAidData', JSON.stringify(details));
    sessionStorage.setItem('paymentBackPath', `${window.location.pathname}${window.location.search}`);
    router.push(`/payment/${campaignId}`);
  };

  // Gift Aid declined - save donation and go to payment
  const handleDeclineGiftAid = (finalAmount: number) => {
    const amountPence = Math.round(finalAmount * 100);
    const donation = {
      campaignId: campaign?.id,
      amount: amountPence,
      isGiftAid: false,
      giftAidAccepted: false, // Explicitly set to false when declined
      isRecurring: isRecurringSelection,
      recurringInterval: isRecurringSelection ? recurringIntervalParam : undefined,
      kioskId: currentKioskSession?.kioskId,
      donorName: '',
    };
    sessionStorage.setItem('donation', JSON.stringify(donation));
    sessionStorage.setItem('paymentBackPath', `${window.location.pathname}${window.location.search}`);
    router.push(`/payment/${campaignId}`);
  };

  if (showGiftAid && loading) {
    return (
      <KioskLoading
        message="Loading Gift Aid details..."
        submessage="Preparing your Gift Aid options."
      />
    );
  }

  // Show Gift Aid page (with sliding panels) - only if Gift Aid is enabled
  if (showGiftAid && campaign) {
    // Check if Gift Aid is enabled for this campaign
    if (!campaign.configuration.giftAidEnabled) {
      // Gift Aid is disabled, redirect to payment directly
      const amountPence = Math.round((initialAmount || 0) * 100);
      const donation = {
        campaignId: campaign.id,
        amount: amountPence,
        isGiftAid: false,
        giftAidAccepted: false, // Explicitly set to false when disabled
        isRecurring: isRecurringSelection,
        recurringInterval: isRecurringSelection ? recurringIntervalParam : undefined,
        kioskId: currentKioskSession?.kioskId,
        donorName: '',
      };
      sessionStorage.setItem('donation', JSON.stringify(donation));
      sessionStorage.setItem('paymentBackPath', fromDetails ? `/campaign/${campaignId}` : '/campaigns');
      router.push(`/payment/${campaignId}`);
      return null; // Prevent rendering while redirecting
    }

    return (
      <GiftAidPage
        campaign={campaign}
        amount={initialAmount || 0}
        isCustomAmount={isCustomAmount || !initialAmount}
        currency={currentKioskSession?.organizationCurrency || 'GBP'}
        onAcceptGiftAid={handleAcceptGiftAid}
        onDeclineGiftAid={handleDeclineGiftAid}
        onBack={handleBackFromGiftAid}
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
      currency={currentKioskSession?.organizationCurrency || 'GBP'}
      initialAmount={preselectAmount || initialAmount}
      onBack={handleBackToList}
      onDonate={handleDonate}
    />
  );
}
