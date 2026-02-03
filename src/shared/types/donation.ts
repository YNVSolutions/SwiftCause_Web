// Gift Aid details interface - HMRC compliant
export interface GiftAidDetails {
  // 1. Donor Information
  firstName: string;
  surname: string;
  houseNumber: string;
  address?: string; // Optional additional address line
  town: string;
  postcode: string;
  
  // 2. Declaration Requirements
  giftAidConsent: boolean; // Explicit agreement to Gift Aid treatment
  ukTaxpayerConfirmation: boolean; // Confirmation of UK taxpayer status
  declarationText: string; // HMRC-compliant declaration wording
  declarationDate: string; // ISO date when declaration was made
  
  // 3. Donation Details
  donationAmount: number;
  donationDate: string; // ISO date of donation
  organizationId: string;
  donationId: string; // Default empty string
  
  // 4. Audit Trail (for compliance)
  timestamp: string; // ISO timestamp when record was created
  taxYear: string; // e.g., "2025-26"
}

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
  giftAidAccepted?: boolean; // Explicit tracking of Gift Aid acceptance/decline
  giftAidDetails?: GiftAidDetails;
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
