export type SubscriptionInterval = "month" | "year";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "unpaid";

export interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  customerId: string;
  campaignId: string;
  organizationId: string;
  interval: SubscriptionInterval;
  intervalCount?: number;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  startedAt?: string | Date | { seconds: number; nanoseconds?: number } | null;
  lastPaymentAt?: string | Date | { seconds: number; nanoseconds?: number } | null;
  nextPaymentAt?: string | Date | { seconds: number; nanoseconds?: number } | null;
  cancelReason?: string | null;
  currentPeriodEnd: string | Date | { seconds: number; nanoseconds?: number };
  createdAt: string | Date | { seconds: number; nanoseconds?: number };
  updatedAt: string | Date | { seconds: number; nanoseconds?: number };
  canceledAt?: string | Date | { seconds: number; nanoseconds?: number };
  lastFailedInvoice?: string;
  lastFailedAt?: string | Date | { seconds: number; nanoseconds?: number };
  metadata?: {
    donorEmail?: string;
    donorName?: string;
    platform?: string;
    [key: string]: any;
  };
}

export interface CreateSubscriptionRequest {
  amount: number;
  interval: SubscriptionInterval;
  intervalCount?: number;
  campaignId: string;
  donor: {
    email: string;
    name?: string;
    phone?: string;
  };
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  clientSecret?: string;
  status: SubscriptionStatus;
  success?: boolean;
  message?: string;
  requiresAction?: boolean;
}
