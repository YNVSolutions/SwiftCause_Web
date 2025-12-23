import { useState, useCallback, useEffect } from 'react';
import { Campaign } from '@/shared/types';
import { CampaignDetailsState } from '../types';

interface UseCampaignDetailsStateProps {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  initialAmount?: number | null;
}

interface UseCampaignDetailsStateReturn {
  state: CampaignDetailsState;
  actions: {
    setSelectedAmount: (amount: number | null) => void;
    setCustomAmount: (value: string) => void;
    setCurrentImageIndex: (index: number) => void;
    getEffectiveAmount: () => number;
  };
}

export function useCampaignDetailsState({
  campaign,
  loading,
  error,
  initialAmount = null,
}: UseCampaignDetailsStateProps): UseCampaignDetailsStateReturn {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(initialAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-select middle predefined amount when campaign loads
  useEffect(() => {
    if (campaign && !initialAmount) {
      const predefinedAmounts = campaign.configuration?.predefinedAmounts || [10, 25, 100];
      if (predefinedAmounts.length >= 2) {
        // Select middle amount (index 1 for 3 items)
        const middleIndex = Math.floor(predefinedAmounts.length / 2);
        setSelectedAmount(predefinedAmounts[Math.min(middleIndex, 1)]);
      } else if (predefinedAmounts.length === 1) {
        setSelectedAmount(predefinedAmounts[0]);
      }
    }
  }, [campaign, initialAmount]);

  const handleSetSelectedAmount = useCallback((amount: number | null) => {
    setSelectedAmount(amount);
    if (amount !== null && amount > 0) {
      setCustomAmount('');
    }
  }, []);

  const handleSetCustomAmount = useCallback((value: string) => {
    setCustomAmount(value);
  }, []);

  const handleSetCurrentImageIndex = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  const getEffectiveAmount = useCallback(() => {
    // Custom amount takes priority if entered
    if (customAmount && parseFloat(customAmount) > 0) {
      return parseFloat(customAmount);
    }
    if (selectedAmount !== null && selectedAmount > 0) {
      return selectedAmount;
    }
    return 0;
  }, [selectedAmount, customAmount]);

  const state: CampaignDetailsState = {
    campaign,
    loading,
    error,
    selectedAmount,
    customAmount,
    currentImageIndex,
  };

  const actions = {
    setSelectedAmount: handleSetSelectedAmount,
    setCustomAmount: handleSetCustomAmount,
    setCurrentImageIndex: handleSetCurrentImageIndex,
    getEffectiveAmount,
  };

  return { state, actions };
}
