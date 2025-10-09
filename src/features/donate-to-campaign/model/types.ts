import { Donation } from '../../../entities/donation';
import { PaymentResult } from '../../../shared/types';

export interface DonationFormData {
  amount: number;
  isRecurring: boolean;
  recurringInterval?: "monthly" | "quarterly" | "yearly";
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
