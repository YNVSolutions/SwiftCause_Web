/**
 * HMRC-compliant Gift Aid Declaration interface
 * 
 * COMPLIANCE NOTES:
 * - All monetary amounts are stored in pence (minor currency units)
 * - donationId enforces strict 1:1 mapping with donations
 * - Fields must not be modified without legal review
 * - Classification tracks: STANDARD (>£30), GADS (≤£30), PENDING (incomplete)
 */
export interface GiftAidDeclaration {
  // MANDATORY: Document identifier (equals donationId for 1:1 mapping)
  id: string;
  
  // MANDATORY: Linking field - enforces 1:1 relationship with donation
  donationId: string;
  
  // MANDATORY: Full donor identity (HMRC requirement)
  donorFirstName: string;
  donorSurname: string;
  
  // MANDATORY: Complete address (HMRC requirement)
  donorHouseNumber: string;
  donorAddressLine1: string;
  donorAddressLine2?: string; // Optional additional address line
  donorTown: string;
  donorPostcode: string;
  
  // MANDATORY: Declaration details (HMRC requirement)
  declarationText: string; // Verbatim HMRC-compliant declaration
  declarationDate: string; // ISO date when declaration was made
  ukTaxpayerConfirmation: boolean; // Explicit UK taxpayer confirmation
  
  // MANDATORY: Financial details (HMRC requirement - amounts in pence)
  donationAmount: number; // Original donation amount in pence (minor currency units)
  giftAidAmount: number; // Calculated Gift Aid amount in pence (minor currency units)
  
  // MANDATORY: Context and traceability
  campaignId: string;
  campaignTitle: string;
  organizationId: string;
  
  // MANDATORY: Dates (HMRC requirement)
  donationDate: string; // ISO date of original donation
  taxYear: string; // Format: "2025-26"
  
  // MANDATORY: Status tracking
  giftAidStatus: 'pending' | 'claimed' | 'rejected';
  
  // MANDATORY: Classification tracking (HMRC compliance)
  classification: 'STANDARD' | 'GADS' | 'PENDING'; // Gift Aid track classification
  pendingReasons?: string[]; // Reasons for PENDING classification (if applicable)
  
  // MANDATORY: Audit trail (compliance requirement)
  createdAt: string; // ISO timestamp when record was created
  updatedAt: string; // ISO timestamp when record was last modified
}

/**
 * Gift Aid details for frontend form collection
 * Maps to GiftAidDeclaration for backend storage
 * 
 * COMPLIANCE NOTES:
 * - All monetary amounts must be in pence (integer values)
 * - donationId intentionally empty at form stage (populated by orchestration)
 * - declarationText must use HMRC_DECLARATION_TEXT constant
 */
export interface GiftAidDetails {
  // Donor Information
  firstName: string;
  surname: string;
  houseNumber: string;
  addressLine1: string;
  addressLine2?: string;
  town: string;
  postcode: string;
  
  // Declaration Requirements
  giftAidConsent: boolean;
  ukTaxpayerConfirmation: boolean;
  declarationText: string;
  declarationDate: string;
  
  // Donation Context
  donationAmount: number;
  donationDate: string;
  organizationId: string;
  donationId: string;
  
  // Audit Trail
  timestamp: string;
  taxYear: string;
}

/**
 * Gift Aid validation result
 * Used to determine if a donation has complete data for classification
 */
export interface GiftAidValidationResult {
  isValid: boolean;
  missingFields: string[];
  pendingReasons: string[];
}

/**
 * Gift Aid classification result
 * Returned by classification logic
 */
export interface GiftAidClassificationResult {
  classification: 'STANDARD' | 'GADS' | 'PENDING';
  giftAidAmount: number; // Calculated Gift Aid amount in pence
  pendingReasons?: string[];
  isEligible: boolean;
}