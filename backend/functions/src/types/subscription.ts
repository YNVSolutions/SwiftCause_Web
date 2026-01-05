export type RecurringInterval = 'monthly' | 'quarterly' | 'yearly';

export interface SetupIntentRequest {
  campaignId?: string;
  interval?: RecurringInterval;
}

export interface SetupIntentResponse {
  clientSecret: string;
  customerId: string;
}

export interface CreateSubscriptionRequest {
  campaignId: string;
  interval: RecurringInterval;
  amount: number;
  currency?: string;
  paymentMethodId: string;
  isGiftAid?: boolean;
  platform?: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  status: string;
  paymentIntentClientSecret?: string;
}
