import { useState } from "react";
import { Button } from "../../shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../shared/ui/card";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Building2,
  Mail,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useOrganization } from "../../shared/lib/hooks/useOrganization";
import { AdminSession, Screen, Permission } from "../../shared/types";
import { auth } from "../../shared/lib/firebase";
import { AdminLayout } from "./AdminLayout";

interface BankDetailsProps {
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  userSession: AdminSession;
  hasPermission: (permission: Permission) => boolean;
}

export function BankDetails({ onNavigate, onLogout, userSession, hasPermission }: BankDetailsProps) {
  const { organization, loading: orgLoading, error: orgError } = useOrganization(
    userSession.user.organizationId ?? null
  );
  const [isStripeOnboardingLoading, setIsStripeOnboardingLoading] = useState(false);

  const handleStripeOnboarding = async () => {
    if (!organization?.id) {
      console.error("Organization ID not available for Stripe onboarding.");
      return;
    }

    if (!auth.currentUser) {
      console.error("No authenticated Firebase user found.");
      return;
    }

    try {
      setIsStripeOnboardingLoading(true);
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('https://createonboardinglink-j2f5w4qwxq-uc.a.run.app', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ orgId: organization.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || response.statusText || "Failed to create onboarding link.");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating Stripe onboarding link:", error);
      alert(`Failed to start Stripe onboarding: ${(error as Error).message}`);
    } finally {
      setIsStripeOnboardingLoading(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (orgError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading organization data: {orgError}</p>
        </div>
      </div>
    );
  }

  const stripeConnected = organization?.stripe?.accountId;
  const chargesEnabled = organization?.stripe?.chargesEnabled;
  const payoutsEnabled = organization?.stripe?.payoutsEnabled;

  return (
    <AdminLayout onNavigate={onNavigate} onLogout={onLogout} userSession={userSession} hasPermission={hasPermission}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Details</h1>
        <p className="text-gray-600">Manage your payment settings and Stripe integration</p>
      </div>

      {/* Stripe Account Status Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Stripe Account Status</CardTitle>
              <CardDescription className="text-base">
                Review the current status of your Stripe integration.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!stripeConnected ? (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">Action Required</h3>
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      Your organization needs to complete Stripe onboarding to accept donations and receive payouts.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleStripeOnboarding}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
                disabled={isStripeOnboardingLoading}
              >
                {isStripeOnboardingLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Complete Stripe Onboarding
                  </>
                )}
              </Button>
            </>
          ) : !chargesEnabled || !payoutsEnabled ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Under Review</h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Your Stripe account is being reviewed. Payouts will be enabled shortly.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">All Set!</h3>
                  <p className="text-sm text-green-800 leading-relaxed">
                    Your Stripe account is fully configured and ready to accept donations and process payouts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Account Details */}
          {stripeConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className={`w-5 h-5 ${chargesEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Charges</p>
                  <p className="text-xs text-gray-500">
                    {chargesEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className={`w-5 h-5 ${payoutsEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Payouts</p>
                  <p className="text-xs text-gray-500">
                    {payoutsEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Organization Details</CardTitle>
              <CardDescription>Your organization information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Organization Name</p>
                <p className="text-sm text-gray-900">{organization?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Admin Email</p>
                <p className="text-sm text-gray-900">{userSession.user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Currency</p>
                <p className="text-sm text-gray-900">{organization?.currency || 'USD'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Member Since</p>
                <p className="text-sm text-gray-900">
                  {userSession.user.createdAt 
                    ? new Date(userSession.user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminLayout>
  );
}
