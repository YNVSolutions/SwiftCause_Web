import React from 'react';
import { LogOut } from 'lucide-react';
import { KioskHeader } from '@/shared/components/KioskHeader';
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
  const currency = kioskSession?.organizationCurrency || 'GBP';

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50/60 relative overflow-hidden">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-green-100 blur-3xl opacity-60" />
      <div className="absolute top-1/3 -left-20 h-64 w-64 rounded-full bg-emerald-100 blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-green-50 blur-3xl opacity-80" />

      <div className="relative z-10">
        <KioskHeader
          variant="hero"
          title="Choose a cause"
          subtitle="Browse our verified campaigns and help make a difference today."
          logoSrc="/logo.png"
          logoAlt="SwiftCause"
          brandPrimary="Swift"
          brandAccent="Cause"
          accentColor="#16A34A"
          actionButton={
            <button
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
              className="flex items-center justify-center h-10 w-10 rounded-lg border border-green-200 bg-white/90 text-green-700 shadow-sm hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <LogOut className="h-4.5 w-4.5" strokeWidth={2.4} />
            </button>
          }
        />

        <main className="max-w-5/6 mx-auto px-6 lg:px-12 xl:px-16 py-4 overflow-y-auto">
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
    </div>
  );
};
