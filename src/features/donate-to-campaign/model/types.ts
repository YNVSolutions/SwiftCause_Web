import { Donation } from '../../../entities/donation';
import { PaymentResult } from '../../../shared/types';

export enum RecurringInterval {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export const getRecurringIntervalLabel = (interval: RecurringInterval): string => {
  switch (interval) {
    case RecurringInterval.MONTHLY:
      return 'Monthly';
    case RecurringInterval.QUARTERLY:
      return 'Quarterly';
    case RecurringInterval.YEARLY:
      return 'Yearly';
    default:
      return 'Monthly';
  }
};

export interface DonationFormData {
  amount: number;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  donorEmail?: string;
  donorName?: string;
  donorPhone?: string;
  donorMessage?: string;
  isAnonymous?: boolean;
  isGiftAid?: boolean;
}

export interface DonationState {
  donation: Donation | null;
  isProcessing: boolean;
  error: string | null;
}

export interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  result: PaymentResult | null;
}
