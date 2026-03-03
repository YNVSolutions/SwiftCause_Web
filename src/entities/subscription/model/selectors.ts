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
  interval: SubscriptionInterval,
  intervalCount: number = 1
): string => {
  if (interval === "year") return "Yearly";
  if (intervalCount === 3) return "Quarterly";
  return "Monthly";
};

/**
 * Get short interval display (for UI badges)
 */
export const getSubscriptionShortInterval = (
  interval: SubscriptionInterval,
  intervalCount: number = 1
): string => {
  if (interval === "year") return "/yr";
  if (intervalCount === 3) return "/qtr";
  return "/mo";
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
  interval: SubscriptionInterval,
  intervalCount: number = 1
): "monthly" | "quarterly" | "yearly" => {
  if (interval === "year") return "yearly";
  if (intervalCount === 3) return "quarterly";
  return "monthly";
};
