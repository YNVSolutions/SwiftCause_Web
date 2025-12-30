import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '../../../shared/ui/dialog';
import { Button } from '../../../shared/ui/button';
import { CreditCard, RefreshCw, AlertCircle, CheckCircle, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';
import { auth } from '../../../shared/lib/firebase';
import { useToast } from '../../../shared/ui/ToastProvider';

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
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-6 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative">
            <div className="flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CreditCard className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
            </div>
            <DialogTitle className="text-xl sm:text-3xl font-bold text-white text-center mb-1 sm:mb-2">
              {isFullyOnboarded ? 'Account Active' : 'Connect with Stripe'}
            </DialogTitle>
            <DialogDescription className="text-indigo-100 text-center text-xs sm:text-base max-w-md mx-auto px-2">
              {isFullyOnboarded
                ? 'Your payment processing is fully configured'
                : 'Enable secure payment processing for your organization'}
            </DialogDescription>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 sm:px-8 sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : isNotOnboarded ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Benefits Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="flex flex-col items-center text-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1 sm:mb-3">
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">Secure</h4>
                  <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">Bank-level encryption</p>
                </div>

                <div className="flex flex-col items-center text-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center mb-1 sm:mb-3">
                    <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">Fast Setup</h4>
                  <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">5-10 minutes</p>
                </div>

                <div className="flex flex-col items-center text-center p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center mb-1 sm:mb-3">
                    <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1">Grow</h4>
                  <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">Accept donations</p>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-r-xl p-3 sm:p-5">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-yellow-900 mb-1">
                      Complete Onboarding Required
                    </h4>
                    <p className="text-xs sm:text-sm text-yellow-800 leading-relaxed">
                      Connect your Stripe account to start accepting donations and receiving payouts. 
                      <span className="hidden sm:inline"> You'll be redirected to Stripe's secure platform to complete the setup.</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* What You'll Need - Hidden on mobile */}
              <div className="hidden sm:block bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">What you'll need:</h4>
                <ul className="space-y-2">
                  {[
                    'Business or organization details',
                    'Bank account information',
                    'Tax identification number',
                    'Representative information'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleStripeOnboarding}
                disabled={isOnboarding}
                className="w-full h-11 sm:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isOnboarding ? (
                  <>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    <span className="text-xs sm:text-base">Connecting...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-xs sm:text-base">Start Stripe Onboarding</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-[10px] sm:text-xs text-center text-gray-500">
                By continuing, you'll be redirected to Stripe's secure platform
              </p>
            </div>
          ) : isPartiallyOnboarded ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">
                    Account Under Review
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-800 leading-relaxed mb-3 sm:mb-4">
                    Your Stripe account is being reviewed by their team. This typically takes 1-2 business days.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-gray-700">Charges enabled - You can accept donations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                      <span className="text-xs sm:text-sm text-gray-700">Payouts pending - Under review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-green-900 mb-2">
                    All Systems Go! 🎉
                  </h4>
                  <p className="text-xs sm:text-sm text-green-800 leading-relaxed mb-3 sm:mb-4">
                    Your Stripe account is fully configured and ready to process payments.
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs font-medium text-gray-600">Charges</p>
                        <p className="text-xs sm:text-sm font-semibold text-green-700">Enabled</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-2 sm:p-3 bg-white rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs font-medium text-gray-600">Payouts</p>
                        <p className="text-xs sm:text-sm font-semibold text-green-700">Enabled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-8 sm:py-4 bg-gray-50 border-t border-gray-200">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full sm:w-auto sm:min-w-[120px] border-gray-300 hover:bg-gray-100 text-sm"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
