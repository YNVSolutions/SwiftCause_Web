// Donation-related types
import { RecurringInterval } from '../../features/donate-to-campaign/model';

export interface Donation {
  campaignId: string;
  amount: number;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  id?: string;
  donorEmail?: string;
  donorName?: string;
  donorPhone?: string;
  donorMessage?: string;
  isAnonymous?: boolean;
  timestamp?: string;
  kioskId?: string;
  transactionId?: string;
  isGiftAid?: boolean;
  organizationId?: string;
}
