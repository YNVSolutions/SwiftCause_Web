/**
 * Gift Aid Classification Logic
 * 
 * HMRC-compliant classification system for Gift Aid donations
 * Implements threshold-based extraction and data validation rules
 */

import {
  GIFT_AID_THRESHOLDS,
  GIFT_AID_CLASSIFICATIONS,
  PENDING_REASONS,
} from '../../../shared/config/giftAid';
import type {
  GiftAidValidationResult,
  GiftAidClassificationResult,
  GiftAidDeclaration,
} from '../model/types';

/**
 * Validates Gift Aid data completeness
 * 
 * Checks if all required fields are present and valid for Standard Gift Aid
 * 
 * @param data - Partial Gift Aid declaration data
 * @returns Validation result with missing fields and pending reasons
 */
export function validateGiftAidData(
  data: Partial<GiftAidDeclaration>
): GiftAidValidationResult {
  const missingFields: string[] = [];
  const pendingReasons: string[] = [];

  // Check required fields
  if (!data.donorFirstName || data.donorFirstName.trim() === '') {
    missingFields.push('donorFirstName');
  }
  if (!data.donorSurname || data.donorSurname.trim() === '') {
    missingFields.push('donorSurname');
  }
  if (!data.donorHouseNumber || data.donorHouseNumber.trim() === '') {
    missingFields.push('donorHouseNumber');
    pendingReasons.push(PENDING_REASONS.MISSING_ADDRESS);
  }
  if (!data.donorAddressLine1 || data.donorAddressLine1.trim() === '') {
    missingFields.push('donorAddressLine1');
    pendingReasons.push(PENDING_REASONS.MISSING_ADDRESS);
  }
  if (!data.donorTown || data.donorTown.trim() === '') {
    missingFields.push('donorTown');
    pendingReasons.push(PENDING_REASONS.MISSING_ADDRESS);
  }
  if (!data.donorPostcode || data.donorPostcode.trim() === '') {
    missingFields.push('donorPostcode');
    pendingReasons.push(PENDING_REASONS.MISSING_ADDRESS);
  }
  if (!data.ukTaxpayerConfirmation) {
    missingFields.push('ukTaxpayerConfirmation');
    pendingReasons.push(PENDING_REASONS.MISSING_TAXPAYER_CONFIRMATION);
  }

  // Deduplicate pending reasons
  const uniquePendingReasons = Array.from(new Set(pendingReasons));

  // Add general missing info reason if fields are missing
  if (missingFields.length > 0 && uniquePendingReasons.length === 0) {
    uniquePendingReasons.push(PENDING_REASONS.MISSING_DONOR_INFO);
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
    pendingReasons: uniquePendingReasons,
  };
}

/**
 * Calculates Gift Aid amount based on donation amount
 * 
 * HMRC Rule: Gift Aid is 25% of the donation amount (basic rate tax reclaim)
 * 
 * @param donationAmount - Donation amount in pence
 * @returns Gift Aid amount in pence (rounded to nearest penny)
 */
export function calculateGiftAidAmount(donationAmount: number): number {
  if (!donationAmount || donationAmount <= 0) {
    return 0;
  }

  // Calculate 25% of donation amount
  const giftAidAmount = Math.round(donationAmount * GIFT_AID_THRESHOLDS.GIFT_AID_RATE);
  
  return giftAidAmount;
}

/**
 * Determines if a donation is eligible for Standard Gift Aid
 * 
 * Standard Gift Aid requires:
 * - Donation amount > £30 (3000 pence)
 * - Complete donor information
 * - UK taxpayer confirmation
 * 
 * @param donationAmount - Donation amount in pence
 * @param validation - Validation result from validateGiftAidData
 * @returns True if eligible for Standard Gift Aid
 */
export function isEligibleForStandardGiftAid(
  donationAmount: number,
  validation: GiftAidValidationResult
): boolean {
  return (
    donationAmount > GIFT_AID_THRESHOLDS.GADS_MAX &&
    validation.isValid
  );
}

