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

export interface GiftAidDeclaration {
  id?: string;
  donationId: string;
  donorName: string;
  donorAddress: string;
  donorPostcode: string;
  amount: number;
  giftAidAmount: number;
  campaignId: string;
  campaignTitle: string;
  donationDate: string;
  giftAidStatus: "pending" | "claimed" | "rejected";
  transactionId: string;
  taxYear: string;
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
}
