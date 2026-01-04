import React from 'react';
import { LogOut } from 'lucide-react';
import { CampaignListPageProps } from '../types';
import {
  LoadingState,
  ErrorState,
  EmptyState,
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
  onViewDetails,
  onLogout,
}) => {
  const { campaigns, loading, error, layoutMode } = state;
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5/6 mx-auto px-6 lg:px-12 xl:px-16 py-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="SwiftCause" className="h-10 w-10" />
              <div className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
                <span>Swift</span>
                <span className="text-[#0DA573]">Cause</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="flex items-center justify-center h-11 w-11 rounded-xl border border-[#f43f5e33] bg-white text-[#f43f5e] shadow-sm hover:bg-[#f43f5e10] hover:border-[#f43f5e55] transition-colors"
            >
              <LogOut className="h-5 w-5" strokeWidth={2.4} />
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] leading-tight">
            Choose a cause
          </h1>
          <p className="text-base sm:text-lg text-[#394150] mt-2">
            Browse our verified campaigns and help make a difference today.
          </p>
        </div>
      </header>

      <main className="max-w-5/6 mx-auto px-6 lg:px-12 xl:px-16 py-6 overflow-y-auto">
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
                onViewDetails={onViewDetails}
              />
            </div>

            {/* Small screens: Layout based on kiosk settings */}
            <div className="lg:hidden">
              {layoutMode === 'carousel' && (
                <CampaignCarousel
                  campaigns={campaigns}
                  currency={currency}
                  onSelectCampaign={onSelectCampaign}
                  onViewDetails={onViewDetails}
                />
              )}

              {layoutMode === 'list' && (
                <CampaignListLayout
                  campaigns={campaigns}
                  currency={currency}
                  onSelectCampaign={onSelectCampaign}
                  onViewDetails={onViewDetails}
                />
              )}

              {layoutMode === 'grid' && (
                <CampaignGrid
                  campaigns={campaigns}
                  currency={currency}
                  onSelectCampaign={onSelectCampaign}
                  onViewDetails={onViewDetails}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
