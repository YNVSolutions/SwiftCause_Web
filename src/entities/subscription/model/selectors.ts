import type { Subscription, SubscriptionInterval } from "./types";

/**
 * Check if subscription is active
 */
export const isSubscriptionActive = (subscription: Subscription): boolean => {
  return subscription.status === "active";
};

/**
 * Check if subscription is canceled
 */
export const isSubscriptionCanceled = (subscription: Subscription): boolean => {
  return subscription.status === "canceled";
};

/**
 * Check if subscription has payment issues
 */
export const isSubscriptionPastDue = (subscription: Subscription): boolean => {
  return subscription.status === "past_due";
};

/**
 * Get human-readable interval display
 */
export const getSubscriptionDisplayInterval = (
  interval: SubscriptionInterval
): string => {
  const map: Record<SubscriptionInterval, string> = {
    month: "Monthly",
    year: "Yearly",
  };
  return map[interval] || interval;
};

/**
 * Get short interval display (for UI badges)
 */
export const getSubscriptionShortInterval = (
  interval: SubscriptionInterval
): string => {
  const map: Record<SubscriptionInterval, string> = {
    month: "/mo",
    year: "/yr",
  };
  return map[interval] || "";
};

/**
 * Format subscription amount for display
 */
export const formatSubscriptionAmount = (
  amount: number,
  currency: string = "usd"
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount / 100); // Stripe amounts are in cents
};

/**
 * Map campaign interval format to Stripe interval format
 */
export const mapToStripeInterval = (
  interval: "monthly" | "quarterly" | "yearly"
): SubscriptionInterval => {
  if (interval === "monthly") return "month";
  if (interval === "yearly") return "year";
  // For quarterly, we'll use month with quantity=3 or just default to month
  return "month";
};

/**
 * Map Stripe interval format to campaign interval format
 */
export const mapFromStripeInterval = (
  interval: SubscriptionInterval
): "monthly" | "yearly" => {
  if (interval === "month") return "monthly";
  if (interval === "year") return "yearly";
  return "monthly";
};
