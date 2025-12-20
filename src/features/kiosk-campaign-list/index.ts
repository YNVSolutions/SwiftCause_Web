// Public API for kiosk-campaign-list feature

// Container (main entry point)
export { CampaignListContainer } from './containers';

// Page component (for direct use if needed)
export { CampaignListPage } from './pages';

// Individual components (for composition)
export {
  LoadingState,
  ErrorState,
  EmptyState,
  CampaignListHeader,
  Pagination,
  CampaignCard,
  CampaignGrid,
  CampaignListLayout,
  CampaignCarousel,
} from './components';

// Hooks
export { useCampaignListState } from './hooks';

// Types
export type {
  CampaignLayoutMode,
  CampaignListState,
  CampaignListPageProps,
  CampaignCardProps,
  CampaignGridProps,
  CampaignListLayoutProps,
  CampaignCarouselProps,
  PaginationProps,
  CampaignListHeaderProps,
  LoadingStateProps,
  ErrorStateProps,
  EmptyStateProps,
} from './types';

// Utilities
export { getTop3Amounts, getProgressPercentage, paginateCampaigns } from './lib';
