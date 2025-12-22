import { Campaign } from '@/shared/types';

// State for the campaign details feature
export interface CampaignDetailsState {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  selectedAmount: number | null;
  customAmount: string;
  currentImageIndex: number;
}

// Props for the main campaign details page
export interface CampaignDetailsPageProps {
  state: CampaignDetailsState;
  currency: string;
  onBack: () => void;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
  onDonate: () => void;
  onImageChange: (index: number) => void;
}

// Props for header
export interface CampaignDetailsHeaderProps {
  onBack: () => void;
}

// Props for image carousel
export interface ImageCarouselProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  fallbackImage?: string;
}

// Props for amount selector
export interface AmountSelectorProps {
  amounts: number[];
  selectedAmount: number | null;
  customAmount: string;
  currency: string;
  onSelectAmount: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;
}

// Props for donate button
export interface DonateButtonProps {
  disabled: boolean;
  onClick: () => void;
}

// Props for video player
export interface VideoPlayerProps {
  videoUrl: string | undefined;
}

// Props for loading state
export interface LoadingStateProps {
  message?: string;
}

// Props for error state
export interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}
