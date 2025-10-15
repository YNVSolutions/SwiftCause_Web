// Donation-related types
export interface Donation {
  campaignId: string;
  amount: number;
  isRecurring: boolean;
  recurringInterval?: "monthly" | "quarterly" | "yearly";
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
