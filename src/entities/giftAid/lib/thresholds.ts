/**
 * Gift Aid Threshold Rules
 * 
 * HMRC-compliant threshold-based classification rules
 * Implements the £30 threshold for GADS vs Standard Gift Aid
 */

import {
  GIFT_AID_THRESHOLDS,
  GIFT_AID_CLASSIFICATIONS,
  PENDING_REASONS,
} from '../../../shared/config/giftAid';
import type { GiftAidValidationResult } from '../model/types';

/**
 * Applies threshold rules to determine classification
 * 
 * HMRC Threshold Rules:
 * - Donations ≤ £30 (3000 pence) → GADS
 * - Donations > £30 (3001+ pence) → Standard Gift Aid (if data complete)
 * - Donations > £30 with incomplete data → PENDING
 * 
 * @param donationAmount - Donation amount in pence
 * @param validation - Data validation result
 * @returns Classification type
 */
export function applyThresholdRules(
  donationAmount: number,
  validation: GiftAidValidationResult
): 'STANDARD' | 'GADS' | 'PENDING' {
  // Invalid amount check
  if (donationAmount <= 0) {
    return GIFT_AID_CLASSIFICATIONS.PENDING;
  }

  // GADS threshold: ≤ £30
  if (donationAmount <= GIFT_AID_THRESHOLDS.GADS_MAX) {
    return GIFT_AID_CLASSIFICATIONS.GADS;
  }

  // Standard Gift Aid threshold: > £30
  if (donationAmount >= GIFT_AID_THRESHOLDS.STANDARD_MIN) {
    // Check if data is complete
    if (validation.isValid) {
      return GIFT_AID_CLASSIFICATIONS.STANDARD;
    } else {
      return GIFT_AID_CLASSIFICATIONS.PENDING;
    }
  }

  // Fallback to PENDING
  return GIFT_AID_CLASSIFICATIONS.PENDING;
}

/**
 * Determines classification based on amount and data completeness
 * 
 * @param donationAmount - Donation amount in pence
 * @param hasCompleteData - Whether all required fields are present
 * @returns Classification type
 */
export function determineClassification(
  donationAmount: number,
  hasCompleteData: boolean
): 'STANDARD' | 'GADS' | 'PENDING' {
  // Invalid amount
  if (donationAmount <= 0) {
    return GIFT_AID_CLASSIFICATIONS.PENDING;
  }

  // GADS: ≤ £30 (no data requirements)
  if (donationAmount <= GIFT_AID_THRESHOLDS.GADS_MAX) {
    return GIFT_AID_CLASSIFICATIONS.GADS;
  }

  // Standard: > £30 with complete data
  if (donationAmount > GIFT_AID_THRESHOLDS.GADS_MAX && hasCompleteData) {
    return GIFT_AID_CLASSIFICATIONS.STANDARD;
  }

  // Pending: > £30 with incomplete data
  return GIFT_AID_CLASSIFICATIONS.PENDING;
}

/**
 * Gets pending reasons based on validation result
 * 
 * @param validation - Validation result
 * @param donationAmount - Donation amount in pence
 * @returns Array of pending reasons
 */
export function getPendingReasons(
  validation: GiftAidValidationResult,
  donationAmount: number
): string[] {
  const reasons: string[] = [];

  // Invalid amount
  if (donationAmount <= 0) {
    reasons.push(PENDING_REASONS.INVALID_AMOUNT);
    return reasons;
  }

  // For GADS donations, no pending reasons (auto-approved)
  if (donationAmount <= GIFT_AID_THRESHOLDS.GADS_MAX) {
    return [];
  }

  // For Standard Gift Aid donations, check validation
  if (!validation.isValid) {
    reasons.push(...validation.pendingReasons);
  }

  return reasons;
}

/**
 * Checks if amount is within GADS threshold
 * 
 * @param donationAmount - Donation amount in pence
 * @returns True if amount qualifies for GADS
 */
export function isWithinGADSThreshold(donationAmount: number): boolean {
  return donationAmount > 0 && donationAmount <= GIFT_AID_THRESHOLDS.GADS_MAX;
}

/**
 * Checks if amount is within Standard Gift Aid threshold
 * 
 * @param donationAmount - Donation amount in pence
 * @returns True if amount qualifies for Standard Gift Aid
 */
export function isWithinStandardThreshold(donationAmount: number): boolean {
  return donationAmount >= GIFT_AID_THRESHOLDS.STANDARD_MIN;
}

/**
 * Formats amount with threshold context
 * 
 * @param donationAmount - Donation amount in pence
 * @returns Formatted string with threshold information
 */
export function formatAmountWithThreshold(donationAmount: number): string {
  const amountInPounds = (donationAmount / 100).toFixed(2);
  
  if (isWithinGADSThreshold(donationAmount)) {
    return `£${amountInPounds} (GADS - Small Donation)`;
  } else if (isWithinStandardThreshold(donationAmount)) {
    return `£${amountInPounds} (Standard Gift Aid)`;
  } else {
    return `£${amountInPounds}`;
  }
}

/**
 * Gets threshold information for display
 * 
 * @returns Threshold information object
 */
export function getThresholdInfo() {
  return {
    gadsMax: GIFT_AID_THRESHOLDS.GADS_MAX,
    gadsMaxPounds: (GIFT_AID_THRESHOLDS.GADS_MAX / 100).toFixed(2),
    standardMin: GIFT_AID_THRESHOLDS.STANDARD_MIN,
    standardMinPounds: (GIFT_AID_THRESHOLDS.STANDARD_MIN / 100).toFixed(2),
    giftAidRate: GIFT_AID_THRESHOLDS.GIFT_AID_RATE,
    giftAidRatePercent: (GIFT_AID_THRESHOLDS.GIFT_AID_RATE * 100).toFixed(0),
  };
}
