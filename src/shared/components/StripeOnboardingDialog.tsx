import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useToast } from '../ui/ToastProvider';

interface StripeOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: {
    id: string;
    name: string;
    stripe?: {
      accountId?: string;
      chargesEnabled?: boolean;
      payoutsEnabled?: boolean;
    };
  } | null;
  loading?: boolean;
}

export function StripeOnboardingDialog({
  open,
  onOpenChange,
  organization,
  loading = false,
}: StripeOnboardingDialogProps) {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const { showToast } = useToast();

  const handleStripeOnboarding = async () => {
    if (!organization?.id) {
      showToast('Organization ID not available for Stripe onboarding.', 'error');
      return;
    }

    if (!auth.currentUser) {
      showToast('No authenticated user found. Please log in again.', 'error');
      return;
    }

    try {
      setIsOnboarding(true);
      const idToken = await auth.currentUser.getIdToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        'https://createonboardinglink-j2f5w4qwxq-uc.a.run.app',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ orgId: organization.id }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || response.statusText || 'Failed to create onboarding link.'
        );
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No onboarding URL received from server.');
      }
    } catch (error: any) {
      console.error('Error creating Stripe onboarding link:', error);
      
      if (error.name === 'AbortError') {
        showToast('Request timed out. Please check your connection and try again.', 'error', 4000);
      } else {
        showToast(
          `Failed to start Stripe onboarding: ${error.message}`,
          'error',
          4000
        );
      }
    } finally {
      setIsOnboarding(false);
    }
  };

  const isFullyOnboarded =
    organization?.stripe?.chargesEnabled && organization?.stripe?.payoutsEnabled;
  const isPartiallyOnboarded =
    organization?.stripe?.chargesEnabled && !organization?.stripe?.payoutsEnabled;
  const isNotOnboarded = !organization?.stripe?.chargesEnabled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            {isFullyOnboarded ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <CreditCard className="h-5 w-5 text-yellow-600" />
            )}
            <span>Stripe Account Status</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isFullyOnboarded
              ? 'Your Stripe account is fully configured.'
              : 'Complete Stripe onboarding to accept donations.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading organization data...</p>
          ) : isNotOnboarded ? (
            <>
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Onboarding Required
                  </p>
                  <p className="text-sm text-yellow-700">
                    Your organization needs to complete Stripe onboarding to accept
                    donations and receive payouts. This process takes about 5-10 minutes.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStripeOnboarding}
                className="bg-yellow-600 hover:bg-yellow-700 w-full"
                disabled={isOnboarding}
              >
                {isOnboarding ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Complete Stripe Onboarding
                  </>
                )}
              </Button>
            </>
          ) : isPartiallyOnboarded ? (
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Account Under Review
                </p>
                <p className="text-sm text-blue-700">
                  Your Stripe account is being reviewed. Payouts will be enabled
                  shortly. You can already accept donations.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Fully Configured
                </p>
                <p className="text-sm text-green-700">
                  Your Stripe account is fully configured and ready to accept
                  donations and process payouts.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
