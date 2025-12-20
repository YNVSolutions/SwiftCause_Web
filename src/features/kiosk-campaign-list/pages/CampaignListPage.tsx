import React from 'react';
import { CampaignListPageProps } from '../types';
import {
  LoadingState,
  ErrorState,
  EmptyState,
  CampaignListHeader,
  Pagination,
  CampaignGrid,
  CampaignListLayout,
  CampaignCarousel,
} from '../components';

/**
 * Pure presentational component for the Campaign List page.
 * Receives all state and callbacks as props - no business logic here.
 *
 * Layout behavior:
 * - Large screens (lg+): Always shows grid layout
 * - Small screens: Shows layout based on kiosk settings (grid/list/carousel)
 */
export const CampaignListPage: React.FC<CampaignListPageProps> = ({
  state,
  kioskSession,
  onSelectCampaign,
  onPageChange,
  onLogout,
}) => {
  const { campaigns, loading, error, currentPage, totalPages, layoutMode } = state;
  const currency = kioskSession?.organizationCurrency || 'USD';

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  // Main content
  return (
    <div className="min-h-screen bg-white">
      <CampaignListHeader onBack={onLogout} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {campaigns.length === 0 ? (
          <EmptyState kioskName={kioskSession?.kioskName} />
        ) : (
          <>
            {/* Large screens: Always grid */}
            <div className="hidden lg:block">
              <CampaignGrid
                campaigns={campaigns}
                currency={currency}
                onSelectCampaign={onSelectCampaign}
              />
            </div>

            {/* Small screens: Layout based on kiosk settings */}
            <div className="lg:hidden">
              {layoutMode === 'carousel' && (
                <CampaignCarousel
                  campaigns={campaigns}
                  currency={currency}
                  onSelectCampaign={onSelectCampaign}
                />
              )}

              {layoutMode === 'list' && (
                <CampaignListLayout
                  campaigns={campaigns}
                  currency={currency}
                  onSelectCampaign={onSelectCampaign}
                />
              )}

              {layoutMode === 'grid' && (
                <CampaignGrid
                  campaigns={campaigns}
                  currency={currency}
                  onSelectCampaign={onSelectCampaign}
                />
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        )}
      </main>
    </div>
  );
};