/**
 * Determines if a donation is eligible for GADS (Gift Aid Small Donations Scheme)
 * 
 * GADS requires:
 * - Donation amount ≤ £30 (3000 pence)
 * - No donor information required
 * 
 * @param donationAmount - Donation amount in pence
 * @returns True if eligible for GADS
 */
export function isEligibleForGADS(donationAmount: number): boolean {
  return (
    donationAmount > 0 &&
    donationAmount <= GIFT_AID_THRESHOLDS.GADS_MAX
  );
}

/**
 * Classifies a Gift Aid donation into appropriate track
 * 
 * Classification Rules:
 * 1. STANDARD: Donation > £30 with complete donor information
 * 2. GADS: Donation ≤ £30 (automatically classified)
 * 3. PENDING: Donation > £30 with incomplete information OR requires review
 * 
 * @param data - Partial Gift Aid declaration data
 * @returns Classification result with track, amount, and pending reasons
 */
export function classifyDonation(
  data: Partial<GiftAidDeclaration>
): GiftAidClassificationResult {
  const donationAmount = data.donationAmount || 0;

  // Validate donation amount
  if (donationAmount <= 0) {
    return {
      classification: GIFT_AID_CLASSIFICATIONS.PENDING,
      giftAidAmount: 0,
      pendingReasons: [PENDING_REASONS.INVALID_AMOUNT],
      isEligible: false,
    };
  }

  // Calculate Gift Aid amount
  const giftAidAmount = calculateGiftAidAmount(donationAmount);

  // Check if donation qualifies for GADS (≤ £30)
  if (isEligibleForGADS(donationAmount)) {
    return {
      classification: GIFT_AID_CLASSIFICATIONS.GADS,
      giftAidAmount,
      isEligible: true,
    };
  }

  // For donations > £30, validate data completeness
  const validation = validateGiftAidData(data);

  // Check if eligible for Standard Gift Aid
  if (isEligibleForStandardGiftAid(donationAmount, validation)) {
    return {
      classification: GIFT_AID_CLASSIFICATIONS.STANDARD,
      giftAidAmount,
      isEligible: true,
    };
  }

  // If not eligible for Standard or GADS, mark as PENDING
  return {
    classification: GIFT_AID_CLASSIFICATIONS.PENDING,
    giftAidAmount,
    pendingReasons: validation.pendingReasons,
    isEligible: false,
  };
}

/**
 * Re-classifies an existing Gift Aid declaration
 * 
 * Used when updating donor information or reviewing pending declarations
 * 
 * @param declaration - Existing Gift Aid declaration
 * @returns Updated classification result
 */
export function reclassifyDeclaration(
  declaration: GiftAidDeclaration
): GiftAidClassificationResult {
  return classifyDonation(declaration);
}

/**
 * Gets human-readable classification label
 * 
 * @param classification - Classification type
 * @returns Display label for classification
 */
export function getClassificationLabel(
  classification: 'STANDARD' | 'GADS' | 'PENDING'
): string {
  switch (classification) {
    case GIFT_AID_CLASSIFICATIONS.STANDARD:
      return 'Standard Gift Aid';
    case GIFT_AID_CLASSIFICATIONS.GADS:
      return 'GADS (Small Donations)';
    case GIFT_AID_CLASSIFICATIONS.PENDING:
      return 'Pending Review';
    default:
      return 'Unknown';
  }
}

/**
 * Gets classification description
 * 
 * @param classification - Classification type
 * @returns Description of classification
 */
export function getClassificationDescription(
  classification: 'STANDARD' | 'GADS' | 'PENDING'
): string {
  switch (classification) {
    case GIFT_AID_CLASSIFICATIONS.STANDARD:
      return 'Donations over £30 with complete donor information';
    case GIFT_AID_CLASSIFICATIONS.GADS:
      return 'Donations of £30 or less (Gift Aid Small Donations Scheme)';
    case GIFT_AID_CLASSIFICATIONS.PENDING:
      return 'Donations requiring additional information or review';
    default:
      return '';
  }
}
