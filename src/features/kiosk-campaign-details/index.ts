// Public API for kiosk-campaign-details feature

// Container (main entry point)
export { CampaignDetailsContainer } from './containers';

// Page component (for direct use if needed)
export { CampaignDetailsPage } from './pages';

// Individual components (for composition)
export {
  CampaignDetailsHeader,
  ImageCarousel,
  AmountSelector,
  DonateButton,
  VideoPlayer,
  LoadingState,
  ErrorState,
} from './components';

// Hooks
export { useCampaignDetailsState } from './hooks';

// Types
export type {
  CampaignDetailsState,
  CampaignDetailsPageProps,
  CampaignDetailsHeaderProps,
  ImageCarouselProps,
  AmountSelectorProps,
  DonateButtonProps,
  VideoPlayerProps,
  LoadingStateProps,
  ErrorStateProps,
} from './types';

// Utilities
export { getYouTubeVideoId, getYouTubeEmbedUrl } from './lib';
