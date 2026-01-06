import { useMemo } from 'react';

interface Organization {
  id: string;
  name: string;
  stripe?: {
    accountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  };
}

export function useStripeOnboarding(organization: Organization | null) {
  const isStripeOnboarded = useMemo(() => {
    if (!organization?.stripe) return false;
    // Consider onboarded if chargesEnabled is true (as per existing logic)
    return organization.stripe.chargesEnabled === true;
  }, [organization]);

  const isFullyOnboarded = useMemo(() => {
    if (!organization?.stripe) return false;
    return (
      organization.stripe.chargesEnabled === true &&
      organization.stripe.payoutsEnabled === true
    );
  }, [organization]);

  const isPartiallyOnboarded = useMemo(() => {
    if (!organization?.stripe) return false;
    return (
      organization.stripe.chargesEnabled === true &&
      organization.stripe.payoutsEnabled !== true
    );
  }, [organization]);

  return {
    isStripeOnboarded,
    isFullyOnboarded,
    isPartiallyOnboarded,
    needsOnboarding: !isStripeOnboarded,
  };
}
