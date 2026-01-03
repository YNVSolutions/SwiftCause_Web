'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/shared/lib/auth-provider';
import { useState, useEffect, use } from 'react';
import { Campaign, GiftAidDetails } from '@/shared/types';
import { getCampaignById } from '@/shared/api/firestoreService';
import { CampaignDetailsContainer } from '@/features/kiosk-campaign-details';
import { GiftAidPage } from '@/features/kiosk-gift-aid';

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

  // Donate from details screen - add from=details param
  const handleDonate = (
    _campaign: Campaign,
    amount: number,
    options: { isRecurring: boolean; recurringInterval: 'monthly' | 'quarterly' | 'yearly' }
  ) => {
    const recurringQuery = options.isRecurring ? `&recurring=true&interval=${options.recurringInterval}` : '';
    router.push(`/campaign/${campaignId}?amount=${amount}&giftaid=true&from=details${recurringQuery}`);
  };

  // Gift Aid accepted - save details and go to payment
  const handleAcceptGiftAid = (details: GiftAidDetails) => {
    const donation = {
      campaignId: campaign?.id,
      amount: details.donationAmount,
      isGiftAid: true,
      isRecurring: isRecurringSelection,
      recurringInterval: isRecurringSelection ? recurringIntervalParam : undefined,
      giftAidDetails: details,
      kioskId: currentKioskSession?.kioskId,
      donorName: `${details.firstName} ${details.surname}`,
    };
    sessionStorage.setItem('donation', JSON.stringify(donation));
    sessionStorage.setItem('giftAidData', JSON.stringify(details));
    router.push(`/payment/${campaignId}`);
  };

  // Gift Aid declined - save donation and go to payment
  const handleDeclineGiftAid = (finalAmount: number) => {
    const donation = {
      campaignId: campaign?.id,
      amount: finalAmount,
      isGiftAid: false,
      isRecurring: isRecurringSelection,
      recurringInterval: isRecurringSelection ? recurringIntervalParam : undefined,
      kioskId: currentKioskSession?.kioskId,
      donorName: '',
    };
    sessionStorage.setItem('donation', JSON.stringify(donation));
    router.push(`/payment/${campaignId}`);
  };

  // Show Gift Aid page (with sliding panels)
  if (showGiftAid && campaign) {
    return (
      <GiftAidPage
        campaign={campaign}
        amount={initialAmount || 0}
        isCustomAmount={isCustomAmount || !initialAmount}
        currency={currentKioskSession?.organizationCurrency || 'USD'}
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
      currency={currentKioskSession?.organizationCurrency || 'USD'}
      initialAmount={preselectAmount || initialAmount}
      onBack={handleBackToList}
      onDonate={handleDonate}
    />
  );
}
